'use client';

import { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { generateId } from '@/lib/utils';
import { X, ClipboardList, Zap, Bug, Calendar, LayoutTemplate } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ColumnType, Column } from '@/lib/types';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  columns: Array<{ title: string; type: ColumnType; width: number }>;
  groups: Array<{ title: string; color: string }>;
}

const TEMPLATES: Template[] = [
  { id: 'project', name: 'Project Planning', description: 'Plan and track project tasks', icon: 'clipboard-list',
    columns: [{ title: 'Task', type: 'text', width: 320 }, { title: 'Status', type: 'status', width: 160 }, { title: 'Owner', type: 'person', width: 140 }, { title: 'Due Date', type: 'date', width: 140 }, { title: 'Priority', type: 'status', width: 140 }],
    groups: [{ title: 'To Do', color: '#579BFC' }, { title: 'In Progress', color: '#FDAB3D' }, { title: 'Done', color: '#00C875' }],
  },
  { id: 'sprint', name: 'Sprint Board', description: 'Agile sprint planning', icon: 'zap',
    columns: [{ title: 'Task', type: 'text', width: 320 }, { title: 'Status', type: 'status', width: 160 }, { title: 'Assignee', type: 'person', width: 140 }, { title: 'Story Points', type: 'number', width: 120 }, { title: 'Due Date', type: 'date', width: 140 }],
    groups: [{ title: 'Current Sprint', color: '#A25DDC' }, { title: 'Backlog', color: '#9AADBD' }],
  },
  { id: 'bugs', name: 'Bug Tracker', description: 'Track and prioritize bugs', icon: 'bug',
    columns: [{ title: 'Bug', type: 'text', width: 320 }, { title: 'Severity', type: 'status', width: 160 }, { title: 'Assigned To', type: 'person', width: 140 }, { title: 'Reported', type: 'date', width: 140 }],
    groups: [{ title: 'Open', color: '#E2445C' }, { title: 'In Fix', color: '#FDAB3D' }, { title: 'Resolved', color: '#00C875' }],
  },
  { id: 'content', name: 'Content Calendar', description: 'Plan and schedule content', icon: 'calendar',
    columns: [{ title: 'Content', type: 'text', width: 320 }, { title: 'Status', type: 'status', width: 160 }, { title: 'Author', type: 'person', width: 140 }, { title: 'Publish Date', type: 'date', width: 140 }],
    groups: [{ title: 'Ideas', color: '#66CCFF' }, { title: 'In Production', color: '#FDAB3D' }, { title: 'Published', color: '#00C875' }],
  },
  { id: 'blank', name: 'Blank Board', description: 'Start from scratch', icon: 'layout-template',
    columns: [{ title: 'Item', type: 'text', width: 320 }, { title: 'Status', type: 'status', width: 160 }],
    groups: [{ title: 'Group 1', color: '#579BFC' }],
  },
];

const ICONS: Record<string, React.ReactNode> = {
  'clipboard-list': <ClipboardList size={24} />,
  'zap': <Zap size={24} />,
  'bug': <Bug size={24} />,
  'calendar': <Calendar size={24} />,
  'layout-template': <LayoutTemplate size={24} />,
};

export default function TemplatePickerModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [boardName, setBoardName] = useState('');
  const [selected, setSelected] = useState('project');

  const handleCreate = () => {
    const tpl = TEMPLATES.find((t) => t.id === selected);
    if (!tpl) return;
    const name = boardName.trim() || tpl.name;
    const boardId = `board-${generateId()}`;
    const columns: Column[] = tpl.columns.map((c) => ({ id: `col-${generateId()}`, title: c.title, type: c.type, width: c.width }));
    const groupIds: string[] = [];
    const newGroups: Record<string, { id: string; boardId: string; title: string; color: string; collapsed: boolean; itemIds: string[] }> = {};
    for (const g of tpl.groups) {
      const gid = `group-${generateId()}`;
      groupIds.push(gid);
      newGroups[gid] = { id: gid, boardId, title: g.title, color: g.color, collapsed: false, itemIds: [] };
    }

    const state = useBoardStore.getState();
    useBoardStore.setState({
      boards: { ...state.boards, [boardId]: { id: boardId, name, groupIds, columns } },
      groups: { ...state.groups, ...newGroups },
      boardOrder: [...state.boardOrder, boardId],
    });
    onClose();
    router.push(`/board/${boardId}`);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-[560px] max-w-full max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E9EF]">
            <h2 className="text-[18px] font-semibold text-[#323338]">Create a new board</h2>
            <button onClick={onClose} className="text-[#676879] hover:text-[#323338] p-1 rounded hover:bg-[#F6F7FB]"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-5">
              <label className="block text-[13px] font-medium text-[#323338] mb-1.5">Board name</label>
              <input value={boardName} onChange={(e) => setBoardName(e.target.value)} placeholder="My new board" autoFocus
                className="w-full px-4 py-2.5 text-[14px] border border-[#D0D4E4] rounded-lg outline-none focus:border-[#6161FF] transition-colors" />
            </div>
            <label className="block text-[13px] font-medium text-[#323338] mb-2">Choose a template</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setSelected(t.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-colors ${selected === t.id ? 'border-[#6161FF] bg-[#F0F0FF]' : 'border-[#E6E9EF] hover:border-[#D0D4E4] hover:bg-[#F6F7FB]'}`}>
                  <div className={`shrink-0 mt-0.5 ${selected === t.id ? 'text-[#6161FF]' : 'text-[#676879]'}`}>{ICONS[t.icon] || <LayoutTemplate size={24} />}</div>
                  <div>
                    <div className="text-[14px] font-medium text-[#323338]">{t.name}</div>
                    <div className="text-[12px] text-[#676879] mt-0.5">{t.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="px-6 py-4 border-t border-[#E6E9EF] flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-[14px] text-[#676879] hover:bg-[#F6F7FB] rounded-lg transition-colors">Cancel</button>
            <button onClick={handleCreate} className="px-6 py-2 bg-[#6161FF] hover:bg-[#5050E6] text-white text-[14px] font-medium rounded-lg transition-colors">Create board</button>
          </div>
        </div>
      </div>
    </>
  );
}
