"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ZoomHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Immersive scroll experience: longer container for a smoother "zoom-in"
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 1. CLIP-PATH EXPANSION (Phase 1: 0 to 0.3)
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.3],
    [
      "inset(15% 15% 15% 15% round 48px)",
      "inset(0% 0% 0% 0% round 0px)"
    ]
  );
  
  // 2. SCROLLING CONTENT (Phase 2: 0.3 to 1.0)
  // Text element 1
  const text1Opacity = useTransform(scrollYProgress, [0.3, 0.45, 0.55], [0, 1, 0]);
  const text1Y = useTransform(scrollYProgress, [0.3, 0.45, 0.55], [100, 0, -100]);
  
  // Text element 2
  const text2Opacity = useTransform(scrollYProgress, [0.6, 0.75, 0.85], [0, 1, 0]);
  const text2Y = useTransform(scrollYProgress, [0.6, 0.75, 0.85], [100, 0, -100]);

  // Background Media Scale (Subtle internal zoom throughout)
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-white dark:bg-[#080808]">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* The Media Window */}
        <motion.div 
          style={{ clipPath }}
          className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center p-6 md:p-12 lg:p-20"
        >
          {/* Background Media */}
          <motion.div 
            style={{ scale: mediaScale }}
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img 
              src="https://images.unsplash.com/photo-1620121692029-d088224efc74?auto=format&fit=crop&q=80&w=2832" 
              alt="Liquid Glass Background"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Scrolling Content - Phase 2 */}
          <div className="relative z-20 w-full h-full max-w-4xl mx-auto flex items-center justify-center">
             
             {/* Slide 1 */}
             <motion.div 
               style={{ opacity: text1Opacity, y: text1Y }}
               className="absolute text-center"
             >
                <h2 className="text-4xl md:text-6xl lg:text-8xl font-logo font-medium tracking-tight text-white mb-6">
                   Talo Liquid Glass.
                </h2>
                <p className="text-lg md:text-2xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
                   Ein neues Erlebnis für Eure Vereinsverwaltung. <br />
                   Einfach, sicher und zutiefst modern.
                </p>
             </motion.div>

             {/* Slide 2 */}
             <motion.div 
               style={{ opacity: text2Opacity, y: text2Y }}
               className="absolute text-center"
             >
                <h2 className="text-4xl md:text-6xl lg:text-8xl font-logo font-medium tracking-tight text-white mb-6">
                   Engineering. <span className="opacity-40">Orchestriert.</span>
                </h2>
                <p className="text-lg md:text-2xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
                   Maximales Engagement durch intelligente Agenten. <br />
                   Der Verein der nächsten Ära startet hier.
                </p>
             </motion.div>
          </div>
        </motion.div>

        {/* Scroll Helper */}
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Scrollen zum Entdecken</span>
          <div className="w-px h-12 bg-gray-200 dark:bg-white/10" />
        </motion.div>
      </div>

      {/* Intro transition to Static Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-40 bg-white dark:bg-[#080808] border-t border-gray-100 dark:border-white/5">
         <div className="max-w-3xl">
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-8">
               Talo ist mehr als nur Software. Es ist die Engineering-Workforce, die euer Verein verdient. <span className="text-gray-400">Zertifiziert, sicher und bereit für die Zukunft.</span>
            </h3>
            <div className="flex gap-12">
               <div className="flex flex-col">
                  <span className="text-5xl font-medium text-gray-900 dark:text-white">v2.0</span>
                  <span className="text-[10px] uppercase font-black text-[#34C759] tracking-widest">Liquid Glass Edition</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
