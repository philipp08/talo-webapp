/**
 * Safe orphaned-data cleanup for the admin panel.
 *
 * Only deletes records that are demonstrably old enough that they can't be
 * caught mid-onboarding. Without an age check this would race with the
 * onboarding flow (createClub → updateMember) and delete brand-new clubs.
 *
 * - Empty clubs are only deleted if `createdAt` is set AND > MIN_CLUB_AGE_MS old.
 *   Clubs without `createdAt` (legacy data) are preserved by default and
 *   surfaced for the admin to delete manually via the club-detail page.
 * - Orphaned members (clubIds empty) require `createdAt` set AND
 *   > MIN_MEMBER_AGE_MS old. Without `createdAt`, the record is preserved.
 */

import { deleteDoc, doc, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const MIN_CLUB_AGE_MS = 24 * 60 * 60 * 1000;    // 24 hours
export const MIN_MEMBER_AGE_MS = 60 * 60 * 1000;       // 1 hour

export interface CleanupCandidates {
  emptyClubIds: string[];
  emptyClubIdsPreserved: number;
  orphanedMemberIds: string[];
  orphanedMembersPreserved: number;
}

export interface CleanupResult {
  deletedClubs: number;
  deletedMembers: number;
}

/**
 * Identify which clubs and members would be deleted by a cleanup run.
 * Pure analysis — does NOT touch the database. Use this to populate the
 * confirmation dialog before calling `executeCleanup`.
 */
export function findOrphanedData(
  clubsSnap: QuerySnapshot<DocumentData>,
  membersSnap: QuerySnapshot<DocumentData>
): CleanupCandidates {
  const now = Date.now();
  const memberCountByClub = new Map<string, number>();
  const memberClubMap = new Map<string, string[]>();

  membersSnap.docs.forEach((m) => {
    const data = m.data();
    const clubIds: string[] = data.clubIds ?? (data.clubId ? [data.clubId] : []);
    memberClubMap.set(m.id, clubIds);
    clubIds.forEach((cid) => {
      memberCountByClub.set(cid, (memberCountByClub.get(cid) ?? 0) + 1);
    });
  });

  const emptyClubIds: string[] = [];
  let emptyClubIdsPreserved = 0;

  clubsSnap.docs.forEach((c) => {
    const memberCount = memberCountByClub.get(c.id) ?? 0;
    if (memberCount > 0) return;

    const data = c.data();
    const createdAtMs = data.createdAt?.toDate?.()?.getTime();
    if (typeof createdAtMs !== "number") {
      // No createdAt → preserve (legacy or onboarding-in-progress).
      emptyClubIdsPreserved++;
      return;
    }
    if (now - createdAtMs < MIN_CLUB_AGE_MS) {
      // Too recent — could still be mid-onboarding.
      emptyClubIdsPreserved++;
      return;
    }
    emptyClubIds.push(c.id);
  });

  const orphanedMemberIds: string[] = [];
  let orphanedMembersPreserved = 0;

  membersSnap.docs.forEach((m) => {
    const clubIds = memberClubMap.get(m.id) ?? [];
    if (clubIds.length > 0) return;

    const data = m.data();
    const createdAtMs = data.createdAt?.toDate?.()?.getTime();
    if (typeof createdAtMs !== "number") {
      orphanedMembersPreserved++;
      return;
    }
    if (now - createdAtMs < MIN_MEMBER_AGE_MS) {
      orphanedMembersPreserved++;
      return;
    }
    orphanedMemberIds.push(m.id);
  });

  return {
    emptyClubIds,
    emptyClubIdsPreserved,
    orphanedMemberIds,
    orphanedMembersPreserved,
  };
}

export async function executeCleanup(
  candidates: CleanupCandidates
): Promise<CleanupResult> {
  if (candidates.emptyClubIds.length > 0) {
    await Promise.all(
      candidates.emptyClubIds.map((id) => deleteDoc(doc(db, "clubs", id)))
    );
  }
  if (candidates.orphanedMemberIds.length > 0) {
    await Promise.all(
      candidates.orphanedMemberIds.map((id) => deleteDoc(doc(db, "members", id)))
    );
  }
  return {
    deletedClubs: candidates.emptyClubIds.length,
    deletedMembers: candidates.orphanedMemberIds.length,
  };
}
