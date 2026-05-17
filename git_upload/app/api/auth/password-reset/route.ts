import { NextResponse } from "next/server";
import { FIREBASE_API_KEY } from "@/lib/firebase/constants";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type SendOobError = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isRecord(rawBody)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const rawEmail = rawBody.email;
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

  if (!email || email.length > 180 || !isEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestType: "PASSWORD_RESET",
        email,
      }),
    }
  );

  if (response.ok) {
    // NOTE: With Firebase Email Enumeration Protection enabled (default for new
    // projects), this endpoint also returns 200 for emails that don't exist in
    // Firebase Auth — no error, no email sent. We log every attempt so misses
    // (e.g. members who exist only in Firestore and never had an Auth account)
    // can be diagnosed from server logs.
    console.log("[password-reset] sendOobCode 200", { email });
    return NextResponse.json({ ok: true });
  }

  let payload: SendOobError = {};
  try {
    payload = (await response.json()) as SendOobError;
  } catch {
    // ignore JSON parse failure — we'll fall through to the default error below
  }

  const code = payload.error?.message?.split(":")[0]?.trim() ?? "UNKNOWN";

  console.error("[password-reset] Identity Toolkit error", {
    status: response.status,
    code,
    raw: payload.error?.message,
  });

  switch (code) {
    case "EMAIL_NOT_FOUND":
      return NextResponse.json({ error: "email_not_found" }, { status: 404 });
    case "INVALID_EMAIL":
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
    case "RESET_PASSWORD_EXCEED_LIMIT":
      return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
    case "USER_DISABLED":
      return NextResponse.json({ error: "user_disabled" }, { status: 403 });
    default:
      return NextResponse.json(
        { error: "unknown", detail: payload.error?.message ?? null },
        { status: 502 }
      );
  }
}
