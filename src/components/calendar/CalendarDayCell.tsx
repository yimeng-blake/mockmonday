'use client';

import { useState } from 'react';
import type { CalendarEvent } from '@/lib/google/types';
import { useUIStore } from '@/store/uiStore';
import CalendarEventPopover from './CalendarEventPopover';

interface TaskPill {
  id: string;
  name: string;
  boardName: string;
  color: string;
}

interface CalendarDayCellProps {
  day: number | null;
  isToday: boolean;
  isCurrentMonth: boolean;
  tasks: TaskPill[];
  events: CalendarEvent[];
}

export default function CalendarDayCell({
  day,
  isToday,
  isCurrentMonth,
  tasks,
  events,
}: CalendarDayCellProps) {
  const setSelectedItemId = useUIStore((s) => s.setSelectedItemId);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  if (day === null) {
    return <div className="min-h-[60px] md:min-h-[100px] bg-[#FAFBFC] border-r border-b border-[#E6E9EF]" />;
  }

  const allItems = [
    ...tasks.map((t) => ({ type: 'task' as const, ...t })),
    ...events.map((e) => ({ type: 'event' as const, ...e })),
  ];
  const visibleItems = allItems.slice(0, 3);
  const overflow = allItems.length - 3;

  return (
    <div
      className={`min-h-[60px] md:min-h-[100px] border-r border-b border-[#E6E9EF] p-0.5 md:p-1 relative ${
        isCurrentMonth ? 'bg-white' : 'bg-[#FAFBFC]'
      }`}
    >
      {/* Day number */}
      <div className="flex justify-end mb-1">
        <span
          className={`text-[12px] w-6 h-6 flex items-center justify-center rounded-full ${
            isToday
              ? 'bg-[#6161FF] text-white font-bold'
              : isCurrentMonth
              ? 'text-[#323338]'
              : 'text-[#C5C7D0]'
          }`}
        >
          {day}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-0.5">
        {visibleItems.map((item, i) => {
          if (item.type === 'task') {
            return (
              <button
                key={`task-${item.id}`}
                onClick={() => setSelectedItemId(item.id)}
                className="w-full text-left text-[11px] px-1.5 py-0.5 rounded truncate bg-[#F0EFFF] hover:bg-[#E4E3FF] transition-colors border-l-[3px]"
                style={{ borderColor: item.color }}
                title={`${item.name} (${item.boardName})`}
              >
                {item.name}
              </button>
            );
          } else {
            return (
              <div key={`event-${item.id}`} className="relative">
                <button
                  onClick={() => setSelectedEvent(item)}
                  className="w-full text-left text-[11px] px-1.5 py-0.5 rounded truncate bg-[#E8F0FE] hover:bg-[#D2E3FC] transition-colors border-l-[3px] border-[#4285F4]"
                  title={item.summary}
                >
                  {item.summary}
                </button>
                {selectedEvent?.id === item.id && (
                  <CalendarEventPopover
                    event={item}
                    onClose={() => setSelectedEvent(null)}
                  />
                )}
              </div>
            );
          }
        })}

        {overflow > 0 && (
          <div className="text-[10px] text-[#676879] px-1.5 font-medium">
            +{overflow} more
          </div>
        )}
      </div>
    </div>
  );
}
