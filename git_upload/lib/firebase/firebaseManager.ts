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
  arrayUnion,
  arrayRemove,
  deleteField,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import {
  Club,
  Member,
  Entry,
  Activity,
  SeasonType,
  Training,
  TrainingSchedule,
  TrainingAnnouncement,
  ClubMembership,
  ClubGroup,
  getEffectiveMemberForClub,
  normalizeClubIds,
} from "./models";

const buildClub = (id: string, data: DocumentData): Club => ({
  id,
  name: data.name,
  requiredPoints: data.requiredPoints,
  compensationPerMissingPoint: data.compensationPerMissingPoint,
  seasonType: data.seasonType as SeasonType,
  approvalRequired: data.approvalRequired,
  plan: data.plan,
  logoUrl: data.logoUrl,
  brandColor: data.brandColor,
  licenseStatus: data.licenseStatus,
  licenseExpiresAt: data.licenseExpiresAt,
});

const buildMember = (
  id: string,
  data: DocumentData,
  activeClubId?: string
): Member => {
  const clubIds = normalizeClubIds(data.clubIds, data.clubId);
  const member: Member = {
    id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    memberType: data.memberType,
    isAdmin: data.isAdmin ?? false,
    isTrainer: data.isTrainer ?? false,
    clubId: data.clubId || clubIds[0] || "",
    clubIds,
    clubMemberships: data.clubMemberships ?? {},
    groupId: data.groupId,
    customTargetPoints: data.customTargetPoints,
    profileImageUrl: data.profileImageUrl,
  };

  return activeClubId ? getEffectiveMemberForClub(member, activeClubId) : member;
};

const cleanMembership = (membership: ClubMembership): ClubMembership =>
  Object.fromEntries(
    Object.entries(membership).filter(([, value]) => value !== undefined)
  ) as ClubMembership;

const mergeMemberSnapshots = (
  snapshots: QuerySnapshot<DocumentData>[],
  activeClubId: string
): Member[] => {
  const byId = new Map<string, Member>();

  snapshots.forEach((snapshot) => {
    snapshot.forEach((docSnap) => {
      byId.set(docSnap.id, buildMember(docSnap.id, docSnap.data(), activeClubId));
    });
  });

  return Array.from(byId.values()).sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  );
};

export class FirebaseManager {
  // === CLUBS ===
  static async createClub(club: Omit<Club, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "clubs"), club);
    return docRef.id;
  }

  static async getClub(clubId: string): Promise<Club | null> {
    try {
      const docRef = doc(db, "clubs", clubId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return buildClub(docSnap.id, docSnap.data());
      }
      return null;
    } catch (error) {
      console.error("Error fetching club:", error);
      return null;
    }
  }

  static async getClubs(clubIds: string[]): Promise<Club[]> {
    const uniqueClubIds = normalizeClubIds(clubIds);
    const clubs = await Promise.all(uniqueClubIds.map((clubId) => this.getClub(clubId)));
    return clubs.filter((club): club is Club => club !== null);
  }

  // === MEMBERS ===
  static async getMemberByEmail(email: string): Promise<Member | null> {
    const trimmedEmail = email.trim();
    const normalizedEmail = trimmedEmail.toLowerCase();
    const emailsToCheck = Array.from(new Set([trimmedEmail, normalizedEmail]));

    const snapshots = await Promise.all(
      emailsToCheck.map((emailToCheck) =>
        getDocs(query(collection(db, "members"), where("email", "==", emailToCheck)))
      )
    );
    const docData = snapshots.flatMap((snapshot) => snapshot.docs)[0];
    if (!docData) return null;
    return buildMember(docData.id, docData.data());
  }

  static async getMember(uid: string, activeClubId?: string): Promise<Member | null> {
    try {
      const docRef = doc(db, "members", uid); // Die Collection heißt "members" in iOS
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return buildMember(docSnap.id, docSnap.data(), activeClubId);
      }
      return null;
    } catch (error) {
      console.error("Error fetching member:", error);
      return null;
    }
  }

  static async getMembersForClub(clubId: string): Promise<Member[]> {
    try {
      const clubIdsQuery = query(
        collection(db, "members"),
        where("clubIds", "array-contains", clubId)
      );
      const legacyClubIdQuery = query(
        collection(db, "members"),
        where("clubId", "==", clubId)
      );
      const snapshots = await Promise.all([
        getDocs(clubIdsQuery),
        getDocs(legacyClubIdQuery),
      ]);
      return mergeMemberSnapshots(snapshots, clubId);
    } catch (error) {
      console.error("Error fetching club members:", error);
      return [];
    }
  }

  // === GROUPS ===
  static listenToGroups(
    clubId: string,
    callback: (groups: ClubGroup[]) => void
  ) {
    const q = query(collection(db, `clubs/${clubId}/groups`));
    return onSnapshot(
      q,
      (snapshot) => {
        const groups: ClubGroup[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          groups.push({
            id: docSnap.id,
            name: data.name,
            description: data.description,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          });
        });
        groups.sort((a, b) => a.name.localeCompare(b.name));
        callback(groups);
      },
      (error) => {
        console.error("Error listening to groups:", error);
      }
    );
  }

  static async addGroup(
    clubId: string,
    group: Omit<ClubGroup, "id" | "createdAt">
  ): Promise<void> {
    await addDoc(collection(db, `clubs/${clubId}/groups`), {
      name: group.name,
      ...(group.description ? { description: group.description } : {}),
      createdAt: Timestamp.now(),
    });
  }

  static async updateGroup(
    clubId: string,
    groupId: string,
    updates: Partial<Omit<ClubGroup, "id" | "createdAt">>
  ): Promise<void> {
    await updateDoc(doc(db, `clubs/${clubId}/groups`, groupId), updates);
  }

  static async deleteGroup(clubId: string, groupId: string): Promise<void> {
    const [clubIdsSnapshot, legacyClubSnapshot] = await Promise.all([
      getDocs(query(collection(db, "members"), where("clubIds", "array-contains", clubId))),
      getDocs(query(collection(db, "members"), where("clubId", "==", clubId))),
    ]);

    const seen = new Set<string>();
    const cleanupWrites: Promise<void>[] = [];
    [...clubIdsSnapshot.docs, ...legacyClubSnapshot.docs].forEach((docSnap) => {
      if (seen.has(docSnap.id)) return;
      seen.add(docSnap.id);

      const data = docSnap.data();
      const membership = data.clubMemberships?.[clubId];
      const updates: Record<string, unknown> = {};

      if (membership?.groupId === groupId) {
        updates[`clubMemberships.${clubId}.groupId`] = deleteField();
      }
      if (data.clubId === clubId && data.groupId === groupId) {
        updates.groupId = deleteField();
      }

      if (Object.keys(updates).length > 0) {
        cleanupWrites.push(updateDoc(docSnap.ref, updates));
      }
    });

    await Promise.all(cleanupWrites);
    await deleteDoc(doc(db, `clubs/${clubId}/groups`, groupId));
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
            groupId: data.groupId,
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
    const updates: Record<string, unknown> = { status: newStatus };
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
    );
  }

  // === TRAININGS ===
  static listenToTrainings(
    clubId: string,
    callback: (trainings: Training[]) => void
  ) {
    const q = query(collection(db, `clubs/${clubId}/trainings`));
    return onSnapshot(
      q,
      (snapshot) => {
        const result: Training[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          result.push({
            id: docSnap.id,
            clubId: data.clubId,
            groupId: data.groupId,
            title: data.title,
            description: data.description,
            date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
            location: data.location,
            attendeeIds: data.attendeeIds || [],
            absenteeIds: data.absenteeIds || [],
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            authorId: data.authorId,
          });
        });
        // Sortieren aufsteigend nach Datum (nächste Trainings zuerst)
        result.sort((a, b) => {
          const t1 = a.date instanceof Date ? a.date.getTime() : 0;
          const t2 = b.date instanceof Date ? b.date.getTime() : 0;
          return t1 - t2; 
        });
        callback(result);
      },
      (error) => {
        console.error("Error listening to trainings:", error);
      }
    );
  }

  // === TRAINING SCHEDULES ===
  static listenToTrainingSchedules(
    clubId: string,
    callback: (schedules: TrainingSchedule[]) => void
  ) {
    const q = query(collection(db, `clubs/${clubId}/trainingSchedules`));
    return onSnapshot(
      q,
      (snapshot) => {
        const result: TrainingSchedule[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          result.push({
            id: docSnap.id,
            clubId: data.clubId,
            groupId: data.groupId,
            title: data.title,
            description: data.description,
            weekday: data.weekday,
            time: data.time,
            location: data.location,
            isActive: data.isActive ?? true,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          });
        });
        result.sort((a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time));
        callback(result);
      },
      (error) => {
        console.error("Error listening to training schedules:", error);
      }
    );
  }

  // === MEMBERS (realtime) ===
  static listenToMembers(
    clubId: string,
    callback: (members: Member[]) => void
  ) {
    const clubIdsQuery = query(
      collection(db, "members"),
      where("clubIds", "array-contains", clubId)
    );
    const legacyClubIdQuery = query(
      collection(db, "members"),
      where("clubId", "==", clubId)
    );
    const snapshots: Array<QuerySnapshot<DocumentData> | null> = [null, null];
    const emit = () => {
      if (!snapshots[0] || !snapshots[1]) return;
      callback(mergeMemberSnapshots([snapshots[0], snapshots[1]], clubId));
    };

    const unsubscribeClubIds = onSnapshot(clubIdsQuery, (snapshot) => {
      snapshots[0] = snapshot;
      emit();
    });
    const unsubscribeLegacyClubId = onSnapshot(legacyClubIdQuery, (snapshot) => {
      snapshots[1] = snapshot;
      emit();
    });

    return () => {
      unsubscribeClubIds();
      unsubscribeLegacyClubId();
    };
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

  static async addMemberToClub(
    member: Member,
    clubId: string,
    membership: ClubMembership
  ): Promise<void> {
    const clubIds = normalizeClubIds([...member.clubIds, clubId], member.clubId);
    const updates: Record<string, unknown> = {
      clubIds: arrayUnion(...clubIds),
      [`clubMemberships.${clubId}`]: cleanMembership(membership),
    };

    if (!member.clubId) {
      updates.clubId = clubId;
    }

    await updateDoc(doc(db, "members", member.id), updates);
  }

  static async updateMemberMembership(
    memberId: string,
    clubId: string,
    membership: ClubMembership
  ): Promise<void> {
    await updateDoc(doc(db, "members", memberId), {
      [`clubMemberships.${clubId}`]: cleanMembership(membership),
    });
  }

  static async removeMemberFromClub(member: Member, clubId: string): Promise<void> {
    const remainingClubIds = normalizeClubIds(member.clubIds, member.clubId).filter(
      (id) => id !== clubId
    );
    const updates: Record<string, unknown> = {
      clubIds: remainingClubIds,
      [`clubMemberships.${clubId}`]: deleteField(),
    };

    if (!remainingClubIds.includes(member.clubId)) {
      updates.clubId = remainingClubIds[0] ?? "";
    }

    await updateDoc(doc(db, "members", member.id), updates);
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
      groupId?: string;
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
    if (data.groupId !== undefined) {
      payload.groupId = data.groupId;
    }
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
      groupId: entry.groupId ?? "",
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
    const updatesWithDate: Record<string, unknown> = { ...updates };
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

  // === TRAININGS (write) ===
  static async addTraining(
    clubId: string,
    training: Omit<Training, "id" | "createdAt" | "clubId" | "attendeeIds" | "absenteeIds">
  ): Promise<void> {
    const payload = {
      ...training,
      clubId,
      attendeeIds: [],
      absenteeIds: [],
      date: training.date instanceof Date ? Timestamp.fromDate(training.date) : training.date,
      createdAt: Timestamp.now(),
    };
    await addDoc(collection(db, `clubs/${clubId}/trainings`), payload);
  }

  static async updateTraining(
    clubId: string,
    trainingId: string,
    updates: Partial<Omit<Training, "id" | "clubId">>
  ): Promise<void> {
    const payload: any = { ...updates };
    if (updates.date && updates.date instanceof Date) {
      payload.date = Timestamp.fromDate(updates.date);
    }
    await updateDoc(doc(db, `clubs/${clubId}/trainings`, trainingId), payload);
  }

  static async deleteTraining(
    clubId: string,
    trainingId: string
  ): Promise<void> {
    await deleteDoc(doc(db, `clubs/${clubId}/trainings`, trainingId));
  }

  static async rsvpTraining(
    clubId: string,
    trainingId: string,
    memberId: string,
    status: "attend" | "decline"
  ): Promise<void> {
    const trainingRef = doc(db, `clubs/${clubId}/trainings`, trainingId);
    
    if (status === "attend") {
      await updateDoc(trainingRef, {
        attendeeIds: arrayUnion(memberId),
        absenteeIds: arrayRemove(memberId)
      });
    } else {
      await updateDoc(trainingRef, {
        absenteeIds: arrayUnion(memberId),
        attendeeIds: arrayRemove(memberId)
      });
    }
  }

  // === TRAINING SCHEDULES (write) ===
  static async addTrainingSchedule(
    clubId: string,
    schedule: Omit<TrainingSchedule, "id" | "createdAt" | "clubId">
  ): Promise<void> {
    await addDoc(collection(db, `clubs/${clubId}/trainingSchedules`), {
      ...schedule,
      clubId,
      createdAt: Timestamp.now(),
      isActive: true,
    });
  }

  static async updateTrainingSchedule(
    clubId: string,
    scheduleId: string,
    updates: Partial<Omit<TrainingSchedule, "id" | "clubId">>
  ): Promise<void> {
    await updateDoc(doc(db, `clubs/${clubId}/trainingSchedules`, scheduleId), updates);
  }

  static async deleteTrainingSchedule(
    clubId: string,
    scheduleId: string
  ): Promise<void> {
    await deleteDoc(doc(db, `clubs/${clubId}/trainingSchedules`, scheduleId));
  }
}
