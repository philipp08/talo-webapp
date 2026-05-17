"use client";

import { useEffect, useState, ReactNode } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { ADMIN_EMAIL } from "@/lib/firebase/constants";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, LogIn, LogOut, Newspaper, Key, XCircle, Building2 } from "lucide-react";

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | "loading">("loading");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/anmelden");
  };

  if (user === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAFA" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgba(0,0,0,0.2)" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center" style={{ background: "#FAFAFA" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.05)" }}>
          <LogIn className="w-6 h-6" style={{ color: "rgba(0,0,0,0.35)" }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[#0A0A0A] mb-2">Nicht eingeloggt</h1>
          <p className="text-sm" style={{ color: "#71717A" }}>Du musst als Admin eingeloggt sein.</p>
        </div>
        <Link href="/anmelden" className="px-5 py-3 rounded-[12px] bg-[#0A0A0A] text-white font-medium text-sm hover:opacity-90 transition-all">
          Zum Login
        </Link>
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center" style={{ background: "#FAFAFA" }}>
        <XCircle className="w-10 h-10 text-red-500" />
        <div>
          <h1 className="text-xl font-semibold text-[#0A0A0A] mb-2">Kein Zugriff</h1>
          <p className="text-sm" style={{ color: "#71717A" }}>Dieses Dashboard ist nur für den Admin zugänglich.</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin/vereine", label: "Vereine", icon: Building2 },
    { href: "/admin/lizenzen", label: "Lizenzen", icon: Key },
    { href: "/admin/newsletter", label: "Newsletter", icon: Newspaper },
  ];

  return (
    <div className="flex h-dvh w-full text-[#0A0A0A] selection:bg-[#0A0A0A] selection:text-white" style={{ background: "#FAFAFA" }}>
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-[300px] flex-col shrink-0 relative overflow-hidden" style={{ background: "#FFFFFF", borderRight: "1px solid rgba(0,0,0,0.05)" }}>
        <div className="px-8 py-10 flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-9 h-9 flex items-center justify-center transition-all group-hover:scale-110">
              <Image src="/talo-logo.png" alt="TALO" width={32} height={32} className="w-8 h-8 invert dark:invert-0" />
            </div>
            <div className="flex flex-col">
              <span className="font-logo text-[17px] font-black tracking-[0.25em] text-[#0A0A0A] uppercase leading-none">TALO</span>
              <span className="text-[9px] font-black tracking-[0.3em] uppercase mt-0.5" style={{ color: "#B4B4BA" }}>Admin</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-5 space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest px-4 mb-5 mt-2" style={{ color: "#B4B4BA" }}>
            Admin Menü
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] relative transition-colors"
                style={{
                  background: isActive ? "rgba(0,0,0,0.06)" : "transparent",
                  color: isActive ? "#0A0A0A" : "#71717A"
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#0A0A0A"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#71717A"; }}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-nav-pill"
                    className="absolute left-0 w-1 h-5 rounded-r-full"
                    style={{ background: "#0A0A0A" }}
                  />
                )}
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`font-poppins text-[14px] ${isActive ? "font-semibold" : "font-medium"}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-5">
          <div className="rounded-[24px] p-4" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                   style={{ background: "rgba(0,0,0,0.07)", color: "#0A0A0A" }}>
                P
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-poppins font-bold text-sm text-[#0A0A0A] truncate leading-tight">Philipp Pauli</span>
                <span className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: "#71717A" }}>Admin</span>
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

      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div className="absolute inset-0 overflow-y-auto no-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
