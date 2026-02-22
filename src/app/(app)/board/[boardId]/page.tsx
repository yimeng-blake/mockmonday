'use client';

import { use } from 'react';
import BoardHeader from '@/components/board/BoardHeader';
import BoardToolbar from '@/components/board/BoardToolbar';
import BoardContent from '@/components/board/BoardContent';

export default function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = use(params);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <BoardHeader boardId={boardId} />
      <BoardToolbar boardId={boardId} />
      <BoardContent boardId={boardId} />
    </div>
  );
}
