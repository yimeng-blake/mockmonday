'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ItemRow from './ItemRow';
import { Column } from '@/lib/types';

interface SortableItemProps {
  itemId: string;
  columns: Column[];
  groupColor: string;
}

export default function SortableItem({ itemId, columns, groupColor }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : 'auto' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ItemRow
        itemId={itemId}
        columns={columns}
        groupColor={groupColor}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
