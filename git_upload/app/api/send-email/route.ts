import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server/firebaseAuth";

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL ?? "philipp@pauli-one.com";
const FROM_NAME = "Talo";
const SUPPORT_EMAIL = "support@talo-app.de";
const CONTACT_RECIPIENT = process.env.CONTACT_RECIPIENT_EMAIL ?? "philipp@pauli-one.de";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://talo.app";

type SendGridPayload = {
  personalizations: Array<{
    to: Array<{ email: string; name?: string }>;
    subject: string;
  }>;
  from: { email: string; name: string };
  reply_to?: { email: string; name?: string };
  content: Array<{ type: "text/plain" | "text/html"; value: string }>;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimits = new Map<string, RateLimitBucket>();

function getClientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const current = rateLimits.get(key);

  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
}

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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderWelcomeHtml(memberName: string, email: string, password: string, clubName: string, adminName: string) {
  return `
<!DOCTYPE html>
<html lang="de">
<body style="margin:0;background:#0D0D0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1C1C24;border-radius:24px;overflow:hidden;max-width:600px;width:100%;border:1px solid #2A2A38;">
        <tr><td style="padding:20px 32px;border-bottom:1px solid #2A2A38;color:#F0F0FF;font-weight:800;letter-spacing:4px;">TALO</td></tr>
        <tr><td style="background:#7DD8D8;padding:36px 32px;text-align:center;">
          <h1 style="margin:0 0 8px;font-size:26px;color:#0D1A1A;">Willkommen bei ${escapeHtml(clubName)}!</h1>
          <p style="margin:0;color:rgba(13,26,26,0.68);">Hallo ${escapeHtml(memberName)}, du bist jetzt dabei.</p>
        </td></tr>
        <tr><td style="padding:28px 32px 0;color:#8888A0;line-height:1.7;">
          Du wurdest als Mitglied registriert und kannst Talo ab sofort nutzen.
        </td></tr>
        <tr><td style="padding:24px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:14px;border:1px solid #2A2A38;">
            <tr><td style="padding:14px 18px;border-bottom:1px solid #2A2A38;color:#F0F0FF;">E-Mail: ${escapeHtml(email)}</td></tr>
            <tr><td style="padding:14px 18px;color:#7DD8D8;font-family:'Courier New',monospace;font-weight:700;letter-spacing:2px;">Passwort: ${escapeHtml(password)}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:28px 32px;text-align:center;">
          <a href="${SITE_URL}/anmelden" style="display:inline-block;background:#7DD8D8;color:#0D1A1A;text-decoration:none;font-size:16px;font-weight:800;padding:16px 36px;border-radius:100px;">Talo öffnen &rarr;</a>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #2A2A38;background:#111118;color:#505060;text-align:center;font-size:12px;">
          Gesendet von ${escapeHtml(adminName)} &middot; ${escapeHtml(clubName)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function renderNewsletterWelcomeHtml(email: string, token: string, origin: string) {
  const unsubscribeUrl = `${origin}/newsletter/abmelden?token=${encodeURIComponent(token)}`;

  return `
<!DOCTYPE html>
<html lang="de">
<body style="margin:0;background:#0D0D0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1C1C24;border-radius:24px;overflow:hidden;max-width:600px;width:100%;border:1px solid #2A2A38;">
        <tr><td style="padding:20px 32px;border-bottom:1px solid #2A2A38;color:#F0F0FF;font-weight:800;">Talo Newsletter</td></tr>
        <tr><td style="background:#7DD8D8;padding:36px 32px;text-align:center;">
          <h1 style="margin:0 0 8px;font-size:26px;color:#0D1A1A;">Willkommen im Newsletter!</h1>
          <p style="margin:0;color:rgba(13,26,26,0.68);">Du stehst jetzt auf der Liste.</p>
        </td></tr>
        <tr><td style="padding:28px 32px;color:#8888A0;line-height:1.7;">
          Schön, dass du dabei bist. Wir melden uns maximal 2x im Monat mit Updates, Praxis-Tipps und Einblicken aus dem Talo-Team.
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #2A2A38;background:#111118;color:#505060;text-align:center;font-size:12px;line-height:1.6;">
          Gesendet an ${escapeHtml(email)}.<br>
          <a href="${unsubscribeUrl}" style="color:#7DD8D8;">Vom Newsletter abmelden</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

async function sendToSendGrid(payload: SendGridPayload) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error("[send-email] SENDGRID_API_KEY is not set");
    return NextResponse.json({ error: "E-Mail-Versand ist nicht konfiguriert." }, { status: 500 });
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[send-email] SendGrid error", response.status, errorText);
    return NextResponse.json({ error: "E-Mail konnte nicht gesendet werden." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}

function contactPayload(body: Record<string, unknown>): SendGridPayload | null {
  const name = readString(body, "name", 120);
  const email = readString(body, "email", 180);
  const club = readString(body, "club", 180);
  const message = readString(body, "message", 3000);

  if (!name || !email || !isEmail(email) || !club || !message) {
    return null;
  }

  const subject = `Neue Demo/Kontakt-Anfrage: ${club}`;
  const plainText = `
Neue Kontaktanfrage über die Website:

Name:    ${name}
E-Mail:  ${email}
Verein:  ${club}

Nachricht:
${message}`.trim();

  return {
    personalizations: [{ to: [{ email: CONTACT_RECIPIENT, name: "Philipp Pauli" }], subject }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    reply_to: { email, name },
    content: [{ type: "text/plain", value: plainText }],
  };
}

function welcomePayload(body: Record<string, unknown>): SendGridPayload | null {
  const to = readString(body, "to", 180);
  const name = readString(body, "name", 160);
  const memberName = readString(body, "memberName", 160);
  const password = readString(body, "password", 128);
  const clubName = readString(body, "clubName", 180);
  const clubId = readString(body, "clubId", 180);
  const adminName = readString(body, "adminName", 160);

  if (!to || !isEmail(to) || !name || !memberName || !password || !clubName || !clubId || !adminName) {
    return null;
  }

  const subject = `Willkommen bei ${clubName} - Deine Zugangsdaten`;
  const plainText = `
Hallo ${memberName},

herzlich willkommen bei ${clubName}!

E-Mail: ${to}
Passwort: ${password}

Bitte ändere dein Passwort nach dem ersten Login in den Einstellungen.

Bei Fragen: ${SUPPORT_EMAIL}

Viele Grüße
${adminName} · ${clubName}`.trim();

  return {
    personalizations: [{ to: [{ email: to, name }], subject }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    content: [
      { type: "text/plain", value: plainText },
      { type: "text/html", value: renderWelcomeHtml(memberName, to, password, clubName, adminName) },
    ],
  };
}

function newsletterWelcomePayload(body: Record<string, unknown>, request: Request): SendGridPayload | null {
  const email = readString(body, "email", 180);
  const token = readString(body, "token", 128);

  if (!email || !isEmail(email) || !token) {
    return null;
  }

  const origin = request.headers.get("origin") || SITE_URL;
  const safeOrigin = origin.startsWith("http://localhost") || origin.startsWith("https://")
    ? origin
    : SITE_URL;

  return {
    personalizations: [{ to: [{ email }], subject: "Du bist dabei - willkommen beim Talo Newsletter" }],
    from: { email: FROM_EMAIL, name: "Talo Newsletter" },
    content: [
      { type: "text/html", value: renderNewsletterWelcomeHtml(email, token, safeOrigin) },
    ],
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const type = body.type;

  if (type === "contact") {
    if (!checkRateLimit(`contact:${getClientKey(request)}`)) {
      return NextResponse.json({ error: "Zu viele Anfragen. Bitte versuche es später erneut." }, { status: 429 });
    }

    const payload = contactPayload(body);
    return payload
      ? sendToSendGrid(payload)
      : NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  if (type === "newsletter-welcome") {
    if (!checkRateLimit(`newsletter:${getClientKey(request)}`, 3)) {
      return NextResponse.json({ error: "Zu viele Anfragen. Bitte versuche es später erneut." }, { status: 429 });
    }

    const payload = newsletterWelcomePayload(body, request);
    return payload
      ? sendToSendGrid(payload)
      : NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  if (type === "welcome") {
    const clubId = readString(body, "clubId", 180);
    const admin = await verifyAdminRequest(request, clubId ?? undefined);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = welcomePayload(body);
    return payload
      ? sendToSendGrid(payload)
      : NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  return NextResponse.json({ error: "Unsupported email type" }, { status: 400 });
}
