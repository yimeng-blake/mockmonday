'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardStore } from '@/store/boardStore';
import { useCurrentPerson } from '@/hooks/usePeople';
import { isPersonValue } from '@/lib/utils';
import { Column, Item } from '@/lib/types';
import ItemRow from '@/components/item/ItemRow';
import { getInitials } from '@/lib/utils';
import { Inbox, ArrowRight } from 'lucide-react';

interface BoardGroup {
  boardId: string;
  boardName: string;
  columns: Column[];
  items: Item[];
}

export default function MyWorkPage() {
  const router = useRouter();
  const currentPerson = useCurrentPerson();
  const boards = useBoardStore((s) => s.boards);
  const groups = useBoardStore((s) => s.groups);
  const items = useBoardStore((s) => s.items);

  const myItems = useMemo(() => {
    const boardGroups: Record<string, BoardGroup> = {};

    Object.values(items).forEach((item) => {
      // Check if any person value in this item matches current user
      const isAssignedToMe = Object.values(item.values).some(
        (val) => isPersonValue(val) && val.id === currentPerson.id
      );

      if (!isAssignedToMe) return;

      const board = boards[item.boardId];
      if (!board) return;

      if (!boardGroups[item.boardId]) {
        boardGroups[item.boardId] = {
          boardId: item.boardId,
          boardName: board.name,
          columns: board.columns,
          items: [],
        };
      }
      boardGroups[item.boardId].items.push(item);
    });

    return Object.values(boardGroups);
  }, [items, boards, currentPerson.id]);

  const totalItems = myItems.reduce((sum, bg) => sum + bg.items.length, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
            style={{ background: currentPerson.avatarColor }}
          >
            {getInitials(currentPerson.name)}
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#323338]">My Work</h1>
            <p className="text-[14px] text-[#676879]">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} assigned to {currentPerson.name}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {myItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F0F0FF] flex items-center justify-center mb-4">
              <Inbox size={28} className="text-[#6161FF]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#323338] mb-2">
              No items assigned to you yet
            </h2>
            <p className="text-[14px] text-[#676879] max-w-[400px]">
              Open a board and assign yourself to items using the person column. They&apos;ll show up here so you can track everything in one place.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {myItems.map((boardGroup) => (
              <div key={boardGroup.boardId}>
                {/* Board header */}
                <button
                  onClick={() => router.push(`/board/${boardGroup.boardId}`)}
                  className="flex items-center gap-2 mb-3 group/boardlink"
                >
                  <h2 className="text-[16px] font-semibold text-[#323338] group-hover/boardlink:text-[#6161FF] transition-colors">
                    {boardGroup.boardName}
                  </h2>
                  <ArrowRight
                    size={16}
                    className="text-[#C5C7D0] group-hover/boardlink:text-[#6161FF] transition-colors"
                  />
                  <span className="text-[13px] text-[#676879]">
                    {boardGroup.items.length} {boardGroup.items.length === 1 ? 'item' : 'items'}
                  </span>
                </button>

                {/* Column headers */}
                <div className="flex items-stretch border-b border-t border-[#E6E9EF] bg-[#F5F6F8] h-[36px]">
                  <div className="w-[6px] shrink-0" />
                  <div className="w-[28px] shrink-0" />
                  {boardGroup.columns.map((col) => (
                    <div
                      key={col.id}
                      className="border-r border-[#E6E9EF] shrink-0 flex items-center justify-center text-[13px] font-medium text-[#323338]"
                      style={{ width: col.width || 150 }}
                    >
                      {col.title}
                    </div>
                  ))}
                  <div className="w-[40px] shrink-0" />
                  <div className="flex-1" />
                </div>

                {/* Items */}
                {boardGroup.items.map((item) => {
                  const group = groups[item.groupId];
                  return (
                    <ItemRow
                      key={item.id}
                      itemId={item.id}
                      columns={boardGroup.columns}
                      groupColor={group?.color || '#579BFC'}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
