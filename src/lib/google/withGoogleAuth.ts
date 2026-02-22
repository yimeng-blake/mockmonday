import { NextRequest, NextResponse } from 'next/server';
import { decryptTokens, encryptTokens, refreshAccessToken } from './auth';

interface GoogleAuthResult {
  accessToken: string;
  setCookieOnResponse?: (response: NextResponse) => void;
}

export async function getValidGoogleTokens(
  request: NextRequest
): Promise<GoogleAuthResult | null> {
  const tokenCookie = request.cookies.get('google_tokens')?.value;
  if (!tokenCookie) return null;

  try {
    const tokens = await decryptTokens(tokenCookie);

    // Check if expired (5 min buffer)
    const isExpired = tokens.expiry_date < Date.now() + 5 * 60 * 1000;

    if (!isExpired) {
      return { accessToken: tokens.access_token };
    }

    // Refresh the token
    const newCredentials = await refreshAccessToken(tokens.refresh_token);
    const updatedTokens = {
      access_token: newCredentials.access_token!,
      refresh_token: tokens.refresh_token,
      expiry_date: newCredentials.expiry_date!,
    };
    const encrypted = await encryptTokens(updatedTokens);

    return {
      accessToken: updatedTokens.access_token,
      setCookieOnResponse: (response) => {
        response.cookies.set('google_tokens', encrypted, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365,
          path: '/',
        });
      },
    };
  } catch (error) {
    console.error('Token validation/refresh failed:', error);
    return null;
  }
}
