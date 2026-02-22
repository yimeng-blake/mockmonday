'use client';

import { useState, useRef, useEffect } from 'react';
import { Expand } from 'lucide-react';

interface TextCellProps {
  value: string;
  onChange: (value: string) => void;
  isName?: boolean;
  onOpenDetail?: () => void;
}

export default function TextCell({ value, onChange, isName, onOpenDetail }: TextCellProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSubmit = () => {
    onChange(text);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') {
            setText(value);
            setEditing(false);
          }
        }}
        className="w-full h-full px-2 text-[14px] bg-white border-none outline-none"
        style={{
          boxShadow: '0 0 0 2px #6161FF',
          borderRadius: '2px',
        }}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={`w-full h-full flex items-center px-2 text-[14px] cursor-text truncate group/text ${
        isName ? 'font-medium text-[#323338]' : 'text-[#323338]'
      } ${!value ? 'text-[#C5C7D0]' : ''}`}
    >
      <span className="flex-1 truncate">{value || (isName ? 'New item' : '')}</span>
      {isName && onOpenDetail && (
        <button
          onClick={(e) => { e.stopPropagation(); onOpenDetail(); }}
          className="shrink-0 ml-1 p-0.5 rounded hover:bg-[#E6E9EF] text-[#C5C7D0] hover:text-[#6161FF] opacity-0 group-hover/text:opacity-100 transition-all"
          title="Open item details"
        >
          <Expand size={14} />
        </button>
      )}
    </div>
  );
}
