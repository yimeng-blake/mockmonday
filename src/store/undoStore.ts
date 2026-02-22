'use client';

import { create } from 'zustand';
import toast from 'react-hot-toast';

interface Snapshot {
  boards: Record<string, any>;
  groups: Record<string, any>;
  items: Record<string, any>;
  boardOrder: string[];
}

interface UndoStore {
  past: Snapshot[];
  future: Snapshot[];

  pushState: (snapshot: Snapshot) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

const MAX_HISTORY = 30;

// We import boardStore lazily to avoid circular dependency
let getBoardStore: () => any;
let setBoardStore: (state: any) => void;

export function connectBoardStore(
  getState: () => any,
  setState: (state: any) => void
) {
  getBoardStore = getState;
  setBoardStore = setState;
}

export const useUndoStore = create<UndoStore>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushState: (snapshot) => {
    set((s) => {
      const newPast = [...s.past.slice(-(MAX_HISTORY - 1)), snapshot];
      return {
        past: newPast,
        future: [],
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: () => {
    const { past } = get();
    if (past.length === 0 || !getBoardStore || !setBoardStore) return;

    const current = getBoardStore();
    const currentSnapshot: Snapshot = {
      boards: current.boards,
      groups: current.groups,
      items: current.items,
      boardOrder: current.boardOrder,
    };

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    setBoardStore({
      boards: previous.boards,
      groups: previous.groups,
      items: previous.items,
      boardOrder: previous.boardOrder,
    });

    set((s) => {
      const newFuture = [...s.future, currentSnapshot];
      return {
        past: newPast,
        future: newFuture,
        canUndo: newPast.length > 0,
        canRedo: true,
      };
    });

    toast('Action undone', { duration: 1500, icon: '↩️' });
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0 || !getBoardStore || !setBoardStore) return;

    const current = getBoardStore();
    const currentSnapshot: Snapshot = {
      boards: current.boards,
      groups: current.groups,
      items: current.items,
      boardOrder: current.boardOrder,
    };

    const next = future[future.length - 1];
    const newFuture = future.slice(0, -1);

    setBoardStore({
      boards: next.boards,
      groups: next.groups,
      items: next.items,
      boardOrder: next.boardOrder,
    });

    set((s) => {
      const newPast = [...s.past, currentSnapshot];
      return {
        past: newPast,
        future: newFuture,
        canUndo: true,
        canRedo: newFuture.length > 0,
      };
    });

    toast('Action redone', { duration: 1500, icon: '↪️' });
  },

  clear: () => set({ past: [], future: [], canUndo: false, canRedo: false }),
}));
