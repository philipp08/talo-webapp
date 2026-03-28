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
