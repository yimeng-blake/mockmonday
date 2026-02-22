'use client';

import { useState, useRef, useEffect } from 'react';

interface NumberCellProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function NumberCell({ value, onChange }: NumberCellProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value?.toString() || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(value?.toString() || '');
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSubmit = () => {
    const num = parseFloat(text);
    onChange(isNaN(num) ? null : num);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') {
            setText(value?.toString() || '');
            setEditing(false);
          }
        }}
        className="w-full h-full px-2 text-[14px] text-right bg-white border-none outline-none"
        style={{ boxShadow: '0 0 0 2px #6161FF', borderRadius: '2px' }}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="w-full h-full flex items-center justify-center text-[14px] text-[#323338] cursor-text"
    >
      {value !== null && value !== undefined ? value : ''}
    </div>
  );
}
