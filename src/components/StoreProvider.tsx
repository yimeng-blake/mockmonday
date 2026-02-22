'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useBoardStore, enableSupabase } from '@/store/boardStore';
import { useGoogleStore } from '@/store/googleStore';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const { user, loading: authLoading, isConfigured } = useAuth();

  useEffect(() => {
    if (isConfigured && authLoading) return;

    if (isConfigured && user) {
      // Enable Supabase sync and load data
      enableSupabase(user.id);

      // Dynamic import to avoid loading queries when Supabase isn't configured
      import('@/lib/supabase/queries')
        .then(({ fetchBoardsForUser }) => fetchBoardsForUser(user.id))
        .then((data) => {
          if (data.boardOrder.length > 0) {
            useBoardStore.getState().initialize(data);
          } else {
            useBoardStore.getState().initialize(useBoardStore.getState());
          }
          setReady(true);
        })
        .catch((err) => {
          console.error('Failed to fetch boards:', err);
          setReady(true);
        });
    } else {
      // No auth or Supabase not configured - use localStorage (fallback)
      setReady(true);
    }

    // Check Google connection status (fire-and-forget, doesn't block loading)
    useGoogleStore.getState().checkConnection();
  }, [user, authLoading, isConfigured]);

  if (!ready) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#F6F7FB' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6161FF] to-[#FF158A] flex items-center justify-center animate-pulse">
            <span className="text-white text-lg font-bold">M</span>
          </div>
          <div className="text-[#676879] text-[14px]">Loading your workspace...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
