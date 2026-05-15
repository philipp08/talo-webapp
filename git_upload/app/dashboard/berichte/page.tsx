"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import {
  Entry,
  Member,
  EntryStatus,
  ActivityCategory,
  calculateTargetPoints,
  getMemberFullName,
} from "@/lib/firebase/models";
import {
  approvedPointsForMember,
  compensationAmountForMember,
  missingPointsForMember,
} from "@/lib/exports/memberStats";

type ReportType = "jahresbericht" | "mitgliederliste";

function parseDateParam(value: string | null, fallback: Date): Date {
  if (!value) return fallback;
  const d = new Date(value);
  return isNaN(d.getTime()) ? fallback : d;
}

function formatDateDE(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}.${String(
    d.getMonth() + 1
  ).padStart(2, "0")}.${d.getFullYear()}`;
}

function BerichtContent() {
  const search = useSearchParams();
  const router = useRouter();
  const currentClub = useAppStore((s) => s.currentClub);
  const currentMember = useAppStore((s) => s.currentMember);

  const type = (search.get("type") || "jahresbericht") as ReportType;
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const yearEnd = new Date(new Date().getFullYear(), 11, 31);
  const from = parseDateParam(search.get("from"), yearStart);
  const to = parseDateParam(search.get("to"), yearEnd);

  const [members, setMembers] = useState<Member[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!currentClub) return;
    let loadedMembers = false;
    let loadedEntries = false;
    const markReady = () => {
      if (loadedMembers && loadedEntries) setReady(true);
    };
    const u1 = FirebaseManager.listenToMembers(currentClub.id, (m) => {
      setMembers(m);
      loadedMembers = true;
      markReady();
    });
    const u2 = FirebaseManager.listenToEntries(currentClub.id, (e) => {
      setEntries(e);
      loadedEntries = true;
      markReady();
    });
    return () => {
      u1();
      u2();
    };
  }, [currentClub]);

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => window.print(), 300);
      return () => clearTimeout(t);
    }
  }, [ready]);

  const filteredEntries = useMemo(
    () =>
      entries.filter((e) => {
        const d = e.date instanceof Date ? e.date : (e.date as { toDate: () => Date }).toDate();
        return d >= from && d <= to;
      }),
    [entries, from, to]
  );

  if (!currentClub || !currentMember) {
    return (
      <div className="p-10 text-sm text-[#52525B]">Lade Daten…</div>
    );
  }

  return (
    <div className="bericht-root bg-white text-[#0A0A0A] font-poppins">
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 14mm 12mm; }
          body * { visibility: hidden !important; }
          .bericht-root, .bericht-root * { visibility: visible !important; }
          .bericht-root { position: absolute; top: 0; left: 0; right: 0; padding: 0 !important; }
          .no-print { display: none !important; }
          body { background: white !important; }
        }
        .bericht-root { padding: 28px 32px; max-width: 1100px; margin: 0 auto; }
        .bericht-toolbar { display: flex; gap: 8px; margin-bottom: 18px; }
      `}</style>

      <div className="bericht-toolbar no-print">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg bg-[#0A0A0A] text-white text-xs font-semibold"
        >
          Drucken / Als PDF speichern
        </button>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg bg-black/[0.06] text-[#0A0A0A] text-xs font-semibold"
        >
          Zurück
        </button>
        <span className="ml-auto text-xs text-[#52525B] self-center">
          {ready ? `${members.length} Mitglieder · ${filteredEntries.length} Einträge im Zeitraum` : "Lade…"}
        </span>
      </div>

      {type === "jahresbericht" ? (
        <AnnualReport
          clubName={currentClub.name}
          requiredPoints={currentClub.requiredPoints}
          compensation={currentClub.compensationPerMissingPoint}
          members={members}
          entries={filteredEntries}
          from={from}
          to={to}
        />
      ) : (
        <MemberList
          clubName={currentClub.name}
          requiredPoints={currentClub.requiredPoints}
          compensation={currentClub.compensationPerMissingPoint}
          members={members}
          entries={filteredEntries}
          from={from}
          to={to}
        />
      )}
    </div>
  );
}

export default function BerichtePage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[#52525B]">Lade…</div>}>
      <BerichtContent />
    </Suspense>
  );
}

function ReportHeader({ clubName, subtitle }: { clubName: string; subtitle: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-black/10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{clubName}</h1>
          <p className="text-[12px] text-[#52525B] mt-0.5">{subtitle}</p>
        </div>
        <span className="text-[11px] font-bold tracking-[0.3em] text-[#52525B]">TALO</span>
      </div>
    </div>
  );
}

function ReportFooter({ clubName }: { clubName: string }) {
  return (
    <div className="mt-10 pt-4 border-t border-black/10 flex items-center justify-between text-[10px] text-[#71717A]">
      <span>Erstellt am {formatDateDE(new Date())} · {clubName}</span>
      <span className="tracking-[0.2em]">TALO · Jeder Beitrag zählt.</span>
    </div>
  );
}

function AnnualReport({
  clubName,
  requiredPoints,
  compensation,
  members,
  entries,
  from,
  to,
}: {
  clubName: string;
  requiredPoints: number;
  compensation: number;
  members: Member[];
  entries: Entry[];
  from: Date;
  to: Date;
}) {
  const activeMembers = members.filter(
    (m) => m.memberType !== "Vorstand" && m.memberType !== "Jugend"
  );
  const onTrack = activeMembers.filter(
    (m) => missingPointsForMember(m, requiredPoints, entries) === 0
  ).length;
  const approvedEntries = entries.filter((e) => e.status === EntryStatus.Approved);
  const pendingEntries = entries.filter((e) => e.status === EntryStatus.Pending);
  const totalPoints = approvedEntries.reduce((s, e) => s + e.points, 0);

  const stats: { label: string; value: string }[] = [
    { label: "Mitglieder gesamt", value: String(members.length) },
    { label: "Aktive Mitglieder", value: String(activeMembers.length) },
    { label: "Ziel erfüllt", value: `${onTrack} / ${activeMembers.length}` },
    { label: "Einträge genehmigt", value: String(approvedEntries.length) },
    { label: "Ausstehend", value: String(pendingEntries.length) },
    { label: "Punkte gesamt", value: totalPoints.toFixed(1) },
    { label: "Pflichtpunkte", value: requiredPoints.toFixed(1) },
    { label: "Ausgleichssatz", value: `${compensation.toFixed(2)} € / Punkt` },
  ];

  const sortedMembers = [...members].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  const categoryGroups: Record<string, Entry[]> = {};
  Object.values(ActivityCategory).forEach((cat) => (categoryGroups[cat] = []));
  approvedEntries.forEach((e) => {
    const k = String(e.activityCategory);
    if (!categoryGroups[k]) categoryGroups[k] = [];
    categoryGroups[k].push(e);
  });

  return (
    <div className="text-sm">
      <ReportHeader
        clubName={clubName}
        subtitle={`Jahresbericht · ${formatDateDE(from)} – ${formatDateDE(to)}`}
      />

      <div className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#52525B]">ÜBERSICHT</div>
      <div className="grid grid-cols-4 gap-2 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="border border-black/10 rounded-md px-3 py-2">
            <div className="text-base font-bold">{s.value}</div>
            <div className="text-[10px] text-[#52525B]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#52525B]">MITGLIEDER-ÜBERSICHT</div>
      <table className="w-full text-[11px] border border-black/10 mb-8">
        <thead>
          <tr className="bg-black/[0.04] text-left">
            <th className="px-2 py-1.5 font-semibold">Name</th>
            <th className="px-2 py-1.5 font-semibold">Typ</th>
            <th className="px-2 py-1.5 font-semibold text-right">Ziel</th>
            <th className="px-2 py-1.5 font-semibold text-right">Erreicht</th>
            <th className="px-2 py-1.5 font-semibold text-right">Fehlend</th>
            <th className="px-2 py-1.5 font-semibold text-right">Ausgleich</th>
            <th className="px-2 py-1.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedMembers.map((m) => {
            const target = calculateTargetPoints(m, requiredPoints);
            const approved = approvedPointsForMember(m.id, entries);
            const missing = missingPointsForMember(m, requiredPoints, entries);
            const comp = compensationAmountForMember(m, requiredPoints, compensation, entries);
            const exempt = m.memberType === "Vorstand" || m.memberType === "Jugend";
            const status = exempt ? "Befreit" : missing === 0 ? "✓ Erfüllt" : "⚠ Rückstand";
            const statusColor = exempt ? "#71717A" : missing === 0 ? "#16803D" : "#B91C1C";
            return (
              <tr key={m.id} className="border-t border-black/5">
                <td className="px-2 py-1">{getMemberFullName(m)}</td>
                <td className="px-2 py-1 text-[#52525B]">{String(m.memberType)}</td>
                <td className="px-2 py-1 text-right tabular-nums">{target.toFixed(1)}</td>
                <td className="px-2 py-1 text-right tabular-nums">{approved.toFixed(1)}</td>
                <td className="px-2 py-1 text-right tabular-nums" style={{ color: missing > 0 ? "#B91C1C" : "inherit" }}>
                  {missing.toFixed(1)}
                </td>
                <td className="px-2 py-1 text-right tabular-nums" style={{ color: comp > 0 ? "#B91C1C" : "inherit" }}>
                  {comp.toFixed(2)} €
                </td>
                <td className="px-2 py-1 font-semibold" style={{ color: statusColor }}>{status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#52525B]">EINTRÄGE NACH KATEGORIE</div>
      <table className="w-full text-[11px] border border-black/10">
        <thead>
          <tr className="bg-black/[0.04] text-left">
            <th className="px-2 py-1.5 font-semibold">Kategorie</th>
            <th className="px-2 py-1.5 font-semibold text-right">Einträge</th>
            <th className="px-2 py-1.5 font-semibold text-right">Punkte</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(categoryGroups).map(([cat, list]) => {
            const sum = list.reduce((s, e) => s + e.points, 0);
            return (
              <tr key={cat} className="border-t border-black/5">
                <td className="px-2 py-1 font-semibold">{cat}</td>
                <td className="px-2 py-1 text-right tabular-nums">{list.length}</td>
                <td className="px-2 py-1 text-right tabular-nums">{sum.toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ReportFooter clubName={clubName} />
    </div>
  );
}

function MemberList({
  clubName,
  requiredPoints,
  compensation,
  members,
  entries,
  from,
  to,
}: {
  clubName: string;
  requiredPoints: number;
  compensation: number;
  members: Member[];
  entries: Entry[];
  from: Date;
  to: Date;
}) {
  const sorted = [...members].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  return (
    <div className="text-sm">
      <ReportHeader
        clubName={clubName}
        subtitle={`Mitgliederliste · ${formatDateDE(from)} – ${formatDateDE(to)}`}
      />

      <div className="flex flex-col gap-2">
        {sorted.map((m) => {
          const target = calculateTargetPoints(m, requiredPoints);
          const approved = approvedPointsForMember(m.id, entries);
          const missing = missingPointsForMember(m, requiredPoints, entries);
          const comp = compensationAmountForMember(m, requiredPoints, compensation, entries);
          const exempt = m.memberType === "Vorstand" || m.memberType === "Jugend";
          const stripe = exempt ? "#A1A1AA" : missing === 0 ? "#16803D" : "#B91C1C";
          const role = m.isAdmin ? "Admin" : m.isTrainer ? "Trainer" : String(m.memberType);

          return (
            <div
              key={m.id}
              className="flex items-stretch border border-black/10 rounded-md overflow-hidden"
            >
              <div style={{ width: 4, background: stripe }} />
              <div className="flex-1 p-3 flex justify-between gap-4">
                <div>
                  <div className="font-semibold text-[13px]">{getMemberFullName(m)}</div>
                  <div className="text-[11px] text-[#52525B]">{m.email}</div>
                  <div className="text-[10px] text-[#71717A] mt-0.5">{role}</div>
                </div>
                <div className="text-[11px] text-right tabular-nums leading-tight">
                  {exempt ? (
                    <div className="text-[#71717A]">{String(m.memberType)}</div>
                  ) : (
                    <>
                      <div>Ziel: <span className="font-semibold">{target.toFixed(1)}</span> Pkt.</div>
                      <div>Erreicht: <span className="font-semibold">{approved.toFixed(1)}</span> Pkt.</div>
                      {missing > 0 ? (
                        <div className="text-[#B91C1C] font-semibold">
                          Fehlend: {missing.toFixed(1)} · Ausgleich: {comp.toFixed(2)} €
                        </div>
                      ) : (
                        <div className="text-[#16803D] font-semibold">✓ Ziel erfüllt</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ReportFooter clubName={clubName} />
    </div>
  );
}
