'use client';

import { useRef, useEffect } from 'react';
import type { CalendarEvent } from '@/lib/google/types';
import { Clock, MapPin, ExternalLink, X } from 'lucide-react';

interface CalendarEventPopoverProps {
  event: CalendarEvent;
  onClose: () => void;
}

export default function CalendarEventPopover({ event, onClose }: CalendarEventPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const formatTime = (dateStr: string) => {
    if (!dateStr || dateStr.length <= 10) return 'All day';
    return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const startTime = formatTime(event.start);
  const endTime = formatTime(event.end);
  const timeDisplay = event.allDay
    ? 'All day'
    : `${startTime} – ${endTime}`;

  return (
    <div
      ref={ref}
      className="absolute z-50 w-[280px] bg-white rounded-lg shadow-xl border border-[#D0D4E4] p-4"
      style={{ top: '100%', left: 0, marginTop: 4 }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-[14px] font-semibold text-[#323338] pr-2 leading-tight">
          {event.summary}
        </h4>
        <button onClick={onClose} className="text-[#C5C7D0] hover:text-[#676879] shrink-0">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-2 text-[13px] text-[#676879]">
        <div className="flex items-center gap-2">
          <Clock size={14} className="shrink-0" />
          <span>{timeDisplay}</span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {event.description && (
          <p className="text-[12px] text-[#9699A6] line-clamp-3 mt-1">
            {event.description}
          </p>
        )}
      </div>

      {event.htmlLink && (
        <a
          href={event.htmlLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1.5 text-[12px] text-[#4285F4] hover:underline"
        >
          <ExternalLink size={12} />
          Open in Google Calendar
        </a>
      )}
    </div>
  );
}
