'use client';

import { useState, useRef, useEffect } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { Column } from '@/lib/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { MoreHorizontal, Trash2, Pencil, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface ColumnHeaderProps {
  column: Column;
  boardId: string;
}

export default function ColumnHeader({ column, boardId }: ColumnHeaderProps) {
  const renameColumn = useBoardStore((s) => s.renameColumn);
  const deleteColumn = useBoardStore((s) => s.deleteColumn);
  const sortConfig = useUIStore((s) => s.sortConfig);
  const setSortConfig = useUIStore((s) => s.setSortConfig);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [editing]);

  const handleRename = () => {
    if (title.trim() && title.trim() !== column.title) renameColumn(boardId, column.id, title.trim());
    setEditing(false);
  };

  const isSorted = sortConfig?.columnId === column.id;
  const sortDir = isSorted ? sortConfig.direction : null;

  const handleSort = () => {
    if (!isSorted) setSortConfig({ columnId: column.id, direction: 'asc' });
    else if (sortDir === 'asc') setSortConfig({ columnId: column.id, direction: 'desc' });
    else setSortConfig(null);
    setMenuOpen(false);
  };

  return (
    <div className="flex items-center px-2 text-[13px] font-medium text-[#323338] border-r border-[#E6E9EF] shrink-0 group/col relative" style={{ width: column.width || 150 }}>
      {editing ? (
        <input ref={inputRef} value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleRename}
          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setTitle(column.title); setEditing(false); } }}
          className="flex-1 text-[13px] font-medium bg-white outline-none px-1 rounded" style={{ boxShadow: '0 0 0 2px #6161FF' }}
        />
      ) : (
        <>
          <span className="flex-1 truncate">{column.title}</span>
          {isSorted && <span className="text-[#6161FF] mr-0.5">{sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}</span>}
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-0.5 rounded hover:bg-[#E6E9EF] text-[#C5C7D0] hover:text-[#676879] opacity-0 group-hover/col:opacity-100 transition-opacity">
            <MoreHorizontal size={14} />
          </button>
        </>
      )}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-40 bg-white rounded-lg shadow-lg border border-[#D0D4E4] py-1 w-[160px]">
            <button onClick={handleSort} className="w-full text-left px-3 py-2 text-[13px] text-[#323338] hover:bg-[#F6F7FB] flex items-center gap-2">
              <ArrowUpDown size={14} />{!isSorted ? 'Sort ascending' : sortDir === 'asc' ? 'Sort descending' : 'Clear sort'}
            </button>
            <button onClick={() => { setEditing(true); setTitle(column.title); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-[13px] text-[#323338] hover:bg-[#F6F7FB] flex items-center gap-2">
              <Pencil size={14} />Rename
            </button>
            <button onClick={() => { setConfirmDelete(true); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-[13px] text-[#E2445C] hover:bg-[#FFF0F0] flex items-center gap-2">
              <Trash2 size={14} />Delete column
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete column"
        message={`Are you sure you want to delete the "${column.title}" column? All data in this column will be lost.`}
        confirmLabel="Delete column"
        onConfirm={() => {
          deleteColumn(boardId, column.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
