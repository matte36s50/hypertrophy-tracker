import { NextRequest, NextResponse } from "next/server";
import { ATHLETE_COOKIE, REFRESH_COOKIE } from "@/lib/strava-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Forget the Strava link by clearing the cookies. (We don't deauthorize the
// app on Strava's side; the user can revoke it from their Strava settings.)
export function POST(request: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(ATHLETE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
