"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid, Users, ClipboardList,
  Settings, Megaphone, LogOut,
  ShieldCheck, Smartphone, Download,
  ArrowRight, PenLine, CheckSquare
} from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useAppStore } from "@/lib/store/useAppStore";
import AuthGuard from "@/app/components/AuthGuard";
import { TAvatar } from "@/app/components/ui/NativeUI";
import ScrollReveal from "@/app/components/ScrollReveal";
import { motion } from "framer-motion";

const MobileBlocker = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center lg:hidden overflow-hidden"
       style={{ background: "#080808" }}>
    <div className="relative z-10 max-w-sm flex flex-col items-center">
      <div className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-10 shadow-2xl relative"
           style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <Smartphone size={48} className="absolute" style={{ color: "rgba(255,255,255,0.1)" }} />
        <Download size={32} className="text-white relative z-10 animate-bounce" />
      </div>

      <h1 className="text-3xl font-logo font-bold text-white mb-6 uppercase tracking-[0.2em]">Talo Web</h1>
      <p className="text-lg leading-relaxed mb-12 font-poppins" style={{ color: "#8A8A8A" }}>
        Die Web-App ist ausschließlich für{" "}
        <span className="text-white font-bold">Desktop-Geräte</span>{" "}
        optimiert. Erlebe Talo auf deinem Handy in unserer nativen App.
      </p>

      <div className="space-y-4 w-full">
        <a
          href="https://apps.apple.com"
          target="_blank"
          className="flex items-center justify-center gap-3 w-full bg-white text-black py-5 rounded-[24px] font-poppins font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          Im App Store laden <ArrowRight size={18} />
        </a>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-8" style={{ color: "#383838" }}>
          Desktop Version v2.4.0
        </p>
      </div>
    </div>
  </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentMember = useAppStore((state) => state.currentMember);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const isAdmin   = currentMember?.isAdmin   === true;
  const isTrainer = currentMember?.isTrainer === true;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/anmelden");
  };

  const navItems = [
    { href: "/dashboard",                  label: "Dashboard",           icon: LayoutGrid,   show: true },
    { href: "/dashboard/eintragen",        label: "Eintragen",           icon: PenLine,       show: true },
    { href: "/dashboard/genehmigungen",    label: "Genehmigungen",       icon: CheckSquare,  show: isAdmin },
    { href: "/dashboard/mitglieder",       label: "Mitgliederverwaltung",icon: Users,        show: isAdmin || isTrainer },
    { href: "/dashboard/taetigkeiten",     label: "Tätigkeiten",         icon: ClipboardList,show: isAdmin },
    { href: "/dashboard/ankuendigungen",   label: "Ankündigungen",       icon: Megaphone,    show: true },
    { href: "/dashboard/einstellungen",    label: "Einstellungen",       icon: Settings,     show: true },
  ].filter((item) => item.show);

  if (!isMounted) return null;

  return (
    <AuthGuard>
      <div className="flex h-dvh w-full text-white selection:bg-white selection:text-black"
           style={{ background: "#080808" }}>

        {/* MOBILE OVERLAY */}
        <MobileBlocker />

        {/* SIDEBAR */}
        <aside className="hidden lg:flex w-[300px] flex-col shrink-0 relative overflow-hidden"
               style={{
                 background: "#0C0C0C",
                 borderRight: "1px solid rgba(255,255,255,0.04)",
               }}>

          {/* Brand */}
          <div className="px-8 py-10 flex items-center gap-3.5">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="w-9 h-9 flex items-center justify-center transition-all group-hover:scale-110">
                <img src="/talo-logo.png" alt="TALO" className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <span className="font-logo text-[17px] font-black tracking-[0.25em] text-white uppercase leading-none">TALO</span>
                <span className="text-[9px] font-black tracking-[0.3em] uppercase mt-0.5" style={{ color: "#383838" }}>Console</span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-5 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest px-4 mb-5 mt-2" style={{ color: "#383838" }}>
              Hauptmenü
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] transition-all group relative"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
                    color: isActive ? "#FFFFFF" : "#555555",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#555555"; }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute left-0 w-1 h-5 rounded-r-full"
                      style={{ background: "#FFFFFF" }}
                    />
                  )}
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="font-poppins font-semibold text-[14px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User card */}
          <div className="p-5">
            <div className="rounded-[24px] p-4 relative overflow-hidden"
                 style={{
                   background: "rgba(255,255,255,0.02)",
                   border: "1px solid rgba(255,255,255,0.05)",
                 }}>
              <div className="flex items-center gap-3">
                <TAvatar
                  name={`${currentMember?.firstName ?? ""} ${currentMember?.lastName ?? ""}`}
                  id={currentMember?.id ?? ""}
                  size={44}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-poppins font-bold text-sm text-white truncate leading-tight">
                    {currentMember?.firstName} {currentMember?.lastName}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#555" }}>
                      {currentMember?.isAdmin ? "Admin" : currentMember?.isTrainer ? "Trainer" : "Mitglied"}
                    </span>
                    {currentMember?.isAdmin && <ShieldCheck size={10} style={{ color: "rgba(255,255,255,0.4)" }} />}
                  </div>
                </div>
              </div>

              <div className="h-px my-3" style={{ background: "rgba(255,255,255,0.05)" }} />

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-1 transition-colors group"
                style={{ color: "#555" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FF453A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
              >
                <span className="text-xs font-bold font-poppins uppercase tracking-wider">Ausloggen</span>
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 relative overflow-hidden" style={{ background: "#080808" }}>
          {/* Content */}
          <div className="absolute inset-0 overflow-y-auto no-scrollbar">
            <ScrollReveal direction="up" delay={0.05}>
              {children}
            </ScrollReveal>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
