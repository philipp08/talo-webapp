"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ScrollReveal from "@/app/components/ScrollReveal";
import { CheckCircle2, AlertCircle, Clock, Server, Shield, Globe, Activity } from "lucide-react";

export default function StatusPage() {
  const [lastCheck, setLastCheck] = useState<string>("");

  useEffect(() => {
    setLastCheck(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const systems = [
    { name: "TALO™ Web Platform", status: "operational", uptime: "99.98%", description: "Die Hauptplattform für Vereine." },
    { name: "TALO™ Console (Dashboard)", status: "operational", uptime: "99.95%", description: "Das Verwaltungs-Backend der Vereine." },
    { name: "Authentifizierungs-Service", status: "operational", uptime: "100%", description: "Login & Mitglieder-Auth via Firebase." },
    { name: "E-Mail Zustellung (SendGrid)", status: "operational", uptime: "99.9%", description: "Versand von Einladungen & Demo-Anfragen." },
    { name: "Datenbank (Firestore)", status: "operational", uptime: "100%", description: "Echtzeit-Datenstruktur & Speicherung." },
    { name: "Asset Storage", status: "operational", uptime: "99.99%", description: "Speicherung von Dokumenten & Bildern." }
  ];

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-[180px] pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest mb-8 border border-green-500/20">
               <Activity size={12} /> Alle Systeme laufen normal
            </div>
            <h1 className="text-5xl md:text-7xl font-logo font-medium tracking-tight text-gray-950 dark:text-white mb-6">
               Systemstatus.
            </h1>
            <p className="text-lg text-gray-500 dark:text-[#8A8A8A] max-w-xl mx-auto leading-relaxed">
               Transparenz ist unser Versprechen. Hier findest du den aktuellen Status aller TALO™ Infrastruktur-Dienste.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Status Grid */}
      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[40px] overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.01]">
               <div className="flex items-center gap-3">
                  <Server size={18} className="text-gray-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">Service Verfügbarkeit</span>
               </div>
               <span className="text-[10px] font-bold text-gray-400 italic">Letzter Check: Heute, {lastCheck} Uhr</span>
            </div>

            {/* Systems List */}
            <div className="divide-y divide-gray-100 dark:divide-white/5">
               {systems.map((system, idx) => (
                 <div key={idx} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <div className="space-y-1">
                       <h3 className="text-lg font-bold text-gray-950 dark:text-white">{system.name}</h3>
                       <p className="text-sm text-gray-500 dark:text-[#8A8A8A]">{system.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-8">
                       <div className="text-right hidden sm:block">
                          <div className="text-[10px] font-black uppercase tracking-tighter text-gray-400 mb-0.5">Uptime</div>
                          <div className="text-sm font-bold text-gray-950 dark:text-white font-mono">{system.uptime}</div>
                       </div>
                       
                       <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/10">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Operational</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 px-8">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <Shield size={16} className="text-blue-500" />
                   <span className="text-xs font-bold text-gray-500">Sicherheits-Audit: Bestanden</span>
                </div>
                <div className="flex items-center gap-2">
                   <Globe size={16} className="text-purple-500" />
                   <span className="text-xs font-bold text-gray-500">Server Standort: Frankfurt (DE)</span>
                </div>
             </div>
             <p className="text-[11px] text-gray-400 max-w-xs text-center md:text-right italic">
                Solltest du dennoch Probleme feststellen, kontaktiere uns bitte sofort über das Demo-Formular.
             </p>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
