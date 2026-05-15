import { Timestamp } from "firebase/firestore";
import {
  Club,
  Entry,
  Member,
  calculateTargetPoints,
  getMemberFullName,
} from "@/lib/firebase/models";
import {
  approvedPointsForMember,
  compensationAmountForMember,
  memberStatusLabel,
  missingPointsForMember,
} from "./memberStats";

const csvEscape = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const toDate = (d: Timestamp | Date): Date =>
  d instanceof Date ? d : (d as Timestamp).toDate();

const formatDate = (d: Date): string =>
  `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}.${d.getFullYear()}`;

export const csvForEntries = (
  entries: Entry[],
  members: Member[],
  from: Date,
  to: Date
): string => {
  const inRange = entries.filter((e) => {
    const d = toDate(e.date);
    return d >= from && d <= to;
  });

  const lines = [
    "Datum,Mitglied,Tätigkeit,Kategorie,Punkte,Status,Notiz,Ablehnungsgrund",
  ];

  inRange
    .sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime())
    .forEach((entry) => {
      const memberName =
        members.find((m) => m.id === entry.memberId)
          ? getMemberFullName(members.find((m) => m.id === entry.memberId)!)
          : entry.memberId;
      const date = formatDate(toDate(entry.date));
      const notes = (entry.notes || "").replace(/\n/g, " ");
      const rejection = entry.rejectionReason || "";
      lines.push(
        [
          date,
          csvEscape(memberName),
          csvEscape(entry.activityName),
          String(entry.activityCategory),
          entry.points.toFixed(1),
          String(entry.status),
          csvEscape(notes),
          csvEscape(rejection),
        ].join(",")
      );
    });

  return lines.join("\n");
};

export const csvForMembers = (
  members: Member[],
  entries: Entry[],
  club: Club,
  from: Date,
  to: Date
): string => {
  const inRange = entries.filter((e) => {
    const d = toDate(e.date);
    return d >= from && d <= to;
  });

  const lines = [
    "Name,E-Mail,Mitgliedstyp,Ziel-Punkte,Erreichte Punkte,Fehlende Punkte,Ausgleichsbetrag (€),Status",
  ];

  members
    .slice()
    .sort((a, b) => a.lastName.localeCompare(b.lastName))
    .forEach((member) => {
      const target = calculateTargetPoints(member, club.requiredPoints);
      const approved = approvedPointsForMember(member.id, inRange);
      const missing = missingPointsForMember(
        member,
        club.requiredPoints,
        inRange
      );
      const compensation = compensationAmountForMember(
        member,
        club.requiredPoints,
        club.compensationPerMissingPoint,
        inRange
      );
      const status = memberStatusLabel(member, club.requiredPoints, inRange);

      lines.push(
        [
          csvEscape(getMemberFullName(member)),
          csvEscape(member.email),
          String(member.memberType),
          target.toFixed(1),
          approved.toFixed(1),
          missing.toFixed(1),
          compensation.toFixed(2),
          status,
        ].join(",")
      );
    });

  return lines.join("\n");
};

const slug = (s: string): string =>
  s
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9\-]/g, "");

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export type ExportType =
  | "entries-csv"
  | "members-csv"
  | "annual-report-pdf"
  | "member-list-pdf";

export const exportFilename = (
  type: ExportType,
  club: Club,
  from: Date,
  to: Date
): string => {
  const clubSlug = slug(club.name) || "Verein";
  const period = `${isoDay(from)}_${isoDay(to)}`;
  switch (type) {
    case "entries-csv":
      return `Talo_${clubSlug}_Eintraege_${period}.csv`;
    case "members-csv":
      return `Talo_${clubSlug}_Mitglieder_${period}.csv`;
    case "annual-report-pdf":
      return `Talo_${clubSlug}_Jahresbericht_${period}.pdf`;
    case "member-list-pdf":
      return `Talo_${clubSlug}_Mitgliederliste_${period}.pdf`;
  }
};

export const downloadTextFile = (
  filename: string,
  content: string,
  mime = "text/csv;charset=utf-8"
): void => {
  const BOM = "﻿"; // Excel-friendly UTF-8 BOM
  const blob = new Blob([BOM + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
