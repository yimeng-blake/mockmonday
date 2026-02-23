import { createClient } from './client';
import type { CellValue, ColumnType } from '@/lib/types';

const supabase = () => createClient();

// ============ BOARDS ============

export async function createBoard(id: string, name: string, userId: string, groupOrder: string[]) {
  const { error } = await supabase().from('boards').insert({
    id,
    user_id: userId,
    name,
    group_order: groupOrder,
  });
  if (error) throw error;
}

export async function renameBoard(id: string, name: string) {
  const { error } = await supabase().from('boards').update({ name, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function updateBoardDescription(id: string, description: string) {
  const { error } = await supabase().from('boards').update({ description, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function deleteBoard(id: string) {
  const { error } = await supabase().from('boards').delete().eq('id', id);
  if (error) throw error;
}

export async function updateBoardGroupOrder(id: string, groupOrder: string[]) {
  const { error } = await supabase().from('boards').update({ group_order: groupOrder, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// ============ COLUMNS ============

export async function createColumn(id: string, boardId: string, title: string, type: ColumnType, width: number, position: number) {
  const { error } = await supabase().from('columns').insert({
    id,
    board_id: boardId,
    title,
    type,
    width,
    position,
  });
  if (error) throw error;
}

export async function renameColumn(id: string, title: string) {
  const { error } = await supabase().from('columns').update({ title }).eq('id', id);
  if (error) throw error;
}

export async function deleteColumn(id: string) {
  // Cell values auto-cascade via FK
  const { error } = await supabase().from('columns').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderColumns(boardId: string, columnIds: string[]) {
  const updates = columnIds.map((id, index) =>
    supabase().from('columns').update({ position: index }).eq('id', id)
  );
  await Promise.all(updates);
}

// ============ GROUPS ============

export async function createGroup(id: string, boardId: string, title: string, color: string) {
  const { error } = await supabase().from('groups').insert({
    id,
    board_id: boardId,
    title,
    color,
    item_order: [],
  });
  if (error) throw error;
}

export async function renameGroup(id: string, title: string) {
  const { error } = await supabase().from('groups').update({ title }).eq('id', id);
  if (error) throw error;
}

export async function deleteGroup(id: string) {
  const { error } = await supabase().from('groups').delete().eq('id', id);
  if (error) throw error;
}

export async function updateGroupCollapse(id: string, collapsed: boolean) {
  const { error } = await supabase().from('groups').update({ collapsed }).eq('id', id);
  if (error) throw error;
}

export async function updateGroupColor(id: string, color: string) {
  const { error } = await supabase().from('groups').update({ color }).eq('id', id);
  if (error) throw error;
}

export async function updateGroupItemOrder(id: string, itemOrder: string[]) {
  const { error } = await supabase().from('groups').update({ item_order: itemOrder }).eq('id', id);
  if (error) throw error;
}

// ============ ITEMS ============

export async function createItem(id: string, groupId: string, boardId: string, parentItemId?: string) {
  const { error } = await supabase().from('items').insert({
    id,
    group_id: groupId,
    board_id: boardId,
    parent_item_id: parentItemId || null,
  });
  if (error) throw error;
}

export async function deleteItem(id: string) {
  const { error } = await supabase().from('items').delete().eq('id', id);
  if (error) throw error;
}

export async function moveItem(id: string, groupId: string) {
  const { error } = await supabase().from('items').update({ group_id: groupId }).eq('id', id);
  if (error) throw error;
}

// ============ CELL VALUES ============

export async function upsertCellValue(itemId: string, columnId: string, value: CellValue) {
  const { error } = await supabase()
    .from('cell_values')
    .upsert(
      { item_id: itemId, column_id: columnId, value: value as unknown as Record<string, unknown> },
      { onConflict: 'item_id,column_id' }
    );
  if (error) throw error;
}

export async function bulkInsertCellValues(
  rows: Array<{ item_id: string; column_id: string; value: CellValue }>
) {
  if (rows.length === 0) return;
  const { error } = await supabase()
    .from('cell_values')
    .upsert(
      rows.map((r) => ({ ...r, value: r.value as unknown as Record<string, unknown> })),
      { onConflict: 'item_id,column_id' }
    );
  if (error) throw error;
}

// ============ ITEM UPDATES ============

export async function createItemUpdate(itemId: string, userId: string, content: string) {
  const { data, error } = await supabase()
    .from('item_updates')
    .insert({ item_id: itemId, user_id: userId, content })
    .select('*, profiles(display_name, avatar_color)')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteItemUpdate(id: string) {
  const { error } = await supabase().from('item_updates').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchItemUpdatesForItem(itemId: string) {
  const { data, error } = await supabase()
    .from('item_updates')
    .select('*, profiles(display_name, avatar_color)')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
