"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ZoomHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress within this container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Transform values for the zoom effect
  // We scale the media from 0.8 to 1.0 (or vice versa for the "zoom-in" feel)
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.5], ["40px", "0px"]);
  const opacity = useTransform(scrollYProgress, [0.4, 0.6], [1, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.1, 0.4], [40, 0]);

  return (
    <div ref={containerRef} className="relative h-[250vh] bg-white dark:bg-[#080808]">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden px-5 md:px-10 lg:px-20">
        
        {/* The Media Container (Zooming Part) */}
        <motion.div 
          style={{ 
            scale,
            borderRadius,
          }}
          className="relative w-full h-[80vh] md:h-[85vh] overflow-hidden bg-gray-100 dark:bg-white/5 shadow-2xl transition-shadow"
        >
          {/* Background Image / Video */}
          <div className="absolute inset-0 w-full h-full">
             <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10" />
             <img 
               src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2564" 
               alt="Digital Abstract"
               className="w-full h-full object-cover"
             />
          </div>

          {/* Text Overlay (Visible after zoom starts) */}
          <motion.div 
            style={{ opacity: textOpacity, y: textY }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6"
          >
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-logo font-medium tracking-tight text-white mb-6">
              So neu. <span className="opacity-60">So Talo.</span>
            </h2>
            <p className="text-lg md:text-2xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
              Talo kommt mit einem neuen und doch vertrauten Look. <br />
              Die bisher beeindruckendste Version für eure Vereinsarbeit.
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Scrollen zum Entdecken</span>
          <div className="w-px h-12 bg-gray-200 dark:bg-white/10" />
        </motion.div>
      </div>

      {/* Transitional text below (Apple style) */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 py-32 lg:py-60">
         <div className="max-w-4xl">
            <h3 className="text-2xl md:text-4xl lg:text-5xl font-medium tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-12">
               Talo Liquid Glass bringt Klarheit in jeden Workflow. Mit intelligenten Agenten, nahtloser Synchronisation und maximaler Sicherheit ist es die Engineering-Workforce, die euer Verein verdient.
            </h3>
            <div className="flex flex-wrap gap-8">
               <div className="flex flex-col gap-2">
                  <span className="text-5xl font-medium text-gray-900 dark:text-white">v2.0</span>
                  <span className="text-sm font-bold uppercase tracking-widest text-[#34C759]">Das grosse Update</span>
               </div>
               <div className="flex flex-col gap-2">
                  <span className="text-5xl font-medium text-gray-900 dark:text-white">10x</span>
                  <span className="text-sm font-bold uppercase tracking-widest text-[#3B82F6]">Mehr Produktivität</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
