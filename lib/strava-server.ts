// Server-only Strava helpers. This module reads the client secret and brokers
// the OAuth token exchange/refresh — it must never be imported into a client
// component. Tokens live in httpOnly cookies set by the route handlers.

import "server-only";

const STRAVA_OAUTH = "https://www.strava.com/oauth/token";

// Cookie names. The refresh token is httpOnly; the athlete name is only a
// convenience label and is also kept httpOnly (exposed via /api/strava/status).
export const REFRESH_COOKIE = "strava_refresh";
export const ATHLETE_COOKIE = "strava_athlete";
// 180 days — Strava refresh tokens are long-lived.
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

export interface StravaConfig {
  clientId: string;
  clientSecret: string;
}

// Read + validate the configured Strava app credentials. Throws a clear error
// if the deployment hasn't set them yet.
export function stravaConfig(): StravaConfig {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Strava is not configured. Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET.",
    );
  }
  return { clientId, clientSecret };
}

export interface TokenResult {
  accessToken: string;
  refreshToken: string;
  athleteName?: string;
}

// Exchange a one-time authorization code for tokens (first connect).
export async function exchangeCode(code: string): Promise<TokenResult> {
  const { clientId, clientSecret } = stravaConfig();
  const res = await fetch(STRAVA_OAUTH, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Strava token exchange failed (${res.status})`);
  }
  const json = await res.json();
  const athlete = json.athlete;
  const athleteName = athlete
    ? [athlete.firstname, athlete.lastname].filter(Boolean).join(" ") ||
      athlete.username
    : undefined;
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    athleteName,
  };
}

// Trade a stored refresh token for a fresh access token. Strava may rotate the
// refresh token, so callers should persist the returned one.
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const { clientId, clientSecret } = stravaConfig();
  const res = await fetch(STRAVA_OAUTH, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) {
    throw new Error(`Strava token refresh failed (${res.status})`);
  }
  const json = await res.json();
  return { accessToken: json.access_token, refreshToken: json.refresh_token };
}
