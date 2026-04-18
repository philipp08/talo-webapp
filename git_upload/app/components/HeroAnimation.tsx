"use client";

import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BARS = [
  { value: 55, label: "Nov" },
  { value: 72, label: "Dez" },
  { value: 40, label: "Jan" },
  { value: 88, label: "Feb" },
  { value: 65, label: "Mär" },
  { value: 92, label: "Apr" },
];

const C = {
  bg: "#f5f5f7",
  card: "#ffffff",
  border: "rgba(0,0,0,0.07)",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  barActive: "#6366f1",
  barMuted: "#e8e8f8",
  green: "#10b981",
  indigo: "#6366f1",
};

const ease = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

function StatCard({ label, value, accent, delay }: {
  label: string; value: string; accent?: string; delay: number;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 22);
  const y = interpolate(frame, [delay, delay + 26], [12, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      flex: 1, background: C.card, borderRadius: 14, padding: "14px 18px",
      border: `1px solid ${C.border}`, opacity: op, transform: `translateY(${y}px)`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <p style={{ fontSize: 10, color: C.textMuted, fontFamily: "system-ui, sans-serif",
        margin: 0, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.11em" }}>
        {label}
      </p>
      <p style={{ fontSize: 26, fontWeight: 700, color: accent || C.textPrimary,
        fontFamily: "system-ui, sans-serif", margin: 0, letterSpacing: "-0.03em" }}>
        {value}
      </p>
    </div>
  );
}

function BarChart() {
  const frame = useCurrentFrame();
  const CHART_H = 68;

  return (
    <div style={{
      background: C.card, borderRadius: 14, padding: "16px 20px",
      border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 10, color: C.textMuted, fontFamily: "system-ui, sans-serif",
          margin: 0, textTransform: "uppercase", letterSpacing: "0.11em" }}>
          Aktivität · 6 Monate
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: C.green }} />
          <span style={{ fontSize: 9, color: C.green, fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>
            +14% ↑
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: CHART_H + 16 }}>
        {BARS.map((bar, i) => {
          const progress = ease(frame, 18 + i * 9, 48 + i * 9);
          const barH = (bar.value / 100) * CHART_H * progress;
          const isLast = i === BARS.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
              <div style={{
                width: "100%", height: barH, borderRadius: 5,
                background: isLast
                  ? "linear-gradient(to top, #6366f1, #818cf8)"
                  : C.barMuted,
              }} />
              <span style={{ fontSize: 9, fontFamily: "system-ui, sans-serif",
                color: isLast ? C.indigo : C.textMuted,
                fontWeight: isLast ? 700 : 400,
              }}>{bar.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotifCard({ icon, title, sub, color, delay }: {
  icon: string; title: string; sub: string; color: string; delay: number;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 18);
  const x = interpolate(frame, [delay, delay + 22], [16, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      background: C.card, borderRadius: 10, padding: "9px 14px",
      border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10,
      opacity: op, transform: `translateX(${x}px)`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7, background: color + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary,
          fontFamily: "system-ui, sans-serif", margin: 0, marginBottom: 1 }}>{title}</p>
        <p style={{ fontSize: 10, color: C.textSecondary,
          fontFamily: "system-ui, sans-serif", margin: 0 }}>{sub}</p>
      </div>
      <div style={{ width: 6, height: 6, borderRadius: 3, background: color, flexShrink: 0 }} />
    </div>
  );
}

export function TALODashboard() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOp = ease(frame, 0, 16);

  const memberCount = Math.round(interpolate(frame, [12, 62], [0, 238], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));

  const pointsCount = Math.round(interpolate(frame, [20, 70], [0, 12450], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));

  return (
    <AbsoluteFill style={{
      background: C.bg, padding: 24, display: "flex",
      flexDirection: "column", gap: 10, opacity: containerOp,
    }}>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8,
        background: C.card, borderRadius: 12, padding: "10px 16px",
        border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: C.green }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: C.textSecondary,
          letterSpacing: "0.07em", fontFamily: "system-ui, sans-serif",
          textTransform: "uppercase" }}>TALO Dashboard</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "system-ui, sans-serif" }}>
          Live · Apr 2026
        </span>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: "#6366f120",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11 }}>👤</div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 10 }}>
        <StatCard label="Mitglieder" value={String(memberCount)} delay={10} />
        <StatCard label="Punkte vergeben"
          value={pointsCount.toLocaleString("de-DE")}
          accent={C.indigo} delay={18} />
        <StatCard label="Offene Anträge" value="3" delay={26} />
      </div>

      {/* Bar chart */}
      <Sequence from={8} layout="none">
        <BarChart />
      </Sequence>

      {/* Notifications */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <Sequence from={105} layout="none">
          <NotifCard icon="✓" title="Antrag genehmigt"
            sub="Zeltlager 2026 · eben" color={C.green} delay={0} />
        </Sequence>
        <Sequence from={128} layout="none">
          <NotifCard icon="★" title="25 Punkte vergeben"
            sub="Max Müller · vor 2 Min." color={C.indigo} delay={0} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
}
