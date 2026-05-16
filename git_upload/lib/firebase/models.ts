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

export interface CustomMemberType {
  id: string;
  name: string;
  /** Fraction of requiredPoints this type must reach, e.g. 0.5 = 50 % */
  pointFactor: number;
}

export interface Club {
  id: string;
  name: string;
  requiredPoints: number;
  compensationPerMissingPoint: number;
  seasonType: SeasonType | string;
  approvalRequired: boolean;
  plan?: string;
  logoUrl?: string;
  brandColor?: string;
  accentColor?: string;
  licenseStatus?: string;
  licenseExpiresAt?: Timestamp | Date | null;
  customMemberTypes?: CustomMemberType[];
}

export interface ClubMembership {
  memberType: MemberType | string;
  customTargetPoints?: number;
  isAdmin: boolean;
  isTrainer: boolean;
  groupId?: string;
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
  groupId?: string;
  profileImageUrl?: string;
}

export interface ClubGroup {
  id: string;
  name: string;
  description?: string;
  createdAt?: Timestamp | Date;
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
  groupId?: string;
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
    groupId: membership.groupId ?? member.groupId,
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

export type PlanKey = "free" | "verein" | "club" | "pro" | "individual";

export interface PlanFeatures {
  key: PlanKey;
  name: string;
  price: string;
  period?: string;
  desc: string;
  features: string[];
  maxMembers: number;
  maxActivities: number;
  canExportCsv: boolean;
  canExportPdf: boolean;
  hasGroups: boolean;
  hasGroupLeaderboards: boolean;
  hasAdvancedStats: boolean;
  hasAdvancedFilters: boolean;
  hasAdvancedRoles: boolean;
  hasClubLogo: boolean;
  hasClubColors: boolean;
  hasPrioritySupport: boolean;
  hasAdvancedAdmin: boolean;
  hasDataImportSupport: boolean;
  hasPersonalOnboarding: boolean;
  hasCustomFeatures: boolean;
  hasCustomMemberTypes: boolean;
  popular?: boolean;
}

const PLAN_FEATURES: Record<PlanKey, PlanFeatures> = {
  free: {
    key: "free",
    name: "Free",
    price: "0€",
    period: "/ Jahr",
    desc: "Für den Einstieg.",
    features: [
      "Bis 10 Mitglieder",
      "Punkte erfassen",
      "Aktivitäten einreichen",
      "Genehmigungen",
      "Basis-Rangliste",
      "3 Tätigkeiten im Katalog",
    ],
    maxMembers: 10,
    maxActivities: 3,
    canExportCsv: false,
    canExportPdf: false,
    hasGroups: false,
    hasGroupLeaderboards: false,
    hasAdvancedStats: false,
    hasAdvancedFilters: false,
    hasAdvancedRoles: false,
    hasClubLogo: false,
    hasClubColors: false,
    hasPrioritySupport: false,
    hasAdvancedAdmin: false,
    hasDataImportSupport: false,
    hasPersonalOnboarding: false,
    hasCustomFeatures: false,
    hasCustomMemberTypes: false,
  },
  verein: {
    key: "verein",
    name: "Verein",
    price: "79€",
    period: "/ Jahr",
    desc: "Für kleine Vereine.",
    features: [
      "Bis 75 Mitglieder",
      "Unbegrenzte Tätigkeiten",
      "Punkteverwaltung",
      "Genehmigungsworkflow",
      "Mitgliederverwaltung",
      "Aktivitätsverlauf",
      "Excel/CSV-Export",
      "Vereinslogo",
    ],
    maxMembers: 75,
    maxActivities: 999,
    canExportCsv: true,
    canExportPdf: false,
    hasGroups: false,
    hasGroupLeaderboards: false,
    hasAdvancedStats: false,
    hasAdvancedFilters: false,
    hasAdvancedRoles: false,
    hasClubLogo: true,
    hasClubColors: false,
    hasPrioritySupport: false,
    hasAdvancedAdmin: false,
    hasDataImportSupport: false,
    hasPersonalOnboarding: false,
    hasCustomFeatures: false,
    hasCustomMemberTypes: false,
  },
  club: {
    key: "club",
    name: "Club",
    price: "129€",
    period: "/ Jahr",
    desc: "Beliebteste Wahl.",
    features: [
      "Bis 150 Mitglieder",
      "Alles aus Verein",
      "Gruppen & Teams",
      "Erweiterte Statistiken",
      "Gruppenranglisten",
      "PDF-Export",
      "Jahresauswertung",
      "Erweiterte Filter",
    ],
    maxMembers: 150,
    maxActivities: 999,
    canExportCsv: true,
    canExportPdf: true,
    hasGroups: true,
    hasGroupLeaderboards: true,
    hasAdvancedStats: true,
    hasAdvancedFilters: true,
    hasAdvancedRoles: false,
    hasClubLogo: true,
    hasClubColors: false,
    hasPrioritySupport: false,
    hasAdvancedAdmin: false,
    hasDataImportSupport: false,
    hasPersonalOnboarding: false,
    hasCustomFeatures: false,
    hasCustomMemberTypes: true,
    popular: true,
  },
  pro: {
    key: "pro",
    name: "Pro",
    price: "199€",
    period: "/ Jahr",
    desc: "Für große Vereine.",
    features: [
      "Bis 300 Mitglieder",
      "Alles aus Club",
      "Mehrere Gruppen/Abteilungen",
      "Erweiterte Rollen",
      "Detaillierte Auswertungen",
      "Vereinsfarben",
      "Priorisierter Support",
      "Erweiterte Admin-Funktionen",
    ],
    maxMembers: 300,
    maxActivities: 999,
    canExportCsv: true,
    canExportPdf: true,
    hasGroups: true,
    hasGroupLeaderboards: true,
    hasAdvancedStats: true,
    hasAdvancedFilters: true,
    hasAdvancedRoles: true,
    hasClubLogo: true,
    hasClubColors: true,
    hasPrioritySupport: true,
    hasAdvancedAdmin: true,
    hasDataImportSupport: false,
    hasPersonalOnboarding: false,
    hasCustomFeatures: false,
    hasCustomMemberTypes: true,
  },
  individual: {
    key: "individual",
    name: "Individuell",
    price: "Auf Anfrage",
    desc: "Für Verbände & große Organisationen.",
    features: [
      "Individuelle Mitgliederzahl",
      "Alle Funktionen aus Pro",
      "Individuelle Rollen/Rechte",
      "Datenimport-Support",
      "Persönliches Onboarding",
      "Persönlicher Ansprechpartner",
      "Individuelle Sonderfunktionen",
    ],
    maxMembers: 99999,
    maxActivities: 999,
    canExportCsv: true,
    canExportPdf: true,
    hasGroups: true,
    hasGroupLeaderboards: true,
    hasAdvancedStats: true,
    hasAdvancedFilters: true,
    hasAdvancedRoles: true,
    hasClubLogo: true,
    hasClubColors: true,
    hasPrioritySupport: true,
    hasAdvancedAdmin: true,
    hasDataImportSupport: true,
    hasPersonalOnboarding: true,
    hasCustomFeatures: true,
    hasCustomMemberTypes: true,
  },
};

export const PLAN_TIERS = [
  PLAN_FEATURES.free,
  PLAN_FEATURES.verein,
  PLAN_FEATURES.club,
  PLAN_FEATURES.pro,
  PLAN_FEATURES.individual,
] as const;

export const getPlanKey = (plan?: string): PlanKey => {
  const p = (plan || "free").toLowerCase();
  if (p === "individuell") return "individual";
  if (p === "verein" || p === "club" || p === "pro" || p === "individual") return p;
  return "free";
};

export const getPlanFeatures = (plan?: string): PlanFeatures => {
  return PLAN_FEATURES[getPlanKey(plan)];
};

/** Returns true when a hex color is light enough to need dark text on top of it. */
export const isLightColor = (hex?: string): boolean => {
  if (!hex) return false;
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
};
