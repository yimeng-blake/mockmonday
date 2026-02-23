'use client';

import { createClient, isSupabaseConfigured } from './client';
import { useBoardStore } from '@/store/boardStore';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { CellValue, Column } from '@/lib/types';

/**
 * Subscribe to real-time changes on a specific board.
 * Returns the channel (or null) so the caller can unsubscribe on cleanup.
 */
export function subscribeToBoardChanges(boardId: string): RealtimeChannel | null {
  if (!isSupabaseConfigured) return null;

  const supabase = createClient();
  const store = useBoardStore;

  const channel = supabase
    .channel(`board-${boardId}`)

    // ── Items changes ──
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'items', filter: `board_id=eq.${boardId}` },
      (payload) => {
        const row = payload.new as { id: string; group_id: string; board_id: string; parent_item_id?: string };
        const state = store.getState();
        // Skip if we already have this item (we made the change locally)
        if (state.items[row.id]) return;

        store.setState((s) => ({
          items: {
            ...s.items,
            [row.id]: {
              id: row.id,
              groupId: row.group_id,
              boardId: row.board_id,
              parentItemId: row.parent_item_id || undefined,
              values: {},
            },
          },
        }));
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'items', filter: `board_id=eq.${boardId}` },
      (payload) => {
        const oldRow = payload.old as { id: string; group_id: string };
        store.setState((s) => {
          const ni = { ...s.items };
          delete ni[oldRow.id];
          // Also update the group's itemIds
          const group = Object.values(s.groups).find((g) => g.itemIds.includes(oldRow.id));
          const ng = group
            ? { ...s.groups, [group.id]: { ...group, itemIds: group.itemIds.filter((x) => x !== oldRow.id) } }
            : s.groups;
          return { items: ni, groups: ng };
        });
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'items', filter: `board_id=eq.${boardId}` },
      (payload) => {
        const row = payload.new as { id: string; group_id: string };
        store.setState((s) => {
          const existing = s.items[row.id];
          if (!existing) return s;
          // Item moved to different group
          if (existing.groupId !== row.group_id) {
            return {
              items: { ...s.items, [row.id]: { ...existing, groupId: row.group_id } },
            };
          }
          return s;
        });
      }
    )

    // ── Cell value changes ──
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cell_values' },
      (payload) => {
        const row = (payload.new || payload.old) as { item_id: string; column_id: string; value: CellValue };
        if (!row?.item_id) return;
        const state = store.getState();
        const item = state.items[row.item_id];
        if (!item || item.boardId !== boardId) return;

        if (payload.eventType === 'DELETE') {
          store.setState((s) => {
            const existing = s.items[row.item_id];
            if (!existing) return s;
            const newValues = { ...existing.values };
            delete newValues[row.column_id];
            return { items: { ...s.items, [row.item_id]: { ...existing, values: newValues } } };
          });
        } else {
          // INSERT or UPDATE
          const newRow = payload.new as { item_id: string; column_id: string; value: CellValue };
          // Skip if value is identical (we made this change)
          if (item.values[newRow.column_id] === newRow.value) return;
          if (JSON.stringify(item.values[newRow.column_id]) === JSON.stringify(newRow.value)) return;

          store.setState((s) => {
            const existing = s.items[newRow.item_id];
            if (!existing) return s;
            return {
              items: {
                ...s.items,
                [newRow.item_id]: {
                  ...existing,
                  values: { ...existing.values, [newRow.column_id]: newRow.value },
                },
              },
            };
          });
        }
      }
    )

    // ── Group changes ──
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'groups', filter: `board_id=eq.${boardId}` },
      (payload) => {
        const row = payload.new as {
          id: string; board_id: string; title: string; color: string;
          collapsed: boolean; item_order: string[];
        };
        store.setState((s) => {
          const existing = s.groups[row.id];
          if (!existing) return s;
          return {
            groups: {
              ...s.groups,
              [row.id]: {
                ...existing,
                title: row.title,
                color: row.color,
                collapsed: row.collapsed,
                itemIds: row.item_order || existing.itemIds,
              },
            },
          };
        });
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'groups', filter: `board_id=eq.${boardId}` },
      (payload) => {
        const row = payload.new as {
          id: string; board_id: string; title: string; color: string;
          collapsed: boolean; item_order: string[];
        };
        const state = store.getState();
        if (state.groups[row.id]) return;

        store.setState((s) => ({
          groups: {
            ...s.groups,
            [row.id]: {
              id: row.id,
              boardId: row.board_id,
              title: row.title,
              color: row.color,
              collapsed: row.collapsed,
              itemIds: row.item_order || [],
            },
          },
        }));
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'groups', filter: `board_id=eq.${boardId}` },
      (payload) => {
        const oldRow = payload.old as { id: string };
        store.setState((s) => {
          const ng = { ...s.groups };
          delete ng[oldRow.id];
          return { groups: ng };
        });
      }
    )

    // ── Board-level changes (rename, description, group_order) ──
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'boards', filter: `id=eq.${boardId}` },
      (payload) => {
        const row = payload.new as {
          id: string; name: string; description: string; group_order: string[];
        };
        store.setState((s) => {
          const existing = s.boards[row.id];
          if (!existing) return s;
          return {
            boards: {
              ...s.boards,
              [row.id]: {
                ...existing,
                name: row.name,
                description: row.description || '',
                groupIds: row.group_order || existing.groupIds,
              },
            },
          };
        });
      }
    )

    // ── Column changes ──
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'columns', filter: `board_id=eq.${boardId}` },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new as { id: string; board_id: string; title: string; type: string; width: number; position: number };
          store.setState((s) => {
            const board = s.boards[boardId];
            if (!board) return s;
            if (board.columns.some((c) => c.id === row.id)) return s;
            const newCol: Column = { id: row.id, title: row.title, type: row.type as Column['type'], width: row.width };
            const cols = [...board.columns, newCol].sort((a, b) => {
              // We don't store position locally, so just append
              return 0;
            });
            return { boards: { ...s.boards, [boardId]: { ...board, columns: cols } } };
          });
        } else if (payload.eventType === 'DELETE') {
          const oldRow = payload.old as { id: string };
          store.setState((s) => {
            const board = s.boards[boardId];
            if (!board) return s;
            return {
              boards: {
                ...s.boards,
                [boardId]: { ...board, columns: board.columns.filter((c) => c.id !== oldRow.id) },
              },
            };
          });
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new as { id: string; title: string; width: number; position: number };
          store.setState((s) => {
            const board = s.boards[boardId];
            if (!board) return s;
            return {
              boards: {
                ...s.boards,
                [boardId]: {
                  ...board,
                  columns: board.columns.map((c) =>
                    c.id === row.id ? { ...c, title: row.title, width: row.width } : c
                  ),
                },
              },
            };
          });
        }
      }
    )

    .subscribe();

  return channel;
}

/**
 * Subscribe to global board list changes (new boards, deleted boards).
 * Used in StoreProvider to keep the home page board list up to date.
 */
export function subscribeToGlobalBoardChanges(userId: string): RealtimeChannel | null {
  if (!isSupabaseConfigured) return null;

  const supabase = createClient();
  const store = useBoardStore;

  const channel = supabase
    .channel(`user-boards-${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'boards', filter: `user_id=eq.${userId}` },
      (payload) => {
        const row = payload.new as { id: string; name: string; description: string; group_order: string[] };
        const state = store.getState();
        if (state.boards[row.id]) return;

        store.setState((s) => ({
          boards: {
            ...s.boards,
            [row.id]: {
              id: row.id,
              name: row.name,
              description: row.description || '',
              groupIds: row.group_order || [],
              columns: [],
            },
          },
          boardOrder: [...s.boardOrder, row.id],
        }));
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'boards', filter: `user_id=eq.${userId}` },
      (payload) => {
        const oldRow = payload.old as { id: string };
        store.setState((s) => {
          const nb = { ...s.boards };
          delete nb[oldRow.id];
          return {
            boards: nb,
            boardOrder: s.boardOrder.filter((x) => x !== oldRow.id),
          };
        });
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from a channel.
 */
export function unsubscribe(channel: RealtimeChannel | null) {
  if (!channel) return;
  const supabase = createClient();
  supabase.removeChannel(channel);
}
