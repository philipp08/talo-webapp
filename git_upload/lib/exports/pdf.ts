import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Club,
  Entry,
  EntryStatus,
  ActivityCategory,
  Member,
  calculateTargetPoints,
  getMemberFullName,
} from "@/lib/firebase/models";
import {
  approvedPointsForMember,
  compensationAmountForMember,
  isExemptMember,
  missingPointsForMember,
} from "./memberStats";
import { exportFilename } from "./csv";

const formatDateDE = (d: Date): string =>
  `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

// Colors – matched to the web dashboard
const C_BLACK: [number, number, number] = [10, 10, 10];
const C_TEXT_SUB: [number, number, number] = [82, 82, 91];
const C_TEXT_MUTED: [number, number, number] = [113, 113, 122];
const C_GREEN: [number, number, number] = [22, 128, 61];
const C_RED: [number, number, number] = [185, 28, 28];
const C_HAIRLINE: [number, number, number] = [228, 228, 231];
const C_BG_SOFT: [number, number, number] = [247, 247, 248];

function drawHeader(doc: jsPDF, clubName: string, subtitle: string): void {
  const w = doc.internal.pageSize.getWidth();
  const margin = 14;

  doc.setTextColor(...C_BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(clubName, margin, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...C_TEXT_SUB);
  doc.text(subtitle, margin, 29);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C_BLACK);
  doc.text("TALO", w - margin, 22, { align: "right", charSpace: 2 });

  doc.setDrawColor(...C_HAIRLINE);
  doc.setLineWidth(0.3);
  doc.line(margin, 34, w - margin, 34);
}

function drawFooter(doc: jsPDF, clubName: string): void {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const margin = 14;
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...C_HAIRLINE);
    doc.setLineWidth(0.3);
    doc.line(margin, h - 14, w - margin, h - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C_TEXT_MUTED);
    doc.text(
      `Erstellt am ${formatDateDE(new Date())} · ${clubName}`,
      margin,
      h - 8
    );
    doc.text(
      `Seite ${i} / ${totalPages}`,
      w - margin,
      h - 8,
      { align: "right" }
    );
  }
}

function sectionTitle(doc: jsPDF, y: number, label: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_TEXT_SUB);
  doc.text(label.toUpperCase(), 14, y, { charSpace: 1.2 });
  return y + 4;
}

function statGrid(
  doc: jsPDF,
  startY: number,
  items: { label: string; value: string }[]
): number {
  const margin = 14;
  const w = doc.internal.pageSize.getWidth();
  const cols = 4;
  const cellW = (w - margin * 2) / cols;
  const cellH = 14;

  items.forEach((item, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = margin + col * cellW;
    const y = startY + row * (cellH + 2);

    doc.setDrawColor(...C_HAIRLINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x + 1, y, cellW - 2, cellH, 1.5, 1.5, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...C_BLACK);
    doc.text(item.value, x + 4, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_TEXT_SUB);
    doc.text(item.label, x + 4, y + 11);
  });

  const rows = Math.ceil(items.length / cols);
  return startY + rows * (cellH + 2) + 4;
}

export function generateAnnualReportPdf(
  club: Club,
  members: Member[],
  entries: Entry[],
  from: Date,
  to: Date
): jsPDF {
  const inRange = entries.filter((e) => {
    const d = e.date instanceof Date ? e.date : (e.date as { toDate: () => Date }).toDate();
    return d >= from && d <= to;
  });

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawHeader(
    doc,
    club.name,
    `Jahresbericht · ${formatDateDE(from)} – ${formatDateDE(to)}`
  );

  const activeMembers = members.filter((m) => !isExemptMember(m, club.memberTypeFactors));
  const onTrack = activeMembers.filter(
    (m) => missingPointsForMember(m, club, inRange) === 0
  ).length;
  const approved = inRange.filter((e) => e.status === EntryStatus.Approved);
  const pending = inRange.filter((e) => e.status === EntryStatus.Pending);
  const totalPoints = approved.reduce((s, e) => s + e.points, 0);

  let y = sectionTitle(doc, 42, "Übersicht");
  y = statGrid(doc, y, [
    { label: "Mitglieder gesamt", value: String(members.length) },
    { label: "Aktive Mitglieder", value: String(activeMembers.length) },
    { label: "Ziel erfüllt", value: `${onTrack} / ${activeMembers.length}` },
    { label: "Einträge genehmigt", value: String(approved.length) },
    { label: "Ausstehend", value: String(pending.length) },
    { label: "Punkte gesamt", value: totalPoints.toFixed(1) },
    { label: "Pflichtpunkte", value: club.requiredPoints.toFixed(1) },
    {
      label: "Ausgleichssatz",
      value: `${club.compensationPerMissingPoint.toFixed(2)} €/Pkt.`,
    },
  ]);

  y = sectionTitle(doc, y + 4, "Mitglieder-Übersicht");

  const sortedMembers = [...members].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  autoTable(doc, {
    startY: y,
    head: [["Name", "Typ", "Ziel", "Erreicht", "Fehlend", "Ausgleich", "Status"]],
    body: sortedMembers.map((m) => {
      const target = calculateTargetPoints(m, club);
      const ap = approvedPointsForMember(m.id, inRange);
      const missing = missingPointsForMember(m, club, inRange);
      const comp = compensationAmountForMember(
        m,
        club,
        club.compensationPerMissingPoint,
        inRange,
        club.memberTypeFactors
      );
      const exempt = isExemptMember(m, club.memberTypeFactors);
      const status = exempt ? "Befreit" : missing === 0 ? "Erfüllt" : "Rückstand";
      return [
        getMemberFullName(m),
        String(m.memberType),
        target.toFixed(1),
        ap.toFixed(1),
        missing.toFixed(1),
        `${comp.toFixed(2)} €`,
        status,
      ];
    }),
    theme: "plain",
    headStyles: {
      fillColor: C_BLACK,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8, textColor: C_BLACK },
    alternateRowStyles: { fillColor: C_BG_SOFT },
    styles: {
      cellPadding: { top: 2, bottom: 2, left: 2.5, right: 2.5 },
      lineColor: C_HAIRLINE,
      lineWidth: 0.1,
    },
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const row = sortedMembers[data.row.index];
      if (!row) return;
      const missing = missingPointsForMember(row, club, inRange);
      const comp = compensationAmountForMember(
        row,
        club,
        club.compensationPerMissingPoint,
        inRange,
        club.memberTypeFactors
      );
      const exempt = isExemptMember(row, club.memberTypeFactors);

      if (data.column.index === 4 && missing > 0) data.cell.styles.textColor = C_RED;
      if (data.column.index === 5 && comp > 0) data.cell.styles.textColor = C_RED;
      if (data.column.index === 6) {
        data.cell.styles.fontStyle = "bold";
        if (exempt) data.cell.styles.textColor = C_TEXT_MUTED;
        else if (missing === 0) data.cell.styles.textColor = C_GREEN;
        else data.cell.styles.textColor = C_RED;
      }
    },
    margin: { left: 14, right: 14 },
  });

  type WithLast = jsPDF & { lastAutoTable?: { finalY: number } };
  y = (doc as WithLast).lastAutoTable?.finalY ?? y;

  y = sectionTitle(doc, y + 8, "Einträge nach Kategorie");

  const categoryRows = (Object.values(ActivityCategory) as string[]).map((cat) => {
    const list = approved.filter((e) => String(e.activityCategory) === cat);
    const sum = list.reduce((s, e) => s + e.points, 0);
    return [cat, String(list.length), sum.toFixed(1)];
  });

  autoTable(doc, {
    startY: y,
    head: [["Kategorie", "Einträge", "Punkte"]],
    body: categoryRows,
    theme: "plain",
    headStyles: {
      fillColor: C_BLACK,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: { fontSize: 9, textColor: C_BLACK },
    styles: {
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      lineColor: C_HAIRLINE,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "right" },
      2: { halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  drawFooter(doc, club.name);
  return doc;
}

export function generateMemberListPdf(
  club: Club,
  members: Member[],
  entries: Entry[],
  from: Date,
  to: Date
): jsPDF {
  const inRange = entries.filter((e) => {
    const d = e.date instanceof Date ? e.date : (e.date as { toDate: () => Date }).toDate();
    return d >= from && d <= to;
  });

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawHeader(
    doc,
    club.name,
    `Mitgliederliste · ${formatDateDE(from)} – ${formatDateDE(to)}`
  );

  const sorted = [...members].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const margin = 14;
  const cardH = 22;
  const cardW = w - margin * 2;
  let y = 42;

  sorted.forEach((m) => {
    if (y + cardH > h - 22) {
      doc.addPage();
      drawHeader(
        doc,
        club.name,
        `Mitgliederliste · ${formatDateDE(from)} – ${formatDateDE(to)}`
      );
      y = 42;
    }

    const target = calculateTargetPoints(m, club);
    const ap = approvedPointsForMember(m.id, inRange);
    const missing = missingPointsForMember(m, club, inRange);
    const comp = compensationAmountForMember(
      m,
      club,
      club.compensationPerMissingPoint,
      inRange,
      club.memberTypeFactors
    );
    const exempt = isExemptMember(m, club.memberTypeFactors);
    const stripe: [number, number, number] = exempt
      ? C_TEXT_MUTED
      : missing === 0
      ? C_GREEN
      : C_RED;

    doc.setDrawColor(...C_HAIRLINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, cardW, cardH, 2, 2, "S");

    doc.setFillColor(...stripe);
    doc.roundedRect(margin, y, 1.5, cardH, 0.5, 0.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C_BLACK);
    doc.text(getMemberFullName(m), margin + 5, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C_TEXT_SUB);
    doc.text(m.email, margin + 5, y + 11);

    doc.setFontSize(8);
    doc.setTextColor(...C_TEXT_MUTED);
    const role = m.isAdmin
      ? "Admin"
      : m.isTrainer
      ? "Trainer"
      : String(m.memberType);
    doc.text(role, margin + 5, y + 16);

    const rightX = margin + cardW - 4;
    if (exempt) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C_TEXT_MUTED);
      doc.text(`${String(m.memberType)} · Befreit`, rightX, y + 11, {
        align: "right",
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C_TEXT_SUB);
      doc.text(
        `Ziel ${target.toFixed(1)} · Erreicht ${ap.toFixed(1)}`,
        rightX,
        y + 7,
        { align: "right" }
      );
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      if (missing > 0) {
        doc.setTextColor(...C_RED);
        doc.text(
          `Fehlend ${missing.toFixed(1)} · ${comp.toFixed(2)} €`,
          rightX,
          y + 13,
          { align: "right" }
        );
      } else {
        doc.setTextColor(...C_GREEN);
        doc.text("Ziel erfüllt", rightX, y + 13, { align: "right" });
      }
    }

    y += cardH + 3;
  });

  drawFooter(doc, club.name);
  return doc;
}

export function downloadPdf(doc: jsPDF, filename: string): void {
  doc.save(filename);
}

export function downloadAnnualReport(
  club: Club,
  members: Member[],
  entries: Entry[],
  from: Date,
  to: Date
): void {
  const doc = generateAnnualReportPdf(club, members, entries, from, to);
  downloadPdf(doc, exportFilename("annual-report-pdf", club, from, to));
}

export function downloadMemberList(
  club: Club,
  members: Member[],
  entries: Entry[],
  from: Date,
  to: Date
): void {
  const doc = generateMemberListPdf(club, members, entries, from, to);
  downloadPdf(doc, exportFilename("member-list-pdf", club, from, to));
}
