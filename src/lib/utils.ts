import { nanoid } from 'nanoid';

export function generateId(): string {
  return nanoid(10);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  return `${month} ${day}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function isStatusValue(val: unknown): val is { label: string; color: string } {
  return val !== null && typeof val === 'object' && 'label' in (val as Record<string, unknown>) && 'color' in (val as Record<string, unknown>);
}

export function isPersonValue(val: unknown): val is { id: string; name: string; avatarColor: string } {
  return val !== null && typeof val === 'object' && 'avatarColor' in (val as Record<string, unknown>);
}

export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}
