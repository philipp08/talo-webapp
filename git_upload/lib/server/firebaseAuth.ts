import { ADMIN_EMAIL, FIREBASE_API_KEY, FIREBASE_CONFIG } from "@/lib/firebase/constants";

type FirebaseLookupResponse = {
  users?: Array<{
    localId?: string;
    email?: string;
  }>;
};

export type VerifiedAdmin = {
  uid: string;
  email: string;
};

type FirestoreValue = {
  booleanValue?: boolean;
  stringValue?: string;
  arrayValue?: {
    values?: FirestoreValue[];
  };
  mapValue?: {
    fields?: Record<string, FirestoreValue>;
  };
};

type FirestoreDocument = {
  fields?: Record<string, FirestoreValue>;
};

function readStringArray(value: FirestoreValue | undefined) {
  return value?.arrayValue?.values
    ?.map((entry) => entry.stringValue)
    .filter((entry): entry is string => typeof entry === "string") ?? [];
}

async function verifyClubAdmin(token: string, uid: string, clubId: string): Promise<boolean> {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/members/${uid}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as FirestoreDocument;
  const fields = data.fields;

  const clubIds = readStringArray(fields?.clubIds);
  const legacyClubId = fields?.clubId?.stringValue;
  const membership = fields?.clubMemberships?.mapValue?.fields?.[clubId]?.mapValue?.fields;
  const belongsToClub = clubIds.includes(clubId) || legacyClubId === clubId || Boolean(membership);

  if (membership) {
    return belongsToClub && membership.isAdmin?.booleanValue === true;
  }

  return belongsToClub && fields?.isAdmin?.booleanValue === true;
}

export async function verifyAdminRequest(request: Request, clubId?: string): Promise<VerifiedAdmin | null> {
  const authHeader = request.headers.get("authorization");
  const match = authHeader?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return null;
  }

  const token = match[1];
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as FirebaseLookupResponse;
  const user = data.users?.[0];
  const email = user?.email;

  if (!user?.localId || !email) {
    return null;
  }

  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return { uid: user.localId, email };
  }

  if (clubId && await verifyClubAdmin(token, user.localId, clubId)) {
    return { uid: user.localId, email };
  }

  return null;
}
