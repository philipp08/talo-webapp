import { auth } from "./config";

export class AuthService {
  static async createMemberAuth(
    email: string,
    firstName: string,
    lastName: string,
    clubId: string
  ): Promise<{ uid: string; password: string }> {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error("Admin-Authentifizierung fehlt.");
    }

    const response = await fetch("/api/members/create-auth", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        clubId,
      }),
    });

    const data = (await response.json()) as {
      uid?: string;
      password?: string;
      error?: string;
    };

    if (!response.ok || !data.uid || !data.password) {
      throw new Error(typeof data.error === "string" ? data.error : "Fehler beim Anlegen des Nutzers.");
    }

    return { uid: data.uid, password: data.password };
  }
}
