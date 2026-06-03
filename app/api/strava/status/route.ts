import { NextRequest, NextResponse } from "next/server";
import { ATHLETE_COOKIE, REFRESH_COOKIE } from "@/lib/strava-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lightweight check the client uses to decide whether to show "Share to Strava"
// vs "Connect Strava". Presence of the refresh cookie == connected.
export function GET(request: NextRequest) {
  const configured = Boolean(
    process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET,
  );
  const connected = Boolean(request.cookies.get(REFRESH_COOKIE)?.value);
  const athlete = request.cookies.get(ATHLETE_COOKIE)?.value;
  return NextResponse.json({ configured, connected, athlete });
}
