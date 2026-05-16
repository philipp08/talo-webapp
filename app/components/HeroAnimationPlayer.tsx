"use client";

import { useRef, useEffect } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { TALODashboard } from "./HeroAnimation";

export function HeroAnimationPlayer() {
  const ref = useRef<PlayerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.play();
        } else {
          ref.current?.pause();
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
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
    </div>
  );
}
