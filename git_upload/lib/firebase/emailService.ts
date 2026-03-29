interface EmailParams {
  to: string;
  name: string;
  subject: string;
  memberName: string;
  password: string;
  clubName: string;
  adminName: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = "philipp@pauli-one.com";
  private static readonly FROM_NAME = "Talo";
  private static readonly APP_STORE_URL = "https://apps.apple.com/app/talo/id000000000";
  private static readonly SUPPORT_EMAIL = "support@talo-app.de";

  static async sendWelcomeMail(params: EmailParams): Promise<void> {
    // ... [existing logic for subject, plainText, and htmlContent remains unchanged]
    const { to, name, memberName, password, clubName, adminName } = params;
    const subject = `Willkommen bei ${clubName} – Deine Zugangsdaten`;

    const plainText = `
Hallo ${memberName},

herzlich willkommen bei ${clubName}!

Du wurdest als Mitglied registriert und kannst ab sofort die Talo-App nutzen, um deine Vereinsstunden zu erfassen.

DEINE ZUGANGSDATEN
──────────────────
E-Mail:   ${to}
Passwort: ${password}

SO GEHT'S
──────────────────
1. App herunterladen: ${this.APP_STORE_URL}
2. Auf "Anmelden" tippen
3. E-Mail und Passwort eingeben
4. Loslegen und Punkte sammeln!

Tipp: Bitte ändere dein Passwort nach dem ersten Login in den Einstellungen.

Bei Fragen: ${this.SUPPORT_EMAIL}

Viele Grüße
${adminName} · ${clubName}
    `.trim();

    const htmlContent = this.generateWelcomeHTML(memberName, to, password, clubName, adminName);

    await this.sendRequest({
      personalizations: [{ to: [{ email: to, name: name }], subject }],
      from: { email: this.FROM_EMAIL, name: this.FROM_NAME },
      content: [
        { type: "text/plain", value: plainText },
        { type: "text/html", value: htmlContent }
      ]
    });
  }

  private static async sendRequest(payload: any): Promise<void> {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error("E-Mail konnte nicht gesendet werden.");
    }
  }

  private static generateWelcomeHTML(memberName: string, email: string, password: string, clubName: string, adminName: string): string {
    return `
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Talo</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0D0D0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%}
</style>
</head>
<body style="background:#0D0D0D;padding:0;margin:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#1C1C24;border-radius:24px;overflow:hidden;max-width:600px;width:100%;border:1px solid #2A2A38;">
      <tr>
        <td style="padding:20px 32px;border-bottom:1px solid #2A2A38;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <span style="font-size:20px;font-weight:800;color:#F0F0FF;letter-spacing:4px;text-transform:uppercase;">TALO</span>
                <span style="font-size:20px;font-weight:300;color:#505060;"> · Jeder Beitrag zaehlt</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:linear-gradient(135deg, #7DD8D8 0%, #4BBABA 100%);padding:40px 32px 32px;text-align:center;">
          <div style="width:72px;height:72px;background:rgba(0,0,0,0.15);border-radius:20px;margin:0 auto 18px;line-height:72px;font-size:32px;text-align:center;">🏆</div>
          <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:#0D1A1A;letter-spacing:-0.5px;line-height:1.2;">Willkommen bei ${clubName}!</h1>
          <p style="margin:0;font-size:15px;color:rgba(13,26,26,0.65);">Hallo ${memberName}, du bist jetzt dabei.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px 0;">
          <p style="font-size:15px;color:#8888A0;line-height:1.7;margin:0;">Du wurdest als Mitglied registriert. Mit der <strong style="color:#F0F0FF;">Talo-App</strong> kannst du ab sofort deine Vereinsstunden erfassen.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px 0;">
          <p style="font-size:11px;font-weight:700;color:#505060;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px;">Deine Zugangsdaten</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:14px;overflow:hidden;border:1px solid #2A2A38;">
            <tr>
              <td style="padding:14px 18px;border-bottom:1px solid #2A2A38;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:12px;color:#505060;font-weight:600;text-transform:uppercase;width:90px;">E-Mail</td>
                    <td style="font-size:14px;color:#F0F0FF;text-align:right;">${email}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 18px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:12px;color:#505060;font-weight:600;text-transform:uppercase;width:90px;">Passwort</td>
                    <td style="font-size:18px;color:#7DD8D8;text-align:right;font-family:'Courier New',Courier,monospace;font-weight:700;letter-spacing:3px;">${password}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px;text-align:center;">
          <a href="${this.APP_STORE_URL}" style="display:inline-block;background:#7DD8D8;color:#0D1A1A;text-decoration:none;font-size:16px;font-weight:800;padding:16px 36px;border-radius:100px;">Jetzt Talo-App laden &rarr;</a>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px;border-top:1px solid #2A2A38;background:#111118;">
          <p style="font-size:12px;color:#505060;text-align:center;line-height:1.6;margin:0;">Gesendet von ${adminName} &middot; ${clubName}</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>
    `;
  }
}
