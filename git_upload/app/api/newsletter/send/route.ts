import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server/firebaseAuth";

interface Subscriber {
  email: string;
  token: string;
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL ?? "philipp@pauli-one.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://talo.app";
const MAX_SUBSCRIBERS_PER_SEND = 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function readString(body: Record<string, unknown>, key: string, maxLength: number) {
  const value = body[key];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

function readSubscribers(value: unknown): Subscriber[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_SUBSCRIBERS_PER_SEND) {
    return null;
  }

  const subscribers: Subscriber[] = [];
  for (const item of value) {
    if (!isRecord(item)) {
      return null;
    }

    const email = readString(item, "email", 180);
    const token = readString(item, "token", 128);
    if (!email || !isEmail(email) || !token) {
      return null;
    }

    subscribers.push({ email, token });
  }

  return subscribers;
}

async function sendOne(apiKey: string, email: string, token: string, subject: string, htmlBody: string, baseUrl: string) {
  const unsubLink = `${baseUrl}/newsletter/abmelden?token=${encodeURIComponent(token)}`;
  const htmlWithFooter = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:48px 24px;color:#1a1a1a;background:#fff">
      <div style="width:36px;height:36px;background:#000;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:28px">
        <span style="color:#fff;font-weight:800;font-size:14px;letter-spacing:0.1em">T</span>
      </div>
      ${htmlBody}
      <hr style="border:none;border-top:1px solid #eee;margin:40px 0 20px">
      <p style="font-size:12px;color:#aaa;line-height:1.6">
        Du erhältst diese E-Mail als Abonnent des Talo Newsletters.<br>
        <a href="${unsubLink}" style="color:#aaa;text-decoration:underline">Vom Newsletter-Versand abmelden</a>
      </p>
    </div>`;

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: FROM_EMAIL, name: "Talo Newsletter" },
      subject,
      content: [{ type: "text/html", value: htmlWithFooter }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`SendGrid ${res.status}: ${errBody}`);
  }
}

export async function POST(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SENDGRID_API_KEY not set" }, { status: 500 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isRecord(rawBody)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const subject = readString(rawBody, "subject", 180);
  const htmlBody = readString(rawBody, "htmlBody", 100_000);
  const subscribers = readSubscribers(rawBody.subscribers);

  if (!subject || !htmlBody || !subscribers) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const origin = request.headers.get("origin");
  const baseUrl = origin?.startsWith("http://localhost") || origin?.startsWith("https://")
    ? origin
    : SITE_URL;

  const results = await Promise.allSettled(
    subscribers.map(({ email, token }) =>
      sendOne(apiKey, email, token, subject, htmlBody, baseUrl)
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => r.reason instanceof Error ? r.reason.message : "unknown");

  return NextResponse.json({ sent, failed, total: subscribers.length, errors });
}
