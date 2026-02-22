export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  htmlLink?: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  fromEmail: string;
  date: string;
  snippet: string;
  isUnread: boolean;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

export interface TaskSummary {
  id: string;
  name: string;
  dueDate: string | null;
  status: string | null;
  boardName: string;
}

export interface Insight {
  id: string;
  type: string;
  emoji: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  relatedItemId?: string;
  relatedBoardId?: string;
  relatedEventId?: string;
  relatedEmailId?: string;
}
