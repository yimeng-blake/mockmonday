import { google } from 'googleapis';
import { EncryptJWT, jwtDecrypt } from 'jose';
import type { GoogleTokens } from './types';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

export const isGoogleConfigured =
  !!process.env.GOOGLE_CLIENT_ID &&
  !!process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id';

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getGoogleAuthUrl(): string {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

export async function exchangeCodeForTokens(code: string) {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function refreshAccessToken(refreshToken: string) {
  const client = createOAuth2Client();
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return credentials;
}

function getEncryptionKey(): Uint8Array {
  const secret = process.env.GOOGLE_TOKEN_ENCRYPTION_SECRET || 'mockmonday-default-secret-32ch!';
  return new TextEncoder().encode(secret.padEnd(32, '!').slice(0, 32));
}

export async function encryptTokens(tokens: GoogleTokens): Promise<string> {
  const key = getEncryptionKey();
  return new EncryptJWT({ tokens })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .encrypt(key);
}

export async function decryptTokens(encrypted: string): Promise<GoogleTokens> {
  const key = getEncryptionKey();
  const { payload } = await jwtDecrypt(encrypted, key);
  return payload.tokens as unknown as GoogleTokens;
}
