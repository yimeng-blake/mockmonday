'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item, Column } from '@/lib/types';
import { isPersonValue, formatDate, getInitials } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { Calendar } from 'lucide-react';

interface KanbanCardProps {
  item: Item;
  columns: Column[];
}

export default function KanbanCard({ item, columns }: KanbanCardProps) {
  const setSelectedItemId = useUIStore((s) => s.setSelectedItemId);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get item name (first text column)
  const nameColumn = columns.find((c) => c.type === 'text');
  const itemName = nameColumn
    ? (item.values[nameColumn.id] as string) || 'Untitled'
    : 'Untitled';

  // Get person (first person column)
  const personColumn = columns.find((c) => c.type === 'person');
  const personValue = personColumn ? item.values[personColumn.id] : null;
  const person = isPersonValue(personValue) ? personValue : null;

  // Get due date (first date column)
  const dateColumn = columns.find((c) => c.type === 'date');
  const dueDate = dateColumn ? (item.values[dateColumn.id] as string) : null;
  const isOverdue =
    dueDate && new Date(dueDate) < new Date(new Date().toDateString());

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedItemId(item.id)}
      className="bg-white rounded-lg border border-[#E6E9EF] p-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Item name */}
      <p className="text-[14px] text-[#323338] font-medium mb-3 line-clamp-2">
        {itemName}
      </p>

      {/* Footer: person and date */}
      <div className="flex items-center justify-between gap-2">
        {person ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
            style={{ background: person.avatarColor }}
            title={person.name}
          >
            {getInitials(person.name)}
          </div>
        ) : (
          <div className="w-6 h-6" />
        )}

        {dueDate && (
          <div
            className={`flex items-center gap-1 text-[12px] ${
              isOverdue ? 'text-[#E2445C]' : 'text-[#676879]'
            }`}
          >
            <Calendar size={12} />
            <span>{formatDate(dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
