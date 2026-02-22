import { google } from 'googleapis';
import type { GmailMessage } from './types';

export async function fetchRecentEmails(
  accessToken: string,
  maxResults: number = 20
): Promise<GmailMessage[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  // List messages
  const listResponse = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    labelIds: ['INBOX'],
  });

  const messageIds = listResponse.data.messages || [];
  if (messageIds.length === 0) return [];

  // Batch fetch message metadata
  const messages: GmailMessage[] = [];

  for (const msg of messageIds) {
    if (!msg.id) continue;

    try {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      });

      const headers = detail.data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      const fromRaw = getHeader('From');
      // Parse "Name <email>" or just "email"
      const fromMatch = fromRaw.match(/^(.+?)\s*<(.+?)>$/);
      const fromName = fromMatch ? fromMatch[1].replace(/^"(.*)"$/, '$1') : fromRaw;
      const fromEmail = fromMatch ? fromMatch[2] : fromRaw;

      const labelIds = detail.data.labelIds || [];
      const isUnread = labelIds.includes('UNREAD');

      messages.push({
        id: msg.id,
        threadId: detail.data.threadId || '',
        subject: getHeader('Subject') || '(No subject)',
        from: fromName,
        fromEmail,
        snippet: detail.data.snippet || '',
        date: getHeader('Date'),
        isUnread,
      });
    } catch {
      // Skip failed message fetches
    }
  }

  return messages;
}
