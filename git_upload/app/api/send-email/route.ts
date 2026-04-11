import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error("[send-email] SENDGRID_API_KEY is not set");
    return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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
    let errorBody: unknown;
    try { errorBody = await response.json(); } catch { errorBody = await response.text(); }
    console.error("[send-email] SendGrid error", response.status, errorBody);
    return NextResponse.json({ error: errorBody }, { status: response.status });
  }

  return NextResponse.json({ success: true });
}
