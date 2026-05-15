"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutGrid, Users, ClipboardList,
  Settings, Megaphone, LogOut,
  ShieldCheck, PenLine, CheckSquare,
  Menu, X, MoreHorizontal,
} from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useAppStore } from "@/lib/store/useAppStore";
import { ADMIN_EMAIL } from "@/lib/firebase/constants";
import AuthGuard from "@/app/components/AuthGuard";
import { TAvatar } from "@/app/components/ui/NativeUI";
import ScrollReveal from "@/app/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingFlow from "@/app/components/OnboardingFlow";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentMember = useAppStore((state) => state.currentMember);
  const user = useAppStore((state) => state.user);
  const isLoadingAuthedState = useAppStore((state) => state.isLoadingAuthedState);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    queueMicrotask(() => setMobileMenuOpen(false));
  }, [pathname]);

  // Redirect admin to their dedicated console
  useEffect(() => {
    if (!isLoadingAuthedState && user?.email === ADMIN_EMAIL) {
      router.replace("/admin/newsletter");
    }
  }, [isLoadingAuthedState, user, router]);

  const isAdmin   = currentMember?.isAdmin   === true;
  const isTrainer = currentMember?.isTrainer === true;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/anmelden");
  };

  const navItems = [
    { href: "/dashboard",                label: "Dashboard",      icon: LayoutGrid,    show: true },
    { href: "/dashboard/eintragen",      label: "Eintragen",      icon: PenLine,       show: true },
    { href: "/dashboard/genehmigungen",  label: "Genehmigungen",  icon: CheckSquare,   show: isAdmin },
    { href: "/dashboard/mitglieder",     label: "Mitglieder",     icon: Users,         show: isAdmin || isTrainer },
    { href: "/dashboard/taetigkeiten",   label: "Tätigkeiten",    icon: ClipboardList, show: isAdmin },
    { href: "/dashboard/ankuendigungen", label: "Ankündigungen",  icon: Megaphone,     show: true },
    { href: "/dashboard/einstellungen",  label: "Einstellungen",  icon: Settings,      show: true },
  ].filter((item) => item.show);

  // Bottom tabs: first 4 items + "Mehr" if there are more than 4
  const MAX_TABS = 4;
  const tabItems = navItems.slice(0, MAX_TABS);
  const hasMore  = navItems.length > MAX_TABS;

  const isTabActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const isOverflowActive =
    hasMore && navItems.slice(MAX_TABS).some((i) => isTabActive(i.href));

  // If no clubId is assigned, show onboarding to create a club
  if (currentMember && !currentMember.clubId) {
    return (
      <AuthGuard>
        <OnboardingFlow />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div
        className="flex h-dvh w-full text-[#0A0A0A] selection:bg-[#0A0A0A] selection:text-white"
        style={{ background: "#FAFAFA" }}
      >

        {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────── */}
        <aside
          className="hidden lg:flex w-[300px] flex-col shrink-0 relative overflow-hidden"
          style={{ background: "#FFFFFF", borderRight: "1px solid rgba(0,0,0,0.05)" }}
        >
          {/* Brand */}
          <div className="px-8 py-10 flex items-center gap-3.5">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="w-9 h-9 flex items-center justify-center transition-all group-hover:scale-110">
                <Image src="/talo-logo.png" alt="TALO" width={32} height={32} className="w-8 h-8 invert dark:invert-0" />
              </div>
              <div className="flex flex-col">
                <span className="font-logo text-[17px] font-black tracking-[0.25em] text-[#0A0A0A] uppercase leading-none">TALO</span>
                <span className="text-[9px] font-black tracking-[0.3em] uppercase mt-0.5" style={{ color: "#B4B4BA" }}>Console</span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-5 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest px-4 mb-5 mt-2" style={{ color: "#B4B4BA" }}>
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
                    background: isActive ? "rgba(0,0,0,0.06)" : "transparent",
                    color: isActive ? "#0A0A0A" : "#71717A",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#0A0A0A"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#71717A"; }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute left-0 w-1 h-5 rounded-r-full"
                      style={{ background: "#0A0A0A" }}
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
            <div
              className="rounded-[24px] p-4 relative overflow-hidden"
              style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <TAvatar
                  name={`${currentMember?.firstName ?? ""} ${currentMember?.lastName ?? ""}`}
                  id={currentMember?.id ?? ""}
                  size={44}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-poppins font-bold text-sm text-[#0A0A0A] truncate leading-tight">
                    {currentMember?.firstName} {currentMember?.lastName}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#71717A" }}>
                      {isAdmin ? "Admin" : isTrainer ? "Trainer" : "Mitglied"}
                    </span>
                    {isAdmin && <ShieldCheck size={10} style={{ color: "rgba(0,0,0,0.42)" }} />}
                  </div>
                </div>
              </div>

              <div className="h-px my-3" style={{ background: "rgba(0,0,0,0.06)" }} />

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-1 transition-colors group"
                style={{ color: "#71717A" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FF453A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#71717A")}
              >
                <span className="text-xs font-bold font-poppins uppercase tracking-wider">Ausloggen</span>
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </aside>

        {/* ── MOBILE SLIDE-IN MENU ────────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 lg:hidden"
                style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)" }}
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Drawer */}
              <motion.div
                key="drawer"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed top-0 left-0 h-full w-72 z-50 flex flex-col lg:hidden"
                style={{ background: "#FFFFFF", borderRight: "1px solid rgba(0,0,0,0.07)" }}
              >
                {/* Header */}
                <div className="px-5 pt-14 pb-5 flex items-center justify-between border-b border-black/5">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                    <Image src="/talo-logo.png" alt="TALO" width={28} height={28} className="w-7 h-7 invert dark:invert-0" />
                    <span className="font-logo text-[16px] font-black tracking-[0.25em] text-[#0A0A0A] uppercase">TALO</span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.06)", color: "#52525B" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3.5 px-4 py-4 rounded-[16px] transition-all"
                        style={{
                          background: isActive ? "rgba(0,0,0,0.07)" : "transparent",
                          color: isActive ? "#0A0A0A" : "#71717A",
                        }}
                      >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span className="font-poppins font-semibold text-[15px]">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-black/5 space-y-2">
                  <div
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: "rgba(0,0,0,0.04)" }}
                  >
                    <TAvatar
                      name={`${currentMember?.firstName ?? ""} ${currentMember?.lastName ?? ""}`}
                      id={currentMember?.id ?? ""}
                      size={38}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-poppins font-bold text-sm text-[#0A0A0A] truncate">
                        {currentMember?.firstName} {currentMember?.lastName}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#71717A" }}>
                        {isAdmin ? "Admin" : isTrainer ? "Trainer" : "Mitglied"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{ color: "#FF453A" }}
                  >
                    <LogOut size={16} />
                    <span className="font-poppins font-semibold text-sm">Ausloggen</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── MOBILE TOP HEADER ───────────────────────────────────────── */}
        <div
          className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14"
          style={{
            background: "rgba(255,255,255,0.92)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl"
            style={{ color: "#52525B" }}
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <Image src="/talo-logo.png" alt="" width={24} height={24} className="w-6 h-6 invert dark:invert-0" />
            <span className="font-logo text-[15px] font-black tracking-[0.2em] text-[#0A0A0A] uppercase">TALO</span>
          </Link>

          {/* Avatar */}
          <div className="w-10 flex items-center justify-center">
            <TAvatar
              name={`${currentMember?.firstName ?? ""} ${currentMember?.lastName ?? ""}`}
              id={currentMember?.id ?? ""}
              size={34}
            />
          </div>
        </div>

        {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
        <main className="flex-1 relative overflow-hidden" style={{ background: "#FAFAFA" }}>
          <div className="absolute inset-0 overflow-y-auto no-scrollbar lg:pt-0 pt-14 pb-[calc(80px+env(safe-area-inset-bottom))] lg:pb-0">
            <ScrollReveal direction="up" delay={0.05}>
              {children}
            </ScrollReveal>
          </div>
        </main>

        {/* ── MOBILE BOTTOM TAB BAR ───────────────────────────────────── */}
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch"
          style={{
            background: "rgba(255,255,255,0.96)",
            borderTop: "1px solid rgba(0,0,0,0.07)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            minHeight: 64,
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {tabItems.map((item) => {
            const active = isTabActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-all active:opacity-60"
                style={{ color: active ? "#0A0A0A" : "#71717A" }}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[9px] font-poppins font-bold uppercase tracking-wider leading-none">
                  {item.label.length > 8 ? item.label.slice(0, 8) : item.label}
                </span>
              </Link>
            );
          })}

          {hasMore && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-all active:opacity-60"
              style={{ color: isOverflowActive ? "#0A0A0A" : "#71717A" }}
            >
              <MoreHorizontal size={22} strokeWidth={1.8} />
              <span className="text-[9px] font-poppins font-bold uppercase tracking-wider leading-none">Mehr</span>
            </button>
          )}
        </div>

      </div>
    </AuthGuard>
  );
}
