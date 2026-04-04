import { db } from "./config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  addDoc,
  deleteDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { Club, Member, Entry, Activity, SeasonType, TrainingAnnouncement } from "./models";

export class FirebaseManager {
  // === CLUBS ===
  static async getClub(clubId: string): Promise<Club | null> {
    try {
      const docRef = doc(db, "clubs", clubId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          requiredPoints: data.requiredPoints,
          compensationPerMissingPoint: data.compensationPerMissingPoint,
          seasonType: data.seasonType as SeasonType,
          approvalRequired: data.approvalRequired,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching club:", error);
      return null;
    }
  }

  // === MEMBERS ===
  static async getMember(uid: string): Promise<Member | null> {
    try {
      const docRef = doc(db, "members", uid); // Die Collection heißt "members" in iOS
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          memberType: data.memberType,
          isAdmin: data.isAdmin ?? false,
          isTrainer: data.isTrainer ?? false,
          clubId: data.clubId,
          clubIds: data.clubIds || [data.clubId],
          customTargetPoints: data.customTargetPoints,
          profileImageUrl: data.profileImageUrl,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching member:", error);
      return null;
    }
  }

  static async getMembersForClub(clubId: string): Promise<Member[]> {
    try {
      const q = query(
        collection(db, "members"),
        where("clubIds", "array-contains", clubId)
      );
      const querySnapshot = await getDocs(q);
      const members: Member[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        members.push({
          id: docSnap.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          memberType: data.memberType,
          isAdmin: data.isAdmin ?? false,
          isTrainer: data.isTrainer ?? false,
          clubId: data.clubId,
          clubIds: data.clubIds || [data.clubId],
          customTargetPoints: data.customTargetPoints,
          profileImageUrl: data.profileImageUrl,
        });
      });
      return members;
    } catch (error) {
      console.error("Error fetching club members:", error);
      return [];
    }
  }

  // === ENTRIES ===
  static listenToEntries(
    clubId: string,
    callback: (entries: Entry[]) => void
  ) {
    const q = query(collection(db, `clubs/${clubId}/entries`));
    return onSnapshot(
      q,
      (snapshot) => {
        const entries: Entry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          entries.push({
            id: docSnap.id,
            memberId: data.memberId,
            date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
            notes: data.notes || "",
            points: data.points || 0,
            status: data.status,
            activityName: data.activityName,
            activityCategory: data.activityCategory,
            rejectionReason: data.rejectionReason,
            photoUrl: data.photoUrl,
          });
        });
        // Sortieren absteigend nach Datum
        entries.sort((a, b) => {
          const t1 = a.date instanceof Date ? a.date.getTime() : 0;
          const t2 = b.date instanceof Date ? b.date.getTime() : 0;
          return t2 - t1;
        });
        callback(entries);
      },
      (error) => {
        console.error("Error listening to entries:", error);
      }
    );
  }

  static listenToActivities(
    clubId: string,
    callback: (activities: Activity[]) => void
  ) {
    const q = query(collection(db, `clubs/${clubId}/activities`));
    return onSnapshot(
      q,
      (snapshot) => {
        const acts: Activity[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          acts.push({
            id: docSnap.id,
            name: data.name,
            points: data.points,
            category: data.category,
            isDefault: data.isDefault ?? false,
          });
        });
        callback(acts);
      },
      (error) => {
        console.error("Error listening to activities:", error);
      }
    );
  }

  static async updateEntryStatus(
    clubId: string,
    entryId: string,
    newStatus: string,
    rejectionReason?: string
  ) {
    const docRef = doc(db, `clubs/${clubId}/entries`, entryId);
    const updates: any = { status: newStatus };
    if (rejectionReason !== undefined) {
      updates.rejectionReason = rejectionReason;
    }
    await updateDoc(docRef, updates);
  }

  // === ANNOUNCEMENTS ===
  static listenToAnnouncements(
    clubId: string,
    callback: (announcements: TrainingAnnouncement[]) => void
  ) {
    const q = query(collection(db, `clubs/${clubId}/announcements`));
    return onSnapshot(
      q,
      (snapshot) => {
        const result: TrainingAnnouncement[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          result.push({
            id: docSnap.id,
            clubId: data.clubId,
            groupId: data.groupId,
            authorId: data.authorId,
            authorName: data.authorName,
            message: data.message,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            isPinned: data.isPinned ?? false,
          });
        });
        // Sortieren absteigend nach Datum
        result.sort((a, b) => {
          const t1 = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const t2 = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          return t2 - t1; // Neueste zuerst
        });
        callback(result);
      },
      (error) => {
        console.error("Error listening to announcements:", error);
      }
    );
  }

  // === MEMBERS (realtime) ===
  static listenToMembers(
    clubId: string,
    callback: (members: Member[]) => void
  ) {
    const q = query(
      collection(db, "members"),
      where("clubIds", "array-contains", clubId)
    );
    return onSnapshot(q, (snapshot) => {
      const members: Member[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        members.push({
          id: docSnap.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          memberType: data.memberType,
          isAdmin: data.isAdmin ?? false,
          isTrainer: data.isTrainer ?? false,
          clubId: data.clubId,
          clubIds: data.clubIds || [data.clubId],
          customTargetPoints: data.customTargetPoints,
          profileImageUrl: data.profileImageUrl,
        });
      });
      members.sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      );
      callback(members);
    });
  }

  // === ACTIVITIES (write) ===
  static async addActivity(
    clubId: string,
    activity: Omit<Activity, "id">
  ): Promise<void> {
    await addDoc(collection(db, `clubs/${clubId}/activities`), activity);
  }

  static async updateActivity(
    clubId: string,
    activityId: string,
    updates: Partial<Omit<Activity, "id">>
  ): Promise<void> {
    await updateDoc(doc(db, `clubs/${clubId}/activities`, activityId), updates);
  }

  static async deleteActivity(
    clubId: string,
    activityId: string
  ): Promise<void> {
    await deleteDoc(doc(db, `clubs/${clubId}/activities`, activityId));
  }

  // === CLUB (write) ===
  static async updateClub(
    clubId: string,
    updates: Partial<Omit<Club, "id">>
  ): Promise<void> {
    await updateDoc(doc(db, "clubs", clubId), updates);
  }

  // === MEMBER (write) ===
  static async setMember(
    memberId: string,
    member: Omit<Member, "id">
  ): Promise<void> {
    await setDoc(doc(db, "members", memberId), member);
  }

  static async updateMember(
    memberId: string,
    updates: Partial<Omit<Member, "id">>
  ): Promise<void> {
    await setDoc(doc(db, "members", memberId), updates, { merge: true });
  }

  // === ENTRIES (write) ===

  /** Legt einen neuen Eintrag an (mit vorgegebener ID via setDoc). */
  static async addEntry(
    clubId: string,
    entryId: string,
    data: {
      memberId: string;
      date: Date;
      notes: string;
      points: number;
      status: string;
      activityName: string;
      activityCategory: string;
      rejectionReason?: string;
    }
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      memberId:         data.memberId,
      date:             Timestamp.fromDate(data.date),
      notes:            data.notes,
      points:           data.points,
      status:           data.status,
      activityName:     data.activityName,
      activityCategory: data.activityCategory,
    };
    if (data.rejectionReason !== undefined) {
      payload.rejectionReason = data.rejectionReason;
    }
    await setDoc(doc(db, `clubs/${clubId}/entries`, entryId), payload);
  }

  static async updateEntry(
    clubId: string,
    entry: Entry
  ): Promise<void> {
    const docRef = doc(db, `clubs/${clubId}/entries`, entry.id);
    await updateDoc(docRef, {
      activityName: entry.activityName,
      activityCategory: entry.activityCategory,
      points: entry.points,
      status: entry.status,
      notes: entry.notes,
      rejectionReason: entry.rejectionReason ?? "",
      date: entry.date instanceof Date ? Timestamp.fromDate(entry.date) : entry.date,
    });
  }

  static async deleteEntry(
    clubId: string,
    entryId: string
  ): Promise<void> {
    await deleteDoc(doc(db, `clubs/${clubId}/entries`, entryId));
  }

  // === ANNOUNCEMENTS (write) ===
  static async addAnnouncement(
    clubId: string,
    announcement: Omit<TrainingAnnouncement, "id" | "createdAt" | "clubId">
  ): Promise<void> {
    const payload = {
      ...announcement,
      clubId,
      createdAt: Timestamp.now(),
    };
    await addDoc(collection(db, `clubs/${clubId}/announcements`), payload);
  }

  static async updateAnnouncement(
    clubId: string,
    announcementId: string,
    updates: Partial<Omit<TrainingAnnouncement, "id" | "clubId">>
  ): Promise<void> {
    const updatesWithDate: any = { ...updates };
    if (updates.createdAt && updates.createdAt instanceof Date) {
        updatesWithDate.createdAt = Timestamp.fromDate(updates.createdAt);
    }
    await updateDoc(doc(db, `clubs/${clubId}/announcements`, announcementId), updatesWithDate);
  }

  static async deleteAnnouncement(
    clubId: string,
    announcementId: string
  ): Promise<void> {
    await deleteDoc(doc(db, `clubs/${clubId}/announcements`, announcementId));
  }
}
