"use client";

import Link from "next/link";
import { ArrowLeft, Home, Search, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Soft background ambient gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-blue-50/30 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[800px] h-[800px] bg-gray-50 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-3xl w-full text-center relative z-10 flex flex-col items-center">
        
        {/* Large Aesthetic 404 Display */}
        <div className="relative mb-8 flex items-center justify-center">
          <h1 className="text-[12rem] md:text-[20rem] font-logo font-medium tracking-tighter text-gray-100/80 leading-none select-none">
             404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[32px] md:rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.08)] flex items-center justify-center border border-gray-100 transform -rotate-6 hover:rotate-0 transition-transform duration-700">
                <Compass size={48} className="text-gray-900 md:size-64" />
             </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 mb-16">
           <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-gray-950 font-logo leading-tight">
              Diese Seite ist <br /><span className="text-gray-400 italic">nicht am Platz.</span>
           </h2>
           <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
              Keine Sorge, wir haben alles im Blick. Wahrscheinlich hat sich die Adresse geändert – deine Vereinsdaten sind natürlich sicher.
           </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-lg">
           <Link 
             href="/" 
             className="w-full sm:flex-1 h-16 rounded-[24px] bg-black text-white font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
           >
              <Home size={18} /> Zur Startseite
           </Link>
           <button 
             onClick={() => window.history.back()}
             className="w-full sm:flex-1 h-16 rounded-[24px] bg-white border border-gray-100 text-gray-950 font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
           >
              <ArrowLeft size={18} /> Zurück
           </button>
        </div>

        {/* Branding Footer */}
        <div className="mt-20">
           <Link href="/status" className="group flex items-center gap-2 px-6 py-2 rounded-full border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 group-hover:text-gray-600 uppercase">Systemstatus: Optimal</span>
           </Link>
        </div>

      </div>
    </main>
  );
}
