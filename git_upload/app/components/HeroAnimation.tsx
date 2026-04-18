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
  { value: 65, label: "Nov" },
  { value: 80, label: "Dez" },
  { value: 45, label: "Jan" },
  { value: 90, label: "Feb" },
  { value: 72, label: "Mär" },
  { value: 88, label: "Apr" },
];

const ease = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

function StatCard({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  const frame = useCurrentFrame();
  const opacity = ease(frame, delay, delay + 20);
  const y = interpolate(frame, [delay, delay + 25], [10, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        background: "#161616",
        borderRadius: 12,
        padding: "14px 18px",
        border: "1px solid #222",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <p
        style={{
          fontSize: 10,
          color: "#555",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 26,
          fontWeight: 600,
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function BarChart() {
  const frame = useCurrentFrame();
  const CHART_HEIGHT = 72;

  return (
    <div
      style={{
        background: "#161616",
        borderRadius: 14,
        padding: "18px 22px",
        border: "1px solid #222",
      }}
    >
      <p
        style={{
          fontSize: 10,
          color: "#555",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          marginBottom: 14,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        Aktivität · Letzte 6 Monate
      </p>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
          height: CHART_HEIGHT + 18,
        }}
      >
        {BARS.map((bar, i) => {
          const progress = ease(frame, 20 + i * 10, 50 + i * 10);
          const barHeight = (bar.value / 100) * CHART_HEIGHT * progress;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: barHeight,
                  background:
                    i === BARS.length - 1
                      ? "linear-gradient(to top, #6366f1, #818cf8)"
                      : "#262626",
                  borderRadius: 4,
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  color: i === BARS.length - 1 ? "#818cf8" : "#444",
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: i === BARS.length - 1 ? 600 : 400,
                }}
              >
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotificationCard({
  icon,
  title,
  sub,
  accentColor,
  delay,
}: {
  icon: string;
  title: string;
  sub: string;
  accentColor: string;
  delay: number;
}) {
  const frame = useCurrentFrame();
  const opacity = ease(frame, delay, delay + 18);
  const y = interpolate(frame, [delay, delay + 22], [16, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        background: "#161616",
        borderRadius: 10,
        padding: "10px 14px",
        border: "1px solid #222",
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: accentColor + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#e5e5e5",
            fontFamily: "system-ui, sans-serif",
            margin: 0,
            marginBottom: 2,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: 10,
            color: "#555",
            fontFamily: "system-ui, sans-serif",
            margin: 0,
          }}
        >
          {sub}
        </p>
      </div>
      <div
        style={{
          marginLeft: "auto",
          width: 6,
          height: 6,
          borderRadius: 3,
          background: accentColor,
          flexShrink: 0,
        }}
      />
    </div>
  );
}

export function TALODashboard() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = ease(frame, 0, 18);

  const memberCount = Math.round(
    interpolate(frame, [15, 65], [0, 238], {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const pointsCount = Math.round(
    interpolate(frame, [25, 75], [0, 12450], {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const headerOpacity = ease(frame, 0, 15);

  return (
    <AbsoluteFill
      style={{
        background: "#0d0d0d",
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: containerOpacity,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
          opacity: headerOpacity,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            background: "#10b981",
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#888",
            letterSpacing: "0.06em",
            fontFamily: "system-ui, sans-serif",
            textTransform: "uppercase",
          }}
        >
          TALO Dashboard
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "#444",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Live · Apr 2026
        </span>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 10 }}>
        <StatCard
          label="Mitglieder"
          value={String(memberCount)}
          delay={12}
        />
        <StatCard
          label="Punkte vergeben"
          value={pointsCount.toLocaleString("de-DE")}
          delay={20}
        />
        <StatCard label="Offene Anträge" value="3" delay={28} />
      </div>

      {/* Bar chart */}
      <Sequence from={10} layout="none" >
        <BarChart />
      </Sequence>

      {/* Activity feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Sequence from={110} layout="none" >
          <NotificationCard
            icon="✓"
            title="Antrag genehmigt"
            sub="Zeltlager 2026 · eben"
            accentColor="#10b981"
            delay={0}
          />
        </Sequence>
        <Sequence from={130} layout="none" >
          <NotificationCard
            icon="↑"
            title="25 Punkte vergeben"
            sub="Max Müller · vor 2 Min."
            accentColor="#6366f1"
            delay={0}
          />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
}
