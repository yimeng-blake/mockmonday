'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { useUIStore } from '@/store/uiStore';
import Group from '@/components/group/Group';
import ItemDetailModal from '@/components/item/ItemDetailModal';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import CalendarView from '@/components/calendar/CalendarView';
import { isStatusValue } from '@/lib/utils';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/lib/constants';
import { Plus, GripVertical } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';
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
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BoardContentProps {
  boardId: string;
}

// Wrapper to make each group sortable (for group reorder)
function SortableGroup({
  groupId,
  columns,
}: {
  groupId: string;
  columns: import('@/lib/types').Column[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `group-drag-${groupId}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : ('auto' as const),
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Group
        groupId={groupId}
        columns={columns}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function BoardContent({ boardId }: BoardContentProps) {
  const board = useBoardStore((s) => s.boards[boardId]);
  const groups = useBoardStore((s) => s.groups);
  const addGroup = useBoardStore((s) => s.addGroup);
  const moveItem = useBoardStore((s) => s.moveItem);
  const reorderGroups = useBoardStore((s) => s.reorderGroups);
  const updateItemValue = useBoardStore((s) => s.updateItemValue);
  const items = useBoardStore((s) => s.items);
  const currentView = useUIStore((s) => s.currentView);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'item' | 'group' | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  // Subscribe to realtime changes for this board
  useEffect(() => {
    let cancelled = false;
    import('@/lib/supabase/realtime').then(({ subscribeToBoardChanges, unsubscribe }) => {
      if (cancelled) return;
      // Unsubscribe from previous board if any
      if (realtimeChannelRef.current) {
        unsubscribe(realtimeChannelRef.current);
      }
      realtimeChannelRef.current = subscribeToBoardChanges(boardId);
    });

    return () => {
      cancelled = true;
      import('@/lib/supabase/realtime').then(({ unsubscribe }) => {
        unsubscribe(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      });
    };
  }, [boardId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = event.active.id as string;
      if (id.startsWith('group-drag-')) {
        setDragType('group');
        setActiveId(id.replace('group-drag-', ''));
      } else {
        setDragType('item');
        setActiveId(id);
      }
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const currentDragType = dragType;
      setActiveId(null);
      setDragType(null);

      if (!over) return;

      // Handle group reorder
      if (currentDragType === 'group') {
        const activeGroupId = (active.id as string).replace('group-drag-', '');
        const overGroupId = (over.id as string).replace('group-drag-', '');
        if (activeGroupId === overGroupId || !board) return;

        const fromIndex = board.groupIds.indexOf(activeGroupId);
        const toIndex = board.groupIds.indexOf(overGroupId);
        if (fromIndex === -1 || toIndex === -1) return;

        reorderGroups(boardId, fromIndex, toIndex);
        return;
      }

      // Handle item drag (existing logic)
      const activeItemId = active.id as string;
      const overId = over.id as string;

      if (activeItemId === overId) return;

      const activeItem = items[activeItemId];
      if (!activeItem) return;

      const overItem = items[overId];

      let targetGroupId: string | null = null;

      if (overItem) {
        targetGroupId = overItem.groupId;
        const targetGroup = useBoardStore.getState().groups[targetGroupId];
        if (!targetGroup) return;
        const overIndex = targetGroup.itemIds.indexOf(overId);
        moveItem(activeItemId, targetGroupId, overIndex);
      } else {
        const targetGroup = useBoardStore.getState().groups[overId];
        if (targetGroup) {
          targetGroupId = overId;
          moveItem(activeItemId, overId, targetGroup.itemIds.length);
        }
      }

      // Sync: update status column to match the target group's title
      if (targetGroupId && targetGroupId !== activeItem.groupId && board) {
        const tGroup = useBoardStore.getState().groups[targetGroupId];
        if (tGroup) {
          const statusCol = board.columns.find((c) => c.type === 'status');
          if (statusCol) {
            const isPriority = statusCol.title.toLowerCase().includes('priority');
            const options = isPriority ? PRIORITY_OPTIONS : STATUS_OPTIONS;
            const match = options.find(
              (o) => o.label.toLowerCase() === tGroup.title.toLowerCase()
            );
            if (match) {
              updateItemValue(activeItemId, statusCol.id, {
                label: match.label,
                color: match.color,
              });
            }
          }
        }
      }
    },
    [items, board, boardId, dragType, moveItem, reorderGroups, updateItemValue]
  );

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full text-[#676879]">
        <div className="text-center">
          <p className="text-[18px] font-medium mb-2">Board not found</p>
          <p className="text-[14px]">Select a board from the sidebar</p>
        </div>
      </div>
    );
  }

  const groupDragIds = board.groupIds.map((gid) => `group-drag-${gid}`);

  return (
    <>
      {currentView === 'calendar' ? (
        <CalendarView boardId={boardId} />
      ) : currentView === 'kanban' ? (
        <KanbanBoard boardId={boardId} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-auto px-2 md:px-8 py-4">
            <SortableContext
              items={groupDragIds}
              strategy={verticalListSortingStrategy}
            >
              {board.groupIds.map((groupId) => (
                <SortableGroup
                  key={groupId}
                  groupId={groupId}
                  columns={board.columns}
                />
              ))}
            </SortableContext>

            <button
              onClick={() => addGroup(boardId)}
              className="flex items-center gap-2 px-4 py-2 text-[14px] text-[#676879] hover:text-[#323338] hover:bg-[#F6F7FB] rounded-md transition-colors mt-2"
            >
              <Plus size={16} />
              <span>Add new group</span>
            </button>
          </div>

          <DragOverlay>
            {activeId && dragType === 'item' && items[activeId] ? (
              <div className="bg-white shadow-lg border border-[#6161FF] rounded px-4 py-2 text-[14px] text-[#323338] opacity-90">
                {(items[activeId].values[board.columns[0]?.id] as string) || 'Item'}
              </div>
            ) : null}
            {activeId && dragType === 'group' && groups[activeId] ? (
              <div className="bg-white shadow-lg border border-[#6161FF] rounded px-4 py-2 text-[14px] font-semibold opacity-90" style={{ color: groups[activeId].color }}>
                {groups[activeId].title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <ItemDetailModal />
    </>
  );
}
