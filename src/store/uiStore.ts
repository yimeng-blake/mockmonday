'use client';

import { create } from 'zustand';
import { FilterState, SortConfig } from '@/lib/types';

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  currentView: 'table' | 'kanban' | 'calendar';
  setCurrentView: (view: 'table' | 'kanban' | 'calendar') => void;

  activeFilters: FilterState;
  setStatusFilter: (statuses: string[]) => void;
  setPersonFilter: (personIds: string[]) => void;
  setKeyword: (keyword: string) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;

  sortConfig: SortConfig | null;
  setSortConfig: (config: SortConfig | null) => void;

  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  currentView: 'table',
  setCurrentView: (view) => set({ currentView: view }),

  activeFilters: {
    statusFilter: [],
    personFilter: [],
    keyword: '',
  },
  setStatusFilter: (statuses) =>
    set((s) => ({ activeFilters: { ...s.activeFilters, statusFilter: statuses } })),
  setPersonFilter: (personIds) =>
    set((s) => ({ activeFilters: { ...s.activeFilters, personFilter: personIds } })),
  setKeyword: (keyword) =>
    set((s) => ({ activeFilters: { ...s.activeFilters, keyword } })),
  clearFilters: () =>
    set({ activeFilters: { statusFilter: [], personFilter: [], keyword: '' } }),
  hasActiveFilters: () => {
    const f = get().activeFilters;
    return f.statusFilter.length > 0 || f.personFilter.length > 0 || f.keyword.length > 0;
  },

  sortConfig: null,
  setSortConfig: (config) => set({ sortConfig: config }),

  selectedItemId: null,
  setSelectedItemId: (id) => set({ selectedItemId: id }),
}));
