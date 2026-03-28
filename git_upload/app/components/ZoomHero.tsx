"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

export default function ZoomHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Immersive scroll experience: longer container for a smoother "zoom-in"
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 1. CLIP-PATH EXPANSION (The "Window" effect)
  // Starts with inset(15% 15% 15% 15% rounded 48px)
  // Ends with inset(0% 0% 0% 0% rounded 0px)
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.45],
    [
      "inset(12% 12% 12% 12% round 48px)",
      "inset(0% 0% 0% 0% round 0px)"
    ]
  );
  
  // 2. TEXT ANIMATION (Headline Super)
  // Fades in and scales as the zoom progresses
  const textOpacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);
  const textScale = useTransform(scrollYProgress, [0.15, 0.4], [0.9, 1]);
  const textY = useTransform(scrollYProgress, [0.15, 0.4], [40, 0]);

  // 3. BACKGROUND MEDIA SCALE (Subtle internal zoom)
  const mediaScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-white dark:bg-[#080808]">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* Immersive Media Container */}
        <motion.div 
          style={{ clipPath }}
          className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center"
        >
          {/* Background Media (Liquid Glass Vibe) */}
          <motion.div 
            style={{ scale: mediaScale }}
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img 
              src="https://images.unsplash.com/photo-1620121692029-d088224efc74?auto=format&fit=crop&q=80&w=2832" 
              alt="Liquid Glass Background"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Headline Super Overlay */}
          <motion.div 
            style={{ opacity: textOpacity, scale: textScale, y: textY }}
            className="relative z-20 text-center px-10"
          >
            <span className="text-sm font-black uppercase tracking-[0.3em] text-white/50 mb-6 block">Talo Liquid Glass</span>
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-logo font-medium tracking-tight text-white mb-6 leading-[0.9]">
              So neu. <span className="opacity-60 block">So Talo.</span>
            </h2>
          </motion.div>

          {/* Bottom Indicators */}
          <motion.div 
            style={{ opacity: useTransform(scrollYProgress, [0.4, 0.45], [0, 1]) }}
            className="absolute bottom-20 left-10 md:left-20 z-30 flex flex-col gap-1"
          >
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">macOS Pro</span>
             <span className="text-lg font-bold text-white">Präzision in jeder Zeile.</span>
          </motion.div>
        </motion.div>

        {/* Scroll Instruction */}
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-40"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Scrollen zum Entdecken</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-gray-200 to-transparent dark:from-white/20" />
        </motion.div>
      </div>

      {/* Intro Description (The Section Header Description) */}
      <section className="relative z-10 py-40 md:py-60 lg:py-80 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-20 gap-10">
           <div className="md:col-start-3 md:col-span-12 lg:col-start-4 lg:col-span-10">
              <ScrollReveal direction="up" duration={1}>
                 <p className="text-2xl md:text-3xl lg:text-[2.75rem] font-medium tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-12">
                   Talo Liquid Glass kommt mit einem <span className="text-gray-400 dark:text-white/40">neuen und doch vertrauten Look.</span> Mit vielen Möglichkeiten, produktiver zu sein, nahtlos mit Euren Mobilen Apps zusammenzuarbeiten und maximale Sicherheit herauszuholen.
                 </p>
                 <div className="flex border-t border-gray-100 dark:border-white/5 pt-12 items-center gap-10">
                    <div className="flex flex-col gap-2">
                       <span className="text-4xl lg:text-5xl font-medium text-gray-900 dark:text-white">v2.0</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#34C759]">Das große Update</span>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-4xl lg:text-5xl font-medium text-gray-900 dark:text-white">10x</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6]">Mehr Effizienz</span>
                    </div>
                 </div>
              </ScrollReveal>
           </div>
        </div>
      </section>
    </div>
  );
}
