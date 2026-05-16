import { Timestamp } from "firebase/firestore";

export enum SeasonType {
  Calendar = "Kalenderjahr (Jan–Dez)",
  Club = "Vereinssaison (Jul–Jun)",
  School = "Schuljahr (Sep–Aug)",
}

export enum MemberType {
  Active = "Aktiv",
  Passive = "Passiv",
  Youth = "Jugend",
  Board = "Vorstand",
}

export enum ActivityCategory {
  A = "A",
  B = "B",
  C = "C",
  S = "S",
}

export enum EntryStatus {
  Pending = "Ausstehend",
  Approved = "Genehmigt",
  Rejected = "Abgelehnt",
}

export interface Club {
  id: string;
  name: string;
  requiredPoints: number;
  compensationPerMissingPoint: number;
  seasonType: SeasonType | string;
  approvalRequired: boolean;
  plan?: string;
  licenseStatus?: string;
  licenseExpiresAt?: Timestamp | Date | null;
}

export interface ClubMembership {
  memberType: MemberType | string;
  customTargetPoints?: number;
  isAdmin: boolean;
  isTrainer: boolean;
}

export interface Member {
  id: string; // Firebase Auth UID
  firstName: string;
  lastName: string;
  email: string;
  memberType: MemberType | string;
  customTargetPoints?: number;
  isAdmin: boolean;
  isTrainer: boolean;
  clubId: string;
  clubIds: string[];
  clubMemberships?: Record<string, ClubMembership>;
  profileImageUrl?: string;
}

export interface Activity {
  id: string;
  name: string;
  points: number;
  category: ActivityCategory | string;
  isDefault: boolean;
}

export interface Entry {
  id: string;
  memberId: string;
  date: Timestamp | Date; // Firebase Timestamp
  notes: string;
  points: number;
  status: EntryStatus | string;
  activityName: string;
  activityCategory: ActivityCategory | string;
  rejectionReason?: string;
  photoUrl?: string;
}

export interface TrainingAnnouncement {
  id: string;
  clubId: string;
  groupId?: string;
  authorId: string;
  authorName: string;
  message: string;
  createdAt: Timestamp | Date;
  isPinned: boolean;
}

// Helpers
export const PointFactors: Record<string, number> = {
  [MemberType.Active]: 1.0,
  [MemberType.Passive]: 0.3,
  [MemberType.Youth]: 0.0,
  [MemberType.Board]: 0.0,
};

export const getMemberFullName = (member: Member) =>
  `${member.firstName} ${member.lastName}`;

export const normalizeClubIds = (
  clubIds?: Array<string | null | undefined> | null,
  legacyClubId?: string | null
): string[] => {
  const result = new Set<string>();

  const add = (clubId?: string | null) => {
    const trimmed = clubId?.trim();
    if (trimmed) result.add(trimmed);
  };

  clubIds?.forEach(add);
  add(legacyClubId);

  return Array.from(result);
};

export const getMemberClubIds = (
  member: Pick<Member, "clubId" | "clubIds">
): string[] => normalizeClubIds(member.clubIds, member.clubId);

export const getEffectiveMemberForClub = (
  member: Member,
  clubId: string
): Member => {
  const membership = member.clubMemberships?.[clubId];

  if (!membership) {
    return { ...member, clubId };
  }

  return {
    ...member,
    clubId,
    memberType: membership.memberType,
    customTargetPoints: membership.customTargetPoints,
    isAdmin: membership.isAdmin === true,
    isTrainer: membership.isTrainer === true,
  };
};

export const calculateTargetPoints = (
  member: Member,
  clubDefaultPoints: number
): number => {
  if (
    member.memberType === MemberType.Board ||
    member.memberType === MemberType.Youth
  ) {
    return 0;
  }
  const base = member.customTargetPoints ?? clubDefaultPoints;
  const factor = PointFactors[member.memberType] ?? 1.0;
  return Number((base * factor).toFixed(1));
};

export const getPlanFeatures = (plan?: string) => {
  const p = (plan || "free").toLowerCase();
  
  if (p === "individual") {
    return { maxMembers: 99999, maxActivities: 999, canExportCsv: true, canExportPdf: true, hasGroups: true };
  }
  if (p === "pro") {
    return { maxMembers: 300, maxActivities: 999, canExportCsv: true, canExportPdf: true, hasGroups: true };
  }
  if (p === "club") {
    return { maxMembers: 150, maxActivities: 999, canExportCsv: true, canExportPdf: true, hasGroups: true };
  }
  if (p === "verein") {
    return { maxMembers: 75, maxActivities: 999, canExportCsv: true, canExportPdf: false, hasGroups: false };
  }
  // Default to Free
  return { maxMembers: 10, maxActivities: 3, canExportCsv: false, canExportPdf: false, hasGroups: false };
};
