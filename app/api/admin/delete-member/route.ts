import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server/firebaseAuth";
import * as admin from "firebase-admin";

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
      console.log("[Firebase Admin] Initialized in delete-member API with credentials");
    } else {
      admin.initializeApp({
        projectId,
      });
      console.log("[Firebase Admin] Initialized in delete-member API with projectId fallback");
    }
  } catch (error) {
    console.error("[Firebase Admin] Initialization failed in delete-member API:", error);
  }
}

async function checkSuperAdmin(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return false;
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email || "";
    const isSuper =
      email.endsWith("@pauli-one.de") ||
      email.endsWith("@pauli-one.com") ||
      email.endsWith("@talo.app") ||
      email.endsWith("@talo-club.de");
    return isSuper;
  } catch (e) {
    console.error("Super Admin check failed in delete-member API:", e);
    return false;
  }
}

/**
 * POST /api/admin/delete-member
 *
 * Super-admin endpoint to completely delete a member document and their Authentication account.
 * Body: { memberId: string }
 */
export async function POST(request: Request) {
  const isSuper = await checkSuperAdmin(request);
  if (!isSuper) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { memberId } = body;
  if (!memberId) {
    return NextResponse.json({ error: "Missing memberId" }, { status: 400 });
  }

  try {
    const firestore = admin.firestore();

    // 1. Delete Firestore Member document
    await firestore.collection("members").doc(memberId).delete();
    console.log(`[delete-member] Deleted Firestore member doc: ${memberId}`);

    // 2. Delete Firebase Auth account
    try {
      await admin.auth().deleteUser(memberId);
      console.log(`[delete-member] Deleted Firebase Auth account: ${memberId}`);
    } catch (authError: any) {
      console.log(`[delete-member] Auth account already missing or not deletable: ${authError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[delete-member] Error deleting member:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
