import type { CalendarEvent, GmailMessage, Insight } from './types';

interface TaskInfo {
  id: string;
  name: string;
  boardId: string;
  boardName: string;
  status?: string;
  dueDate?: string;
}

export function generateInsights(
  calendarEvents: CalendarEvent[],
  emails: GmailMessage[],
  tasks: TaskInfo[]
): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  const todayStr = formatDate(now);
  const tomorrowStr = formatDate(new Date(now.getTime() + 86400000));
  const twoDaysStr = formatDate(new Date(now.getTime() + 2 * 86400000));
  const weekFromNow = new Date(now.getTime() + 7 * 86400000);

  // 🔴 Overdue tasks (due date past, status ≠ Done)
  for (const task of tasks) {
    if (
      task.dueDate &&
      task.dueDate < todayStr &&
      task.status?.toLowerCase() !== 'done' &&
      task.status?.toLowerCase() !== 'completed'
    ) {
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(task.dueDate).getTime()) / 86400000
      );
      insights.push({
        id: `overdue-${task.id}`,
        type: 'overdue',
        priority: 'high',
        emoji: '🔴',
        title: 'Overdue task',
        description: `"${task.name}" was due ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago in ${task.boardName}`,
        relatedItemId: task.id,
        relatedBoardId: task.boardId,
      });
    }
  }

  // ⏰ Tasks due in next 2 days
  for (const task of tasks) {
    if (
      task.dueDate &&
      task.dueDate >= todayStr &&
      task.dueDate <= twoDaysStr &&
      task.status?.toLowerCase() !== 'done' &&
      task.status?.toLowerCase() !== 'completed'
    ) {
      const isToday = task.dueDate === todayStr;
      const isTomorrow = task.dueDate === tomorrowStr;
      const label = isToday ? 'today' : isTomorrow ? 'tomorrow' : 'in 2 days';
      insights.push({
        id: `upcoming-${task.id}`,
        type: 'upcoming',
        priority: isToday ? 'high' : 'medium',
        emoji: '⏰',
        title: `Due ${label}`,
        description: `"${task.name}" in ${task.boardName} is due ${label}`,
        relatedItemId: task.id,
        relatedBoardId: task.boardId,
      });
    }
  }

  // 📅 Calendar events tomorrow with related in-progress tasks
  const tomorrowEvents = calendarEvents.filter((e) => e.start.substring(0, 10) === tomorrowStr);
  for (const event of tomorrowEvents) {
    const relatedTask = tasks.find((t) => fuzzyMatch(event.summary, t.name));
    if (relatedTask && relatedTask.status?.toLowerCase() !== 'done') {
      insights.push({
        id: `cal-task-${event.id}`,
        type: 'calendar_task',
        priority: 'medium',
        emoji: '📅',
        title: 'Meeting prep needed',
        description: `You have "${event.summary}" tomorrow and task "${relatedTask.name}" is still in progress`,
        relatedItemId: relatedTask.id,
        relatedBoardId: relatedTask.boardId,
      });
    }
  }

  // 🎂 Birthday events within 7 days
  for (const event of calendarEvents) {
    const eventDate = new Date(event.start.substring(0, 10));
    if (
      eventDate >= now &&
      eventDate <= weekFromNow &&
      isBirthdayEvent(event.summary)
    ) {
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / 86400000);
      const label = daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;
      insights.push({
        id: `birthday-${event.id}`,
        type: 'birthday',
        priority: daysUntil <= 1 ? 'high' : 'medium',
        emoji: '🎂',
        title: 'Birthday coming up',
        description: `"${event.summary}" is ${label}! Don't forget to wish them!`,
      });
    }
  }

  // ✍️ Emails about unsigned documents
  for (const email of emails) {
    const text = `${email.subject} ${email.snippet}`.toLowerCase();
    if (
      text.includes('unsigned') ||
      text.includes('sign') ||
      text.includes('contract') ||
      text.includes('agreement') ||
      text.includes('docusign') ||
      text.includes('e-sign')
    ) {
      insights.push({
        id: `sign-${email.id}`,
        type: 'action_needed',
        priority: 'medium',
        emoji: '✍️',
        title: 'Document needs attention',
        description: `Email from ${email.from}: "${email.subject}" may require your signature`,
      });
    }
  }

  // 🚨 Urgent unread emails
  for (const email of emails) {
    if (!email.isUnread) continue;
    const text = `${email.subject} ${email.snippet}`.toLowerCase();
    if (
      text.includes('urgent') ||
      text.includes('asap') ||
      text.includes('deadline') ||
      text.includes('immediately') ||
      text.includes('critical') ||
      text.includes('time-sensitive')
    ) {
      insights.push({
        id: `urgent-${email.id}`,
        type: 'urgent_email',
        priority: 'high',
        emoji: '🚨',
        title: 'Urgent unread email',
        description: `${email.from}: "${email.subject}" — this might need your immediate attention`,
      });
    }
  }

  // Sort by priority: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return insights;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fuzzyMatch(a: string, b: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const aN = normalize(a);
  const bN = normalize(b);
  if (aN.length < 3 || bN.length < 3) return false;
  return aN.includes(bN) || bN.includes(aN);
}

function isBirthdayEvent(summary: string): boolean {
  const lower = summary.toLowerCase();
  return (
    lower.includes('birthday') ||
    lower.includes('bday') ||
    lower.includes("b'day") ||
    lower.includes('cumpleaños')
  );
}
