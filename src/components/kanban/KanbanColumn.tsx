'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Item, Column } from '@/lib/types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  statusLabel: string;
  color: string;
  items: Item[];
  columns: Column[];
}

export default function KanbanColumn({
  statusLabel,
  color,
  items,
  columns,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: statusLabel });
  const itemIds = items.map((i) => i.id);

  return (
    <div
      className={`flex flex-col w-[240px] md:w-[280px] shrink-0 rounded-lg transition-colors ${
        isOver ? 'bg-[#ECEDF5]' : 'bg-[#F6F7FB]'
      }`}
    >
      {/* Column header */}
      <div className="px-3 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: color }}
          />
          <span className="text-[14px] font-semibold text-[#323338] truncate">
            {statusLabel || 'Unassigned'}
          </span>
          <span className="text-[12px] text-[#676879] ml-auto shrink-0">
            {items.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[100px]"
      >
        <SortableContext
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          {items.length === 0 && (
            <div className="text-[12px] text-[#C5C7D0] text-center py-6 italic">
              No items
            </div>
          )}
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} columns={columns} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
