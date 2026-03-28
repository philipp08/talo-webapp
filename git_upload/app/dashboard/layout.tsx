"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  Megaphone,
} from "lucide-react";
import { useState } from "react";
import AuthGuard from "../components/AuthGuard";
import { auth } from "../../lib/firebase/config";
import { signOut } from "firebase/auth";
import { useAppStore } from "../../lib/store/useAppStore";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentMember = useAppStore((state) => state.currentMember);
  const currentClub = useAppStore((state) => state.currentClub);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const isAdmin = currentMember?.isAdmin === true;
  const isTrainer = currentMember?.isTrainer === true;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/dashboard/genehmigungen", label: "Genehmigungen", icon: CheckSquare, show: isAdmin },
    { href: "/dashboard/mitglieder", label: "Mitglieder", icon: Users, show: isAdmin || isTrainer },
    { href: "/dashboard/taetigkeiten", label: "Tätigkeiten", icon: Briefcase, show: isAdmin },
    { href: "/dashboard/ankuendigungen", label: "Ankündigungen", icon: Megaphone, show: true },
    { href: "/dashboard/einstellungen", label: "Einstellungen", icon: Settings, show: true },
  ].filter((item) => item.show);

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Brand/Club Info */}
      <div className="flex flex-col gap-1 border-b border-gray-200 dark:border-white/10 px-6 py-6 shrink-0">
        <div className="flex items-center gap-2">
          <img src="/talo-logo.png" alt="Talo" className="h-6 w-6 rounded-md invert dark:invert-0" />
          <span className="font-logo text-lg font-bold tracking-[0.2em] text-gray-900 dark:text-white uppercase">TALO</span>
        </div>
        {currentClub && (
          <p className="mt-2 text-sm text-gray-500 dark:text-[#9CA3AF] font-poppins font-medium">{currentClub.name}</p>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto space-y-1.5 px-4 py-6">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-[#8A8A8A] hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span className="font-poppins">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section & Logout */}
      <div className="border-t border-gray-200 dark:border-white/10 p-4 shrink-0 bg-white/50 dark:bg-transparent">
        <div className="mb-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200 dark:bg-white/10 text-sm font-bold shrink-0 text-gray-900 dark:text-white shadow-inner">
              {currentMember?.firstName.charAt(0)}
              {currentMember?.lastName.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                {currentMember?.firstName} {currentMember?.lastName}
              </span>
              <span className="text-[11px] font-medium text-gray-500 dark:text-[#8A8A8A]">
                {currentMember?.isAdmin
                  ? "Administrator"
                  : currentMember?.isTrainer
                  ? "Trainer"
                  : currentMember?.memberType}
              </span>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-[#8A8A8A]"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="flex h-screen w-full bg-white dark:bg-[#080808]">
        {/* Desktop Sidebar */}
        <aside className="hidden w-[280px] flex-col border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0c0c0c] md:flex">
          <SidebarContent />
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0c0c0c] border-b border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2">
            <img src="/talo-logo.png" alt="Talo" className="h-6 w-6 rounded-md invert dark:invert-0" />
            <span className="font-logo text-base font-bold tracking-[0.2em] text-gray-900 dark:text-white">TALO</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-[#8A8A8A]"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-900 dark:text-white"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex flex-col w-[280px] bg-gray-50 dark:bg-[#0c0c0c] border-r border-gray-200 dark:border-white/10 h-full z-50 pt-14 shadow-2xl">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto md:pt-0 pt-14 bg-white dark:bg-[#080808]">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
