"use client";

import { useRef, useEffect } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { TALODashboard } from "./HeroAnimation";

export function HeroAnimationPlayer() {
  const ref = useRef<PlayerRef>(null);

  useEffect(() => {
    ref.current?.play();
  }, []);

  return (
    <Player
      ref={ref}
      component={TALODashboard}
      durationInFrames={200}
      fps={30}
      compositionWidth={960}
      compositionHeight={540}
      style={{ width: "100%", display: "block", borderRadius: 16 }}
      loop
    />
  );
}
