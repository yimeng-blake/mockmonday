'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useBoardStore, enableSupabase } from '@/store/boardStore';
import { useGoogleStore } from '@/store/googleStore';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const { user, loading: authLoading, isConfigured } = useAuth();
  const globalChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (isConfigured && authLoading) return;

    if (isConfigured && user) {
      // Enable Supabase sync and load data
      enableSupabase(user.id);

      // Dynamic import to avoid loading queries when Supabase isn't configured
      import('@/lib/supabase/queries')
        .then(({ fetchBoardsForUser }) => fetchBoardsForUser(user.id))
        .then(async (data) => {
          if (data.boardOrder.length > 0) {
            useBoardStore.getState().initialize(data);
          } else {
            // New user — seed demo boards into Supabase
            try {
              const { seedUserBoards } = await import('@/lib/supabase/seedUser');
              await seedUserBoards(user.id);
              // Re-fetch after seeding to get properly structured data
              const { fetchBoardsForUser } = await import('@/lib/supabase/queries');
              const seededData = await fetchBoardsForUser(user.id);
              useBoardStore.getState().initialize(
                seededData.boardOrder.length > 0 ? seededData : useBoardStore.getState()
              );
            } catch (err) {
              console.error('Failed to seed boards:', err);
              // Fallback to localStorage seed
              useBoardStore.getState().initialize(useBoardStore.getState());
            }
          }
          setReady(true);

          // Subscribe to global board changes for real-time updates
          import('@/lib/supabase/realtime').then(({ subscribeToGlobalBoardChanges }) => {
            globalChannelRef.current = subscribeToGlobalBoardChanges(user.id);
          });
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

    return () => {
      // Cleanup global realtime subscription
      if (globalChannelRef.current) {
        import('@/lib/supabase/realtime').then(({ unsubscribe }) => {
          unsubscribe(globalChannelRef.current);
          globalChannelRef.current = null;
        });
      }
    };
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
