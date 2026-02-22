import { createClient } from './client';
import type { Board, Group, Item, Column, CellValue } from '@/lib/types';

interface RawCellValue {
  item_id: string;
  column_id: string;
  value: CellValue;
}

interface FetchResult {
  boards: Record<string, Board>;
  groups: Record<string, Group>;
  items: Record<string, Item>;
  boardOrder: string[];
}

export async function fetchBoardsForUser(userId: string): Promise<FetchResult> {
  const supabase = createClient();

  // Fetch all boards for this user
  const { data: boardRows, error: boardErr } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (boardErr) throw boardErr;
  if (!boardRows || boardRows.length === 0) {
    return { boards: {}, groups: {}, items: {}, boardOrder: [] };
  }

  const boardIds = boardRows.map((b) => b.id);

  // Fetch columns, groups, items, cell_values in parallel
  const [columnsRes, groupsRes, itemsRes, cellsRes] = await Promise.all([
    supabase
      .from('columns')
      .select('*')
      .in('board_id', boardIds)
      .order('position', { ascending: true }),
    supabase
      .from('groups')
      .select('*')
      .in('board_id', boardIds),
    supabase
      .from('items')
      .select('*')
      .in('board_id', boardIds)
      .is('parent_item_id', null),
    supabase
      .from('cell_values')
      .select('item_id, column_id, value')
      .in(
        'item_id',
        // We need to get item IDs first, but since we're fetching in parallel,
        // we'll use a subquery approach via board_id
        (await supabase.from('items').select('id').in('board_id', boardIds)).data?.map((i) => i.id) || []
      ),
  ]);

  if (columnsRes.error) throw columnsRes.error;
  if (groupsRes.error) throw groupsRes.error;
  if (itemsRes.error) throw itemsRes.error;

  // Build column map per board
  const columnsByBoard: Record<string, Column[]> = {};
  for (const col of columnsRes.data || []) {
    if (!columnsByBoard[col.board_id]) columnsByBoard[col.board_id] = [];
    columnsByBoard[col.board_id].push({
      id: col.id,
      title: col.title,
      type: col.type as Column['type'],
      width: col.width,
    });
  }

  // Build cell values map: itemId -> { columnId -> value }
  const cellsByItem: Record<string, Record<string, CellValue>> = {};
  for (const cell of (cellsRes.data || []) as RawCellValue[]) {
    if (!cellsByItem[cell.item_id]) cellsByItem[cell.item_id] = {};
    cellsByItem[cell.item_id][cell.column_id] = cell.value;
  }

  // Build items
  const items: Record<string, Item> = {};
  for (const row of itemsRes.data || []) {
    items[row.id] = {
      id: row.id,
      groupId: row.group_id,
      boardId: row.board_id,
      parentItemId: row.parent_item_id || undefined,
      values: cellsByItem[row.id] || {},
    };
  }

  // Build groups
  const groups: Record<string, Group> = {};
  for (const row of groupsRes.data || []) {
    groups[row.id] = {
      id: row.id,
      boardId: row.board_id,
      title: row.title,
      color: row.color,
      collapsed: row.collapsed,
      itemIds: row.item_order || [],
    };
  }

  // Build boards
  const boards: Record<string, Board> = {};
  const boardOrder: string[] = [];
  for (const row of boardRows) {
    boards[row.id] = {
      id: row.id,
      name: row.name,
      description: row.description || '',
      groupIds: row.group_order || [],
      columns: columnsByBoard[row.id] || [],
    };
    boardOrder.push(row.id);
  }

  return { boards, groups, items, boardOrder };
}

export async function fetchSubitems(parentItemId: string): Promise<Item[]> {
  const supabase = createClient();
  const { data: itemRows, error } = await supabase
    .from('items')
    .select('*')
    .eq('parent_item_id', parentItemId);
  if (error) throw error;

  const itemIds = (itemRows || []).map((r) => r.id);
  if (itemIds.length === 0) return [];

  const { data: cells } = await supabase
    .from('cell_values')
    .select('item_id, column_id, value')
    .in('item_id', itemIds);

  const cellsByItem: Record<string, Record<string, CellValue>> = {};
  for (const cell of (cells || []) as RawCellValue[]) {
    if (!cellsByItem[cell.item_id]) cellsByItem[cell.item_id] = {};
    cellsByItem[cell.item_id][cell.column_id] = cell.value;
  }

  return (itemRows || []).map((row) => ({
    id: row.id,
    groupId: row.group_id,
    boardId: row.board_id,
    parentItemId: row.parent_item_id,
    values: cellsByItem[row.id] || {},
  }));
}

export async function fetchItemUpdates(itemId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('item_updates')
    .select('*, profiles(display_name, avatar_color)')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchBoardTemplates() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('board_templates')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}
