'use client';

import { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { useUIStore } from '@/store/uiStore';
import { useFilteredItems } from '@/hooks/useFilteredItems';
import { Column } from '@/lib/types';
import { GROUP_COLORS } from '@/lib/constants';
import SortableItem from '@/components/item/SortableItem';
import AddColumnButton from '@/components/columns/AddColumnButton';
import ColumnHeader from '@/components/columns/ColumnHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ChevronDown, ChevronRight, Plus, MoreHorizontal, Trash2, Palette, GripVertical } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface GroupProps {
  groupId: string;
  columns: Column[];
  dragHandleProps?: Record<string, unknown>;
}

export default function Group({ groupId, columns, dragHandleProps }: GroupProps) {
  const group = useBoardStore((s) => s.groups[groupId]);
  const toggleCollapse = useBoardStore((s) => s.toggleGroupCollapse);
  const renameGroup = useBoardStore((s) => s.renameGroup);
  const deleteGroup = useBoardStore((s) => s.deleteGroup);
  const setGroupColor = useBoardStore((s) => s.setGroupColor);
  const addItem = useBoardStore((s) => s.addItem);
  const filteredItemIds = useFilteredItems(groupId);
  const hasActiveFilters = useUIStore((s) => s.hasActiveFilters);
  const totalItems = group?.itemIds.length ?? 0;
  const filtersActive = hasActiveFilters();
  const hiddenCount = filtersActive ? totalItems - filteredItemIds.length : 0;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { setNodeRef: setDropRef } = useDroppable({ id: groupId });

  if (!group) return null;

  const handleStartEdit = () => {
    setTitle(group.title);
    setEditing(true);
  };

  const handleSubmit = () => {
    if (title.trim()) renameGroup(groupId, title.trim());
    setEditing(false);
  };

  const handleAddItem = () => {
    addItem(groupId);
  };

  return (
    <div className="mb-6 group">
      {/* Group header */}
      <div className="flex items-center gap-1 mb-0 px-0 group/header">
        {/* Group drag handle */}
        <div
          className="p-1 opacity-0 group-hover/header:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-[#C5C7D0] hover:text-[#676879]"
          {...dragHandleProps}
        >
          <GripVertical size={16} />
        </div>

        <button
          onClick={() => toggleCollapse(groupId)}
          className="p-1 rounded hover:bg-[#F6F7FB] transition-colors"
          style={{ color: group.color }}
        >
          {group.collapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
        </button>

        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') setEditing(false);
            }}
            autoFocus
            className="text-[16px] font-semibold bg-transparent outline-none border-b-2"
            style={{ color: group.color, borderColor: group.color }}
          />
        ) : (
          <span
            onClick={handleStartEdit}
            className="text-[16px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: group.color }}
          >
            {group.title}
          </span>
        )}

        <span className="text-[12px] text-[#676879] ml-2">
          {filtersActive && hiddenCount > 0
            ? `${filteredItemIds.length}/${totalItems} items`
            : `${filteredItemIds.length} ${filteredItemIds.length === 1 ? 'item' : 'items'}`
          }
        </span>

        {/* Group menu */}
        <div className="relative ml-1">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded hover:bg-[#F6F7FB] text-[#C5C7D0] hover:text-[#676879] transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => { setMenuOpen(false); setColorOpen(false); }} />
              <div className="absolute left-0 top-full mt-1 z-40 bg-white rounded-lg shadow-lg border border-[#D0D4E4] py-1 w-[180px]">
                <button
                  onClick={() => { setColorOpen(!colorOpen); }}
                  className="w-full text-left px-3 py-2 text-[13px] text-[#323338] hover:bg-[#F6F7FB] flex items-center gap-2"
                >
                  <Palette size={14} />
                  Change color
                </button>
                {colorOpen && (
                  <div className="px-3 py-2 flex flex-wrap gap-1.5">
                    {GROUP_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setGroupColor(groupId, color);
                          setMenuOpen(false);
                          setColorOpen(false);
                        }}
                        className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
                        style={{
                          background: color,
                          outline: color === group.color ? '2px solid #323338' : 'none',
                          outlineOffset: '2px',
                        }}
                      />
                    ))}
                  </div>
                )}
                <button
                  onClick={() => {
                    setConfirmDelete(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[13px] text-[#E2445C] hover:bg-[#FFF0F0] flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete group
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Column headers + Items (horizontally scrollable on mobile) */}
      {!group.collapsed && (
        <div className="overflow-x-auto">
          <div className="min-w-fit">
            {/* Column headers */}
            <div className="flex items-stretch h-[36px] bg-white border-b border-t border-[#D0D4E4]">
              <div className="w-[6px] shrink-0 rounded-tl-md" style={{ background: group.color }} />
              <div className="w-[28px] shrink-0" />
              {columns.map((col) => (
                <ColumnHeader key={col.id} column={col} boardId={group.boardId} />
              ))}
              <AddColumnButton boardId={group.boardId} />
              <div className="flex-1" />
            </div>

            {/* Items */}
            <div ref={setDropRef}>
              <SortableContext items={filteredItemIds} strategy={verticalListSortingStrategy}>
                {filteredItemIds.map((itemId) => (
                  <SortableItem
                    key={itemId}
                    itemId={itemId}
                    columns={columns}
                    groupColor={group.color}
                  />
                ))}
              </SortableContext>

              {filteredItemIds.length === 0 && filtersActive && totalItems > 0 && (
                <div className="flex items-center h-[38px] border-b border-[#E6E9EF] px-10 text-[13px] text-[#C5C7D0] italic">
                  {hiddenCount} item{hiddenCount === 1 ? '' : 's'} hidden by filters
                </div>
              )}

              {filteredItemIds.length === 0 && !filtersActive && totalItems === 0 && (
                <div className="flex items-center h-[38px] border-b border-[#E6E9EF] px-10 text-[13px] text-[#C5C7D0] italic">
                  No items yet — click &quot;+ Add item&quot; below
                </div>
              )}

              {/* Add item footer */}
              <div className="flex items-center h-[38px] border-b border-[#E6E9EF] cursor-pointer hover:bg-[#F5F6F8] transition-colors">
                <div className="w-[6px] shrink-0 rounded-bl-md" style={{ background: group.color }} />
                <button
                  onClick={handleAddItem}
                  className="flex items-center gap-1 px-3 h-full text-[14px] text-[#C5C7D0] hover:text-[#676879] transition-colors"
                >
                  <Plus size={16} />
                  <span>Add item</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete group"
        message={`Are you sure you want to delete "${group.title}" and all ${group.itemIds.length} item${group.itemIds.length === 1 ? '' : 's'} in it? You can undo this with Ctrl+Z.`}
        confirmLabel="Delete group"
        onConfirm={() => {
          deleteGroup(groupId);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
