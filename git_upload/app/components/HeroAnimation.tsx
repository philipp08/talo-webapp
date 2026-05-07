"use client";

import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Exact design tokens from the real TALO dashboard
const C = {
  bg: "#080808",
  sidebar: "#0C0C0C",
  card: "#0C0C0C",
  cardInner: "#111111",
  border: "rgba(255,255,255,0.04)",
  borderHover: "rgba(255,255,255,0.1)",
  text: "#FFFFFF",
  textSub: "#8A8A8A",
  textMuted: "#555555",
  green: "#34C759",
  orange: "#FF9500",
  pink: "#E87AA0",
  red: "#FF453A",
  font: "'Poppins', 'Inter', system-ui, sans-serif",
};

const ease = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const slideY = (frame: number, start: number, dist = 14) =>
  interpolate(frame, [start, start + 26], [dist, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ── Sidebar ─────────────────────────────────────────────────────────────────
const NAV = [
  { icon: "⊞", label: "Dashboard", active: true },
  { icon: "✎", label: "Eintragen" },
  { icon: "☑", label: "Genehmigungen" },
  { icon: "◈", label: "Mitgliederverwaltung" },
  { icon: "☰", label: "Tätigkeiten" },
  { icon: "◎", label: "Ankündigungen" },
  { icon: "◎", label: "Einstellungen" },
];

function Sidebar() {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 20], [-175, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{
      width: 175,
      flexShrink: 0,
      background: C.sidebar,
      borderRight: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      transform: `translateX(${x}px)`,
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "rgba(255,255,255,0.06)",
            border: `1px solid rgba(255,255,255,0.1)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 13, color: C.text, fontFamily: C.font, fontWeight: 700 }}>T</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.text, fontFamily: C.font, letterSpacing: "0.08em" }}>TALO</p>
            <p style={{ margin: 0, fontSize: 7.5, color: C.textMuted, fontFamily: C.font, letterSpacing: "0.14em" }}>CONSOLE</p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <p style={{ margin: "14px 16px 6px", fontSize: 7.5, color: C.textMuted, fontFamily: C.font, letterSpacing: "0.16em", textTransform: "uppercase" }}>
        HAUPTMENÜ
      </p>

      {/* Nav items */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, padding: "0 8px" }}>
        {NAV.map((item, i) => {
          const op = ease(frame, 6 + i * 3, 22 + i * 3);
          const isActive = item.active;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "7px 10px", borderRadius: 10,
              background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
              borderLeft: `2px solid ${isActive ? C.text : "transparent"}`,
              opacity: op,
            }}>
              <span style={{ fontSize: 11, color: isActive ? C.text : C.textMuted, fontFamily: C.font, lineHeight: 1 }}>
                {item.icon}
              </span>
              <span style={{ fontSize: 10.5, fontFamily: C.font, color: isActive ? C.text : C.textMuted, fontWeight: isActive ? 600 : 400 }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* User profile */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 8px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 14,
            background: "rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.text, fontFamily: C.font }}>PP</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.text, fontFamily: C.font }}>Philipp Pauli</p>
            <p style={{ margin: 0, fontSize: 7.5, color: C.textMuted, fontFamily: C.font, letterSpacing: "0.08em" }}>ADMIN ●</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", marginTop: 1 }}>
          <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.font, letterSpacing: "0.1em" }}>AUSLOGGEN</span>
          <span style={{ fontSize: 10, color: C.textMuted, fontFamily: C.font }}>→</span>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, delay }: {
  label: string; value: string; sub: string; color: string; delay: number;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 20);
  const y = slideY(frame, delay);

  return (
    <div style={{
      flex: 1, background: C.card, borderRadius: 22, padding: "18px 18px 16px",
      border: `1px solid ${C.border}`, opacity: op, transform: `translateY(${y}px)`,
      position: "relative", overflow: "hidden",
    }}>
      {/* glow */}
      <div style={{
        position: "absolute", top: -20, left: -10,
        width: 70, height: 70, borderRadius: "50%",
        background: color + "18",
        filter: "blur(28px)",
        pointerEvents: "none",
      }} />
      {/* icon */}
      <div style={{
        width: 30, height: 30, borderRadius: 9,
        background: color + "16",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 13, color, lineHeight: 1 }}>
          {color === C.green ? "✓" : color === C.orange ? "⏱" : color === C.text ? "⚡" : "▮"}
        </span>
      </div>
      <p style={{ fontSize: 26, fontWeight: 700, color: C.text, fontFamily: C.font, margin: 0, letterSpacing: "-0.03em", marginBottom: 4 }}>
        {value}
      </p>
      <p style={{ fontSize: 8.5, color: C.textMuted, fontFamily: C.font, margin: 0, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 3 }}>
        {label}
      </p>
      <p style={{ fontSize: 8.5, color: C.textMuted, fontFamily: C.font, margin: 0 }}>
        {sub}
      </p>
    </div>
  );
}

// ── Activity Row ─────────────────────────────────────────────────────────────
function ActivityRow({ avatar, name, date, points, avatarColor, delay }: {
  avatar: string; name: string; date: string; points: string; avatarColor: string; delay: number;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 16);
  const x = interpolate(frame, [delay, delay + 20], [-10, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      background: C.card, borderRadius: 22, border: `1px solid ${C.border}`,
      opacity: op, transform: `translateX(${x}px)`,
    }}>
      {/* avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: 15,
        background: avatarColor + "26",
        border: `1px solid ${avatarColor}40`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: avatarColor, fontFamily: C.font }}>{avatar}</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 11.5, fontWeight: 500, color: C.text, fontFamily: C.font }}>{name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <span style={{ fontSize: 8.5, color: C.textMuted, fontFamily: C.font }}>📅 {date}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ padding: "2px 9px", borderRadius: 20, background: C.green + "1A" }}>
          <span style={{ fontSize: 8.5, color: C.green, fontFamily: C.font, fontWeight: 600 }}>Genehmigt</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: C.font }}>{points}</span>
        <span style={{ fontSize: 12, color: C.textMuted }}>›</span>
      </div>
    </div>
  );
}

// ── Announcement Card ────────────────────────────────────────────────────────
function AnnouncementCard({ author, msg, date, delay }: {
  author: string; msg: string; date: string; delay: number;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 16);
  return (
    <div style={{
      padding: "10px 12px",
      background: "rgba(255,255,255,0.02)",
      borderRadius: 14,
      border: `1px solid ${C.border}`,
      marginBottom: 5,
      opacity: op,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
        <span style={{ fontSize: 8, color: C.textMuted, fontFamily: C.font }}>◎</span>
        <span style={{ fontSize: 9.5, fontWeight: 500, color: C.textSub, fontFamily: C.font }}>{author}</span>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: C.text, fontFamily: C.font }}>{msg}</p>
      <p style={{ margin: "3px 0 0", fontSize: 8.5, color: C.textMuted, fontFamily: C.font }}>{date}</p>
    </div>
  );
}

// ── Main Composition ─────────────────────────────────────────────────────────
export function TALODashboard() {
  const frame = useCurrentFrame();

  const containerOp = ease(frame, 0, 10);

  const confirmedPts = interpolate(frame, [18, 58], [0, 13.0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const progressPct = interpolate(frame, [52, 88], [0, 100], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const headerOp = ease(frame, 8, 24);
  const headerY = slideY(frame, 8, 10);

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex", opacity: containerOp }}>
      <Sidebar />

      {/* Main + Right */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Center column ── */}
        <div style={{ flex: 1, padding: "20px 14px 20px 22px", display: "flex", flexDirection: "column", gap: 11, overflow: "hidden", minWidth: 0 }}>

          {/* Title */}
          <div style={{ opacity: headerOp, transform: `translateY(${headerY}px)` }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.text, fontFamily: C.font, letterSpacing: "-0.025em" }}>
              Dashboard
            </h1>
            <p style={{ margin: "1px 0 0", fontSize: 8.5, color: C.textMuted, fontFamily: C.font, letterSpacing: "0.15em" }}>
              TTF RASTATT · DEIN ÜBERBLICK
            </p>
          </div>

          {/* Stat cards */}
          <div style={{ display: "flex", gap: 8 }}>
            <StatCard label="Bestätigte Punkte" value={confirmedPts.toFixed(1)} sub="Erfolgreich verbucht" color={C.green} delay={18} />
            <StatCard label="Warteschlange" value="0.0" sub="In Prüfung" color={C.orange} delay={26} />
            <StatCard label="Soll-Erfüllung" value="100%" sub="0.0 Pkt. verbleibend" color={C.text} delay={34} />
            <StatCard label="Jahresziel" value="0.0" sub="Ziel 2026" color={C.pink} delay={42} />
          </div>

          {/* Progress bar */}
          <div style={{ opacity: ease(frame, 50, 64) }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 8.5, color: C.textMuted, fontFamily: C.font, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Fortschritt
              </span>
              <span style={{ fontSize: 8.5, color: C.green, fontFamily: C.font, fontWeight: 600 }}>
                {Math.round(progressPct)}%
              </span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: C.green, borderRadius: 3 }} />
            </div>
          </div>

          {/* Activity feed */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Sequence from={62} layout="none">
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8, opacity: ease(frame, 0, 14) }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text, fontFamily: C.font }}>Aktivitätsverlauf</p>
                  <p style={{ margin: 0, fontSize: 8, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Deine letzten 10 Einträge
                  </p>
                </div>
                <div style={{
                  padding: "4px 11px", borderRadius: 20,
                  border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontSize: 8.5, color: C.textSub, fontFamily: C.font, letterSpacing: "0.08em" }}>GENEHMIGUNGEN</span>
                  <span style={{ fontSize: 9, color: C.textMuted }}>↗</span>
                </div>
              </div>
            </Sequence>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Sequence from={76} layout="none">
                <ActivityRow avatar="A" name="Event-Organisation" date="27. März 2026" points="+6.0" avatarColor={C.pink} delay={0} />
              </Sequence>
              <Sequence from={98} layout="none">
                <ActivityRow avatar="C" name="Materialtransport" date="26. März 2026" points="+1.0" avatarColor={C.green} delay={0} />
              </Sequence>
              <Sequence from={118} layout="none">
                <ActivityRow avatar="A" name="Event-Organisation" date="22. März 2026" points="+6.0" avatarColor={C.pink} delay={0} />
              </Sequence>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={{ width: 232, flexShrink: 0, padding: "20px 16px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Quick Actions */}
          <Sequence from={26} layout="none">
            <div style={{ opacity: ease(frame, 0, 18) }}>
              <p style={{ margin: "0 0 8px", fontSize: 8.5, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.14em" }}>
                Quick Actions
              </p>
              {/* EINTRAGEN — white card */}
              <div style={{
                background: C.text, borderRadius: 22, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 12, marginBottom: 8,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "#111",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: 14 }}>✏️</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#080808", fontFamily: C.font, letterSpacing: "0.06em" }}>EINTRAGEN</p>
                  <p style={{ margin: 0, fontSize: 8, color: "#6b7280", fontFamily: C.font, letterSpacing: "0.1em" }}>TÄTIGKEIT ERFASSEN</p>
                </div>
              </div>
              {/* Ankündigungen — dark card */}
              <div style={{
                background: C.card, borderRadius: 22, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 12,
                border: `1px solid ${C.border}`,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: 14 }}>📢</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.text, fontFamily: C.font }}>Ankündigungen</p>
                  <p style={{ margin: 0, fontSize: 8.5, color: C.textMuted, fontFamily: C.font }}>3 Einträge</p>
                </div>
              </div>
            </div>
          </Sequence>

          {/* Letzte Ankündigungen */}
          <div style={{ opacity: ease(frame, 55, 72) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 8.5, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase", letterSpacing: "0.14em" }}>
                Letzte Ankündigungen
              </p>
              <span style={{ fontSize: 11, color: C.textMuted }}>🔔</span>
            </div>
            <AnnouncementCard author="Philipp Pauli" msg="test" date="06. Apr" delay={58} />
            <AnnouncementCard author="Philipp Pauli" msg="t" date="30. März" delay={72} />
            <AnnouncementCard author="Philipp Pauli" msg="Willkommen!" date="28. März" delay={86} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
