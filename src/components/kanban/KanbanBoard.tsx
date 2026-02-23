'use client';

import { useState, useCallback, useMemo } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { useUIStore } from '@/store/uiStore';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/lib/constants';
import { isStatusValue, isPersonValue } from '@/lib/utils';
import { Item } from '@/lib/types';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';

interface KanbanBoardProps {
  boardId: string;
}

export default function KanbanBoard({ boardId }: KanbanBoardProps) {
  const board = useBoardStore((s) => s.boards[boardId]);
  const groups = useBoardStore((s) => s.groups);
  const items = useBoardStore((s) => s.items);
  const updateItemValue = useBoardStore((s) => s.updateItemValue);
  const moveItem = useBoardStore((s) => s.moveItem);
  const filters = useUIStore((s) => s.activeFilters);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Find first status column
  const statusColumn = useMemo(() => {
    if (!board) return null;
    return board.columns.find((c) => c.type === 'status') || null;
  }, [board]);

  // Determine which status options to use
  const statusOptions = useMemo(() => {
    if (!statusColumn) return [];
    const isPriority = statusColumn.title.toLowerCase().includes('priority');
    const options = isPriority ? PRIORITY_OPTIONS : STATUS_OPTIONS;
    // Put blank (unassigned) first, then labeled statuses
    const blank = options.find((s) => !s.label);
    const labeled = options.filter((s) => s.label);
    return blank ? [blank, ...labeled] : labeled;
  }, [statusColumn]);

  // Get all items from all groups on this board (exclude subitems)
  const allItems = useMemo(() => {
    if (!board) return [];
    return Object.values(items).filter(
      (item) => item.boardId === boardId && !item.parentItemId
    );
  }, [items, boardId, board]);

  // Apply filters
  const filteredItems = useMemo(() => {
    const { statusFilter, personFilter, keyword } = filters;
    const hasFilters =
      statusFilter.length > 0 || personFilter.length > 0 || keyword.length > 0;

    if (!hasFilters) return allItems;

    return allItems.filter((item) => {
      if (statusFilter.length > 0) {
        const hasMatchingStatus = Object.values(item.values).some(
          (v) => isStatusValue(v) && statusFilter.includes(v.label)
        );
        if (!hasMatchingStatus) return false;
      }
      if (personFilter.length > 0) {
        const hasMatchingPerson = Object.values(item.values).some(
          (v) => isPersonValue(v) && personFilter.includes(v.id)
        );
        if (!hasMatchingPerson) return false;
      }
      if (keyword.length > 0) {
        const kw = keyword.toLowerCase();
        const hasMatch = Object.values(item.values).some((v) => {
          if (typeof v === 'string') return v.toLowerCase().includes(kw);
          if (isStatusValue(v)) return v.label.toLowerCase().includes(kw);
          if (isPersonValue(v)) return v.name.toLowerCase().includes(kw);
          return false;
        });
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [allItems, filters]);

  // Group items by their status in the first status column
  const itemsByStatus = useMemo(() => {
    const grouped: Record<string, Item[]> = {};
    statusOptions.forEach((opt) => {
      grouped[opt.label] = [];
    });

    filteredItems.forEach((item) => {
      if (!statusColumn) return;
      const statusVal = item.values[statusColumn.id];
      const label = isStatusValue(statusVal) ? statusVal.label : '';
      if (grouped[label] !== undefined) {
        grouped[label].push(item);
      } else {
        // If status doesn't match any option, put in unassigned
        if (grouped[''] !== undefined) {
          grouped[''].push(item);
        }
      }
    });

    return grouped;
  }, [filteredItems, statusOptions, statusColumn]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || !statusColumn) return;

      const itemId = active.id as string;
      const overId = over.id as string;

      // If dropped on another card, find which column that card is in
      const overItem = items[overId];
      let targetLabel: string;

      if (overItem && statusColumn) {
        // Dropped on another card — use that card's column (status)
        const overStatus = overItem.values[statusColumn.id];
        targetLabel = isStatusValue(overStatus) ? overStatus.label : '';
      } else {
        // Dropped on a column droppable (overId is the status label)
        targetLabel = overId;
      }

      // Find the matching status option
      const targetOption = statusOptions.find((s) => s.label === targetLabel);
      if (!targetOption) return;

      // Check if status actually changed
      const currentStatus = items[itemId]?.values[statusColumn.id];
      const currentLabel = isStatusValue(currentStatus)
        ? currentStatus.label
        : '';
      if (currentLabel === targetLabel) return;

      // Update the item's status
      updateItemValue(itemId, statusColumn.id, {
        label: targetOption.label,
        color: targetOption.color,
      });

      // Sync: move item to a group whose title matches the target status label
      // This keeps table view groups consistent with kanban columns
      if (board) {
        const matchingGroupId = board.groupIds.find((gid) => {
          const g = groups[gid];
          return g && g.title.toLowerCase() === targetLabel.toLowerCase();
        });
        if (matchingGroupId && items[itemId]?.groupId !== matchingGroupId) {
          const targetGroup = groups[matchingGroupId];
          if (targetGroup) {
            moveItem(itemId, matchingGroupId, targetGroup.itemIds.length);
          }
        }
      }
    },
    [items, groups, board, statusColumn, statusOptions, updateItemValue, moveItem]
  );

  if (!board) return null;

  if (!statusColumn) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#676879]">
        <div className="text-center">
          <p className="text-[18px] font-medium mb-2">
            No status column found
          </p>
          <p className="text-[14px]">
            Add a status column to use Kanban view
          </p>
        </div>
      </div>
    );
  }

  const activeItem = activeId ? items[activeId] : null;
  const hasFilters =
    filters.statusFilter.length > 0 ||
    filters.personFilter.length > 0 ||
    filters.keyword.length > 0;
  const totalItemCount = allItems.length;
  const filteredCount = filteredItems.length;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-3 md:px-8 py-4">
        {hasFilters && filteredCount < totalItemCount && (
          <div className="mb-3 px-3 py-2 bg-[#F0F0FF] rounded-lg text-[13px] text-[#6161FF] inline-flex items-center gap-1.5">
            Showing {filteredCount} of {totalItemCount} items
          </div>
        )}
        <div className="flex gap-3 h-full min-w-max">
          {statusOptions.map((opt) => (
            <KanbanColumn
              key={opt.label}
              statusLabel={opt.label}
              color={opt.color}
              items={itemsByStatus[opt.label] || []}
              columns={board.columns}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="opacity-90 w-[280px]">
            <KanbanCard item={activeItem} columns={board.columns} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
