'use client';

import { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { ColumnType } from '@/lib/types';
import { Plus, Type, Hash, Calendar, User, CircleDot } from 'lucide-react';

interface AddColumnButtonProps {
  boardId: string;
}

const COLUMN_TYPES: { type: ColumnType; label: string; icon: React.ReactNode }[] = [
  { type: 'status', label: 'Status', icon: <CircleDot size={16} /> },
  { type: 'person', label: 'Person', icon: <User size={16} /> },
  { type: 'date', label: 'Date', icon: <Calendar size={16} /> },
  { type: 'text', label: 'Text', icon: <Type size={16} /> },
  { type: 'number', label: 'Number', icon: <Hash size={16} /> },
];

export default function AddColumnButton({ boardId }: AddColumnButtonProps) {
  const [open, setOpen] = useState(false);
  const addColumn = useBoardStore((s) => s.addColumn);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-[40px] h-full flex items-center justify-center text-[#C5C7D0] hover:text-[#6161FF] hover:bg-[#F0F0FF] transition-colors"
        title="Add column"
      >
        <Plus size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-40 bg-white rounded-lg shadow-lg border border-[#D0D4E4] py-1 w-[160px]">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-[#676879] uppercase tracking-wider">
              Column type
            </div>
            {COLUMN_TYPES.map((ct) => (
              <button
                key={ct.type}
                onClick={() => {
                  addColumn(boardId, ct.label, ct.type);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#323338] hover:bg-[#F6F7FB] transition-colors"
              >
                <span className="text-[#676879]">{ct.icon}</span>
                {ct.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
