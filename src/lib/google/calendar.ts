import { google } from 'googleapis';
import type { CalendarEvent } from './types';

export async function fetchCalendarEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  });

  const items = response.data.items || [];

  return items.map((event) => ({
    id: event.id || '',
    summary: event.summary || '(No title)',
    description: event.description || undefined,
    start: event.start?.dateTime || event.start?.date || '',
    end: event.end?.dateTime || event.end?.date || '',
    location: event.location || undefined,
    htmlLink: event.htmlLink || '',
    allDay: !event.start?.dateTime,
  }));
}
