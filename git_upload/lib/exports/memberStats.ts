import {
  Entry,
  EntryStatus,
  Member,
  MemberType,
  calculateTargetPoints,
} from "@/lib/firebase/models";

export const isExemptMember = (member: Member): boolean =>
  member.memberType === MemberType.Board ||
  member.memberType === MemberType.Youth;

export const approvedPointsForMember = (
  memberId: string,
  entries: Entry[]
): number =>
  entries
    .filter((e) => e.memberId === memberId && e.status === EntryStatus.Approved)
    .reduce((sum, e) => sum + e.points, 0);

export const missingPointsForMember = (
  member: Member,
  club: any,
  entries: Entry[]
): number => {
  if (isExemptMember(member)) return 0;
  const target = calculateTargetPoints(member, club);
  const approved = approvedPointsForMember(member.id, entries);
  return Math.max(0, target - approved);
};

export const compensationAmountForMember = (
  member: Member,
  club: any,
  compensationRate: number,
  entries: Entry[]
): number => {
  const missing = missingPointsForMember(member, club, entries);
  return missing * compensationRate;
};

export const memberStatusLabel = (
  member: Member,
  club: any,
  entries: Entry[]
): "Befreit" | "Erfüllt" | "Rückstand" => {
  if (isExemptMember(member)) return "Befreit";
  return missingPointsForMember(member, club, entries) === 0
    ? "Erfüllt"
    : "Rückstand";
};
