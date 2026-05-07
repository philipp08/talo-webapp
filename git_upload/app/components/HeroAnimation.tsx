"use client";

import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

// ─── Exact design tokens from the real TALO dashboard ────────────────────────
const C = {
  bg:          "#080808",
  sidebar:     "#0C0C0C",
  card:        "#0C0C0C",
  border:      "rgba(255,255,255,0.05)",
  borderSub:   "rgba(255,255,255,0.04)",
  text:        "#FFFFFF",
  textSub:     "#8A8A8A",
  textMuted:   "#555555",
  textDark:    "#383838",
  green:       "#34C759",
  orange:      "#FF9500",
  pink:        "#E87AA0",
  font:        "'Poppins', system-ui, sans-serif",
};

// ─── Animation helpers ────────────────────────────────────────────────────────
const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const slideY = (frame: number, from: number, dist = 16) =>
  interpolate(frame, [from, from + 28], [dist, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const slideX = (frame: number, from: number, dist = -10) =>
  interpolate(frame, [from, from + 22], [dist, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",           active: true  },
  { label: "Eintragen",           active: false },
  { label: "Genehmigungen",       active: false },
  { label: "Mitgliederverwaltung",active: false },
  { label: "Tätigkeiten",         active: false },
  { label: "Ankündigungen",       active: false },
  { label: "Einstellungen",       active: false },
];

function Sidebar() {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 18], [-160, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{
      width: 158,
      flexShrink: 0,
      background: C.sidebar,
      borderRight: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      transform: `translateX(${x}px)`,
    }}>
      {/* Logo */}
      <div style={{ padding: "14px 14px 12px", borderBottom: `1px solid ${C.border}` }}>
        <Img
          src={staticFile("talo-logo.png")}
          style={{ width: 96, height: 28, objectFit: "contain", objectPosition: "left center", display: "block" }}
        />
        <p style={{ margin: "3px 0 0", fontSize: 7, color: C.textMuted, fontFamily: C.font, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          CONSOLE
        </p>
      </div>

      {/* Section label */}
      <p style={{ margin: "12px 14px 5px", fontSize: 7, color: C.textMuted, fontFamily: C.font, letterSpacing: "0.18em", textTransform: "uppercase" }}>
        HAUPTMENÜ
      </p>

      {/* Nav items */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, padding: "0 8px" }}>
        {NAV_ITEMS.map((item, i) => {
          const op = ease(frame, 5 + i * 3, 20 + i * 3);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 8px", borderRadius: 9,
              background: item.active ? "rgba(255,255,255,0.05)" : "transparent",
              borderLeft: `2px solid ${item.active ? C.text : "transparent"}`,
              opacity: op,
            }}>
              <span style={{
                fontSize: 10, fontFamily: C.font,
                color: item.active ? C.text : C.textMuted,
                fontWeight: item.active ? 600 : 400,
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* User */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 8px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 8px" }}>
          <div style={{
            width: 26, height: 26, borderRadius: 13,
            background: "rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 8, fontWeight: 800, color: C.text, fontFamily: C.font }}>PP</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 9.5, fontWeight: 600, color: C.text, fontFamily: C.font }}>Philipp Pauli</p>
            <p style={{ margin: 0, fontSize: 7, color: C.textMuted, fontFamily: C.font, letterSpacing: "0.08em" }}>ADMIN ●</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px" }}>
          <span style={{ fontSize: 8.5, color: C.textMuted, fontFamily: C.font, letterSpacing: "0.1em" }}>AUSLOGGEN</span>
          <span style={{ fontSize: 9, color: C.textMuted }}>→</span>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card (matches real dashboard StatCard exactly) ──────────────────────
function StatCard({ label, value, color, subtext, delay, Icon }: {
  label: string; value: string; color: string; subtext: string; delay: number;
  Icon: React.FC<{ size: number; color: string }>;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 20);
  const y  = slideY(frame, delay);

  return (
    <div style={{
      flex: 1,
      padding: "14px 14px 13px",
      borderRadius: 22,
      background: C.card,
      border: `1px solid ${C.border}`,
      position: "relative",
      overflow: "hidden",
      opacity: op,
      transform: `translateY(${y}px)`,
    }}>
      {/* Glow blob — top-right, matching real app */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: color + "10",
        filter: "blur(30px)",
        pointerEvents: "none",
      }} />

      {/* Icon container */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: color + "12",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 10, position: "relative", zIndex: 1,
      }}>
        <Icon size={17} color={color} />
      </div>

      {/* Value */}
      <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.text, fontFamily: C.font, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4, position: "relative", zIndex: 1 }}>
        {value}
      </p>
      {/* Label */}
      <p style={{ margin: 0, fontSize: 7.5, fontWeight: 900, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 4, position: "relative", zIndex: 1 }}>
        {label}
      </p>
      {/* Subtext */}
      <p style={{ margin: 0, fontSize: 8, fontWeight: 700, color: C.textDark, fontFamily: C.font, position: "relative", zIndex: 1 }}>
        {subtext}
      </p>
    </div>
  );
}

// ─── Inline SVG icons (replaces Lucide, no external deps in Remotion) ─────────
const CheckCircleIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const ClockIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const ZapIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const BarChart3Icon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const CalendarIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const ChevronRightIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ArrowUpRightIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
  </svg>
);
const PenLineIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);
const MegaphoneIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l19-9v18L3 11z" /><path d="M11 11v7a2 2 0 0 1-4 0v-7" />
  </svg>
);
const BellIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// ─── TCatBadge (matches real NativeUI.tsx logic) ──────────────────────────────
const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "rgba(232,122,160,0.15)", text: "#E87AA0" },
  B: { bg: "rgba(255,255,255,0.08)",  text: "#FFFFFF" },
  C: { bg: "rgba(52,199,89,0.15)",    text: "#34C759" },
  S: { bg: "rgba(255,149,0,0.15)",    text: "#FF9500" },
};
function CatBadge({ cat }: { cat: string }) {
  const c = CAT_COLORS[cat] ?? CAT_COLORS.B;
  return (
    <div style={{
      width: 38, height: 38, borderRadius: 19,
      background: c.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 13, fontWeight: 800, color: c.text, fontFamily: C.font }}>{cat}</span>
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────
function ActivityRow({ cat, name, date, status, points, delay }: {
  cat: string; name: string; date: string; status: string; points: string; delay: number;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 16);
  const x  = slideX(frame, delay, -8);

  const statusColor = status === "Genehmigt" ? C.green : status === "Ausstehend" ? C.orange : "#FF453A";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
      borderRadius: 20,
      background: C.card,
      border: `1px solid ${C.borderSub}`,
      opacity: op, transform: `translateX(${x}px)`,
    }}>
      <CatBadge cat={cat} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: C.text, fontFamily: C.font }}>
          {name}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <CalendarIcon size={10} color={C.textMuted} />
          <span style={{ fontSize: 9.5, color: C.textSub, fontFamily: C.font }}>{date}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Status badge — exact from TStatusBadge */}
        <div style={{ padding: "3px 10px", borderRadius: 20, background: statusColor + "18" }}>
          <span style={{ fontSize: 8.5, fontWeight: 700, color: statusColor, fontFamily: C.font }}>{status}</span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 900, color: C.text, fontFamily: "'Courier New', monospace" }}>
          +{points}
        </span>
        <ChevronRightIcon size={14} color={C.textDark} />
      </div>
    </div>
  );
}

// ─── Announcement Card ────────────────────────────────────────────────────────
function AnnCard({ author, msg, date, pinned, delay }: {
  author: string; msg: string; date: string; pinned?: boolean; delay: number;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 16);
  return (
    <div style={{
      padding: "10px 12px",
      borderRadius: 18,
      background: pinned ? "rgba(232,122,160,0.06)" : "rgba(255,255,255,0.02)",
      border: pinned ? "1px solid rgba(232,122,160,0.2)" : `1px solid ${C.borderSub}`,
      display: "flex", flexDirection: "column", gap: 4,
      opacity: op,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <MegaphoneIcon size={10} color={pinned ? C.pink : C.textMuted} />
        <span style={{ fontSize: 10, fontWeight: 700, color: pinned ? C.pink : C.textSub, fontFamily: C.font }}>
          {author}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 11.5, color: C.text, fontFamily: C.font, lineHeight: 1.4 }}>{msg}</p>
      <p style={{ margin: 0, fontSize: 9, color: C.textMuted, fontFamily: C.font }}>{date}</p>
    </div>
  );
}

// ─── Main Composition ─────────────────────────────────────────────────────────
export function TALODashboard() {
  const frame = useCurrentFrame();

  // Animated values
  const approved = interpolate(frame, [16, 55], [0, 13.0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const progressW = interpolate(frame, [50, 90], [0, 100], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const containerOp = ease(frame, 0, 10);
  const headerOp    = ease(frame, 6, 22);
  const headerY     = slideY(frame, 6, 10);

  return (
    // ⚠ CRITICAL: AbsoluteFill defaults to flexDirection:"column" — must override to "row"
    <AbsoluteFill style={{
      background: C.bg,
      flexDirection: "row",   // ← sidebar + main side-by-side
      opacity: containerOp,
    }}>

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Content area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "row", overflow: "hidden" }}>

        {/* ── Center column ── */}
        <div style={{
          flex: 1,
          padding: "18px 16px 18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          overflow: "hidden",
          minWidth: 0,
        }}>

          {/* Page header */}
          <div style={{
            paddingBottom: 12,
            borderBottom: `1px solid rgba(255,255,255,0.05)`,
            opacity: headerOp,
            transform: `translateY(${headerY}px)`,
          }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: C.text, fontFamily: C.font, letterSpacing: "-0.03em", lineHeight: 1 }}>
              Dashboard
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 9, fontWeight: 700, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.2em" }}>
              TTF RASTATT · Dein Überblick
            </p>
          </div>

          {/* Stat cards grid */}
          <div style={{ display: "flex", gap: 8 }}>
            <StatCard label="Bestätigte Punkte" value={approved.toFixed(1)} color={C.green}      subtext="Erfolgreich verbucht"     delay={16} Icon={CheckCircleIcon} />
            <StatCard label="Warteschlange"      value="0.0"                 color={C.orange}     subtext="In Prüfung"               delay={24} Icon={ClockIcon}       />
            <StatCard label="Soll-Erfüllung"     value="100%"                color={C.text}       subtext="0.0 Pkt. verbleibend"     delay={32} Icon={ZapIcon}         />
            <StatCard label="Jahresziel"         value="13.0"                color={C.pink}       subtext="Ziel 2026"                delay={40} Icon={BarChart3Icon}   />
          </div>

          {/* Progress bar */}
          <div style={{ opacity: ease(frame, 48, 62), display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                Fortschritt
              </span>
              <span style={{ fontSize: 9, fontWeight: 900, color: C.green, fontFamily: C.font }}>
                {Math.round(progressW)}%
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
              <div style={{ height: "100%", width: `${progressW}%`, borderRadius: 3, background: C.green }} />
            </div>
          </div>

          {/* Activity log */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {/* Header */}
            <Sequence from={60} layout="none">
              <div style={{
                display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                paddingBottom: 10,
                borderBottom: `1px solid rgba(255,255,255,0.05)`,
                marginBottom: 8,
                opacity: ease(frame, 0, 12),
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.font }}>
                    Aktivitätsverlauf
                  </h2>
                  <p style={{ margin: "2px 0 0", fontSize: 8, fontWeight: 900, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                    Deine letzten 10 Einträge
                  </p>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "4px 10px", borderRadius: 20,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  <span style={{ fontSize: 8, fontWeight: 900, color: C.textSub, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Genehmigungen
                  </span>
                  <ArrowUpRightIcon size={10} color={C.textSub} />
                </div>
              </div>
            </Sequence>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Sequence from={74} layout="none">
                <ActivityRow cat="A" name="Event-Organisation" date="27. März 2026" status="Genehmigt" points="6.0" delay={0} />
              </Sequence>
              <Sequence from={94} layout="none">
                <ActivityRow cat="C" name="Materialtransport"  date="26. März 2026" status="Genehmigt" points="1.0" delay={0} />
              </Sequence>
              <Sequence from={112} layout="none">
                <ActivityRow cat="A" name="Event-Organisation" date="22. März 2026" status="Genehmigt" points="6.0" delay={0} />
              </Sequence>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={{
          width: 246,
          flexShrink: 0,
          padding: "18px 14px 18px 0",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>

          {/* Quick Actions */}
          <Sequence from={22} layout="none">
            <div style={{ opacity: ease(frame, 0, 16) }}>
              {/* Section heading with bottom border */}
              <div style={{ paddingBottom: 10, marginBottom: 12, borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                <p style={{ margin: 0, fontSize: 8.5, fontWeight: 900, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.3em" }}>
                  Quick Actions
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* EINTRAGEN — white card */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 14px",
                  borderRadius: 22,
                  background: "#FFFFFF",
                  boxShadow: "0 8px 24px rgba(255,255,255,0.06)",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "#000000",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <PenLineIcon size={17} color="#FFFFFF" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "#080808", fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.02em" }}>Eintragen</p>
                    <p style={{ margin: 0, fontSize: 8, fontWeight: 700, color: "rgba(0,0,0,0.4)", fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.15em" }}>Tätigkeit erfassen</p>
                  </div>
                </div>

                {/* Ankündigungen — dark card */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 14px",
                  borderRadius: 22,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <MegaphoneIcon size={17} color={C.text} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text, fontFamily: C.font }}>Ankündigungen</p>
                    <p style={{ margin: 0, fontSize: 8.5, fontWeight: 700, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.15em" }}>3 Einträge</p>
                  </div>
                </div>
              </div>
            </div>
          </Sequence>

          {/* Letzte Ankündigungen */}
          <div style={{ opacity: ease(frame, 52, 68), flex: 1 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingBottom: 10, marginBottom: 10,
              borderBottom: `1px solid rgba(255,255,255,0.05)`,
            }}>
              <p style={{ margin: 0, fontSize: 8.5, fontWeight: 900, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.3em" }}>
                Letzte Ankündigungen
              </p>
              <BellIcon size={12} color={C.textDark} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <AnnCard author="Philipp Pauli" msg="test"        date="06. Apr" delay={56} />
              <AnnCard author="Philipp Pauli" msg="t"           date="30. März" delay={70} />
              <AnnCard author="Philipp Pauli" msg="Willkommen!" date="28. März" delay={84} pinned />
            </div>
          </div>

        </div>
      </div>
    </AbsoluteFill>
  );
}
