'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useBoardStore } from '@/store/boardStore';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Menu,
  X,
  Home,
  User,
  CalendarDays,
  Mail,
  LayoutDashboard,
  LogOut,
  Plus,
} from 'lucide-react';
import ConnectGoogleButton from '@/components/google/ConnectGoogleButton';
import clsx from 'clsx';

const GROUP_COLORS = ['#579BFC', '#00C875', '#FFCB00', '#E2445C', '#A25DDC', '#66CCFF', '#FDAB3D', '#FF158A'];

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const boards = useBoardStore((s) => s.boards);
  const boardOrder = useBoardStore((s) => s.boardOrder);
  const addBoard = useBoardStore((s) => s.addBoard);
  const { user, signOut, isConfigured } = useAuth();

  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const handleAddBoard = () => {
    const id = addBoard('New Board');
    router.push(`/board/${id}`);
    setOpen(false);
  };

  // Determine page title
  let title = 'MockMonday';
  if (pathname === '/') title = 'Home';
  else if (pathname === '/my-work') title = 'My Work';
  else if (pathname === '/calendar') title = 'Calendar';
  else if (pathname === '/inbox') title = 'Inbox';
  else if (pathname.startsWith('/board/')) {
    const boardId = pathname.split('/board/')[1];
    title = boards[boardId]?.name || 'Board';
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-[50px] shrink-0 border-b border-[#E6E9EF] bg-white">
        <button
          onClick={() => setOpen(true)}
          className="text-[#323338] p-1.5 -ml-1.5 rounded-lg hover:bg-[#F6F7FB] transition-colors"
        >
          <Menu size={22} />
        </button>
        <span className="text-[16px] font-semibold text-[#323338] truncate mx-3">{title}</span>
        <div className="w-[30px]" /> {/* Spacer for centering */}
      </div>

      {/* Overlay drawer */}
      {open && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/40 z-50" onClick={() => setOpen(false)} />
          <aside
            className="md:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50 flex flex-col overflow-y-auto"
            style={{ background: '#292F4C' }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 h-[50px] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#6161FF] to-[#FF158A] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="text-white text-[15px] font-semibold">MockMonday</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#D5D8DF] hover:text-white p-1.5 rounded hover:bg-[#383D5C] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav items */}
            <div className="px-2 space-y-0.5">
              <button
                onClick={() => navigate('/')}
                className={clsx(
                  'flex items-center gap-3 px-4 py-2.5 w-full rounded-md text-[14px] transition-colors',
                  pathname === '/' ? 'bg-[#4B4E69] text-white' : 'text-[#D5D8DF] hover:bg-[#383D5C]'
                )}
              >
                <Home size={18} /> Home
              </button>
              <button
                onClick={() => navigate('/my-work')}
                className={clsx(
                  'flex items-center gap-3 px-4 py-2.5 w-full rounded-md text-[14px] transition-colors',
                  pathname === '/my-work' ? 'bg-[#4B4E69] text-white' : 'text-[#D5D8DF] hover:bg-[#383D5C]'
                )}
              >
                <User size={18} /> My Work
              </button>
              <button
                onClick={() => navigate('/calendar')}
                className={clsx(
                  'flex items-center gap-3 px-4 py-2.5 w-full rounded-md text-[14px] transition-colors',
                  pathname === '/calendar' ? 'bg-[#4B4E69] text-white' : 'text-[#D5D8DF] hover:bg-[#383D5C]'
                )}
              >
                <CalendarDays size={18} /> Calendar
              </button>
              <button
                onClick={() => navigate('/inbox')}
                className={clsx(
                  'flex items-center gap-3 px-4 py-2.5 w-full rounded-md text-[14px] transition-colors',
                  pathname === '/inbox' ? 'bg-[#4B4E69] text-white' : 'text-[#D5D8DF] hover:bg-[#383D5C]'
                )}
              >
                <Mail size={18} /> Inbox
              </button>
            </div>

            {/* Boards */}
            <div className="mt-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between px-4 mb-1">
                <span className="text-[#9699A6] text-[12px] font-medium uppercase tracking-wider">Boards</span>
                <button
                  onClick={handleAddBoard}
                  className="text-[#9699A6] hover:text-white p-1 rounded hover:bg-[#383D5C] transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <nav className="space-y-0.5 px-2">
                {boardOrder.map((boardId, index) => {
                  const board = boards[boardId];
                  if (!board) return null;
                  const isActive = pathname === `/board/${boardId}`;
                  const color = GROUP_COLORS[index % GROUP_COLORS.length];
                  return (
                    <button
                      key={boardId}
                      onClick={() => navigate(`/board/${boardId}`)}
                      className={clsx(
                        'flex items-center gap-3 w-full rounded-md text-[14px] px-3 py-2.5 transition-colors',
                        isActive ? 'bg-[#4B4E69] text-white' : 'text-[#D5D8DF] hover:bg-[#383D5C]'
                      )}
                    >
                      <LayoutDashboard size={18} style={{ color }} />
                      <span className="truncate">{board.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Google Connection */}
            <div className="shrink-0 px-1 py-1">
              <ConnectGoogleButton collapsed={false} />
            </div>

            {/* User / Logout */}
            <div className="shrink-0 border-t border-[#383D5C] px-3 py-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#6161FF] flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-[#D5D8DF] text-[13px] truncate flex-1">
                  {user?.email || 'Demo User'}
                </span>
                {isConfigured && (
                  <button
                    onClick={() => { signOut(); setOpen(false); }}
                    className="text-[#9699A6] hover:text-white p-1.5 rounded hover:bg-[#383D5C] transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
