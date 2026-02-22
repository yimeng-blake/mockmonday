'use client';

import { useEffect } from 'react';
import { useUndoStore } from '@/store/undoStore';

export function useKeyboardShortcuts() {
  const undo = useUndoStore((s) => s.undo);
  const redo = useUndoStore((s) => s.redo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't fire shortcuts when typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const isMod = e.metaKey || e.ctrlKey;

      // Undo: Cmd/Ctrl + Z (without Shift)
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Cmd/Ctrl + Shift + Z
      if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      // Redo: Cmd/Ctrl + Y (Windows convention)
      if (isMod && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
}
