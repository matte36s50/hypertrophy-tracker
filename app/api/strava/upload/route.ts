import { NextRequest, NextResponse } from "next/server";
import {
  ATHLETE_COOKIE,
  COOKIE_MAX_AGE,
  REFRESH_COOKIE,
  refreshAccessToken,
} from "@/lib/strava-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOADS_URL = "https://www.strava.com/api/v3/uploads";

// POST a structured strength workout (exercises + sets + reps + weight) to
// Strava. The request body is the JSON payload built by lib/strava.ts. We
// refresh the access token from the httpOnly cookie, upload the JSON as a file,
// then poll until Strava finishes processing it into an activity.
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "Not connected to Strava." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || !Array.isArray(payload.sets) || payload.sets.length === 0) {
    return NextResponse.json({ error: "No sets to upload." }, { status: 400 });
  }

  // 1. Refresh the access token (Strava may rotate the refresh token).
  let accessToken: string;
  let rotatedRefresh = refreshToken;
  try {
    const refreshed = await refreshAccessToken(refreshToken);
    accessToken = refreshed.accessToken;
    rotatedRefresh = refreshed.refreshToken;
  } catch {
    // A failed refresh usually means the link was revoked — clear it.
    const res = NextResponse.json(
      { error: "Strava session expired. Please reconnect." },
      { status: 401 },
    );
    res.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
    res.cookies.set(ATHLETE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }

  // 2. Upload the workout JSON as a file.
  const name: string = payload.name ?? "Strength Workout";
  const form = new FormData();
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  form.set("file", blob, "workout.json");
  form.set("data_type", "json");
  form.set("name", name);
  form.set("sport_type", "WeightTraining");
  form.set("external_id", `hypertrophy-${Date.now()}`);

  let uploadId: number | string | undefined;
  try {
    const up = await fetch(UPLOADS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    });
    const upJson = await up.json().catch(() => ({}));
    if (!up.ok || upJson.error) {
      return persistRefresh(
        NextResponse.json(
          { error: upJson.error || `Strava upload failed (${up.status})` },
          { status: 502 },
        ),
        rotatedRefresh,
        request,
      );
    }
    uploadId = upJson.id;
    // If Strava already turned it into an activity, we're done.
    if (upJson.activity_id) {
      return persistRefresh(
        NextResponse.json({ ok: true, activityId: upJson.activity_id }),
        rotatedRefresh,
        request,
      );
    }
  } catch (e) {
    return persistRefresh(
      NextResponse.json(
        { error: e instanceof Error ? e.message : "Upload error" },
        { status: 502 },
      ),
      rotatedRefresh,
      request,
    );
  }

  // 3. Poll the upload until it becomes an activity (Strava processes async).
  const activityId = await pollUpload(uploadId!, accessToken);
  if (activityId === null) {
    // Still processing — not a failure; the activity will appear shortly.
    return persistRefresh(
      NextResponse.json({ ok: true, pending: true }),
      rotatedRefresh,
      request,
    );
  }
  if (typeof activityId === "string") {
    return persistRefresh(
      NextResponse.json({ error: activityId }, { status: 502 }),
      rotatedRefresh,
      request,
    );
  }
  return persistRefresh(
    NextResponse.json({ ok: true, activityId }),
    rotatedRefresh,
    request,
  );
}

// Poll GET /uploads/{id}. Returns the activity id when ready, a string error
// message on failure, or null if it's still processing after our attempts.
async function pollUpload(
  uploadId: number | string,
  accessToken: string,
): Promise<number | string | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    await sleep(700);
    try {
      const res = await fetch(`${UPLOADS_URL}/${uploadId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (json.error) return String(json.error);
      if (json.activity_id) return json.activity_id as number;
    } catch {
      // transient — try again
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Re-store the (possibly rotated) refresh token on the outgoing response so the
// next upload keeps working.
function persistRefresh(
  res: NextResponse,
  refreshToken: string,
  request: NextRequest,
): NextResponse {
  const secure = new URL(request.url).protocol === "https:";
  res.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
