"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, Sparkles, Users, ClipboardList, MoreHorizontal,
  Settings, Megaphone, LogOut, X, ChevronRight,
  ShieldCheck, Dumbbell, User
} from "lucide-react";
import { auth } from "../../lib/firebase/config";
import { signOut } from "firebase/auth";
import { useAppStore } from "../../lib/store/useAppStore";
import AuthGuard from "../components/AuthGuard";
import { TAvatar, TLine, GlassSection, AmbientBackground } from "../components/ui/NativeUI";

const tabs = [
  { id: "/dashboard", label: "Home", icon: LayoutGrid, admin: false },
  { id: "/dashboard/genehmigungen", label: "Genehmigen", icon: Sparkles, admin: true },
  { id: "/dashboard/mitglieder", label: "Team", icon: Users, admin: true },
  { id: "/dashboard/taetigkeiten", label: "Aktiv", icon: ClipboardList, admin: true },
  { id: "more", label: "Mehr", icon: MoreHorizontal, admin: false },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const currentMember = useAppStore((state) => state.currentMember);
  const currentClub = useAppStore((state) => state.currentClub);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isAdmin = currentMember?.isAdmin === true;
  const isTrainer = currentMember?.isTrainer === true;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/anmelden");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, admin: false },
    { href: "/dashboard/genehmigungen", label: "Genehmigungen", icon: Sparkles, admin: true, show: isAdmin },
    { href: "/dashboard/mitglieder", label: "Mitglieder", icon: Users, admin: true, show: isAdmin || isTrainer },
    { href: "/dashboard/taetigkeiten", label: "Tätigkeiten", icon: ClipboardList, admin: true, show: isAdmin },
    { href: "/dashboard/ankuendigungen", label: "Ankündigungen", icon: Megaphone, admin: false, show: true },
    { href: "/dashboard/einstellungen", label: "Einstellungen", icon: Settings, admin: false, show: true },
  ].filter(item => item.show ?? true);

  return (
    <AuthGuard>
      <div className="flex h-screen w-full bg-[#080808] text-white">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-[280px] flex-col border-r border-white/[0.05] bg-[#0c0c0c] relative overflow-hidden shrink-0">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-[60px] pointer-events-none" />
          
          {/* Logo */}
          <div className="px-6 py-8 flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <img src="/talo-logo.png" alt="Talo" className="w-6 h-6 invert" />
             </div>
             <span className="font-logo text-lg font-bold tracking-[0.2em] text-white uppercase">TALO</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
             {navItems.map((item) => {
               const isActive = pathname === item.href;
               const Icon = item.icon;
               return (
                 <Link key={item.href} href={item.href} className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all group ${
                   isActive ? "bg-white/10 text-white" : "text-[#8A8A8A] hover:text-white"
                 }`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isActive ? "bg-white text-[#080808] shadow-lg" : "bg-white/5 group-hover:bg-white/10"
                    }`}>
                       <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <span className="font-poppins font-bold text-[14px]">{item.label}</span>
                 </Link>
               );
             })}
          </div>

          {/* User Row */}
          <div className="p-4 border-t border-white/[0.05]">
             <div className="flex items-center gap-3 px-2 py-3">
                <TAvatar 
                  name={`${currentMember?.firstName} ${currentMember?.lastName}`} 
                  id={currentMember?.id || ""} 
                  size={42} 
                />
                <div className="flex flex-col min-w-0">
                   <span className="font-poppins font-bold text-sm truncate leading-tight">
                     {currentMember?.firstName} {currentMember?.lastName}
                   </span>
                   <span className="text-[11px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-wider">
                     {currentMember?.isAdmin ? "Admin" : currentMember?.isTrainer ? "Trainer" : currentMember?.memberType}
                   </span>
                </div>
             </div>
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-poppins font-bold text-sm mt-1">
                <LogOut size={18} strokeWidth={2.5} />
                <span>Abmelden</span>
             </button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 relative overflow-y-auto overflow-x-hidden pt-0 lg:pb-0 pointer-events-auto">
          {children}
        </main>

        {/* MOBILE BOTTOM TAB BAR */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[84px] bg-[#0c0c0c]/80 backdrop-blur-2xl border-t border-white/[0.05] flex items-start justify-between px-6 pt-3 z-50">
           {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.id;
              const isHidden = tab.admin && !isAdmin && !isTrainer;
              
              if (isHidden) return null;

              return (
                 <button
                   key={tab.id}
                   onClick={() => {
                     if (tab.id === "more") setIsMoreOpen(true);
                     else router.push(tab.id);
                   }}
                   className={`flex flex-col items-center gap-1 transition-all duration-200 ${isActive ? "text-white" : "text-[#8A8A8A] active:scale-95"}`}
                 >
                   <Icon size={isActive ? 21 : 20} strokeWidth={isActive ? 2.5 : 2} />
                   <span className="text-[10px] font-bold tracking-tight font-poppins uppercase tracking-[0.05em]">{tab.label}</span>
                 </button>
              );
           })}
           {/* Home Indicator Spacing */}
           <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full" />
        </div>

        {/* MOBILE "MEHR" DRAWER */}
        <AnimatePresence>
          {isMoreOpen && (
            <div className="lg:hidden fixed inset-0 z-[60] flex items-end">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }} 
                 onClick={() => setIsMoreOpen(false)}
                 className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
               />
               <motion.div 
                 initial={{ y: "100%" }} 
                 animate={{ y: 0 }} 
                 exit={{ y: "100%" }} 
                 transition={{ type: "spring", damping: 30, stiffness: 300 }}
                 className="relative w-full bg-[#0c0c0c] border-t border-white/10 rounded-t-[32px] p-6 pb-12 flex flex-col gap-8 shadow-2xl overflow-hidden"
               >
                  <AmbientBackground />
                  
                  {/* Handle */}
                  <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto -mt-2 mb-2" onClick={() => setIsMoreOpen(false)} />
                  
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 relative z-10">
                     <TAvatar name={`${currentMember?.firstName} ${currentMember?.lastName}`} id={currentMember?.id || ""} size={64} />
                     <div className="flex flex-col">
                        <span className="font-poppins font-bold text-xl text-white">{currentMember?.firstName} {currentMember?.lastName}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-xs font-poppins font-bold text-[#8A8A8A] uppercase tracking-widest">{currentMember?.memberType}</span>
                           {isAdmin && <ShieldCheck size={12} className="text-white opacity-40" />}
                        </div>
                     </div>
                     <button onClick={() => setIsMoreOpen(false)} className="ml-auto w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#8A8A8A]">
                        <X size={20} />
                     </button>
                  </div>

                  {/* Menu Grid */}
                  <div className="flex flex-col gap-3 relative z-10">
                     <Link href="/dashboard/einstellungen" onClick={() => setIsMoreOpen(false)} className="w-full">
                        <GlassSection className="p-4 flex items-center gap-4 active:bg-white/5 transition-all">
                           <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white">
                              <Settings size={22} strokeWidth={2.5} />
                           </div>
                           <div className="flex flex-col">
                              <span className="font-poppins font-bold text-[16px]">Einstellungen</span>
                              <span className="text-[12px] font-poppins text-[#8A8A8A]">Profil & App verwalten</span>
                           </div>
                           <ChevronRight size={14} className="ml-auto text-[#383838]" />
                        </GlassSection>
                     </Link>
                     
                     <Link href="/dashboard/ankuendigungen" onClick={() => setIsMoreOpen(false)} className="w-full">
                        <GlassSection className="p-4 flex items-center gap-4 active:bg-white/5 transition-all">
                           <div className="w-12 h-12 rounded-xl bg-[#00E0D1]/10 flex items-center justify-center text-[#00E0D1]">
                              <Megaphone size={22} strokeWidth={2.5} />
                           </div>
                           <div className="flex flex-col">
                              <span className="font-poppins font-bold text-[16px]">Ankündigungen</span>
                              <span className="text-[12px] font-poppins text-[#8A8A8A]">Neuigkeiten vom Verein</span>
                           </div>
                           <ChevronRight size={14} className="ml-auto text-[#383838]" />
                        </GlassSection>
                     </Link>

                     <button onClick={handleLogout} className="w-full text-left">
                        <GlassSection className="p-4 flex items-center gap-4 bg-red-500/[0.03] border-red-500/10 active:bg-red-500/10 transition-all">
                           <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                              <LogOut size={22} strokeWidth={2.5} />
                           </div>
                           <div className="flex flex-col">
                              <span className="font-poppins font-bold text-[16px] text-red-400">Abmelden</span>
                              <span className="text-[12px] font-poppins text-red-900/40">Von diesem Gerät ausloggen</span>
                           </div>
                        </GlassSection>
                     </button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AuthGuard>
  );
}
