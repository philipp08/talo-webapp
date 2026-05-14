import { NextResponse } from "next/server";
import { FIREBASE_API_KEY } from "@/lib/firebase/constants";
import { verifyAdminRequest } from "@/lib/server/firebaseAuth";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(body: Record<string, unknown>, key: string, maxLength: number) {
  const value = body[key];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function randomIndex(max: number): number {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.getRandomValues) {
    const values = new Uint32Array(1);
    cryptoApi.getRandomValues(values);
    return values[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function generatePassword(length: number = 12): string {
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const digits = "23456789";
  const all = lower + upper + digits;
  const safeLength = Math.max(length, 6);

  const pick = (chars: string) => chars[randomIndex(chars.length)];
  const passwordChars = Array.from({ length: safeLength - 2 }, () => pick(all));
  passwordChars.push(pick(upper), pick(digits));

  for (let i = passwordChars.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}

function localizeFirebaseError(code: string): string {
  switch (code) {
    case "EMAIL_EXISTS":
      return "Diese E-Mail-Adresse ist bereits vergeben.";
    case "INVALID_EMAIL":
      return "Ungültige E-Mail-Adresse.";
    case "WEAK_PASSWORD":
      return "Passwort muss mindestens 6 Zeichen haben.";
    default:
      return `Fehler: ${code}`;
  }
}

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isRecord(rawBody)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const email = readString(rawBody, "email", 180);
  const firstName = readString(rawBody, "firstName", 120);
  const lastName = readString(rawBody, "lastName", 120);
  const clubId = readString(rawBody, "clubId", 180);

  if (!email || !isEmail(email) || !firstName || !lastName || !clubId) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const admin = await verifyAdminRequest(request, clubId);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const password = generatePassword();
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
        returnSecureToken: true,
      }),
    }
  );

  const data = (await response.json()) as {
    localId?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.localId) {
    const errorMsg = data.error?.message || "Fehler beim Anlegen des Nutzers.";
    return NextResponse.json({ error: localizeFirebaseError(errorMsg) }, { status: 502 });
  }

  return NextResponse.json({ uid: data.localId, password });
}
