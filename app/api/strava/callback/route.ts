import { NextRequest, NextResponse } from "next/server";
import {
  ATHLETE_COOKIE,
  COOKIE_MAX_AGE,
  REFRESH_COOKIE,
  exchangeCode,
} from "@/lib/strava-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Step 2 of OAuth: Strava redirects here with a one-time `code`. We exchange it
// for tokens server-side (using the client secret), stash the refresh token in
// an httpOnly cookie, and bounce back to the app.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const scope = url.searchParams.get("scope") ?? "";

  if (error || !code) {
    return NextResponse.redirect(new URL("/?strava=denied", request.url));
  }
  // We need write access to upload activities.
  if (!scope.includes("activity:write")) {
    return NextResponse.redirect(new URL("/?strava=noscope", request.url));
  }

  try {
    const { refreshToken, athleteName } = await exchangeCode(code);
    const res = NextResponse.redirect(new URL("/?strava=connected", request.url));
    const secure = url.protocol === "https:";
    res.cookies.set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    if (athleteName) {
      res.cookies.set(ATHLETE_COOKIE, athleteName, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }
    return res;
  } catch {
    return NextResponse.redirect(new URL("/?strava=error", request.url));
  }
}
