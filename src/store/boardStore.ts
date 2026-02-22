'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Board, Group, Item, Column, CellValue, ColumnType } from '@/lib/types';
import { seedData } from '@/lib/seed';
import { generateId } from '@/lib/utils';
import { GROUP_COLORS, DEFAULT_COLUMN_WIDTHS } from '@/lib/constants';
import * as mut from '@/lib/supabase/mutations';
import toast from 'react-hot-toast';
import { useUndoStore, connectBoardStore } from './undoStore';

// Runtime flags for Supabase sync
let supabaseEnabled = false;
let currentUserId: string | null = null;

export function enableSupabase(userId: string) {
  supabaseEnabled = true;
  currentUserId = userId;
}

export function disableSupabase() {
  supabaseEnabled = false;
  currentUserId = null;
}

function sync(fn: () => Promise<void>, label?: string) {
  if (!supabaseEnabled) return;
  fn().catch((err) => {
    console.error(`Sync error (${label}):`, err);
    toast.error('Failed to save changes');
  });
}

function pushUndo() {
  const s = useBoardStore.getState();
  useUndoStore.getState().pushState({
    boards: s.boards,
    groups: s.groups,
    items: s.items,
    boardOrder: s.boardOrder,
  });
}

interface BoardStore {
  boards: Record<string, Board>;
  groups: Record<string, Group>;
  items: Record<string, Item>;
  boardOrder: string[];
  initialized: boolean;

  initialize: (data: { boards: Record<string, Board>; groups: Record<string, Group>; items: Record<string, Item>; boardOrder: string[] }) => void;

  addBoard: (name: string) => string;
  renameBoard: (boardId: string, name: string) => void;
  updateBoardDescription: (boardId: string, description: string) => void;
  deleteBoard: (boardId: string) => void;

  addGroup: (boardId: string, title?: string) => string;
  renameGroup: (groupId: string, title: string) => void;
  deleteGroup: (groupId: string) => void;
  toggleGroupCollapse: (groupId: string) => void;
  setGroupColor: (groupId: string, color: string) => void;

  addItem: (groupId: string) => string;
  addSubitem: (parentItemId: string) => string;
  deleteItem: (itemId: string) => void;
  updateItemValue: (itemId: string, columnId: string, value: CellValue) => void;

  addColumn: (boardId: string, title: string, type: ColumnType) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  renameColumn: (boardId: string, columnId: string, title: string) => void;
  reorderColumns: (boardId: string, fromIndex: number, toIndex: number) => void;

  moveItem: (itemId: string, toGroupId: string, toIndex: number) => void;
  reorderGroups: (boardId: string, fromIndex: number, toIndex: number) => void;
}

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      ...seedData,
      initialized: false,

      initialize: (data) => {
        set({ ...data, initialized: true });
      },

      // ============ BOARDS ============

      addBoard: (name) => {
        pushUndo();
        const id = `board-${generateId()}`;
        const groupId = `group-${generateId()}`;
        const columns: Column[] = [
          { id: `col-${generateId()}`, title: 'Task', type: 'text', width: 320 },
          { id: `col-${generateId()}`, title: 'Status', type: 'status', width: 160 },
          { id: `col-${generateId()}`, title: 'Owner', type: 'person', width: 140 },
          { id: `col-${generateId()}`, title: 'Due Date', type: 'date', width: 140 },
        ];
        const newBoard: Board = { id, name, groupIds: [groupId], columns };
        const color = GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)];
        const newGroup: Group = { id: groupId, boardId: id, title: 'New Group', color, collapsed: false, itemIds: [] };

        set((s) => ({
          boards: { ...s.boards, [id]: newBoard },
          groups: { ...s.groups, [groupId]: newGroup },
          boardOrder: [...s.boardOrder, id],
        }));

        sync(async () => {
          if (!currentUserId) return;
          await mut.createBoard(id, name, currentUserId, [groupId]);
          await mut.createGroup(groupId, id, 'New Group', color);
          for (let i = 0; i < columns.length; i++) {
            const c = columns[i];
            await mut.createColumn(c.id, id, c.title, c.type, c.width || 150, i);
          }
        }, 'addBoard');
        return id;
      },

      renameBoard: (boardId, name) => {
        pushUndo();
        set((s) => ({ boards: { ...s.boards, [boardId]: { ...s.boards[boardId], name } } }));
        sync(() => mut.renameBoard(boardId, name), 'renameBoard');
      },

      updateBoardDescription: (boardId, description) => {
        pushUndo();
        set((s) => ({ boards: { ...s.boards, [boardId]: { ...s.boards[boardId], description } } }));
        sync(() => mut.updateBoardDescription(boardId, description), 'updateBoardDesc');
      },

      deleteBoard: (boardId) => {
        pushUndo();
        set((s) => {
          const board = s.boards[boardId];
          if (!board) return s;
          const newBoards = { ...s.boards }; delete newBoards[boardId];
          const newGroups = { ...s.groups };
          const newItems = { ...s.items };
          for (const gid of board.groupIds) {
            const g = s.groups[gid];
            if (g) for (const iid of g.itemIds) delete newItems[iid];
            delete newGroups[gid];
          }
          return { boards: newBoards, groups: newGroups, items: newItems, boardOrder: s.boardOrder.filter((x) => x !== boardId) };
        });
        sync(() => mut.deleteBoard(boardId), 'deleteBoard');
      },

      // ============ GROUPS ============

      addGroup: (boardId, title) => {
        pushUndo();
        const id = `group-${generateId()}`;
        const board = get().boards[boardId];
        if (!board) return id;
        const usedColors = board.groupIds.map((gid) => get().groups[gid]?.color);
        const color = GROUP_COLORS.find((c) => !usedColors.includes(c)) || GROUP_COLORS[0];
        const t = title || 'New Group';
        const newGroupOrder = [...board.groupIds, id];

        set((s) => ({
          groups: { ...s.groups, [id]: { id, boardId, title: t, color, collapsed: false, itemIds: [] } },
          boards: { ...s.boards, [boardId]: { ...s.boards[boardId], groupIds: newGroupOrder } },
        }));

        sync(async () => {
          await mut.createGroup(id, boardId, t, color);
          await mut.updateBoardGroupOrder(boardId, newGroupOrder);
        }, 'addGroup');
        return id;
      },

      renameGroup: (groupId, title) => {
        pushUndo();
        set((s) => ({ groups: { ...s.groups, [groupId]: { ...s.groups[groupId], title } } }));
        sync(() => mut.renameGroup(groupId, title), 'renameGroup');
      },

      deleteGroup: (groupId) => {
        pushUndo();
        const group = get().groups[groupId];
        if (!group) return;
        const board = get().boards[group.boardId];
        const newGroupOrder = board.groupIds.filter((x) => x !== groupId);

        set((s) => {
          const ng = { ...s.groups }; const ni = { ...s.items };
          for (const iid of group.itemIds) delete ni[iid];
          delete ng[groupId];
          return {
            groups: ng, items: ni,
            boards: { ...s.boards, [group.boardId]: { ...board, groupIds: newGroupOrder } },
          };
        });

        sync(async () => {
          await mut.deleteGroup(groupId);
          await mut.updateBoardGroupOrder(group.boardId, newGroupOrder);
        }, 'deleteGroup');
      },

      toggleGroupCollapse: (groupId) => {
        const nc = !get().groups[groupId]?.collapsed;
        set((s) => ({ groups: { ...s.groups, [groupId]: { ...s.groups[groupId], collapsed: nc } } }));
        sync(() => mut.updateGroupCollapse(groupId, nc), 'toggleCollapse');
      },

      setGroupColor: (groupId, color) => {
        pushUndo();
        set((s) => ({ groups: { ...s.groups, [groupId]: { ...s.groups[groupId], color } } }));
        sync(() => mut.updateGroupColor(groupId, color), 'setGroupColor');
      },

      // ============ ITEMS ============

      addItem: (groupId) => {
        pushUndo();
        const id = `item-${generateId()}`;
        const group = get().groups[groupId];
        if (!group) return id;
        const board = get().boards[group.boardId];
        if (!board) return id;
        const values: Record<string, CellValue> = {};
        for (const col of board.columns) {
          if (col.type === 'text') values[col.id] = '';
          else if (col.type === 'status') values[col.id] = { label: '', color: '#C4C4C4' };
          else values[col.id] = null;
        }
        const newItem: Item = { id, groupId, boardId: group.boardId, values };
        const newOrder = [...group.itemIds, id];

        set((s) => ({
          items: { ...s.items, [id]: newItem },
          groups: { ...s.groups, [groupId]: { ...s.groups[groupId], itemIds: newOrder } },
        }));

        sync(async () => {
          await mut.createItem(id, groupId, group.boardId);
          await mut.updateGroupItemOrder(groupId, newOrder);
          const cells = Object.entries(values).filter(([, v]) => v !== null).map(([cid, v]) => ({ item_id: id, column_id: cid, value: v }));
          if (cells.length > 0) await mut.bulkInsertCellValues(cells);
        }, 'addItem');
        return id;
      },

      addSubitem: (parentItemId) => {
        pushUndo();
        const id = `item-${generateId()}`;
        const parent = get().items[parentItemId];
        if (!parent) return id;
        const board = get().boards[parent.boardId];
        if (!board) return id;
        const values: Record<string, CellValue> = {};
        for (const col of board.columns) {
          if (col.type === 'text') values[col.id] = '';
          else if (col.type === 'status') values[col.id] = { label: '', color: '#C4C4C4' };
          else values[col.id] = null;
        }

        set((s) => ({
          items: { ...s.items, [id]: { id, groupId: parent.groupId, boardId: parent.boardId, parentItemId, values } },
        }));

        sync(() => mut.createItem(id, parent.groupId, parent.boardId, parentItemId), 'addSubitem');
        return id;
      },

      deleteItem: (itemId) => {
        pushUndo();
        const item = get().items[itemId];
        if (!item) return;

        set((s) => {
          const ni = { ...s.items };
          Object.values(ni).forEach((i) => { if (i.parentItemId === itemId) delete ni[i.id]; });
          delete ni[itemId];
          const group = s.groups[item.groupId];
          const newOrder = group ? group.itemIds.filter((x) => x !== itemId) : [];
          return {
            items: ni,
            groups: group ? { ...s.groups, [item.groupId]: { ...group, itemIds: newOrder } } : s.groups,
          };
        });

        sync(async () => {
          await mut.deleteItem(itemId);
          const group = get().groups[item.groupId];
          if (group) await mut.updateGroupItemOrder(item.groupId, group.itemIds);
        }, 'deleteItem');
      },

      updateItemValue: (itemId, columnId, value) => {
        pushUndo();
        set((s) => ({
          items: { ...s.items, [itemId]: { ...s.items[itemId], values: { ...s.items[itemId].values, [columnId]: value } } },
        }));
        sync(() => mut.upsertCellValue(itemId, columnId, value), 'updateCell');
      },

      // ============ COLUMNS ============

      addColumn: (boardId, title, type) => {
        pushUndo();
        const id = `col-${generateId()}`;
        const width = DEFAULT_COLUMN_WIDTHS[type] || 150;
        const position = get().boards[boardId]?.columns.length || 0;

        set((s) => ({
          boards: { ...s.boards, [boardId]: { ...s.boards[boardId], columns: [...s.boards[boardId].columns, { id, title, type, width }] } },
        }));
        sync(() => mut.createColumn(id, boardId, title, type, width, position), 'addColumn');
      },

      deleteColumn: (boardId, columnId) => {
        pushUndo();
        set((s) => ({
          boards: { ...s.boards, [boardId]: { ...s.boards[boardId], columns: s.boards[boardId].columns.filter((c) => c.id !== columnId) } },
        }));
        sync(() => mut.deleteColumn(columnId), 'deleteColumn');
      },

      renameColumn: (boardId, columnId, title) => {
        pushUndo();
        set((s) => ({
          boards: { ...s.boards, [boardId]: { ...s.boards[boardId], columns: s.boards[boardId].columns.map((c) => c.id === columnId ? { ...c, title } : c) } },
        }));
        sync(() => mut.renameColumn(columnId, title), 'renameColumn');
      },

      reorderColumns: (boardId, fromIndex, toIndex) => {
        set((s) => {
          const board = s.boards[boardId]; if (!board) return s;
          const cols = [...board.columns];
          const [removed] = cols.splice(fromIndex, 1);
          cols.splice(toIndex, 0, removed);
          return { boards: { ...s.boards, [boardId]: { ...board, columns: cols } } };
        });
        sync(async () => {
          const board = get().boards[boardId];
          if (board) await mut.reorderColumns(boardId, board.columns.map((c) => c.id));
        }, 'reorderColumns');
      },

      // ============ DRAG & DROP ============

      moveItem: (itemId, toGroupId, toIndex) => {
        pushUndo();
        const item = get().items[itemId];
        if (!item) return;
        const fromGroupId = item.groupId;
        const fromGroup = get().groups[fromGroupId];
        const toGroup = get().groups[toGroupId];
        if (!fromGroup || !toGroup) return;

        const fromItemIds = fromGroup.itemIds.filter((x) => x !== itemId);
        let toItemIds: string[];
        if (fromGroupId === toGroupId) {
          toItemIds = fromItemIds.slice();
          toItemIds.splice(toIndex, 0, itemId);
        } else {
          toItemIds = toGroup.itemIds.slice();
          toItemIds.splice(toIndex, 0, itemId);
        }

        set((s) => ({
          items: { ...s.items, [itemId]: { ...item, groupId: toGroupId } },
          groups: {
            ...s.groups,
            [fromGroupId]: { ...fromGroup, itemIds: fromGroupId === toGroupId ? toItemIds : fromItemIds },
            ...(fromGroupId !== toGroupId ? { [toGroupId]: { ...toGroup, itemIds: toItemIds } } : {}),
          },
        }));

        sync(async () => {
          if (fromGroupId !== toGroupId) {
            await mut.moveItem(itemId, toGroupId);
            await mut.updateGroupItemOrder(fromGroupId, fromItemIds);
          }
          await mut.updateGroupItemOrder(toGroupId, toItemIds);
        }, 'moveItem');
      },

      reorderGroups: (boardId, fromIndex, toIndex) => {
        set((s) => {
          const board = s.boards[boardId]; if (!board) return s;
          const gids = [...board.groupIds];
          const [removed] = gids.splice(fromIndex, 1);
          gids.splice(toIndex, 0, removed);
          return { boards: { ...s.boards, [boardId]: { ...board, groupIds: gids } } };
        });
        sync(async () => {
          const board = get().boards[boardId];
          if (board) await mut.updateBoardGroupOrder(boardId, board.groupIds);
        }, 'reorderGroups');
      },
    }),
    {
      name: 'mockmonday-data',
    }
  )
);

// Connect undo store to board store (avoids circular import)
connectBoardStore(
  () => useBoardStore.getState(),
  (state) => useBoardStore.setState(state)
);
