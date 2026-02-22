'use client';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function KeyboardShortcutListener() {
  useKeyboardShortcuts();
  return null;
}
