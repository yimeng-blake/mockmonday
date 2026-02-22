'use client';

import { useRef } from 'react';
import { formatDate } from '@/lib/utils';

interface DateCellProps {
  value: string | null;
  onChange: (value: string) => void;
}

export default function DateCell({ value, onChange }: DateCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = formatDate(value || null);
  const isOverdue = value ? new Date(value) < new Date(new Date().toDateString()) : false;

  return (
    <div className="relative w-full h-full">
      <div
        className={`w-full h-full flex items-center justify-center text-[13px] cursor-pointer hover:bg-[#F0F0FF] transition-colors ${
          isOverdue ? 'text-[#E2445C]' : value ? 'text-[#323338]' : 'text-[#C5C7D0]'
        }`}
        onClick={() => inputRef.current?.showPicker()}
      >
        {displayValue || '-'}
      </div>
      <input
        ref={inputRef}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 pointer-events-none"
      />
    </div>
  );
}
