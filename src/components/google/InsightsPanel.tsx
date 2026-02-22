'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardStore } from '@/store/boardStore';
import { useGoogleStore } from '@/store/googleStore';
import { useUIStore } from '@/store/uiStore';
import { generateInsights } from '@/lib/google/insights';
import type { Insight } from '@/lib/google/types';
import { Sparkles, ArrowRight, Link2 } from 'lucide-react';

export default function InsightsPanel() {
  const boards = useBoardStore((s) => s.boards);
  const groups = useBoardStore((s) => s.groups);
  const items = useBoardStore((s) => s.items);
  const isGoogleConnected = useGoogleStore((s) => s.isConnected);
  const calendarEvents = useGoogleStore((s) => s.calendarEvents);
  const emails = useGoogleStore((s) => s.emails);
  const setSelectedItemId = useUIStore((s) => s.setSelectedItemId);
  const router = useRouter();

  // Build task list for insights engine
  const tasks = useMemo(() => {
    const result: Array<{
      id: string;
      name: string;
      boardId: string;
      boardName: string;
      status?: string;
      dueDate?: string;
    }> = [];

    for (const [boardId, board] of Object.entries(boards)) {
      if (!board) continue;
      const nameCol = board.columns[0];
      const dateCol = board.columns.find((c) => c.type === 'date');
      const statusCol = board.columns.find((c) => c.type === 'status');

      for (const gid of board.groupIds) {
        const group = groups[gid];
        if (!group) continue;
        for (const itemId of group.itemIds) {
          const item = items[itemId];
          if (!item) continue;

          const name = nameCol ? (item.values[nameCol.id] as string) || 'Untitled' : 'Untitled';
          const dueDate = dateCol ? (item.values[dateCol.id] as string) || undefined : undefined;
          const statusVal = statusCol ? item.values[statusCol.id] : undefined;
          const status =
            statusVal && typeof statusVal === 'object' && 'label' in statusVal
              ? (statusVal as { label: string }).label
              : undefined;

          result.push({ id: itemId, name, boardId, boardName: board.name, status, dueDate });
        }
      }
    }
    return result;
  }, [boards, groups, items]);

  const insights = useMemo(
    () => generateInsights(calendarEvents, emails, tasks),
    [calendarEvents, emails, tasks]
  );

  const handleInsightClick = (insight: Insight) => {
    if (insight.relatedItemId) {
      setSelectedItemId(insight.relatedItemId);
    } else if (insight.relatedBoardId) {
      router.push(`/board/${insight.relatedBoardId}`);
    }
  };

  const priorityBorder: Record<string, string> = {
    high: '#E2445C',
    medium: '#FDAB3D',
    low: '#00C875',
  };

  return (
    <div className="bg-white rounded-xl border border-[#E6E9EF] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-[#6161FF]" />
        <h2 className="text-[14px] font-semibold text-[#323338]">Insights</h2>
      </div>

      {insights.length === 0 && !isGoogleConnected ? (
        <div className="text-center py-4">
          <p className="text-[13px] text-[#676879] mb-2">
            Connect Google for smarter insights — calendar reminders, urgent emails, and more.
          </p>
          <a
            href="/api/auth/google"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#4285F4] hover:underline"
          >
            <Link2 size={14} />
            Connect Google
          </a>
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-[13px] text-[#676879]">
            All caught up! No insights right now. 🎉
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {insights.slice(0, 5).map((insight) => (
            <button
              key={insight.id}
              onClick={() => handleInsightClick(insight)}
              className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-[#F6F7FB] transition-colors group border-l-[3px]"
              style={{ borderColor: priorityBorder[insight.priority] || '#C5C7D0' }}
            >
              <span className="text-[18px] leading-none mt-0.5">{insight.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[#323338]">{insight.title}</div>
                <div className="text-[12px] text-[#676879] mt-0.5 line-clamp-2">
                  {insight.description}
                </div>
              </div>
              {(insight.relatedItemId || insight.relatedBoardId) && (
                <ArrowRight
                  size={14}
                  className="text-[#C5C7D0] group-hover:text-[#6161FF] transition-colors mt-1 shrink-0"
                />
              )}
            </button>
          ))}

          {insights.length > 5 && (
            <div className="text-center pt-1">
              <span className="text-[12px] text-[#9699A6]">
                +{insights.length - 5} more insight{insights.length - 5 !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
