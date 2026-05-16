"use client";

import Image from "next/image";

export function HeroAnimationPlayer() {
  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl border-[10px] border-black bg-black shadow-2xl">
      <Image
        src="/dashboard-mockup.png"
        alt="TALO Dashboard Console Mockup"
        fill
        priority
        sizes="(max-w-7xl) 100vw, 1200px"
        className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.015]"
      />
    </div>
  );
}
