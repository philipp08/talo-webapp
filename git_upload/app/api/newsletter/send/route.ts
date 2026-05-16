import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server/firebaseAuth";
import { buildNewsletterHtml } from "@/lib/newsletter/template";

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
  const htmlWithFooter = buildNewsletterHtml({ htmlBody, baseUrl, unsubLink });

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
