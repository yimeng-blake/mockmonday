'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardStore } from '@/store/boardStore';
import TemplatePickerModal from '@/components/board/TemplatePickerModal';
import { LayoutDashboard, Plus, ArrowRight } from 'lucide-react';
import InsightsPanel from '@/components/google/InsightsPanel';

export default function Home() {
  const boards = useBoardStore((s) => s.boards);
  const boardOrder = useBoardStore((s) => s.boardOrder);
  const router = useRouter();
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#F6F7FB' }}>
      <div className="max-w-[600px] w-full px-6">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6161FF] to-[#FF158A] items-center justify-center mb-4">
            <span className="text-white text-3xl font-bold">M</span>
          </div>
          <h1 className="text-[24px] md:text-[32px] font-bold text-[#323338] mb-2">Welcome to MockMonday</h1>
          <p className="text-[16px] text-[#676879]">
            Select a board from the sidebar or create a new one to get started.
          </p>
        </div>

        {boardOrder.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E6E9EF] p-4 mb-4">
            <h2 className="text-[14px] font-semibold text-[#323338] mb-3">Your boards</h2>
            <div className="space-y-1">
              {boardOrder.map((boardId) => {
                const board = boards[boardId];
                if (!board) return null;
                return (
                  <button
                    key={boardId}
                    onClick={() => router.push(`/board/${boardId}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F6F7FB] transition-colors group"
                  >
                    <LayoutDashboard size={18} className="text-[#6161FF]" />
                    <span className="text-[14px] text-[#323338] flex-1 text-left">{board.name}</span>
                    <ArrowRight size={16} className="text-[#C5C7D0] group-hover:text-[#6161FF] transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <InsightsPanel />

        <button
          onClick={() => setShowTemplatePicker(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#6161FF] hover:bg-[#5050E6] text-white rounded-lg text-[14px] font-medium transition-colors mt-4"
        >
          <Plus size={18} />
          Create new board
        </button>
      </div>

      {showTemplatePicker && (
        <TemplatePickerModal onClose={() => setShowTemplatePicker(false)} />
      )}
    </div>
  );
}
