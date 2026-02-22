import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, encryptTokens } from '@/lib/google/auth';

function getBaseUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedHost) {
    const proto = forwardedProto || 'https';
    return `${proto}://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?google_error=no_code`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(`${baseUrl}/?google_error=missing_tokens`);
    }

    const encrypted = await encryptTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000,
    });

    const response = NextResponse.redirect(`${baseUrl}/?google_connected=true`);
    response.cookies.set('google_tokens', encrypted, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(`${baseUrl}/?google_error=exchange_failed`);
  }
}
