'use client';

import { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { useUIStore } from '@/store/uiStore';
import { Table2, LayoutGrid, CalendarDays } from 'lucide-react';

export default function BoardHeader({ boardId }: { boardId: string }) {
  const board = useBoardStore((s) => s.boards[boardId]);
  const renameBoard = useBoardStore((s) => s.renameBoard);
  const updateBoardDescription = useBoardStore((s) => s.updateBoardDescription);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [desc, setDesc] = useState('');
  const currentView = useUIStore((s) => s.currentView);
  const setCurrentView = useUIStore((s) => s.setCurrentView);

  if (!board) return null;

  const handleStartEdit = () => {
    setName(board.name);
    setEditing(true);
  };

  const handleSubmit = () => {
    if (name.trim()) {
      renameBoard(boardId, name.trim());
    }
    setEditing(false);
  };

  const handleStartDescEdit = () => {
    setDesc(board.description || '');
    setEditingDesc(true);
  };

  const handleDescSubmit = () => {
    updateBoardDescription(boardId, desc.trim());
    setEditingDesc(false);
  };

  return (
    <div className="px-8 pt-6 pb-2">
      {editing ? (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') setEditing(false);
          }}
          autoFocus
          className="text-[28px] font-bold text-[#323338] bg-transparent border-none outline-none w-full"
          style={{ lineHeight: '36px' }}
        />
      ) : (
        <h1
          onClick={handleStartEdit}
          className="text-[28px] font-bold text-[#323338] cursor-pointer hover:text-[#6161FF] transition-colors"
          style={{ lineHeight: '36px' }}
        >
          {board.name}
        </h1>
      )}

      {editingDesc ? (
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={handleDescSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleDescSubmit();
            if (e.key === 'Escape') setEditingDesc(false);
          }}
          autoFocus
          placeholder="Add a board description..."
          className="text-[14px] text-[#676879] mt-1 bg-transparent border-none outline-none w-full"
          style={{ borderBottom: '1px solid #6161FF', paddingBottom: '2px' }}
        />
      ) : (
        <p
          onClick={handleStartDescEdit}
          className="text-[14px] text-[#676879] mt-1 cursor-pointer hover:text-[#323338] transition-colors min-h-[20px]"
        >
          {board.description || 'Add a board description...'}
        </p>
      )}

      {/* View toggle */}
      <div className="flex gap-1 mt-3 bg-[#F6F7FB] rounded-md p-1 w-fit">
        <button
          onClick={() => setCurrentView('table')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${
            currentView === 'table'
              ? 'bg-white text-[#6161FF] shadow-sm'
              : 'text-[#676879] hover:text-[#323338]'
          }`}
        >
          <Table2 size={16} />
          <span>Table</span>
        </button>
        <button
          onClick={() => setCurrentView('kanban')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${
            currentView === 'kanban'
              ? 'bg-white text-[#6161FF] shadow-sm'
              : 'text-[#676879] hover:text-[#323338]'
          }`}
        >
          <LayoutGrid size={16} />
          <span>Kanban</span>
        </button>
        <button
          onClick={() => setCurrentView('calendar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${
            currentView === 'calendar'
              ? 'bg-white text-[#6161FF] shadow-sm'
              : 'text-[#676879] hover:text-[#323338]'
          }`}
        >
          <CalendarDays size={16} />
          <span>Calendar</span>
        </button>
      </div>
    </div>
  );
}
