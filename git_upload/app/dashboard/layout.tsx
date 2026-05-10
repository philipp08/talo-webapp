"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid, Users, ClipboardList,
  Settings, Megaphone, LogOut,
  ShieldCheck, PenLine, CheckSquare,
  Menu, X, MoreHorizontal,
} from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useAppStore } from "@/lib/store/useAppStore";
import AuthGuard from "@/app/components/AuthGuard";
import { TAvatar } from "@/app/components/ui/NativeUI";
import ScrollReveal from "@/app/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_EMAIL = "philipp@pauli-one.de";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentMember = useAppStore((state) => state.currentMember);
  const user = useAppStore((state) => state.user);
  const isLoadingAuthedState = useAppStore((state) => state.isLoadingAuthedState);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  // Close menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

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

  if (!isMounted) return null;

  return (
    <AuthGuard>
      <div
        className="dark flex h-dvh w-full text-white selection:bg-white selection:text-black"
        style={{ background: "#080808" }}
      >

        {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────── */}
        <aside
          className="hidden lg:flex w-[300px] flex-col shrink-0 relative overflow-hidden"
          style={{ background: "#0C0C0C", borderRight: "1px solid rgba(255,255,255,0.04)" }}
        >
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
            <div
              className="rounded-[24px] p-4 relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
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
                      {isAdmin ? "Admin" : isTrainer ? "Trainer" : "Mitglied"}
                    </span>
                    {isAdmin && <ShieldCheck size={10} style={{ color: "rgba(255,255,255,0.4)" }} />}
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
                style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
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
                style={{ background: "#0C0C0C", borderRight: "1px solid rgba(255,255,255,0.06)" }}
              >
                {/* Header */}
                <div className="px-5 pt-14 pb-5 flex items-center justify-between border-b border-white/5">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                    <img src="/talo-logo.png" alt="TALO" className="w-7 h-7" />
                    <span className="font-logo text-[16px] font-black tracking-[0.25em] text-white uppercase">TALO</span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#8A8A8A" }}
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
                          background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                          color: isActive ? "#FFFFFF" : "#666",
                        }}
                      >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span className="font-poppins font-semibold text-[15px]">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 space-y-2">
                  <div
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <TAvatar
                      name={`${currentMember?.firstName ?? ""} ${currentMember?.lastName ?? ""}`}
                      id={currentMember?.id ?? ""}
                      size={38}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-poppins font-bold text-sm text-white truncate">
                        {currentMember?.firstName} {currentMember?.lastName}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#555" }}>
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
            background: "rgba(8,8,8,0.92)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl"
            style={{ color: "#8A8A8A" }}
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <img src="/talo-logo.png" alt="" className="w-6 h-6" />
            <span className="font-logo text-[15px] font-black tracking-[0.2em] text-white uppercase">TALO</span>
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
        <main className="flex-1 relative overflow-hidden" style={{ background: "#080808" }}>
          <div className="absolute inset-0 overflow-y-auto no-scrollbar lg:pt-0 pt-14 pb-[64px] lg:pb-0">
            <ScrollReveal direction="up" delay={0.05}>
              {children}
            </ScrollReveal>
          </div>
        </main>

        {/* ── MOBILE BOTTOM TAB BAR ───────────────────────────────────── */}
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch"
          style={{
            background: "rgba(12,12,12,0.98)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            height: 64,
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
                style={{ color: active ? "#FFFFFF" : "#555" }}
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
              style={{ color: isOverflowActive ? "#FFFFFF" : "#555" }}
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
