'use client';

import { useMemo, useEffect, useCallback } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { useGoogleStore } from '@/store/googleStore';
import CalendarDayCell from './CalendarDayCell';
import ItemDetailModal from '@/components/item/ItemDetailModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CalendarViewProps {
  boardId?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ boardId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const boards = useBoardStore((s) => s.boards);
  const groups = useBoardStore((s) => s.groups);
  const items = useBoardStore((s) => s.items);
  const isGoogleConnected = useGoogleStore((s) => s.isConnected);
  const calendarEvents = useGoogleStore((s) => s.calendarEvents);
  const fetchCalendarEvents = useGoogleStore((s) => s.fetchCalendarEvents);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Compute the calendar grid range (may include days from prev/next month)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay(); // 0=Sun
  const totalDays = lastDay.getDate();
  const totalCells = Math.ceil((startOffset + totalDays) / 7) * 7;

  // Time range for Google Calendar API
  const timeMin = useMemo(() => {
    const d = new Date(year, month, 1 - startOffset);
    return d.toISOString();
  }, [year, month, startOffset]);

  const timeMax = useMemo(() => {
    const d = new Date(year, month, 1 - startOffset + totalCells);
    return d.toISOString();
  }, [year, month, startOffset, totalCells]);

  // Fetch Google Calendar events when month changes
  useEffect(() => {
    if (isGoogleConnected) {
      fetchCalendarEvents(timeMin, timeMax);
    }
  }, [isGoogleConnected, timeMin, timeMax, fetchCalendarEvents]);

  // Collect all MockMonday tasks with date values
  const tasksByDate = useMemo(() => {
    const map: Record<string, Array<{ id: string; name: string; boardName: string; color: string }>> = {};

    const targetBoardIds = boardId ? [boardId] : Object.keys(boards);

    for (const bid of targetBoardIds) {
      const board = boards[bid];
      if (!board) continue;

      const dateColumns = board.columns.filter((c) => c.type === 'date');
      const nameColumn = board.columns[0]; // First column is always the name

      for (const gid of board.groupIds) {
        const group = groups[gid];
        if (!group) continue;

        for (const itemId of group.itemIds) {
          const item = items[itemId];
          if (!item) continue;

          const itemName = nameColumn ? (item.values[nameColumn.id] as string) || 'Untitled' : 'Untitled';

          for (const dateCol of dateColumns) {
            const dateVal = item.values[dateCol.id];
            if (typeof dateVal === 'string' && dateVal) {
              // dateVal is YYYY-MM-DD
              if (!map[dateVal]) map[dateVal] = [];
              map[dateVal].push({
                id: itemId,
                name: itemName,
                boardName: board.name,
                color: group.color,
              });
            }
          }
        }
      }
    }
    return map;
  }, [boardId, boards, groups, items]);

  // Group Google events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof calendarEvents> = {};
    for (const ev of calendarEvents) {
      const dateStr = ev.start.substring(0, 10); // YYYY-MM-DD
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(ev);
    }
    return map;
  }, [calendarEvents]);

  const goToPrev = useCallback(() => {
    setCurrentDate(new Date(year, month - 1, 1));
  }, [year, month]);

  const goToNext = useCallback(() => {
    setCurrentDate(new Date(year, month + 1, 1));
  }, [year, month]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const monthLabel = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Build day cells
  const cells = useMemo(() => {
    const result: Array<{
      day: number | null;
      dateStr: string;
      isToday: boolean;
      isCurrentMonth: boolean;
    }> = [];

    for (let i = 0; i < totalCells; i++) {
      const dayDate = new Date(year, month, i - startOffset + 1);
      const d = dayDate.getDate();
      const m = dayDate.getMonth();
      const y = dayDate.getFullYear();
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      result.push({
        day: d,
        dateStr,
        isToday: dateStr === todayStr,
        isCurrentMonth: m === month,
      });
    }
    return result;
  }, [year, month, startOffset, totalCells, todayStr]);

  return (
    <div className="flex-1 overflow-auto px-8 py-4">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-semibold text-[#323338]">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrev}
              className="p-1 rounded hover:bg-[#E6E9EF] text-[#676879] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToNext}
              className="p-1 rounded hover:bg-[#E6E9EF] text-[#676879] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-[13px] font-medium text-[#6161FF] border border-[#6161FF] rounded-md hover:bg-[#F0EFFF] transition-colors"
          >
            Today
          </button>
        </div>

        {!isGoogleConnected && (
          <a
            href="/api/auth/google"
            className="text-[13px] text-[#4285F4] hover:underline"
          >
            Connect Google Calendar →
          </a>
        )}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-t border-l border-[#E6E9EF]">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-[12px] font-medium text-[#676879] text-center py-2 border-r border-b border-[#E6E9EF] bg-[#F6F7FB]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-l border-[#E6E9EF]">
        {cells.map((cell, i) => (
          <CalendarDayCell
            key={i}
            day={cell.day}
            isToday={cell.isToday}
            isCurrentMonth={cell.isCurrentMonth}
            tasks={tasksByDate[cell.dateStr] || []}
            events={eventsByDate[cell.dateStr] || []}
          />
        ))}
      </div>

      <ItemDetailModal />
    </div>
  );
}
