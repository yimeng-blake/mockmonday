import { seedData } from '@/lib/seed';
import * as mut from './mutations';
import type { CellValue } from '@/lib/types';

/**
 * Seeds the demo boards for a new user in Supabase.
 * Called when a user signs up and has no boards yet.
 */
export async function seedUserBoards(userId: string): Promise<void> {
  const { boards, groups, items, boardOrder } = seedData;

  // Create boards in order
  for (const boardId of boardOrder) {
    const board = boards[boardId];
    if (!board) continue;

    await mut.createBoard(boardId, board.name, userId, board.groupIds);

    if (board.description) {
      await mut.updateBoardDescription(boardId, board.description);
    }

    // Create columns
    for (let i = 0; i < board.columns.length; i++) {
      const col = board.columns[i];
      await mut.createColumn(col.id, boardId, col.title, col.type, col.width || 150, i);
    }

    // Create groups
    for (const groupId of board.groupIds) {
      const group = groups[groupId];
      if (!group) continue;

      await mut.createGroup(groupId, boardId, group.title, group.color);

      if (group.collapsed) {
        await mut.updateGroupCollapse(groupId, true);
      }

      // Update item order on the group
      if (group.itemIds.length > 0) {
        await mut.updateGroupItemOrder(groupId, group.itemIds);
      }

      // Create items in this group
      for (const itemId of group.itemIds) {
        const item = items[itemId];
        if (!item) continue;

        await mut.createItem(itemId, groupId, boardId, item.parentItemId);

        // Create cell values
        const cells: Array<{ item_id: string; column_id: string; value: CellValue }> = [];
        for (const [colId, value] of Object.entries(item.values)) {
          if (value !== null && value !== undefined && value !== '') {
            cells.push({ item_id: itemId, column_id: colId, value });
          }
        }
        if (cells.length > 0) {
          await mut.bulkInsertCellValues(cells);
        }
      }
    }
  }
}
