import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, encryptTokens } from '@/lib/google/auth';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?google_error=no_code', request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(new URL('/?google_error=missing_tokens', request.url));
    }

    const encrypted = await encryptTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000,
    });

    const response = NextResponse.redirect(new URL('/?google_connected=true', request.url));
    response.cookies.set('google_tokens', encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?google_error=exchange_failed', request.url));
  }
}
