/**
 * Single source of truth for the newsletter email shell.
 * Used by the admin preview AND the server send route so what the admin
 * sees in the in-app preview matches exactly what subscribers receive.
 */
export function buildNewsletterHtml(opts: {
  htmlBody: string;
  baseUrl: string;
  unsubLink: string;
}) {
  const { htmlBody, baseUrl, unsubLink } = opts;
  // Absolute URL to the Talo cursive-T logo. Must be absolute so email
  // clients (which strip <base>) can resolve it.
  const logoUrl = `${baseUrl}/talo-logo.png`;

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light">
    <title>Talo Newsletter</title>
  </head>
  <body style="margin:0;padding:0;background:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0A0A0A;-webkit-font-smoothing:antialiased">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F4F4F5;padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid rgba(0,0,0,0.05)">

            <!-- Header / Logo -->
            <tr>
              <td style="padding:32px 40px 8px 40px">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="vertical-align:middle">
                      <div style="display:inline-block;width:44px;height:44px;background:#0A0A0A;border-radius:12px;text-align:center;vertical-align:middle;line-height:44px">
                        <img src="${logoUrl}" alt="TALO" width="28" height="28" style="display:inline-block;width:28px;height:28px;vertical-align:middle;border:0;outline:none;text-decoration:none">
                      </div>
                    </td>
                    <td style="vertical-align:middle;padding-left:14px">
                      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:17px;font-weight:900;letter-spacing:0.25em;color:#0A0A0A;line-height:1;text-transform:uppercase">TALO</div>
                      <div style="font-size:9px;font-weight:900;letter-spacing:0.3em;color:#B4B4BA;margin-top:4px;text-transform:uppercase">Newsletter</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:24px 40px 8px 40px;font-size:15px;line-height:1.7;color:#1f2937">
                ${htmlBody}
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:24px 40px 0 40px">
                <div style="height:1px;background:rgba(0,0,0,0.06);width:100%"></div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 40px 36px 40px;font-size:12px;line-height:1.7;color:#9CA3AF">
                Du erhältst diese E-Mail als Abonnent des Talo Newsletters.<br>
                <a href="${unsubLink}" style="color:#71717A;text-decoration:underline">Vom Newsletter-Versand abmelden</a>
                <div style="margin-top:14px;color:#B4B4BA;font-size:11px;letter-spacing:0.05em">© Talo · Vereinsmanagement, endlich einfach</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
