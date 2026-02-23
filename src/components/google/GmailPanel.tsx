'use client';

import { useEffect } from 'react';
import { useGoogleStore } from '@/store/googleStore';
import { useBoardStore } from '@/store/boardStore';
import { RefreshCw, Plus, Mail, ExternalLink } from 'lucide-react';

export default function GmailPanel() {
  const isConnected = useGoogleStore((s) => s.isConnected);
  const emails = useGoogleStore((s) => s.emails);
  const emailsLoading = useGoogleStore((s) => s.emailsLoading);
  const emailsError = useGoogleStore((s) => s.emailsError);
  const fetchEmails = useGoogleStore((s) => s.fetchEmails);

  const boardOrder = useBoardStore((s) => s.boardOrder);
  const boards = useBoardStore((s) => s.boards);
  const addItem = useBoardStore((s) => s.addItem);
  const updateItemValue = useBoardStore((s) => s.updateItemValue);

  useEffect(() => {
    if (isConnected) {
      fetchEmails();
    }
  }, [isConnected, fetchEmails]);

  const handleCreateTask = (subject: string) => {
    // Add task to the first group of the first board
    if (boardOrder.length === 0) return;
    const firstBoard = boards[boardOrder[0]];
    if (!firstBoard || firstBoard.groupIds.length === 0) return;
    const firstGroupId = firstBoard.groupIds[0];
    const nameCol = firstBoard.columns[0];
    if (!nameCol) return;

    const itemId = addItem(firstGroupId);
    updateItemValue(itemId, nameCol.id, `[Email] ${subject}`);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const AVATAR_COLORS = ['#6161FF', '#00C875', '#E2445C', '#FDAB3D', '#A25DDC', '#579BFC', '#FF158A', '#66CCFF'];
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  };

  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-[300px]">
          <div className="w-12 h-12 rounded-full bg-[#E8F0FE] flex items-center justify-center mx-auto mb-3">
            <Mail size={24} className="text-[#4285F4]" />
          </div>
          <h3 className="text-[16px] font-semibold text-[#323338] mb-1">Connect Gmail</h3>
          <p className="text-[13px] text-[#676879] mb-4">
            Connect your Google account to see recent emails and create tasks from them.
          </p>
          <a
            href="/api/auth/google"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4285F4] hover:bg-[#3574E0] text-white rounded-lg text-[13px] font-medium transition-colors"
          >
            <Mail size={16} />
            Connect Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header actions */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-[#E6E9EF]">
        <span className="text-[13px] text-[#676879]">
          {emails.length} email{emails.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => fetchEmails(20, true)}
          disabled={emailsLoading}
          className="flex items-center gap-1.5 text-[13px] text-[#676879] hover:text-[#323338] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={emailsLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {emailsError && (
        <div className="px-4 md:px-8 py-2 bg-[#FFF0F0] text-[13px] text-[#E2445C]">
          {emailsError}
        </div>
      )}

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        {emailsLoading && emails.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-[#676879] text-[14px]">
            Loading emails...
          </div>
        ) : emails.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-[#676879] text-[14px]">
            No emails found
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              className={`flex items-start gap-3 px-4 md:px-8 py-3 border-b border-[#F0F1F3] hover:bg-[#F6F7FB] transition-colors ${
                email.isUnread ? 'bg-[#FAFBFF]' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-semibold mt-0.5"
                style={{ backgroundColor: getAvatarColor(email.from) }}
              >
                {getInitials(email.from)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[13px] truncate ${email.isUnread ? 'font-semibold text-[#323338]' : 'text-[#676879]'}`}>
                    {email.from}
                  </span>
                  <span className="text-[12px] text-[#9699A6] shrink-0">{formatDate(email.date)}</span>
                  {email.isUnread && (
                    <div className="w-2 h-2 rounded-full bg-[#6161FF] shrink-0" />
                  )}
                </div>
                <div className={`text-[13px] truncate ${email.isUnread ? 'font-medium text-[#323338]' : 'text-[#676879]'}`}>
                  {email.subject}
                </div>
                <div className="text-[12px] text-[#9699A6] truncate mt-0.5">
                  {email.snippet}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 mt-1">
                <button
                  onClick={() => handleCreateTask(email.subject)}
                  className="p-1.5 rounded hover:bg-[#E6E9EF] text-[#9699A6] hover:text-[#6161FF] transition-colors"
                  title="Create task from email"
                >
                  <Plus size={14} />
                </button>
                <a
                  href={`https://mail.google.com/mail/u/0/#inbox/${email.threadId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded hover:bg-[#E6E9EF] text-[#9699A6] hover:text-[#4285F4] transition-colors"
                  title="Open in Gmail"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
