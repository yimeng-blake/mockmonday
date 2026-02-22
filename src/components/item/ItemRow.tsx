'use client';

import { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { useUIStore } from '@/store/uiStore';
import { Column, CellValue, StatusValue, PersonValue } from '@/lib/types';
import { isStatusValue, isPersonValue } from '@/lib/utils';
import { PRIORITY_OPTIONS } from '@/lib/constants';
import TextCell from '@/components/columns/TextCell';
import StatusCell from '@/components/columns/StatusCell';
import PersonCell from '@/components/columns/PersonCell';
import DateCell from '@/components/columns/DateCell';
import NumberCell from '@/components/columns/NumberCell';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Trash2, GripVertical } from 'lucide-react';

interface ItemRowProps {
  itemId: string;
  columns: Column[];
  groupColor: string;
  dragHandleProps?: Record<string, unknown>;
}

export default function ItemRow({ itemId, columns, groupColor, dragHandleProps }: ItemRowProps) {
  const item = useBoardStore((s) => s.items[itemId]);
  const updateItemValue = useBoardStore((s) => s.updateItemValue);
  const deleteItem = useBoardStore((s) => s.deleteItem);
  const setSelectedItemId = useUIStore((s) => s.setSelectedItemId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!item) return null;

  const itemName = columns[0] ? (item.values[columns[0].id] as string) || 'Untitled item' : 'Untitled item';

  const renderCell = (col: Column) => {
    const value = item.values[col.id];

    switch (col.type) {
      case 'text': {
        const isNameCol = columns.indexOf(col) === 0;
        return (
          <TextCell
            value={(value as string) || ''}
            onChange={(v) => updateItemValue(itemId, col.id, v)}
            isName={isNameCol}
            onOpenDetail={isNameCol ? () => setSelectedItemId(itemId) : undefined}
          />
        );
      }
      case 'status': {
        const isPriority = col.title.toLowerCase().includes('priority');
        return (
          <StatusCell
            value={isStatusValue(value) ? (value as StatusValue) : null}
            onChange={(v) => updateItemValue(itemId, col.id, v)}
            options={isPriority ? PRIORITY_OPTIONS : undefined}
          />
        );
      }
      case 'person':
        return (
          <PersonCell
            value={isPersonValue(value) ? (value as PersonValue) : null}
            onChange={(v) => updateItemValue(itemId, col.id, v)}
          />
        );
      case 'date':
        return (
          <DateCell
            value={(value as string) || null}
            onChange={(v) => updateItemValue(itemId, col.id, v)}
          />
        );
      case 'number':
        return (
          <NumberCell
            value={typeof value === 'number' ? value : null}
            onChange={(v) => updateItemValue(itemId, col.id, v)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="group/row flex items-stretch border-b border-[#E6E9EF] hover:bg-[#F5F6F8] transition-colors h-[38px]">
      {/* Group color bar */}
      <div className="w-[6px] shrink-0" style={{ background: groupColor }} />

      {/* Drag handle */}
      <div
        className="w-[28px] flex items-center justify-center shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...dragHandleProps}
      >
        <GripVertical size={14} className="text-[#C5C7D0]" />
      </div>

      {/* Cells */}
      {columns.map((col) => (
        <div
          key={col.id}
          className="border-r border-[#E6E9EF] shrink-0 relative"
          style={{ width: col.width || 150 }}
        >
          {renderCell(col)}
        </div>
      ))}

      {/* Delete button */}
      <div className="w-[40px] flex items-center justify-center shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
        <button
          onClick={() => setConfirmDelete(true)}
          className="text-[#C5C7D0] hover:text-[#E2445C] transition-colors p-1"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Fill remaining space */}
      <div className="flex-1" />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete item"
        message={`Are you sure you want to delete "${itemName}"? This will also remove all subitems. You can undo this with Ctrl+Z.`}
        confirmLabel="Delete"
        onConfirm={() => {
          deleteItem(itemId);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
