import { NextRequest, NextResponse } from 'next/server';
import { getValidGoogleTokens } from '@/lib/google/withGoogleAuth';
import { fetchCalendarEvents } from '@/lib/google/calendar';

export async function GET(request: NextRequest) {
  const auth = await getValidGoogleTokens(request);
  if (!auth) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const timeMin = searchParams.get('timeMin');
  const timeMax = searchParams.get('timeMax');

  if (!timeMin || !timeMax) {
    return NextResponse.json(
      { error: 'timeMin and timeMax are required' },
      { status: 400 }
    );
  }

  try {
    const events = await fetchCalendarEvents(auth.accessToken, timeMin, timeMax);
    const response = NextResponse.json({ events });
    if (auth.setCookieOnResponse) {
      auth.setCookieOnResponse(response);
    }
    return response;
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
