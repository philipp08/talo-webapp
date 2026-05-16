import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server/firebaseAuth";

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL ?? "newsletter@talo-club.de";
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
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Deine Zugangsdaten f\u00fcr ${escapeHtml(clubName)}</title>
</head>

<body style="margin:0; padding:0; background:transparent; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px; background:transparent;">
<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0"
style="
max-width:640px;
background:#ffffff;
border-radius:32px;
overflow:hidden;
box-shadow:0 20px 60px rgba(0,0,0,0.08);
">

  <!-- HEADER -->
  <tr>
    <td
      style="
      background-color:#0f172a;
      background:
      radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 30%),
      linear-gradient(135deg, #0f172a 0%, #111827 40%, #1e293b 100%);
      padding:70px 40px 60px;
      text-align:center;
      position:relative;
      "
    >


      <div
        style="
        display:inline-block;
        padding:8px 18px;
        border-radius:999px;
        background:rgba(255,255,255,0.10);
        border:1px solid rgba(255,255,255,0.12);
        backdrop-filter:blur(10px);
        color:#dbeafe;
        font-size:13px;
        font-weight:600;
        letter-spacing:0.4px;
        margin-bottom:24px;
        "
      >
        Willkommen bei Talo
      </div>

      <h1
        style="
        margin:0;
        font-size:42px;
        line-height:1.05;
        font-weight:800;
        color:#ffffff;
        letter-spacing:-1.6px;
        "
      >
        Dein Zugang<br />
        ist bereit.
      </h1>

      <p
        style="
        margin:24px auto 0;
        max-width:460px;
        font-size:18px;
        line-height:1.7;
        color:rgba(255,255,255,0.72);
        "
      >
        Du wurdest erfolgreich zu ${escapeHtml(clubName)} hinzugefügt und kannst dich jetzt bei Talo anmelden.
      </p>

    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td style="padding:48px 40px;">

      <p
        style="
        margin:0 0 22px;
        font-size:17px;
        line-height:1.8;
        color:#374151;
        "
      >
        Hallo ${escapeHtml(memberName)},
      </p>

      <p
        style="
        margin:0 0 34px;
        font-size:17px;
        line-height:1.8;
        color:#4b5563;
        "
      >
        dein Verein nutzt <strong style="color:#111827;">Talo</strong>, um Engagement, Aktivitäten und Vereinsorganisation digital und transparent zu verwalten.
      </p>

      <!-- LOGIN BOX -->
      <table width="100%" cellpadding="0" cellspacing="0"
      style="
      background:#f8fafc;
      border:1px solid #e5e7eb;
      border-radius:24px;
      overflow:hidden;
      margin-bottom:36px;
      ">
        <tr>
          <td style="padding:30px;">

            <div
              style="
              font-size:13px;
              font-weight:700;
              text-transform:uppercase;
              letter-spacing:1px;
              color:#64748b;
              margin-bottom:24px;
              "
            >
              Deine Zugangsdaten
            </div>

            <table width="100%" cellpadding="0" cellspacing="0">

              <tr>
                <td
                  style="
                  padding:14px 0;
                  color:#6b7280;
                  font-size:15px;
                  border-bottom:1px solid #e5e7eb;
                  "
                >
                  Benutzername
                </td>

                <td
                  align="right"
                  style="
                  padding:14px 0;
                  color:#111827;
                  font-size:15px;
                  font-weight:700;
                  border-bottom:1px solid #e5e7eb;
                  "
                >
                  ${escapeHtml(email)}
                </td>
              </tr>

              <tr>
                <td
                  style="
                  padding:14px 0;
                  color:#6b7280;
                  font-size:15px;
                  "
                >
                  Passwort
                </td>

                <td
                  align="right"
                  style="
                  padding:14px 0;
                  color:#111827;
                  font-size:15px;
                  font-weight:700;
                  "
                >
                  ${escapeHtml(password)}
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

      <!-- BUTTON -->
      <div style="text-align:center; margin-bottom:34px;">

        <a
          href="${SITE_URL}/anmelden"
          style="
          display:inline-block;
          background:#111827;
          color:#ffffff;
          text-decoration:none;
          padding:18px 34px;
          border-radius:999px;
          font-size:16px;
          font-weight:700;
          letter-spacing:-0.2px;
          box-shadow:0 10px 30px rgba(17,24,39,0.18);
          "
        >
          Bei Talo anmelden
        </a>

      </div>

      <!-- LINK -->
      <p
        style="
        margin:0 0 30px;
        font-size:14px;
        line-height:1.8;
        color:#6b7280;
        text-align:center;
        "
      >
        Oder direkt hier öffnen:<br />

        <a
          href="${SITE_URL}/anmelden"
          style="
          color:#111827;
          font-weight:600;
          text-decoration:none;
          "
        >
          talo-club.de/anmelden
        </a>
      </p>

      <!-- INFO BOX -->
      <table width="100%" cellpadding="0" cellspacing="0"
      style="
      background:#f9fafb;
      border-radius:20px;
      border:1px solid #e5e7eb;
      ">
        <tr>
          <td style="padding:22px 24px;">

            <p
              style="
              margin:0;
              color:#6b7280;
              font-size:14px;
              line-height:1.7;
              "
            >
              Tipp: Ändere dein Passwort nach deinem ersten Login für maximale Sicherheit.
            </p>

          </td>
        </tr>
      </table>

      <p
        style="
        margin:38px 0 0;
        font-size:16px;
        line-height:1.8;
        color:#374151;
        "
      >
        Viel Spaß mit Talo!<br />
        <strong style="color:#111827;">${escapeHtml(adminName)} · ${escapeHtml(clubName)}</strong>
      </p>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td
      style="
      background:#f9fafb;
      border-top:1px solid #e5e7eb;
      padding:24px;
      text-align:center;
      "
    >

      <p
        style="
        margin:0;
        font-size:12px;
        line-height:1.7;
        color:#9ca3af;
        "
      >
        Diese E-Mail wurde automatisch versendet, weil du zu einem Verein in Talo hinzugefügt wurdest.
      </p>

      <p
        style="
        margin:8px 0 0;
        font-size:12px;
        color:#9ca3af;
        "
      >
        © 2026 Talo
      </p>

    </td>
  </tr>

</table>

</td>
</tr>
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
    from: { email: "zugangsdaten@talo-club.de", name: "Zugangsdaten-Service von Talo" },
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
