import { NextRequest, NextResponse } from 'next/server';
import { decryptTokens, createOAuth2Client, isGoogleConfigured } from '@/lib/google/auth';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  if (!isGoogleConfigured) {
    return NextResponse.json({ connected: false, configured: false });
  }

  const tokenCookie = request.cookies.get('google_tokens')?.value;
  if (!tokenCookie) {
    return NextResponse.json({ connected: false, configured: true });
  }

  try {
    const tokens = await decryptTokens(tokenCookie);
    const client = createOAuth2Client();
    client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data } = await oauth2.userinfo.get();

    return NextResponse.json({
      connected: true,
      configured: true,
      email: data.email,
    });
  } catch (error) {
    console.error('Google status check error:', error);
    // Token is invalid — clear it
    const response = NextResponse.json({ connected: false, configured: true });
    response.cookies.delete('google_tokens');
    return response;
  }
}
