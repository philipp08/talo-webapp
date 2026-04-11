import { NextResponse } from "next/server";

interface Subscriber {
  email: string;
  token: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SENDGRID_API_KEY not set" }, { status: 500 });
  }

  let body: { subject: string; htmlBody: string; subscribers: Subscriber[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { subject, htmlBody, subscribers } = body;
  if (!subject || !htmlBody || !Array.isArray(subscribers) || subscribers.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const baseUrl = request.headers.get("origin") || "https://talo-webapp.vercel.app";

  const results = await Promise.allSettled(
    subscribers.map(({ email, token }) => {
      const unsubLink = `${baseUrl}/newsletter/abmelden?token=${token}`;
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

      return fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: "philipp@pauli-one.de", name: "Talo Newsletter" },
          subject,
          content: [{ type: "text/html", value: htmlWithFooter }],
        }),
      });
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ sent, failed, total: subscribers.length });
}
