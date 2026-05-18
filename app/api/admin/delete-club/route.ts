/**
 * POST /api/admin/delete-club
 *
 * Super-admin endpoint to fully delete a club:
 *   1. Removes every subcollection (entries, shifts, trainings, trainingSchedules,
 *      trainingGroups, trainingSessions, announcements, activities, groups, duels)
 *   2. Detaches the club from every member's clubIds / clubMemberships
 *      (members themselves are kept — they may still belong to other clubs)
 *   3. Deletes the club document
 *
 * Using the Firebase Admin SDK is the only safe way to do this:
 *  - Client-side recursive deletes are slow, risky and would hit rules limits
 *  - This avoids leaving orphaned subcollections that count against quota forever
 *
 * Body: { clubId: string }
 */

import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { isSuperAdminEmail } from "@/lib/firebase/constants";

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
    } else {
      admin.initializeApp({ projectId });
    }
  } catch (error) {
    console.error("[Firebase Admin] Initialization failed in delete-club API:", error);
  }
}

const SUBCOLLECTIONS = [
  "entries",
  "shifts",
  "trainings",
  "trainingSchedules",
  "trainingGroups",
  "trainingSessions",
  "announcements",
  "activities",
  "groups",
  "duels",
];

async function checkSuperAdmin(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return false;
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return isSuperAdminEmail(decodedToken.email);
  } catch (e) {
    console.error("[delete-club] Super-admin check failed:", e);
    return false;
  }
}

/**
 * Delete a collection in batches. Admin SDK has no built-in recursive delete
 * for nested collections under a single doc, so we do it in chunks of 500
 * to stay within the transaction limit.
 */
async function deleteCollection(
  ref: FirebaseFirestore.CollectionReference,
  batchSize = 200
): Promise<number> {
  let totalDeleted = 0;
  // Loop until the collection is empty (handles unbounded sizes).
  // Safety cap: 1_000_000 docs (5_000 batches) — abort if exceeded.
  for (let i = 0; i < 5000; i++) {
    const snap = await ref.limit(batchSize).get();
    if (snap.empty) return totalDeleted;
    const batch = ref.firestore.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    totalDeleted += snap.size;
  }
  throw new Error(`deleteCollection exceeded safety cap on ${ref.path}`);
}

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

  const { clubId } = body;
  if (!clubId || typeof clubId !== "string") {
    return NextResponse.json({ error: "Missing clubId" }, { status: 400 });
  }

  try {
    const firestore = admin.firestore();
    const clubRef = firestore.collection("clubs").doc(clubId);

    // 1) Make sure the club actually exists before doing destructive work.
    const clubSnap = await clubRef.get();
    if (!clubSnap.exists) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // 2) Wipe all subcollections in parallel.
    const subResults = await Promise.all(
      SUBCOLLECTIONS.map((name) => deleteCollection(clubRef.collection(name)))
    );
    const subDeleted = SUBCOLLECTIONS.reduce<Record<string, number>>(
      (acc, name, i) => {
        acc[name] = subResults[i];
        return acc;
      },
      {}
    );

    // 3) Detach this clubId from every member that referenced it.
    //    Query members where clubIds array-contains clubId.
    const membersWithClub = await firestore
      .collection("members")
      .where("clubIds", "array-contains", clubId)
      .get();

    const detachOps: Promise<any>[] = [];
    membersWithClub.forEach((m) => {
      const data = m.data();
      const remaining: string[] = (data.clubIds ?? []).filter((c: string) => c !== clubId);
      const updates: Record<string, any> = {
        clubIds: remaining,
      };
      // Strip the membership object so we don't leak a dangling reference.
      updates[`clubMemberships.${clubId}`] = admin.firestore.FieldValue.delete();
      // If clubId was set as the active one, switch to the first remaining (or empty).
      if (data.clubId === clubId) {
        updates.clubId = remaining[0] ?? "";
      }
      detachOps.push(m.ref.update(updates));
    });
    await Promise.all(detachOps);

    // 4) Finally delete the club doc itself.
    await clubRef.delete();

    return NextResponse.json({
      success: true,
      clubId,
      subcollectionsDeleted: subDeleted,
      membersDetached: membersWithClub.size,
    });
  } catch (e: any) {
    console.error("[delete-club] Error:", e);
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 });
  }
}
