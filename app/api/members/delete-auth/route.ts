import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server/firebaseAuth";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK in trusted server environment
if (!admin.apps.length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "talo-def0d";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
      console.log("[Firebase Admin] Initialized with credentials certificate");
    } else {
      admin.initializeApp({
        projectId,
      });
      console.log("[Firebase Admin] Initialized with projectId fallback");
    }
  } catch (error) {
    console.error("[Firebase Admin] Initialization failed:", error);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * POST /api/members/delete-auth
 *
 * Deletes a Firebase Authentication account administratively.
 * Called when a member is removed from their last club,
 * completely deleting their account from Auth.
 *
 * Body: { uid: string, clubId: string }
 * Requires admin authorization for the given club.
 */
export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isRecord(rawBody)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const uid = typeof rawBody.uid === "string" ? rawBody.uid.trim() : null;
  const clubId = typeof rawBody.clubId === "string" ? rawBody.clubId.trim() : null;

  if (!uid || !clubId) {
    return NextResponse.json({ error: "Missing uid or clubId" }, { status: 400 });
  }

  // Verify the caller is an admin of this club
  const adminUser = await verifyAdminRequest(request, clubId);
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prevent admins from deleting their own auth account
  if (adminUser.uid === uid) {
    return NextResponse.json({ error: "Eigenes Konto kann nicht gelöscht werden." }, { status: 403 });
  }

  try {
    // Attempt administrative deletion using the Admin SDK
    await admin.auth().deleteUser(uid);
    console.log(`[delete-auth] Successfully deleted Firebase Auth account: ${uid}`);
    return NextResponse.json({ success: true, authDeleted: true });
  } catch (adminError: any) {
    console.error("[delete-auth] Admin SDK deletion failed:", adminError.message);
    
    // If user is already deleted, count as success
    if (adminError.code === "auth/user-not-found") {
      return NextResponse.json({ success: true, authDeleted: true, reason: "User already deleted" });
    }

    // Return structured failure response so client knows Firebase Admin is not configured
    return NextResponse.json(
      {
        success: false,
        authDeleted: false,
        error: adminError.message,
        code: adminError.code,
        reason: "Administrative account deletion requires FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables to be configured.",
      },
      { status: 500 }
    );
  }
}
