"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, collectionGroup, query, orderBy, limit } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Activity, RefreshCw, FileText, UserPlus, Building2,
  Calendar, CheckCircle2, XCircle, Clock, Key, Sparkles,
} from "lucide-react";
import { GlassSection } from "@/app/components/ui/NativeUI";
import Link from "next/link";

type FeedItem =
  | { kind: "entry"; id: string; ts: Date; clubId: string; clubName: string; memberName: string; activityName: string; points: number; status: string }
  | { kind: "member"; id: string; ts: Date; name: string; email: string; clubNames: string[] }
  | { kind: "club"; id: string; ts: Date; name: string; plan: string }
  | { kind: "license"; id: string; ts: Date; key: string; plan: string; clubName?: string };

type FeedKind = "all" | "entry" | "member" | "club" | "license";

const fmtRelative = (d: Date): string => {
  const diff = Date.now() - d.getTime();
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff < min) return "gerade eben";
  if (diff < hour) return `vor ${Math.floor(diff / min)} Min.`;
  if (diff < day) return `vor ${Math.floor(diff / hour)} Std.`;
  if (diff < 7 * day) return `vor ${Math.floor(diff / day)} Tagen`;
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
};

export default function AktivitaetAdminPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FeedKind>("all");

  async function loadFeed() {
    setLoading(true);
    try {
      const [clubsSnap, membersSnap, licensesSnap] = await Promise.all([
        getDocs(collection(db, "clubs")),
        getDocs(collection(db, "members")),
        getDocs(collection(db, "licenses")),
      ]);

      const clubNameById = new Map<string, string>();
      const memberClubsById = new Map<string, string[]>();
      clubsSnap.docs.forEach((c) => clubNameById.set(c.id, c.data().name ?? "—"));

      const memberNameById = new Map<string, string>();
      membersSnap.docs.forEach((m) => {
        const d = m.data();
        memberNameById.set(m.id, `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || "—");
        const cids: string[] = d.clubIds ?? (d.clubId ? [d.clubId] : []);
        memberClubsById.set(m.id, cids);
      });

      const feed: FeedItem[] = [];

      const getSafeDate = (val: any) => {
        if (!val) return new Date(2026, 0, 1);
        if (typeof val.toDate === "function") return val.toDate();
        const parsed = new Date(val);
        return isNaN(parsed.getTime()) ? new Date(2026, 0, 1) : parsed;
      };

      // Recent clubs
      clubsSnap.docs.forEach((c) => {
        const d = c.data();
        const ts = getSafeDate(d.createdAt);
        feed.push({
          kind: "club",
          id: c.id,
          ts,
          name: d.name ?? "—",
          plan: (d.plan ?? "starter").toLowerCase(),
        });
      });

      // Recent members
      membersSnap.docs.forEach((m) => {
        const d = m.data();
        const ts = getSafeDate(d.createdAt);
        const cids: string[] = d.clubIds ?? (d.clubId ? [d.clubId] : []);
        feed.push({
          kind: "member",
          id: m.id,
          ts,
          name: `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || "—",
          email: d.email ?? "—",
          clubNames: cids.map((cid) => clubNameById.get(cid) ?? cid).filter(Boolean),
        });
      });

      // Recent licenses redeemed
      licensesSnap.docs.forEach((l) => {
        const d = l.data();
        if (d.status === "used") {
          const ts = getSafeDate(d.usedAt);
          feed.push({
            kind: "license",
            id: l.id,
            ts,
            key: d.key,
            plan: (d.plan ?? "starter").toLowerCase(),
            clubName: d.usedByOrgId ? clubNameById.get(d.usedByOrgId) : undefined,
          });
        }
      });

      // Recent entries
      let entriesDocs: any[] = [];
      try {
        const entriesSnap = await getDocs(
          query(collectionGroup(db, "entries"), orderBy("date", "desc"), limit(50))
        );
        entriesDocs = entriesSnap.docs;
      } catch (err) {
        console.warn("collectionGroup query failed (possibly missing index), falling back to club-by-club fetch:", err);
        try {
          const clubEntriesPromises = clubsSnap.docs.map(async (clubDoc) => {
            const entriesSnap = await getDocs(
              query(collection(db, "clubs", clubDoc.id, "entries"), limit(50))
            );
            return entriesSnap.docs;
          });
          const resolved = await Promise.all(clubEntriesPromises);
          const allEntries = resolved.flat();
          // Sort by date in memory desc
          allEntries.sort((a, b) => {
            const dateA = getSafeDate(a.data().date);
            const dateB = getSafeDate(b.data().date);
            return dateB.getTime() - dateA.getTime();
          });
          entriesDocs = allEntries.slice(0, 50);
        } catch (fallbackErr) {
          console.error("Fallback club-by-club fetch failed too:", fallbackErr);
        }
      }

      entriesDocs.forEach((e: any) => {
        const d = e.data();
        const ts = getSafeDate(d.date);
        const pathParts = e.ref.path.split("/");
        const clubId = pathParts[1];
        feed.push({
          kind: "entry",
          id: e.id,
          ts,
          clubId,
          clubName: clubNameById.get(clubId) ?? clubId,
          memberName: memberNameById.get(d.memberId) ?? "—",
          activityName: d.activityName ?? "—",
          points: d.points ?? 0,
          status: d.status ?? "—",
        });
      });

      feed.sort((a, b) => b.ts.getTime() - a.ts.getTime());
      setItems(feed.slice(0, 100));
    } catch (e) {
      console.error("Fehler beim Laden", e);
    }
    setLoading(false);
  }

  useEffect(() => { loadFeed(); }, []);

  const filtered = useMemo(
    () => filter === "all" ? items : items.filter((i) => i.kind === filter),
    [items, filter]
  );

  const counts = useMemo(() => ({
    all: items.length,
    entry: items.filter((i) => i.kind === "entry").length,
    member: items.filter((i) => i.kind === "member").length,
    club: items.filter((i) => i.kind === "club").length,
    license: items.filter((i) => i.kind === "license").length,
  }), [items]);

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1200px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">

        <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Aktivität</h1>
            <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">
              Letzte 100 Ereignisse plattformweit
            </p>
          </div>
          <button
            onClick={loadFeed}
            disabled={loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "rgba(0,0,0,0.05)", color: "#71717A" }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { k: "all" as FeedKind, label: "Alle", count: counts.all },
            { k: "entry" as FeedKind, label: "Einträge", count: counts.entry },
            { k: "member" as FeedKind, label: "Mitglieder", count: counts.member },
            { k: "club" as FeedKind, label: "Vereine", count: counts.club },
            { k: "license" as FeedKind, label: "Lizenzen", count: counts.license },
          ]).map((p) => (
            <button
              key={p.k}
              onClick={() => setFilter(p.k)}
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${
                filter === p.k ? "bg-[#0A0A0A] text-white" : "bg-black/[0.04] text-[#71717A] hover:text-[#0A0A0A]"
              }`}
            >
              {p.label} <span className="opacity-50">· {p.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-black/10 border-t-[#0A0A0A] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Activity size={32} className="mb-4" style={{ color: "#71717A" }} />
            <p className="font-poppins font-bold text-[18px] text-[#0A0A0A] mb-2">Keine Aktivität</p>
          </div>
        ) : (
          <GlassSection>
            <div className="p-1">
              {filtered.map((it, i) => (
                <FeedRow key={`${it.kind}-${it.id}`} item={it} index={i} isLast={i === filtered.length - 1} />
              ))}
            </div>
          </GlassSection>
        )}
      </div>
    </div>
  );
}

function FeedRow({ item, index, isLast }: { item: FeedItem; index: number; isLast: boolean }) {
  const { icon: Icon, color, bg, label, body, href } = renderItem(item);
  const content = (
    <div className={`flex items-center gap-4 px-4 py-3.5 ${!isLast ? "border-b border-black/[0.04]" : ""} ${href ? "hover:bg-black/[0.02] transition-all" : ""}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-poppins font-semibold text-[#0A0A0A] truncate">{label}</p>
        <p className="text-[10px] text-[#71717A] truncate">{body}</p>
      </div>
      <span className="text-[10px] text-[#A1A1AA] shrink-0 font-bold uppercase tracking-wide">{fmtRelative(item.ts)}</span>
    </div>
  );

  if (!href) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(index * 0.01, 0.3) }}>
      {content}
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(index * 0.01, 0.3) }}>
      <Link href={href}>{content}</Link>
    </motion.div>
  );
}

function renderItem(item: FeedItem): {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
  body: string;
  href?: string;
} {
  switch (item.kind) {
    case "entry": {
      const statusIcon =
        item.status === "Genehmigt" ? CheckCircle2 :
        item.status === "Abgelehnt" ? XCircle :
        Clock;
      const statusColor =
        item.status === "Genehmigt" ? "#34C759" :
        item.status === "Abgelehnt" ? "#FF453A" :
        "#FF9500";
      return {
        icon: statusIcon,
        color: statusColor,
        bg: `${statusColor}15`,
        label: `${item.activityName} · ${item.points}P`,
        body: `${item.memberName} · ${item.clubName} · ${item.status}`,
        href: `/admin/vereine/${item.clubId}`,
      };
    }
    case "member":
      return {
        icon: UserPlus,
        color: "#007AFF",
        bg: "rgba(0,122,255,0.12)",
        label: `Neues Mitglied: ${item.name}`,
        body: `${item.email}${item.clubNames.length > 0 ? ` · ${item.clubNames.join(", ")}` : " · ohne Verein"}`,
      };
    case "club":
      return {
        icon: Building2,
        color: "#AF52DE",
        bg: "rgba(175,82,222,0.12)",
        label: `Neuer Verein: ${item.name}`,
        body: `Plan: ${item.plan}`,
        href: `/admin/vereine/${item.id}`,
      };
    case "license":
      return {
        icon: Key,
        color: "#FF9500",
        bg: "rgba(255,149,0,0.12)",
        label: `Lizenz eingelöst: ${item.key}`,
        body: `Plan: ${item.plan}${item.clubName ? ` · ${item.clubName}` : ""}`,
      };
  }
}
