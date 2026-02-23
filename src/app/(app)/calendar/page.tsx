'use client';

import CalendarView from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 md:px-8 pt-4 md:pt-6 pb-2">
        <h1 className="text-[22px] md:text-[28px] font-bold text-[#323338]" style={{ lineHeight: '36px' }}>
          Calendar
        </h1>
        <p className="text-[14px] text-[#676879] mt-1">
          All your tasks and Google Calendar events in one view
        </p>
      </div>
      <CalendarView />
    </div>
  );
}
