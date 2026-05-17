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

export interface DuelGroupConfig {
  id: string;
  name: string;
  mappedGroupIds: string[];
}

export interface Duel {
  id: string;
  title: string;
  startDate: any;
  endDate: any;
  isActive: boolean;
  duelGroups: DuelGroupConfig[];
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
  sportType?: string;
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

export interface ClaimedSlot {
  memberId: string;
  memberName: string;
  claimedAt?: string;
}

export interface Shift {
  id: string;
  title: string;
  event: string;
  date: string;
  time: string;
  points: number;
  claimedById: string | null;
  claimedByName: string | null;
  slotsRequired?: number;
  claimedSlots?: ClaimedSlot[];
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
  dayOfWeek: number; // 1=Monday … 7=Sunday
  time: string; // "HH:mm"
}

export interface TrainingGroup {
  id: string;
  name: string;
  parentGroupId?: string; // optional: creates subgroup hierarchy
  memberIds: string[]; // member IDs belonging to this group
  schedule: TrainingScheduleEntry[]; // embedded recurring schedule
  colorHex: string; // UI accent color
  trainerId?: string; // Default trainer for this group
  trainerIds?: string[]; // Multiple default trainers (Pro feature)
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
  excludedMemberIds?: string[]; // IDs of members explicitly excluded/deleted from this session
  // Extra session (one-off training not part of the recurring schedule)
  isExtra?: boolean;
  extraTime?: string; // "HH:mm" — only set when isExtra is true
  // For regular days: which scheduled times are cancelled (Termine ausfallen)
  cancelledTimes?: string[];
  // Optional trainer note attached to this session
  note?: string;
  // Trainer assignment
  trainerId?: string;
  trainerName?: string;
  trainerIds?: string[]; // Multiple override trainers
  isTrainerAbsent?: boolean;
  absentTrainerIds?: string[];
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

export type PlanKey = "starter" | "club" | "pro";

export interface PlanFeatures {
  key: PlanKey;
  name: string;
  price: string;
  period?: string;
  priceMonthly?: string;
  priceYearly?: string;
  desc: string;
  features: string[];
  maxMembers: number;
  maxActivities: number;
  canExportCsv: boolean;
  canExportPdf: boolean;
  hasGroups: boolean;
  hasGroupLeaderboards: boolean;
  hasSelfServiceShifts: boolean;
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
  hasMultiTrainer: boolean;
  popular?: boolean;
}

const PLAN_FEATURES: Record<PlanKey, PlanFeatures> = {
  starter: {
    key: "starter",
    name: "Starter",
    price: "0€",
    period: "/ Jahr",
    priceMonthly: "0€",
    priceYearly: "0€",
    desc: "Für kleine TT-Abteilungen zum Schnuppern.",
    features: [
      "Bis zu 20 Mitglieder",
      "Bis zu 5 Tätigkeiten (Katalog)",
      "Punkte & Tätigkeiten erfassen",
      "Genehmigungsworkflow (Admins/Trainer)",
      "Basis-Rangliste (alle Mitglieder)",
      "Standard-Mitgliedertypen (Aktiv, Passiv, etc.)",
      "WhatsApp-Share für Einsatzpläne",
      "Sportart-spezifische Emojis 🏓",
      "Saison nach Kalenderjahr / Vereinssaison / Schuljahr",
      "Nur Lese-Zugriff bei Limit-Überschreitung",
    ],
    maxMembers: 20,
    maxActivities: 5,
    canExportCsv: false,
    canExportPdf: false,
    hasGroups: false,
    hasGroupLeaderboards: false,
    hasSelfServiceShifts: false,
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
    hasMultiTrainer: false,
  },
  club: {
    key: "club",
    name: "Club",
    price: "79€",
    period: "/ Jahr",
    priceMonthly: "9€",
    priceYearly: "79€",
    desc: "Für aktive TT-Vereine mit Ligabetrieb.",
    features: [
      "Bis zu 120 Mitglieder",
      "Unbegrenzte Tätigkeiten im Katalog",
      "Trainings-Anmeldung & RSVP (Zusagen/Absagen)",
      "Gruppen, Mannschaften & Gruppenranglisten",
      "Eigene Mitgliedertypen (z. B. Fördermitglied)",
      "Individuelle Punktefaktoren pro Mitgliedstyp",
      "Eigene Saisonzeiträume (tagesgenau)",
      "CSV-Export für alle Daten",
      "PDF-Export & Saisonberichte",
      "Individuelles Vereinslogo",
      "Erweiterte Filter & Statistiken",
      "Standard E-Mail-Support",
      "Alles aus dem Starter-Plan",
    ],
    maxMembers: 120,
    maxActivities: 999,
    canExportCsv: true,
    canExportPdf: true,
    hasGroups: true,
    hasGroupLeaderboards: true,
    hasSelfServiceShifts: false,
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
    hasMultiTrainer: false,
    popular: true,
  },
  pro: {
    key: "pro",
    name: "Pro",
    price: "159€",
    period: "/ Jahr",
    priceMonthly: "19€",
    priceYearly: "159€",
    desc: "Für Großvereine mit mehreren Mannschaften.",
    features: [
      "Bis zu 300 Mitglieder",
      "Volles App-Branding (Vereinsfarben anpassen)",
      "Schicht-Börse: Mitglieder buchen selbst",
      "Multi-Trainer Support (2. & 3. Trainer)",
      "Erweiterte Rollen für Funktionäre",
      "Erweiterte Admin-Ansichten & Analysen",
      "Datenimport-Service (Excel/CSV-Migration)",
      "Persönliches Onboarding-Gespräch",
      "Priorisierter E-Mail & Chat Support",
      "Alles aus dem Club-Plan",
    ],
    maxMembers: 300,
    maxActivities: 999,
    canExportCsv: true,
    canExportPdf: true,
    hasGroups: true,
    hasGroupLeaderboards: true,
    hasSelfServiceShifts: true,
    hasAdvancedStats: true,
    hasAdvancedFilters: true,
    hasAdvancedRoles: true,
    hasClubLogo: true,
    hasClubColors: true,
    hasPrioritySupport: true,
    hasAdvancedAdmin: true,
    hasDataImportSupport: true,
    hasPersonalOnboarding: true,
    hasCustomFeatures: false,
    hasCustomMemberTypes: true,
    hasCustomSeason: true,
    hasTrainingRSVP: true,
    hasMultiTrainer: true,
  },
};

export const PLAN_TIERS = [
  PLAN_FEATURES.starter,
  PLAN_FEATURES.club,
  PLAN_FEATURES.pro,
] as const;

/**
 * Maps any stored plan string to a current PlanKey.
 * Handles legacy keys: "free" → "starter", "verein" → "club".
 */
export const getPlanKey = (plan?: string): PlanKey => {
  const p = (plan || "").toLowerCase();
  if (p === "pro") return "pro";
  if (p === "club" || p === "verein") return "club";
  return "starter";
};

export const getPlanFeatures = (plan?: string): PlanFeatures => {
  return PLAN_FEATURES[getPlanKey(plan)];
};

export const isLicenseExpired = (club: Club): boolean => {
  if (!club.licenseExpiresAt) return false;
  const expiry =
    club.licenseExpiresAt instanceof Date
      ? club.licenseExpiresAt
      : typeof (club.licenseExpiresAt as any).toDate === "function"
      ? (club.licenseExpiresAt as any).toDate()
      : new Date(club.licenseExpiresAt as any);
  return expiry < new Date();
};

export const getEffectivePlanFeatures = (club: Club): PlanFeatures => {
  if (isLicenseExpired(club)) return PLAN_FEATURES.starter;
  return getPlanFeatures(club.plan);
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

export const SPORT_TYPE_EMOJIS: Record<string, string> = {
  tischtennis: "🏓",
  general: "🏆",
  fussball: "⚽",
  tennis: "🎾",
  basketball: "🏀",
  volleyball: "🏐",
  handball: "🤾",
  turnen: "🤸",
  schwimmen: "🏊",
  leichtathletik: "🏃",
};

export const SPORT_TYPE_LABELS: Record<string, string> = {
  tischtennis: "Tischtennis",
  general: "Sonstiger Verein",
  fussball: "Fußball",
  tennis: "Tennis",
  basketball: "Basketball",
  volleyball: "Volleyball",
  handball: "Handball",
  turnen: "Turnen & Gymnastik",
  schwimmen: "Schwimmen",
  leichtathletik: "Leichtathletik",
};
