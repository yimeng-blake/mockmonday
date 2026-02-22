'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalendarEvent, GmailMessage } from '@/lib/google/types';

interface GoogleStore {
  isConnected: boolean;
  isConfigured: boolean;
  connectedEmail: string | null;
  setConnectionStatus: (connected: boolean, configured: boolean, email?: string) => void;

  calendarEvents: CalendarEvent[];
  calendarLoading: boolean;
  calendarError: string | null;
  calendarLastFetched: number | null;
  calendarRange: string | null;
  fetchCalendarEvents: (timeMin: string, timeMax: string, force?: boolean) => Promise<void>;

  emails: GmailMessage[];
  emailsLoading: boolean;
  emailsError: string | null;
  emailsLastFetched: number | null;
  fetchEmails: (maxResults?: number, force?: boolean) => Promise<void>;

  disconnect: () => Promise<void>;
  checkConnection: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useGoogleStore = create<GoogleStore>()(
  persist(
    (set, get) => ({
      isConnected: false,
      isConfigured: false,
      connectedEmail: null,

      calendarEvents: [],
      calendarLoading: false,
      calendarError: null,
      calendarLastFetched: null,
      calendarRange: null,

      emails: [],
      emailsLoading: false,
      emailsError: null,
      emailsLastFetched: null,

      setConnectionStatus: (connected, configured, email) =>
        set({ isConnected: connected, isConfigured: configured, connectedEmail: email || null }),

      checkConnection: async () => {
        try {
          const res = await fetch('/api/auth/google/status');
          const data = await res.json();
          set({
            isConnected: data.connected,
            isConfigured: data.configured,
            connectedEmail: data.email || null,
          });
        } catch {
          // Silently fail — app still works without Google
        }
      },

      fetchCalendarEvents: async (timeMin, timeMax, force = false) => {
        const { calendarLastFetched, calendarLoading, calendarRange } = get();
        const rangeKey = `${timeMin}_${timeMax}`;

        if (calendarLoading) return;
        if (
          !force &&
          calendarRange === rangeKey &&
          calendarLastFetched &&
          Date.now() - calendarLastFetched < CACHE_DURATION
        ) {
          return;
        }

        set({ calendarLoading: true, calendarError: null });
        try {
          const res = await fetch(
            `/api/google/calendar?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`
          );
          if (!res.ok) throw new Error('Failed to fetch calendar');
          const data = await res.json();
          set({
            calendarEvents: data.events,
            calendarLoading: false,
            calendarLastFetched: Date.now(),
            calendarRange: rangeKey,
          });
        } catch {
          set({ calendarError: 'Failed to load calendar events', calendarLoading: false });
        }
      },

      fetchEmails: async (maxResults = 20, force = false) => {
        const { emailsLastFetched, emailsLoading } = get();
        if (emailsLoading) return;
        if (!force && emailsLastFetched && Date.now() - emailsLastFetched < CACHE_DURATION) return;

        set({ emailsLoading: true, emailsError: null });
        try {
          const res = await fetch(`/api/google/gmail?maxResults=${maxResults}`);
          if (!res.ok) throw new Error('Failed to fetch emails');
          const data = await res.json();
          set({
            emails: data.emails,
            emailsLoading: false,
            emailsLastFetched: Date.now(),
          });
        } catch {
          set({ emailsError: 'Failed to load emails', emailsLoading: false });
        }
      },

      disconnect: async () => {
        await fetch('/api/auth/google/disconnect', { method: 'POST' });
        set({
          isConnected: false,
          connectedEmail: null,
          calendarEvents: [],
          emails: [],
          calendarLastFetched: null,
          emailsLastFetched: null,
          calendarRange: null,
        });
      },
    }),
    {
      name: 'mockmonday-google',
      partialize: (state) => ({
        isConnected: state.isConnected,
        isConfigured: state.isConfigured,
        connectedEmail: state.connectedEmail,
        calendarEvents: state.calendarEvents,
        calendarLastFetched: state.calendarLastFetched,
        calendarRange: state.calendarRange,
        emails: state.emails,
        emailsLastFetched: state.emailsLastFetched,
      }),
    }
  )
);
