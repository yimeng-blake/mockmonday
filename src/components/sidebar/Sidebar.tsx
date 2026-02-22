'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useBoardStore } from '@/store/boardStore';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  LayoutDashboard,
  Plus,
  ChevronLeft,
  ChevronRight,
  Home,
  Trash2,
  MoreHorizontal,
  LogOut,
  User,
  CalendarDays,
  Mail,
} from 'lucide-react';
import TemplatePickerModal from '@/components/board/TemplatePickerModal';
import ConnectGoogleButton from '@/components/google/ConnectGoogleButton';
import clsx from 'clsx';

export default function Sidebar() {
  const { user, signOut, isConfigured } = useAuth();
  const boards = useBoardStore((s) => s.boards);
  const boardOrder = useBoardStore((s) => s.boardOrder);
  const deleteBoard = useBoardStore((s) => s.deleteBoard);
  const renameBoard = useBoardStore((s) => s.renameBoard);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const handleAddBoard = () => {
    setShowTemplatePicker(true);
  };

  const handleDelete = (boardId: string) => {
    deleteBoard(boardId);
    setMenuOpen(null);
    if (pathname === `/board/${boardId}`) {
      const remaining = boardOrder.filter((id) => id !== boardId);
      if (remaining.length > 0) {
        router.push(`/board/${remaining[0]}`);
      } else {
        router.push('/');
      }
    }
  };

  const handleRename = (boardId: string) => {
    setEditingId(boardId);
    setEditName(boards[boardId]?.name || '');
    setMenuOpen(null);
  };

  const handleRenameSubmit = (boardId: string) => {
    if (editName.trim()) {
      renameBoard(boardId, editName.trim());
    }
    setEditingId(null);
  };

  const GROUP_COLORS = ['#579BFC', '#00C875', '#FFCB00', '#E2445C', '#A25DDC', '#66CCFF', '#FDAB3D', '#FF158A'];

  return (
    <aside
      className={clsx(
        'h-screen flex flex-col transition-all duration-200 ease-in-out shrink-0',
        collapsed ? 'w-[48px]' : 'w-[260px]'
      )}
      style={{ background: '#292F4C' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-[50px] shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#6161FF] to-[#FF158A] flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-white text-[15px] font-semibold">MockMonday</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="text-[#D5D8DF] hover:text-white p-1 rounded hover:bg-[#383D5C] transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Home */}
      {!collapsed && (
        <button
          onClick={() => router.push('/')}
          className={clsx(
            'flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-[14px] transition-colors',
            pathname === '/'
              ? 'bg-[#4B4E69] text-white'
              : 'text-[#D5D8DF] hover:bg-[#383D5C]'
          )}
        >
          <Home size={18} />
          <span>Home</span>
        </button>
      )}

      {/* My Work */}
      {!collapsed && (
        <button
          onClick={() => router.push('/my-work')}
          className={clsx(
            'flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-[14px] transition-colors',
            pathname === '/my-work'
              ? 'bg-[#4B4E69] text-white'
              : 'text-[#D5D8DF] hover:bg-[#383D5C]'
          )}
        >
          <User size={18} />
          <span>My Work</span>
        </button>
      )}

      {/* Calendar */}
      {!collapsed && (
        <button
          onClick={() => router.push('/calendar')}
          className={clsx(
            'flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-[14px] transition-colors',
            pathname === '/calendar'
              ? 'bg-[#4B4E69] text-white'
              : 'text-[#D5D8DF] hover:bg-[#383D5C]'
          )}
        >
          <CalendarDays size={18} />
          <span>Calendar</span>
        </button>
      )}

      {/* Inbox */}
      {!collapsed && (
        <button
          onClick={() => router.push('/inbox')}
          className={clsx(
            'flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-[14px] transition-colors',
            pathname === '/inbox'
              ? 'bg-[#4B4E69] text-white'
              : 'text-[#D5D8DF] hover:bg-[#383D5C]'
          )}
        >
          <Mail size={18} />
          <span>Inbox</span>
        </button>
      )}

      {/* Boards section */}
      <div className="mt-4 flex-1 overflow-y-auto">
        {!collapsed && (
          <div className="flex items-center justify-between px-4 mb-1">
            <span className="text-[#9699A6] text-[12px] font-medium uppercase tracking-wider">
              Boards
            </span>
            <button
              onClick={handleAddBoard}
              className="text-[#9699A6] hover:text-white p-0.5 rounded hover:bg-[#383D5C] transition-colors"
              title="Add board"
            >
              <Plus size={16} />
            </button>
          </div>
        )}

        <nav className="space-y-0.5 px-2">
          {boardOrder.map((boardId, index) => {
            const board = boards[boardId];
            if (!board) return null;
            const isActive = pathname === `/board/${boardId}`;
            const color = GROUP_COLORS[index % GROUP_COLORS.length];

            return (
              <div key={boardId} className="relative group">
                <button
                  onClick={() => router.push(`/board/${boardId}`)}
                  className={clsx(
                    'flex items-center gap-3 w-full rounded-md text-[14px] transition-colors',
                    collapsed ? 'px-2 py-2 justify-center' : 'px-3 py-[7px]',
                    isActive
                      ? 'bg-[#4B4E69] text-white'
                      : 'text-[#D5D8DF] hover:bg-[#383D5C]'
                  )}
                >
                  <div className="shrink-0">
                    <LayoutDashboard size={18} style={{ color }} />
                  </div>
                  {!collapsed && (
                    <>
                      {editingId === boardId ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => handleRenameSubmit(boardId)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameSubmit(boardId);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          className="bg-[#383D5C] text-white text-[14px] px-1 rounded outline-none flex-1 min-w-0"
                        />
                      ) : (
                        <span className="truncate flex-1 text-left">{board.name}</span>
                      )}
                    </>
                  )}
                </button>

                {/* Context menu trigger */}
                {!collapsed && editingId !== boardId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === boardId ? null : boardId);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9699A6] hover:text-white p-0.5 rounded hover:bg-[#4B4E69] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                )}

                {/* Context menu */}
                {menuOpen === boardId && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-[#D0D4E4] py-1 min-w-[150px]">
                      <button
                        onClick={() => handleRename(boardId)}
                        className="w-full text-left px-3 py-2 text-[13px] text-[#323338] hover:bg-[#F6F7FB] transition-colors"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => handleDelete(boardId)}
                        className="w-full text-left px-3 py-2 text-[13px] text-[#E2445C] hover:bg-[#FFF0F0] transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Add board button at bottom (collapsed mode) */}
      {collapsed && (
        <div className="p-2 shrink-0">
          <button
            onClick={handleAddBoard}
            className="w-full flex justify-center text-[#9699A6] hover:text-white p-2 rounded hover:bg-[#383D5C] transition-colors"
            title="Add board"
          >
            <Plus size={18} />
          </button>
        </div>
      )}

      {/* Google Connection */}
      <div className="shrink-0 px-1 py-1">
        <ConnectGoogleButton collapsed={collapsed} />
      </div>

      {/* User / Logout */}
      <div className="shrink-0 border-t border-[#383D5C] px-3 py-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#6161FF] flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-[#D5D8DF] text-[13px] truncate flex-1">
              {user?.user_metadata?.display_name || user?.email || 'Demo User'}
            </span>
            {isConfigured && (
              <button
                onClick={signOut}
                className="text-[#9699A6] hover:text-white p-1 rounded hover:bg-[#383D5C] transition-colors"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        ) : (
          isConfigured && (
            <button
              onClick={signOut}
              className="w-full flex justify-center text-[#9699A6] hover:text-white p-2 rounded hover:bg-[#383D5C] transition-colors"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          )
        )}
      </div>

      {showTemplatePicker && (
        <TemplatePickerModal onClose={() => setShowTemplatePicker(false)} />
      )}
    </aside>
  );
}
