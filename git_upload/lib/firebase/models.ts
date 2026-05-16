import { Timestamp } from "firebase/firestore";

export enum SeasonType {
  Calendar = "Kalenderjahr (Jan–Dez)",
  Club = "Vereinssaison (Jul–Jun)",
  School = "Schuljahr (Sep–Aug)",
  Custom = "Individueller Zeitraum",
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
  memberTypeFactors?: Record<string, number>;
  licenseStatus?: string;
  licenseExpiresAt?: Timestamp | Date | null;
  isTrial?: boolean;
  customMemberTypes?: CustomMemberType[];
  seasonStart?: Timestamp | Date | null;
  seasonEnd?: Timestamp | Date | null;
}

export interface ClubMembership {
  memberType: MemberType | string;
  customTargetPoints?: number;
  isAdmin: boolean;
  isTrainer: boolean;
  groupId?: string; // General Club Group (e.g. Abteilung)
  trainingGroupIds?: string[]; // Training-specific groups
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
  groupId?: string; // General Club Group
  trainingGroupIds?: string[]; // Training-specific groups
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

export interface Training {
  id: string;
  clubId: string;
  trainingGroupId?: string; // Link to TrainingGroup
  scheduleId?: string; 
  title: string;
  description?: string;
  date: Timestamp | Date;
  location?: string;
  attendeeIds: string[]; 
  absenteeIds: string[]; 
  createdAt: Timestamp | Date;
  authorId: string;
}

export interface TrainingSchedule {
  id: string;
  clubId: string;
  trainingGroupId?: string; 
  title: string;
  description?: string;
  weekday: number; 
  time: string; 
  location?: string;
  createdAt: Timestamp | Date;
  isActive: boolean;
}

export interface TrainingAnnouncement {
  id: string;
  clubId: string;
  trainingGroupId?: string;
  authorId: string;
  authorName: string;
  message: string;
  createdAt: Timestamp | Date;
  isPinned: boolean;
}

// Weekly recurring schedule entry embedded in a TrainingGroup
export interface TrainingScheduleEntry {
  id: string;
  dayOfWeek: number; // 1=Monday … 7=Sunday (iOS convention)
  time: string; // "HH:mm"
}

export interface TrainingGroup {
  id: string;
  name: string;
  parentGroupId?: string; // optional: creates subgroup hierarchy
  memberIds: string[]; // member IDs belonging to this group
  schedule: TrainingScheduleEntry[]; // embedded recurring schedule
  colorHex: string; // UI accent color
  // legacy compat
  clubId?: string;
  createdAt?: Timestamp | Date;
}

// A session document. Three kinds:
//   1. Regular-day record  — id "{groupId}_{yyyy-MM-dd}", absences + optional cancelledTimes[]
//   2. Extra (Zusatztermin)  — id "{groupId}_{yyyy-MM-dd}_extra_{HHMM}", isExtra=true
//   3. Cancellation-only    — kind 1 with cancelledTimes set, no absences yet
export interface TrainingSession {
  id: string;
  groupId: string;
  dateString: string; // "yyyy-MM-dd" for Firestore range queries
  date: Date;
  absentMemberIds: string[];
  absenceReasons: Record<string, string>; // memberId → reason string
  // Extra session (one-off training not part of the recurring schedule)
  isExtra?: boolean;
  extraTime?: string; // "HH:mm" — only set when isExtra is true
  // For regular days: which scheduled times are cancelled (Termine ausfallen)
  cancelledTimes?: string[];
  // Optional trainer note attached to this session
  note?: string;
}

export const TRAINING_GROUP_COLORS = [
  "#34C759", // Green
  "#007AFF", // Blue
  "#FF9500", // Orange
  "#FF2D55", // Red/Pink
  "#5856D6", // Purple
  "#00C7BE", // Teal
] as const;

export const ABSENCE_REASONS = [
  "Krank",
  "Urlaub",
  "Arbeit",
  "Verletzt",
  "Familie",
  "Sonstiges",
] as const;

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
    trainingGroupIds: membership.trainingGroupIds ?? member.trainingGroupIds ?? [],
  };
};

export const calculateTargetPoints = (
  member: Member,
  club?: Club | null
): number => {
  const base = member.customTargetPoints ?? (club?.requiredPoints ?? 15);
  if (!club) {
    if (member.memberType === MemberType.Board || member.memberType === MemberType.Youth) return 0;
    return Number((base * (PointFactors[member.memberType] ?? 1.0)).toFixed(1));
  }

  const planFeatures = getPlanFeatures(club.plan);
  
  if (planFeatures.hasCustomMemberTypes) {
    const overrideFactor = club.memberTypeFactors?.[member.memberType];
    if (overrideFactor !== undefined) {
      return Number((base * overrideFactor).toFixed(1));
    }
  }

  if (member.memberType === MemberType.Board || member.memberType === MemberType.Youth) {
    return 0;
  }
  const factor = PointFactors[member.memberType] ?? 1.0;
  return Number((base * factor).toFixed(1));
};

export type PlanKey = "free" | "verein" | "club" | "pro";

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
  hasCustomSeason: boolean;
  hasTrainingRSVP: boolean;
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
      "Bis zu 10 Mitglieder",
      "Bis zu 3 Tätigkeiten (Katalog)",
      "Punkte & Tätigkeiten erfassen",
      "Genehmigungsworkflow (Admins/Trainer)",
      "Basis-Ranglisten (Alle Mitglieder)",
      "Standard-Mitgliedertypen (Aktiv, Passiv, etc.)",
      "Nur Lese-Zugriff bei Limit-Überschreitung",
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
    hasCustomSeason: false,
    hasTrainingRSVP: false,
  },
  verein: {
    key: "verein",
    name: "Verein",
    price: "49€",
    period: "/ Jahr",
    desc: "Für aktive Vereine.",
    features: [
      "Bis zu 75 Mitglieder",
      "Unbegrenzte Tätigkeiten im Katalog",
      "Eigene Saisonzeiträume (Tagesgenau)",
      "CSV-Export für alle Daten",
      "Individuelles Vereinslogo",
      "Alles aus dem Free-Plan",
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
    hasCustomSeason: true,
    hasTrainingRSVP: false,
  },
  club: {
    key: "club",
    name: "Club",
    price: "99€",
    period: "/ Jahr",
    desc: "Professionelle Verwaltung.",
    features: [
      "Bis zu 150 Mitglieder",
      "Trainings-Anmeldung & RSVP (Zusagen/Absagen)",
      "Gruppenranglisten & Filter",
      "Eigene Mitgliedertypen (z. B. Fördermitglied)",
      "Individuelle Punktefaktoren pro Typ",
      "Umfangreicher PDF-Export & Jahresberichte",
      "Erweiterte Filter & Statistiken",
      "Alles aus dem Verein-Plan (Logo, CSV)",
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
    hasCustomSeason: true,
    hasTrainingRSVP: true,
    popular: true,
  },
  pro: {
    key: "pro",
    name: "Pro",
    price: "199€",
    period: "/ Jahr",
    desc: "Für große Vereine.",
    features: [
      "Bis zu 300 Mitglieder",
      "Volles App-Branding (Vereinsfarben anpassen)",
      "Trainings-Anmeldung & RSVP",
      "Mehrere Gruppen & Abteilungen",
      "Erweiterte Rollen für Funktionäre",
      "Detaillierte Auswertungen & Analysen",
      "Priorisierter E-Mail & Chat Support",
      "Erweiterte Admin-Ansichten",
      "Alles aus dem Club-Plan",
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
    hasCustomSeason: true,
    hasTrainingRSVP: true,
  },
};

export const PLAN_TIERS = [
  PLAN_FEATURES.free,
  PLAN_FEATURES.verein,
  PLAN_FEATURES.club,
  PLAN_FEATURES.pro,
] as const;

export const getPlanKey = (plan?: string): PlanKey => {
  const p = (plan || "free").toLowerCase();
  if (p === "verein" || p === "club" || p === "pro") return p;
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
