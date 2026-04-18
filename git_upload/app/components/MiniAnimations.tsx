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

/* ─── Activity Feed ──────────────────────────────────────────────── */

const ACTIVITIES = [
  { initial: "M", name: "Maria Schmidt", action: "20 Punkte erhalten", time: "eben", color: "#6366f1" },
  { initial: "A", name: "Antrag #42", action: "Zeltlager genehmigt", time: "vor 1 Min.", color: "#10b981" },
  { initial: "T", name: "Tim Kowalski", action: "Neu beigetreten", time: "vor 3 Min.", color: "#3b82f6" },
  { initial: "K", name: "Kassenprüfung", action: "Dokument geprüft", time: "vor 5 Min.", color: "#f59e0b" },
];

function ActivityRow({
  initial, name, action, time, color, delay,
}: {
  initial: string; name: string; action: string; time: string; color: string; delay: number;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 20);
  const x = interpolate(frame, [delay, delay + 24], [24, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
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
        <p style={{ fontSize: 12, fontWeight: 600, color: "#111827",
          fontFamily: "system-ui, sans-serif", margin: 0, marginBottom: 1 }}>
          {name}
        </p>
        <p style={{ fontSize: 11, color: "#6b7280",
          fontFamily: "system-ui, sans-serif", margin: 0 }}>
          {action}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
        <span style={{ fontSize: 10, color: "#9ca3af",
          fontFamily: "system-ui, sans-serif" }}>{time}</span>
      </div>
    </div>
  );
}

export function ActivityFeedComposition() {
  const frame = useCurrentFrame();
  const headerOp = ease(frame, 0, 14);

  return (
    <AbsoluteFill style={{
      background: "#ffffff", padding: "18px 20px",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 6, opacity: headerOp,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: 4, background: "#10b981" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280",
            letterSpacing: "0.09em", fontFamily: "system-ui, sans-serif",
            textTransform: "uppercase" }}>Live Aktivitäten</span>
        </div>
        <span style={{ fontSize: 10, color: "#d1d5db",
          fontFamily: "system-ui, sans-serif" }}>Heute</span>
      </div>

      {/* Rows */}
      <Sequence from={12} layout="none">
        <ActivityRow {...ACTIVITIES[0]} delay={0} />
      </Sequence>
      <Sequence from={38} layout="none">
        <ActivityRow {...ACTIVITIES[1]} delay={0} />
      </Sequence>
      <Sequence from={64} layout="none">
        <ActivityRow {...ACTIVITIES[2]} delay={0} />
      </Sequence>
      <Sequence from={90} layout="none">
        <ActivityRow {...ACTIVITIES[3]} delay={0} />
      </Sequence>
    </AbsoluteFill>
  );
}

/* ─── Leaderboard ────────────────────────────────────────────────── */

const MEMBERS = [
  { rank: 1, initial: "L", name: "Lisa K.", points: 2840, pct: 100, color: "#f59e0b" },
  { rank: 2, initial: "M", name: "Max M.", points: 2120, pct: 75, color: "#9ca3af" },
  { rank: 3, initial: "T", name: "Tim B.", points: 1680, pct: 59, color: "#cd7c2f" },
];

const RANK_ICONS = ["🥇", "🥈", "🥉"];

function LeaderRow({
  rank, initial, name, points, pct, color, delay,
}: {
  rank: number; initial: string; name: string;
  points: number; pct: number; color: string; delay: number;
}) {
  const frame = useCurrentFrame();
  const op = ease(frame, delay, delay + 20);
  const barProgress = ease(frame, delay + 8, delay + 45);
  const barWidth = pct * barProgress;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 0", opacity: op,
    }}>
      <span style={{ fontSize: 14, width: 20, textAlign: "center",
        flexShrink: 0 }}>{RANK_ICONS[rank - 1]}</span>
      <div style={{
        width: 28, height: 28, borderRadius: 9, background: color + "20",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color, fontFamily: "system-ui, sans-serif",
        flexShrink: 0,
      }}>{initial}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#111827",
            fontFamily: "system-ui, sans-serif" }}>{name}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color,
            fontFamily: "system-ui, sans-serif", letterSpacing: "-0.02em" }}>
            {points.toLocaleString("de-DE")}
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: "#f3f4f6", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${barWidth}%`, borderRadius: 3,
            background: `linear-gradient(to right, ${color}80, ${color})`,
          }} />
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
    <AbsoluteFill style={{
      background: "#ffffff", padding: "16px 18px",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 10, opacity: headerOp,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280",
          letterSpacing: "0.09em", fontFamily: "system-ui, sans-serif",
          textTransform: "uppercase" }}>Top Mitglieder</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1",
          fontFamily: "system-ui, sans-serif", letterSpacing: "-0.01em" }}>
          {totalPoints.toLocaleString("de-DE")} Pkt.
        </span>
      </div>

      {/* Rows */}
      <Sequence from={10} layout="none">
        <LeaderRow {...MEMBERS[0]} delay={0} />
      </Sequence>
      <Sequence from={30} layout="none">
        <LeaderRow {...MEMBERS[1]} delay={0} />
      </Sequence>
      <Sequence from={50} layout="none">
        <LeaderRow {...MEMBERS[2]} delay={0} />
      </Sequence>
    </AbsoluteFill>
  );
}
