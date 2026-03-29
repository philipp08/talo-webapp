"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutGrid, Sparkles, Users, ClipboardList, 
  Settings, Megaphone, LogOut, ChevronRight,
  ShieldCheck, User, Monitor, Smartphone, Download,
  ArrowRight
} from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useAppStore } from "@/lib/store/useAppStore";
import AuthGuard from "@/app/components/AuthGuard";
import { TAvatar, TLine, GlassSection, AmbientBackground } from "@/app/components/ui/NativeUI";

import ScrollReveal from "@/app/components/ScrollReveal";

import { motion, AnimatePresence } from "framer-motion";

const MobileBlocker = () => (
  <div className="fixed inset-0 z-[100] bg-[#080808] flex flex-col items-center justify-center p-8 text-center lg:hidden overflow-hidden">
    <div className="relative z-10 max-w-sm flex flex-col items-center">
      <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mb-10 shadow-2xl relative">
        <Smartphone size={48} className="text-white/20 absolute" />
        <Download size={32} className="text-white relative z-10 animate-bounce" />
      </div>
      
      <h1 className="text-3xl font-logo font-bold text-white mb-6 uppercase tracking-[0.2em]">Talo™ Web</h1>
      <p className="text-[#8A8A8A] font-poppins text-lg leading-relaxed mb-12">
        Die Web-App ist ausschließlich für <span className="text-white font-bold">Desktop-Geräte</span> optimiert. Erlebe Talo™ auf deinem Handy in unserer nativen App.
      </p>

      <div className="space-y-4 w-full">
        <a 
          href="https://apps.apple.com" 
          target="_blank" 
          className="flex items-center justify-center gap-3 w-full bg-white text-black py-5 rounded-[24px] font-poppins font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          Im App Store laden <ArrowRight size={18} />
        </a>
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-8">
           Desktop Version v2.4.0
        </p>
      </div>
    </div>
  </div>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const currentMember = useAppStore((state) => state.currentMember);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAdmin = currentMember?.isAdmin === true;
  const isTrainer = currentMember?.isTrainer === true;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/anmelden");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, admin: false, show: true },
    { href: "/dashboard/genehmigungen", label: "Genehmigungen", icon: Sparkles, admin: true, show: isAdmin },
    { href: "/dashboard/mitglieder", label: "Mitgliederverwaltung", icon: Users, admin: true, show: isAdmin || isTrainer },
    { href: "/dashboard/taetigkeiten", label: "Tätigkeiten & Erfassung", icon: ClipboardList, admin: true, show: isAdmin },
    { href: "/dashboard/ankuendigungen", label: "Ankündigungen", icon: Megaphone, admin: false, show: true },
    { href: "/dashboard/einstellungen", label: "Einstellungen", icon: Settings, admin: false, show: true },
  ].filter(item => item.show);

  if (!isMounted) return null;

  return (
    <AuthGuard>
      <div className="flex h-screen w-full bg-[#080808] text-white selection:bg-white selection:text-black">
        
        {/* MOBILE REDIRECT OVERLAY */}
        <MobileBlocker />

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-[320px] flex-col border-r border-white/[0.03] bg-[#0c0c0c] relative overflow-hidden shrink-0">
          
          {/* Brand Header */}
          <div className="px-10 py-12 flex items-center justify-between mb-4">
             <Link href="/" className="flex items-center gap-3.5 group">
                <div className="w-10 h-10 flex items-center justify-center transition-all group-hover:scale-110">
                   <img src="/talo-logo.png" alt="TALO" className="w-8 h-8" />
                </div>
                <div className="flex flex-col">
                   <span className="font-logo text-lg font-black tracking-[0.25em] text-white uppercase leading-none">TALO</span>
                   <span className="text-[9px] font-black text-gray-500 tracking-[0.3em] uppercase mt-1">Console</span>
                </div>
             </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-2">
             <div className="px-4 mb-6 italic">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Hauptmenü</span>
             </div>
             {navItems.map((item) => {
               const isActive = pathname === item.href;
               const Icon = item.icon;
               return (
                 <Link key={item.href} href={item.href} className={`flex items-center gap-4 px-5 py-4 rounded-[22px] transition-all group relative ${
                   isActive ? "bg-white/[0.04] text-white shadow-inner" : "text-gray-500 hover:text-white hover:bg-white/[0.02]"
                 }`}>
                    {isActive && (
                      <motion.div layoutId="nav-pill" className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full" />
                    )}
                    <div className={`w-6 h-6 flex items-center justify-center transition-all ${
                      isActive ? "text-white" : "text-gray-600 group-hover:text-gray-400"
                    }`}>
                       <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className="font-poppins font-bold text-[15px]">{item.label}</span>
                 </Link>
               );
             })}
          </nav>

          {/* Sidebar Footer / User Profile */}
          <div className="p-6">
             <div className="rounded-[32px] bg-white/[0.02] border border-white/5 p-5 relative overflow-hidden group">
                <div className="flex items-center gap-4 relative z-10">
                   <TAvatar 
                     name={`${currentMember?.firstName} ${currentMember?.lastName}`} 
                     id={currentMember?.id || ""} 
                     size={48} 
                   />
                   <div className="flex flex-col min-w-0">
                      <span className="font-poppins font-bold text-sm truncate text-white leading-tight">
                        {currentMember?.firstName} {currentMember?.lastName}
                      </span>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                           {currentMember?.isAdmin ? "Admin" : currentMember?.isTrainer ? "Trainer" : "Mitglied"}
                         </span>
                         {currentMember?.isAdmin && <ShieldCheck size={10} className="text-white/60" />}
                      </div>
                   </div>
                </div>
                
                <div className="h-px bg-white/5 my-4" />
                
                <button onClick={handleLogout} className="w-full flex items-center justify-between text-gray-500 hover:text-red-400 transition-colors px-1">
                   <span className="text-xs font-bold font-poppins uppercase tracking-wider">Ausloggen</span>
                   <LogOut size={14} />
                </button>
             </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 relative overflow-hidden bg-[#080808]">
           {/* Global Header / Search / Notifications Placeholder */}
           <header className="h-[100px] border-b border-white/[0.03] flex items-center justify-between px-10 relative z-10 bg-[#080808]/50 backdrop-blur-3xl">
              <div className="flex items-center gap-4">
                 <h2 className="font-logo font-bold text-xl text-white">
                    {navItems.find(n => n.href === pathname)?.label || "Dashboard"}
                 </h2>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                    <Monitor size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Desktop Modus Aktiv</span>
                 </div>
              </div>
           </header>

           {/* Content Wrap */}
           <div className="absolute inset-0 top-[100px] overflow-y-auto px-10 pb-20 scrollbar-hide">
              <ScrollReveal direction="up" delay={0.1}>
                 {children}
              </ScrollReveal>
           </div>
        </main>
      </div>
    </AuthGuard>
  );
}
