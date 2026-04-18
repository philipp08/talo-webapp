"use client";

import { useRef, useEffect } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { ActivityFeedComposition, LeaderboardComposition } from "./MiniAnimations";

function AutoPlayer({
  component, width, height, fps, duration, style,
}: {
  component: React.ComponentType;
  width: number;
  height: number;
  fps: number;
  duration: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<PlayerRef>(null);
  useEffect(() => { ref.current?.play(); }, []);

  return (
    <Player
      ref={ref}
      component={component}
      compositionWidth={width}
      compositionHeight={height}
      fps={fps}
      durationInFrames={duration}
      style={{ width: "100%", display: "block", ...style }}
      loop
    />
  );
}

export function ActivityFeedPlayer() {
  return (
    <AutoPlayer
      component={ActivityFeedComposition}
      width={800}
      height={220}
      fps={30}
      duration={180}
    />
  );
}

export function LeaderboardPlayer() {
  return (
    <AutoPlayer
      component={LeaderboardComposition}
      width={440}
      height={200}
      fps={30}
      duration={160}
    />
  );
}
