"use client";

import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#080808] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-white/[0.03] blur-[160px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
      
      <div className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center">
        
        {/* Animated Icon Container */}
        <div className="relative mb-12 group">
          <div className="absolute inset-0 bg-white/10 blur-[40px] rounded-full scale-0 group-hover:scale-110 transition-transform duration-1000" />
          <div className="w-32 h-32 rounded-[40px] bg-white/[0.03] border border-white/10 flex items-center justify-center relative z-10 animate-float">
             <div className="text-6xl font-logo font-black text-white/20 tracking-tighter">404</div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black shadow-2xl animate-pulse-glow">
             <Sparkles size={20} />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-5xl md:text-7xl font-medium tracking-tighter text-white font-logo leading-tight mb-8">
           Verlaufen im<br /><span className="text-[#8A8A8A] italic">Engagement-Dschungel?</span>
        </h1>
        
        <p className="text-xl text-[#8A8A8A] font-medium leading-relaxed max-w-md mx-auto mb-16 px-4">
           Diese Seite existiert nicht oder wurde in einen anderen Vereinsbereich verschoben. Keine Sorge, Punkte gehen hier nicht verloren.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md">
           <Link 
             href="/" 
             className="w-full sm:flex-1 h-16 rounded-[24px] bg-white text-black font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl"
           >
              <Home size={18} /> Zur Startseite
           </Link>
           <button 
             onClick={() => window.history.back()}
             className="w-full sm:flex-1 h-16 rounded-[24px] bg-white/[0.03] border border-white/10 text-white font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-95"
           >
              <ArrowLeft size={18} /> Zurück
           </button>
        </div>

        {/* Branding Footer */}
        <div className="mt-24 opacity-30">
           <span className="font-logo font-black text-sm tracking-[0.3em] text-white uppercase">TALO™</span>
        </div>

      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
