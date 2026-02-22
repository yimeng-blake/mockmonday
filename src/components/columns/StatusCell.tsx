'use client';

import { useState, useRef } from 'react';
import { StatusValue } from '@/lib/types';
import { STATUS_OPTIONS } from '@/lib/constants';

interface StatusCellProps {
  value: StatusValue | null;
  onChange: (value: StatusValue) => void;
  options?: StatusValue[];
}

export default function StatusCell({ value, onChange, options }: StatusCellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const statusOptions = options || STATUS_OPTIONS;

  const currentColor = value?.color || '#C4C4C4';
  const currentLabel = value?.label || '';

  return (
    <div ref={ref} className="relative w-full h-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-full flex items-center justify-center text-[13px] font-medium text-white cursor-pointer transition-all duration-150 hover:brightness-110"
        style={{
          background: currentColor,
        }}
      >
        {currentLabel}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-40 bg-white rounded-lg shadow-lg border border-[#D0D4E4] p-2 w-[180px]">
            <div className="grid grid-cols-1 gap-1">
              {statusOptions.map((status, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onChange(status);
                    setOpen(false);
                  }}
                  className="flex items-center justify-center py-2 px-3 rounded-md text-[13px] font-medium text-white transition-all hover:brightness-110 hover:scale-[1.02]"
                  style={{ background: status.color }}
                >
                  {status.label || '\u00A0'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
