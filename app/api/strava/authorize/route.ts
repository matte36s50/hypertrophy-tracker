import { NextRequest, NextResponse } from "next/server";
import { stravaConfig } from "@/lib/strava-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Step 1 of OAuth: send the user to Strava to grant access. We request
// `activity:write` so we can upload workouts (and `read` for the athlete name).
// Strava returns to /api/strava/callback on the same origin.
export function GET(request: NextRequest) {
  let clientId: string;
  try {
    ({ clientId } = stravaConfig());
  } catch {
    return NextResponse.redirect(
      new URL("/?strava=unconfigured", request.url),
    );
  }

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/strava/callback`;

  const authUrl = new URL("https://www.strava.com/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("approval_prompt", "auto");
  authUrl.searchParams.set("scope", "read,activity:write");

  return NextResponse.redirect(authUrl);
}
