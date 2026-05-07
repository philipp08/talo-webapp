"use client";

import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";

const ease = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/* ══════════════════════════════════════════════════════════════════
   ACTIVITY FEED
══════════════════════════════════════════════════════════════════ */

const ACTIVITIES = [
  { initial: "M", name: "Maria Schmidt",  action: "20 Punkte erhalten",    time: "eben",       color: "#6366f1" },
  { initial: "A", name: "Antrag #42",     action: "Zeltlager genehmigt",   time: "vor 1 Min.", color: "#10b981" },
  { initial: "T", name: "Tim Kowalski",   action: "Neu beigetreten",       time: "vor 3 Min.", color: "#3b82f6" },
  { initial: "K", name: "Kassenprüfung",  action: "Dokument geprüft",      time: "vor 5 Min.", color: "#f59e0b" },
];

function ActivityRow({ initial, name, action, time, color, delay }: {
  initial: string; name: string; action: string; time: string; color: string; delay: number;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 20);
  const x = interpolate(frame, [delay, delay + 24], [24, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "9px 0", borderBottom: "1px solid rgba(0,0,0,0.05)",
      opacity: op, transform: `translateX(${x}px)`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, background: color + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 13, fontWeight: 700,
        color, fontFamily: "system-ui, sans-serif",
      }}>{initial}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", fontFamily: "system-ui, sans-serif", margin: 0, marginBottom: 1 }}>{name}</p>
        <p style={{ fontSize: 11, color: "#6b7280", fontFamily: "system-ui, sans-serif", margin: 0 }}>{action}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
        <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "system-ui, sans-serif" }}>{time}</span>
      </div>
    </div>
  );
}

export function ActivityFeedComposition() {
  const frame = useCurrentFrame();
  const headerOp = ease(frame, 0, 14);
  return (
    <AbsoluteFill style={{ background: "#ffffff", padding: "18px 20px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, opacity: headerOp }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: 4, background: "#10b981" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.09em", fontFamily: "system-ui, sans-serif", textTransform: "uppercase" }}>Live Aktivitäten</span>
        </div>
        <span style={{ fontSize: 10, color: "#d1d5db", fontFamily: "system-ui, sans-serif" }}>Heute</span>
      </div>
      <Sequence from={12} layout="none"><ActivityRow {...ACTIVITIES[0]} delay={0} /></Sequence>
      <Sequence from={38} layout="none"><ActivityRow {...ACTIVITIES[1]} delay={0} /></Sequence>
      <Sequence from={64} layout="none"><ActivityRow {...ACTIVITIES[2]} delay={0} /></Sequence>
      <Sequence from={90} layout="none"><ActivityRow {...ACTIVITIES[3]} delay={0} /></Sequence>
    </AbsoluteFill>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEADERBOARD
══════════════════════════════════════════════════════════════════ */

const MEMBERS = [
  { rank: 1, initial: "L", name: "Lisa K.",  points: 2840, pct: 100, color: "#f59e0b" },
  { rank: 2, initial: "M", name: "Max M.",   points: 2120, pct: 75,  color: "#9ca3af" },
  { rank: 3, initial: "T", name: "Tim B.",   points: 1680, pct: 59,  color: "#cd7c2f" },
];
const RANK_ICONS = ["🥇", "🥈", "🥉"];

function LeaderRow({ rank, initial, name, points, pct, color, delay }: {
  rank: number; initial: string; name: string; points: number; pct: number; color: string; delay: number;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 20);
  const barProgress = ease(frame, delay + 8, delay + 45);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", opacity: op }}>
      <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{RANK_ICONS[rank - 1]}</span>
      <div style={{
        width: 28, height: 28, borderRadius: 9, background: color + "20",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color, fontFamily: "system-ui, sans-serif", flexShrink: 0,
      }}>{initial}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#111827", fontFamily: "system-ui, sans-serif" }}>{name}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "system-ui, sans-serif", letterSpacing: "-0.02em" }}>{points.toLocaleString("de-DE")}</span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: "#f3f4f6", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct * barProgress}%`, borderRadius: 3, background: `linear-gradient(to right, ${color}80, ${color})` }} />
        </div>
      </div>
    </div>
  );
}

export function LeaderboardComposition() {
  const frame = useCurrentFrame();
  const headerOp = ease(frame, 0, 14);
  const totalPoints = Math.round(interpolate(frame, [8, 55], [0, 6640], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));
  return (
    <AbsoluteFill style={{ background: "#ffffff", padding: "16px 18px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, opacity: headerOp }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.09em", fontFamily: "system-ui, sans-serif", textTransform: "uppercase" }}>Top Mitglieder</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", fontFamily: "system-ui, sans-serif", letterSpacing: "-0.01em" }}>{totalPoints.toLocaleString("de-DE")} Pkt.</span>
      </div>
      <Sequence from={10} layout="none"><LeaderRow {...MEMBERS[0]} delay={0} /></Sequence>
      <Sequence from={30} layout="none"><LeaderRow {...MEMBERS[1]} delay={0} /></Sequence>
      <Sequence from={50} layout="none"><LeaderRow {...MEMBERS[2]} delay={0} /></Sequence>
    </AbsoluteFill>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAILING  (Automatisierte Mailings)
   440 × 190 @ 30 fps, 180 frames
══════════════════════════════════════════════════════════════════ */

const MAILS = [
  { icon: "📅", subject: "Erinnerung: Vereinsversammlung", to: "An alle 47 Mitglieder", color: "#6366f1" },
  { icon: "✅", subject: "Antrag genehmigt",                to: "An Tim Kowalski",       color: "#10b981" },
  { icon: "⭐", subject: "Punktestand April 2026",          to: "An alle Mitglieder",    color: "#f59e0b" },
];

function MailRow({ icon, subject, to, color, delay }: {
  icon: string; subject: string; to: string; color: string; delay: number;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 18);
  const y = interpolate(frame, [delay, delay + 22], [10, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const sentOp = ease(frame, delay + 22, delay + 36);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 10px", borderRadius: 10,
      background: color + "08", border: `1px solid ${color}20`,
      opacity: op, transform: `translateY(${y}px)`,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: color + "15",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: "#111827", fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {subject}
        </p>
        <p style={{ margin: 0, fontSize: 10, color: "#9ca3af", fontFamily: "system-ui, sans-serif" }}>{to}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, opacity: sentOp, flexShrink: 0 }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 9, color: "#fff" }}>✓</span>
        </div>
        <span style={{ fontSize: 9.5, fontWeight: 600, color: "#10b981", fontFamily: "system-ui, sans-serif" }}>Gesendet</span>
      </div>
    </div>
  );
}

export function MailingComposition() {
  const frame = useCurrentFrame();
  const headerOp = ease(frame, 0, 14);
  const sentCount = Math.round(interpolate(frame, [10, 90], [0, 47], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));

  return (
    <AbsoluteFill style={{ background: "#ffffff", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2, opacity: headerOp }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: 4, background: "#6366f1" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.09em", fontFamily: "system-ui, sans-serif", textTransform: "uppercase" }}>
            Benachrichtigungen
          </span>
        </div>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#6366f1", fontFamily: "system-ui, sans-serif" }}>
          {sentCount} gesendet
        </span>
      </div>

      <Sequence from={14} layout="none"><MailRow {...MAILS[0]} delay={0} /></Sequence>
      <Sequence from={46} layout="none"><MailRow {...MAILS[1]} delay={0} /></Sequence>
      <Sequence from={78} layout="none"><MailRow {...MAILS[2]} delay={0} /></Sequence>
    </AbsoluteFill>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ROLES  (Rollen & Berechtigungen)
   440 × 190 @ 30 fps, 180 frames
══════════════════════════════════════════════════════════════════ */

const ROLES = [
  {
    label: "Vorstand",
    badge: "Admin",
    color: "#6366f1",
    perms: [
      { name: "Eintragen",   ok: true  },
      { name: "Genehmigen",  ok: true  },
      { name: "Verwalten",   ok: true  },
    ],
  },
  {
    label: "Übungsleiter",
    badge: "Trainer",
    color: "#f59e0b",
    perms: [
      { name: "Eintragen",   ok: true  },
      { name: "Genehmigen",  ok: false },
      { name: "Verwalten",   ok: false },
    ],
  },
  {
    label: "Mitglied",
    badge: "User",
    color: "#9ca3af",
    perms: [
      { name: "Eintragen",   ok: true  },
      { name: "Genehmigen",  ok: false },
      { name: "Verwalten",   ok: false },
    ],
  },
];

function RoleRow({ label, badge, color, perms, delay }: typeof ROLES[0] & { delay: number }) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 18);
  const x = interpolate(frame, [delay, delay + 22], [-12, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const permsOp = ease(frame, delay + 18, delay + 32);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 10px", borderRadius: 10,
      background: color + "08", border: `1px solid ${color}20`,
      opacity: op, transform: `translateX(${x}px)`,
    }}>
      {/* Role label + badge */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 90, flexShrink: 0 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#111827", fontFamily: "system-ui, sans-serif" }}>{label}</span>
        <div style={{ display: "inline-flex", alignItems: "center", width: "fit-content" }}>
          <span style={{ fontSize: 8.5, fontWeight: 700, color, fontFamily: "system-ui, sans-serif", background: color + "18", padding: "1px 6px", borderRadius: 4, letterSpacing: "0.06em" }}>
            {badge}
          </span>
        </div>
      </div>

      {/* Permission dots */}
      <div style={{ display: "flex", gap: 6, opacity: permsOp }}>
        {perms.map((p, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{
              width: 20, height: 20, borderRadius: 10,
              background: p.ok ? "#10b981" : "#f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 10, color: p.ok ? "#fff" : "#d1d5db" }}>{p.ok ? "✓" : "✕"}</span>
            </div>
            <span style={{ fontSize: 8, color: "#9ca3af", fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap" }}>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RolesComposition() {
  const frame = useCurrentFrame();
  const headerOp = ease(frame, 0, 14);
  return (
    <AbsoluteFill style={{ background: "#ffffff", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2, opacity: headerOp }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: 4, background: "#6366f1" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.09em", fontFamily: "system-ui, sans-serif", textTransform: "uppercase" }}>
            Rechtesystem
          </span>
        </div>
        <span style={{ fontSize: 10, color: "#d1d5db", fontFamily: "system-ui, sans-serif" }}>3 Rollen aktiv</span>
      </div>

      <Sequence from={12} layout="none"><RoleRow {...ROLES[0]} delay={0} /></Sequence>
      <Sequence from={40} layout="none"><RoleRow {...ROLES[1]} delay={0} /></Sequence>
      <Sequence from={68} layout="none"><RoleRow {...ROLES[2]} delay={0} /></Sequence>
    </AbsoluteFill>
  );
}

/* ══════════════════════════════════════════════════════════════════
   EXPORT  (Nahtlose Exporte)
   440 × 170 @ 30 fps, 180 frames
══════════════════════════════════════════════════════════════════ */

const EXPORT_FILES = [
  { icon: "📄", name: "Jahresbericht_2026.pdf",   size: "2.4 MB", color: "#ef4444", ext: "PDF"  },
  { icon: "📊", name: "Punkteübersicht.xlsx",      size: "890 KB", color: "#10b981", ext: "XLSX" },
];

function ExportFile({ icon, name, size, color, ext, delay }: typeof EXPORT_FILES[0] & { delay: number }) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 18);
  const y = interpolate(frame, [delay, delay + 22], [8, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px", borderRadius: 10,
      background: "#f9fafb", border: "1px solid #f3f4f6",
      opacity: op, transform: `translateY(${y}px)`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: color + "12",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 15, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#111827", fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {name}
        </p>
        <p style={{ margin: 0, fontSize: 9.5, color: "#9ca3af", fontFamily: "system-ui, sans-serif" }}>{size}</p>
      </div>
      <span style={{ fontSize: 8.5, fontWeight: 700, color, background: color + "15", padding: "2px 7px", borderRadius: 4, fontFamily: "system-ui, sans-serif", flexShrink: 0 }}>
        {ext}
      </span>
    </div>
  );
}

export function ExportComposition() {
  const frame = useCurrentFrame();
  const headerOp = ease(frame, 0, 14);

  // progress bar 0 → 100% over frames 12–70
  const progress = interpolate(frame, [12, 70], [0, 100], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const progressOp = ease(frame, 8, 20);
  // fade out progress bar once done
  const progressFadeOut = interpolate(frame, [74, 86], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#ffffff", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: headerOp }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: 4, background: "#10b981" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.09em", fontFamily: "system-ui, sans-serif", textTransform: "uppercase" }}>
            Export
          </span>
        </div>
        <Sequence from={72} layout="none">
          <div style={{ display: "flex", alignItems: "center", gap: 4, opacity: ease(frame, 0, 10) }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 8, color: "#fff" }}>✓</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", fontFamily: "system-ui, sans-serif" }}>Abgeschlossen</span>
          </div>
        </Sequence>
      </div>

      {/* Progress bar */}
      <div style={{ opacity: progressOp * progressFadeOut }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "system-ui, sans-serif" }}>Wird generiert…</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#111827", fontFamily: "system-ui, sans-serif" }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "#f3f4f6", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, borderRadius: 3, background: "linear-gradient(to right, #6366f1, #10b981)" }} />
        </div>
      </div>

      {/* Files */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <Sequence from={86} layout="none">
          <ExportFile {...EXPORT_FILES[0]} delay={0} />
        </Sequence>
        <Sequence from={110} layout="none">
          <ExportFile {...EXPORT_FILES[1]} delay={0} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
}
