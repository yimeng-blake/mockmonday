'use client';

import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useBoardStore } from '@/store/boardStore';
import { STATUS_OPTIONS } from '@/lib/constants';
import { usePeople } from '@/hooks/usePeople';
import { Search, Filter, X, User, CheckCircle, ArrowUpDown, Undo2, Redo2 } from 'lucide-react';
import { useUndoStore } from '@/store/undoStore';
import clsx from 'clsx';

export default function BoardToolbar({ boardId }: { boardId: string }) {
  const board = useBoardStore((s) => s.boards[boardId]);
  const filters = useUIStore((s) => s.activeFilters);
  const setKeyword = useUIStore((s) => s.setKeyword);
  const setStatusFilter = useUIStore((s) => s.setStatusFilter);
  const setPersonFilter = useUIStore((s) => s.setPersonFilter);
  const clearFilters = useUIStore((s) => s.clearFilters);
  const hasActiveFilters = useUIStore((s) => s.hasActiveFilters);
  const sortConfig = useUIStore((s) => s.sortConfig);
  const setSortConfig = useUIStore((s) => s.setSortConfig);
  const people = usePeople();
  const undo = useUndoStore((s) => s.undo);
  const redo = useUndoStore((s) => s.redo);
  const canUndo = useUndoStore((s) => s.canUndo);
  const canRedo = useUndoStore((s) => s.canRedo);
  const [showSearch, setShowSearch] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const active = hasActiveFilters();
  const sortedColumn = sortConfig ? board?.columns.find((c) => c.id === sortConfig.columnId) : null;

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  return (
    <div className="px-8 py-2 flex items-center gap-2 border-b border-[#E6E9EF]">
      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-[#E6E9EF]">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          className={clsx(
            'p-1.5 rounded-md transition-colors',
            canUndo
              ? 'text-[#676879] hover:bg-[#F6F7FB] cursor-pointer'
              : 'text-[#D0D4E4] cursor-not-allowed'
          )}
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
          className={clsx(
            'p-1.5 rounded-md transition-colors',
            canRedo
              ? 'text-[#676879] hover:bg-[#F6F7FB] cursor-pointer'
              : 'text-[#D0D4E4] cursor-not-allowed'
          )}
        >
          <Redo2 size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-colors',
            showSearch || filters.keyword
              ? 'bg-[#F0F0FF] text-[#6161FF]'
              : 'text-[#676879] hover:bg-[#F6F7FB]'
          )}
        >
          <Search size={16} />
          <span>Search</span>
        </button>
        {showSearch && (
          <div className="absolute top-full left-0 mt-1 z-30">
            <div className="bg-white rounded-lg shadow-lg border border-[#D0D4E4] p-2 w-[250px]">
              <input
                ref={searchRef}
                value={filters.keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search items..."
                className="w-full px-3 py-2 text-[13px] border border-[#D0D4E4] rounded-md outline-none focus:border-[#6161FF]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status filter */}
      <div className="relative">
        <button
          onClick={() => {
            setShowStatusDropdown(!showStatusDropdown);
            setShowPersonDropdown(false);
          }}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-colors',
            filters.statusFilter.length > 0
              ? 'bg-[#F0F0FF] text-[#6161FF]'
              : 'text-[#676879] hover:bg-[#F6F7FB]'
          )}
        >
          <Filter size={16} />
          <span>Status</span>
          {filters.statusFilter.length > 0 && (
            <span className="bg-[#6161FF] text-white text-[11px] rounded-full w-4 h-4 flex items-center justify-center">
              {filters.statusFilter.length}
            </span>
          )}
        </button>
        {showStatusDropdown && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowStatusDropdown(false)} />
            <div className="absolute top-full left-0 mt-1 z-30 bg-white rounded-lg shadow-lg border border-[#D0D4E4] py-1 w-[200px]">
              {STATUS_OPTIONS.filter((s) => s.label).map((status) => (
                <button
                  key={status.label}
                  onClick={() => {
                    const current = filters.statusFilter;
                    if (current.includes(status.label)) {
                      setStatusFilter(current.filter((s) => s !== status.label));
                    } else {
                      setStatusFilter([...current, status.label]);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-[#F6F7FB] transition-colors"
                >
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ background: status.color }}
                  />
                  <span className="flex-1 text-left">{status.label}</span>
                  {filters.statusFilter.includes(status.label) && (
                    <CheckCircle size={14} className="text-[#6161FF]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Person filter */}
      <div className="relative">
        <button
          onClick={() => {
            setShowPersonDropdown(!showPersonDropdown);
            setShowStatusDropdown(false);
          }}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-colors',
            filters.personFilter.length > 0
              ? 'bg-[#F0F0FF] text-[#6161FF]'
              : 'text-[#676879] hover:bg-[#F6F7FB]'
          )}
        >
          <User size={16} />
          <span>Person</span>
          {filters.personFilter.length > 0 && (
            <span className="bg-[#6161FF] text-white text-[11px] rounded-full w-4 h-4 flex items-center justify-center">
              {filters.personFilter.length}
            </span>
          )}
        </button>
        {showPersonDropdown && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowPersonDropdown(false)} />
            <div className="absolute top-full left-0 mt-1 z-30 bg-white rounded-lg shadow-lg border border-[#D0D4E4] py-1 w-[200px]">
              {people.map((person) => (
                <button
                  key={person.id}
                  onClick={() => {
                    const current = filters.personFilter;
                    if (current.includes(person.id)) {
                      setPersonFilter(current.filter((id) => id !== person.id));
                    } else {
                      setPersonFilter([...current, person.id]);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-[#F6F7FB] transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                    style={{ background: person.avatarColor }}
                  >
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="flex-1 text-left">{person.name}</span>
                  {filters.personFilter.includes(person.id) && (
                    <CheckCircle size={14} className="text-[#6161FF]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sort */}
      <div className="relative">
        <button
          onClick={() => {
            setShowSortDropdown(!showSortDropdown);
            setShowStatusDropdown(false);
            setShowPersonDropdown(false);
          }}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-colors',
            sortConfig
              ? 'bg-[#F0F0FF] text-[#6161FF]'
              : 'text-[#676879] hover:bg-[#F6F7FB]'
          )}
        >
          <ArrowUpDown size={16} />
          <span>{sortConfig && sortedColumn ? `Sort: ${sortedColumn.title}` : 'Sort'}</span>
        </button>
        {showSortDropdown && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowSortDropdown(false)} />
            <div className="absolute top-full left-0 mt-1 z-30 bg-white rounded-lg shadow-lg border border-[#D0D4E4] py-1 w-[220px]">
              {sortConfig && (
                <button
                  onClick={() => { setSortConfig(null); setShowSortDropdown(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#E2445C] hover:bg-[#FFF0F0] transition-colors"
                >
                  <X size={14} />
                  <span>Clear sort</span>
                </button>
              )}
              {board?.columns.map((col) => (
                <button
                  key={col.id}
                  onClick={() => {
                    setSortConfig({
                      columnId: col.id,
                      direction: sortConfig?.columnId === col.id && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                    });
                    setShowSortDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-[#F6F7FB] transition-colors"
                >
                  <span className="flex-1 text-left text-[#323338]">{col.title}</span>
                  {sortConfig?.columnId === col.id && (
                    <span className="text-[#6161FF] text-[11px] font-medium">
                      {sortConfig.direction === 'asc' ? 'A→Z' : 'Z→A'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Clear filters */}
      {active && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-2 py-1.5 text-[13px] text-[#E2445C] hover:bg-[#FFF0F0] rounded-md transition-colors"
        >
          <X size={14} />
          <span>Clear all filters</span>
        </button>
      )}

      {/* Active filter indicator */}
      {active && (
        <span className="text-[12px] text-[#676879] ml-auto italic">
          Filters active
        </span>
      )}
    </div>
  );
}
