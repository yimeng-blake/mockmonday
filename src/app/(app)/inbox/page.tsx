'use client';

import GmailPanel from '@/components/google/GmailPanel';

export default function InboxPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 pt-6 pb-2">
        <h1 className="text-[28px] font-bold text-[#323338]" style={{ lineHeight: '36px' }}>
          Inbox
        </h1>
        <p className="text-[14px] text-[#676879] mt-1">
          Your recent emails — create tasks directly from messages
        </p>
      </div>
      <GmailPanel />
    </div>
  );
}
