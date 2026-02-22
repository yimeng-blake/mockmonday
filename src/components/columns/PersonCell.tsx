'use client';

import { useState } from 'react';
import { PersonValue } from '@/lib/types';
import { usePeople, useCurrentPerson } from '@/hooks/usePeople';
import { getInitials } from '@/lib/utils';
import { X } from 'lucide-react';

interface PersonCellProps {
  value: PersonValue | null;
  onChange: (value: PersonValue | null) => void;
}

export default function PersonCell({ value, onChange }: PersonCellProps) {
  const [open, setOpen] = useState(false);
  const people = usePeople();
  const currentPerson = useCurrentPerson();

  return (
    <div className="relative w-full h-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-full flex items-center justify-center gap-1 px-2 hover:bg-[#F0F0FF] transition-colors"
      >
        {value ? (
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
              style={{ background: value.avatarColor }}
            >
              {getInitials(value.name)}
            </div>
            <span className="text-[13px] text-[#323338] truncate hidden xl:block">
              {value.name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full border-2 border-dashed border-[#C5C7D0] flex items-center justify-center">
            <span className="text-[#C5C7D0] text-[11px]">+</span>
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-40 bg-white rounded-lg shadow-lg border border-[#D0D4E4] py-1 w-[200px]">
            {value && (
              <button
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#676879] hover:bg-[#F6F7FB] transition-colors"
              >
                <X size={14} />
                <span>Unassign</span>
              </button>
            )}
            {people.map((person) => (
              <button
                key={person.id}
                onClick={() => {
                  onChange(person);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-[#F6F7FB] transition-colors"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                  style={{ background: person.avatarColor }}
                >
                  {getInitials(person.name)}
                </div>
                <span>{person.name}{person.id === currentPerson.id ? ' (Me)' : ''}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
