import { NextRequest, NextResponse } from 'next/server';
import { getValidGoogleTokens } from '@/lib/google/withGoogleAuth';
import { fetchRecentEmails } from '@/lib/google/gmail';

export async function GET(request: NextRequest) {
  const auth = await getValidGoogleTokens(request);
  if (!auth) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const maxResults = parseInt(searchParams.get('maxResults') || '20', 10);

  try {
    const emails = await fetchRecentEmails(auth.accessToken, maxResults);
    const response = NextResponse.json({ emails });
    if (auth.setCookieOnResponse) {
      auth.setCookieOnResponse(response);
    }
    return response;
  } catch (error) {
    console.error('Gmail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
