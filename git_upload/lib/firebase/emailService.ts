import { auth } from "./config";

interface EmailParams {
  to: string;
  name: string;
  subject?: string;
  memberName: string;
  password: string;
  clubName: string;
  clubId: string;
  adminName: string;
}

interface ContactParams {
  name: string;
  email: string;
  club: string;
  message: string;
}

type EmailRequest =
  | ({ type: "welcome" } & EmailParams)
  | ({ type: "contact" } & ContactParams);

export class EmailService {
  static async sendWelcomeMail(params: EmailParams): Promise<void> {
    await this.sendRequest({ type: "welcome", ...params }, true);
  }

  static async sendContactMail(params: ContactParams): Promise<void> {
    await this.sendRequest({ type: "contact", ...params }, false);
  }

  private static async sendRequest(payload: EmailRequest, requireAdminToken: boolean): Promise<void> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (requireAdminToken) {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Admin-Authentifizierung fehlt.");
      }

      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("E-Mail konnte nicht gesendet werden.");
    }
  }
}
