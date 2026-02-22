'use client';

import { useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { PEOPLE, DEMO_USER } from '@/lib/constants';
import type { Person } from '@/lib/types';

export function useCurrentPerson(): Person {
  const { user, isConfigured } = useAuth();

  return useMemo(() => {
    if (isConfigured && user) {
      return {
        id: `user-${user.id}`,
        name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Me',
        avatarColor: '#6161FF',
      };
    }
    return DEMO_USER;
  }, [user, isConfigured]);
}

export function usePeople(): Person[] {
  const currentPerson = useCurrentPerson();

  return useMemo(() => {
    return [currentPerson, ...PEOPLE];
  }, [currentPerson]);
}
