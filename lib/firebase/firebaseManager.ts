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
  TrainingGroup,
  TrainingSession,
  TrainingAnnouncement,
  ClubMembership,
  ClubGroup,
  getEffectiveMemberForClub,
  normalizeClubIds,
} from "./models";

const toDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

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
            trainingGroupId: data.trainingGroupId,
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
            trainingGroupId: data.trainingGroupId,
            scheduleId: data.scheduleId,
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
            trainingGroupId: data.trainingGroupId,
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

  // === TRAINING GROUPS ===
  static listenToTrainingGroups(
    clubId: string,
    callback: (groups: TrainingGroup[]) => void
  ) {
    const q = query(collection(db, `clubs/${clubId}/trainingGroups`));
    return onSnapshot(
      q,
      (snapshot) => {
        const groups: TrainingGroup[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          groups.push({
            id: docSnap.id,
            name: data.name,
            parentGroupId: data.parentGroupId ?? undefined,
            memberIds: data.memberIds ?? [],
            schedule: (data.schedule ?? []).map((e: Record<string, unknown>) => ({
              id: (e.id as string) || crypto.randomUUID(),
              dayOfWeek: e.dayOfWeek as number,
              time: e.time as string,
            })),
            colorHex: (data.colorHex as string) || "#007AFF",
            trainerId: data.trainerId,
            trainerIds: data.trainerIds || [],
            clubId: data.clubId,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          });
        });
        groups.sort((a, b) => a.name.localeCompare(b.name));
        callback(groups);
      },
      (error) => {
        console.error("Error listening to training groups:", error);
      }
    );
  }

  // === TRAINING SESSIONS ===
  static listenToTrainingSessions(
    clubId: string,
    callback: (sessions: TrainingSession[]) => void
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const future = new Date(today);
    future.setDate(future.getDate() + 7);
    const todayStr = toDateString(today);
    const futureStr = toDateString(future);

    const q = query(
      collection(db, `clubs/${clubId}/trainingSessions`),
      where("dateString", ">=", todayStr),
      where("dateString", "<=", futureStr)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const sessions: TrainingSession[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          sessions.push({
            id: docSnap.id,
            groupId: data.groupId,
            dateString: data.dateString,
            date: data.date instanceof Timestamp ? data.date.toDate() : new Date(),
            absentMemberIds: data.absentMemberIds ?? [],
            absenceReasons: data.absenceReasons ?? {},
            isExtra: data.isExtra ?? false,
            extraTime: data.extraTime,
            note: data.note,
            cancelledTimes: data.cancelledTimes ?? [],
            trainerId: data.trainerId,
            trainerName: data.trainerName,
            trainerIds: data.trainerIds ?? [],
            isTrainerAbsent: data.isTrainerAbsent ?? false,
            absentTrainerIds: data.absentTrainerIds ?? [],
          });
        });
        callback(sessions);
      },
      (error) => {
        console.error("Error listening to training sessions:", error);
      }
    );
  }

  static async setAbsence(
    clubId: string,
    groupId: string,
    date: Date,
    memberId: string,
    absent: boolean,
    reason?: string
  ): Promise<void> {
    const dateString = toDateString(date);
    const sessionId = `${groupId}_${dateString}`;
    const sessionRef = doc(db, `clubs/${clubId}/trainingSessions`, sessionId);

    if (absent) {
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) {
        await setDoc(sessionRef, {
          groupId,
          dateString,
          date: Timestamp.fromDate(date),
          absentMemberIds: [memberId],
          absenceReasons: reason ? { [memberId]: reason } : {},
        });
      } else {
        const updates: Record<string, unknown> = {
          absentMemberIds: arrayUnion(memberId),
        };
        if (reason) updates[`absenceReasons.${memberId}`] = reason;
        await updateDoc(sessionRef, updates);
      }
    } else {
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) return;
      await updateDoc(sessionRef, {
        absentMemberIds: arrayRemove(memberId),
        [`absenceReasons.${memberId}`]: deleteField(),
      });
    }
  }

  // Add an extra training session (Zusatztermin) outside the recurring schedule
  static async addExtraSession(
    clubId: string,
    groupId: string,
    date: Date,
    time: string,
    note?: string
  ): Promise<void> {
    const dateString = toDateString(date);
    const timeKey = time.replace(":", "");
    const sessionId = `${groupId}_${dateString}_extra_${timeKey}`;
    const sessionRef = doc(db, `clubs/${clubId}/trainingSessions`, sessionId);
    const payload: Record<string, unknown> = {
      groupId,
      dateString,
      date: Timestamp.fromDate(date),
      absentMemberIds: [],
      absenceReasons: {},
      isExtra: true,
      extraTime: time,
    };
    if (note && note.trim()) payload.note = note.trim();
    await setDoc(sessionRef, payload);
  }

  static async setSessionTrainer(
    clubId: string,
    groupId: string,
    date: Date,
    trainerId: string,
    trainerName: string
  ): Promise<void> {
    const dateString = toDateString(date);
    const sessionId = `${groupId}_${dateString}`;
    const sessionRef = doc(db, `clubs/${clubId}/trainingSessions`, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      await setDoc(sessionRef, {
        groupId,
        dateString,
        date: Timestamp.fromDate(date),
        absentMemberIds: [],
        absenceReasons: {},
        trainerId,
        trainerName,
      });
    } else {
      await updateDoc(sessionRef, { trainerId, trainerName });
    }
  }

  static async setSessionTrainers(
    clubId: string,
    groupId: string,
    date: Date,
    trainerIds: string[]
  ): Promise<void> {
    const dateString = toDateString(date);
    const sessionId = `${groupId}_${dateString}`;
    const sessionRef = doc(db, `clubs/${clubId}/trainingSessions`, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      await setDoc(sessionRef, {
        groupId,
        dateString,
        date: Timestamp.fromDate(date),
        absentMemberIds: [],
        absenceReasons: {},
        trainerIds,
      });
    } else {
      await updateDoc(sessionRef, { trainerIds });
    }
  }

  static async toggleIndividualTrainerAbsence(
    clubId: string,
    groupId: string,
    date: Date,
    trainerId: string
  ): Promise<void> {
    const dateString = toDateString(date);
    const sessionId = `${groupId}_${dateString}`;
    const sessionRef = doc(db, `clubs/${clubId}/trainingSessions`, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      await setDoc(sessionRef, {
        groupId,
        dateString,
        date: Timestamp.fromDate(date),
        absentMemberIds: [],
        absenceReasons: {},
        absentTrainerIds: [trainerId],
      });
    } else {
      const data = sessionSnap.data();
      const current = data.absentTrainerIds || [];
      const updated = current.includes(trainerId)
        ? current.filter((id: string) => id !== trainerId)
        : [...current, trainerId];
      await updateDoc(sessionRef, { absentTrainerIds: updated });
    }
  }

  static async toggleTrainerAbsence(
    clubId: string,
    groupId: string,
    date: Date
  ): Promise<void> {
    const dateString = toDateString(date);
    const sessionId = `${groupId}_${dateString}`;
    const sessionRef = doc(db, `clubs/${clubId}/trainingSessions`, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      await setDoc(sessionRef, {
        groupId,
        dateString,
        date: Timestamp.fromDate(date),
        absentMemberIds: [],
        absenceReasons: {},
        isTrainerAbsent: true,
      });
    } else {
      const current = sessionSnap.data().isTrainerAbsent ?? false;
      await updateDoc(sessionRef, { isTrainerAbsent: !current });
    }
  }

  // Delete any session document (used for removing extras)
  static async deleteSession(clubId: string, sessionId: string): Promise<void> {
    await deleteDoc(doc(db, `clubs/${clubId}/trainingSessions`, sessionId));
  }

  // Toggle a regular schedule time as cancelled for a specific date
  static async toggleCancellation(
    clubId: string,
    groupId: string,
    date: Date,
    time: string
  ): Promise<void> {
    const dateString = toDateString(date);
    const sessionId = `${groupId}_${dateString}`;
    const sessionRef = doc(db, `clubs/${clubId}/trainingSessions`, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      await setDoc(sessionRef, {
        groupId,
        dateString,
        date: Timestamp.fromDate(date),
        absentMemberIds: [],
        absenceReasons: {},
        cancelledTimes: [time],
      });
      return;
    }

    const current = (sessionSnap.data().cancelledTimes ?? []) as string[];
    if (current.includes(time)) {
      await updateDoc(sessionRef, { cancelledTimes: arrayRemove(time) });
    } else {
      await updateDoc(sessionRef, { cancelledTimes: arrayUnion(time) });
    }
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

  static async removeMemberFromClub(
    member: Member,
    clubId: string
  ): Promise<{ fullyDeleted: boolean }> {
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

    // Note: We deliberately DO NOT delete the members document when 0 clubs remain.
    // If we delete it, their Firebase Auth account still exists (we can't delete it without Admin SDK),
    // and if they are added again, it throws an unrecoverable 'EMAIL_EXISTS' error because
    // we lost their UID mapping. Leaving the document effectively "orphans" them safely.
    return { fullyDeleted: remainingClubIds.length === 0 };
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

  // === TRAINING GROUPS (write) ===
  static async addTrainingGroup(
    clubId: string,
    group: Omit<TrainingGroup, "id" | "createdAt" | "clubId">
  ): Promise<void> {
    await addDoc(collection(db, `clubs/${clubId}/trainingGroups`), {
      name: group.name,
      parentGroupId: group.parentGroupId ?? null,
      memberIds: group.memberIds ?? [],
      schedule: group.schedule ?? [],
      colorHex: group.colorHex ?? "#007AFF",
      trainerId: group.trainerId ?? null,
      trainerIds: group.trainerIds ?? [],
      clubId,
      createdAt: Timestamp.now(),
    });
  }

  static async updateTrainingGroup(
    clubId: string,
    groupId: string,
    updates: Partial<Omit<TrainingGroup, "id" | "clubId">>
  ): Promise<void> {
    await updateDoc(doc(db, `clubs/${clubId}/trainingGroups`, groupId), updates);
  }

  static async deleteTrainingGroup(
    clubId: string,
    groupId: string
  ): Promise<void> {
    await deleteDoc(doc(db, `clubs/${clubId}/trainingGroups`, groupId));
  }
}
