import { auth } from "./config";
import { createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { FirebaseManager } from "./firebaseManager";

export class AuthService {
  static generatePassword(length: number = 12): string {
    const lower = "abcdefghjkmnpqrstuvwxyz";
    const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
    const digits = "23456789";
    const all = lower + upper + digits;
    
    // Ensure at least 1 uppercase and 1 digit
    let pwd = Array.from({ length: length - 2 }, () => all[Math.floor(Math.random() * all.length)]).join("");
    pwd += upper[Math.floor(Math.random() * upper.length)];
    pwd += digits[Math.floor(Math.random() * digits.length)];
    
    // Shuffle
    return pwd.split('').sort(() => 0.5 - Math.random()).join('');
  }

  /**
   * Creates a member by signing up with a temporary password via REST API 
   * (similar to native app to avoid being logged in as the new user).
   */
  static async createMemberAuth(email: string, firstName: string, lastName: string, apiKey: string): Promise<{ uid: string; password: string }> {
    const password = this.generatePassword();
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
        returnSecureToken: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || "Fehler beim Anlegen des Nutzers.";
      throw new Error(this.localizeFirebaseError(errorMsg));
    }

    return { uid: data.localId, password };
  }

  private static localizeFirebaseError(code: string): string {
    switch (code) {
      case "EMAIL_EXISTS": return "Diese E-Mail-Adresse ist bereits vergeben.";
      case "INVALID_EMAIL": return "Ungültige E-Mail-Adresse.";
      case "WEAK_PASSWORD": return "Passwort muss mindestens 6 Zeichen haben.";
      default: return `Fehler: ${code}`;
    }
  }
}
