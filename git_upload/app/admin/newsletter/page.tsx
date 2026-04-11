"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase/config";
import {
  collection, query, where, getDocs, Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, Send, RefreshCw, Mail,
  CheckCircle2, XCircle, LogIn,
  Loader2, Eye, EyeOff, LogOut, Newspaper,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  token: string;
  subscribedAt: Timestamp | null;
}

const ADMIN_EMAIL = "philipp@pauli-one.de";

export default function AdminNewsletterPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | "loading">("loading");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Compose state
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);
  const [sendError, setSendError] = useState("");

  // Auth watch
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // Load subscribers
  async function loadSubscribers() {
    setLoadingSubs(true);
    try {
      // No orderBy — avoids needing a composite index; we sort client-side instead
      const q = query(
        collection(db, "newsletter_subscribers"),
        where("active", "==", true)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({
        id: d.id,
        email: d.data().email as string,
        token: d.data().token as string,
        subscribedAt: (d.data().subscribedAt as Timestamp) ?? null,
      }));
      // Sort newest first on the client
      docs.sort((a, b) => {
        const ta = a.subscribedAt?.toMillis() ?? 0;
        const tb = b.subscribedAt?.toMillis() ?? 0;
        return tb - ta;
      });
      setSubscribers(docs);
    } catch (e: any) {
      console.error("[admin] loadSubscribers error:", e?.code ?? e?.message ?? e);
    }
    setLoadingSubs(false);
  }

  useEffect(() => {
    if (user && user !== "loading" && user.email === ADMIN_EMAIL) {
      loadSubscribers();
    }
  }, [user]);

  async function handleSend() {
    if (!subject.trim() || !htmlBody.trim()) {
      setSendError("Bitte Betreff und Inhalt ausfüllen.");
      return;
    }
    if (subscribers.length === 0) {
      setSendError("Keine aktiven Abonnenten vorhanden.");
      return;
    }
    setSending(true);
    setSendError("");
    setSendResult(null);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          htmlBody,
          subscribers: subscribers.map(({ email, token }) => ({ email, token })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler beim Versand");
      if (data.failed > 0) {
        setSendError(`${data.failed} E-Mail(s) fehlgeschlagen: ${(data.errors ?? []).join("; ")}`);
      }
      setSendResult({ sent: data.sent, failed: data.failed });
    } catch (e: any) {
      setSendError(e.message || "Unbekannter Fehler");
    }
    setSending(false);
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/anmelden");
  };

  // ── Loading auth ──
  if (user === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080808" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgba(255,255,255,0.2)" }} />
      </div>
    );
  }

  // ── Not logged in ──
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center" style={{ background: "#080808" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
          <LogIn className="w-6 h-6" style={{ color: "rgba(255,255,255,0.3)" }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white mb-2">Nicht eingeloggt</h1>
          <p className="text-sm" style={{ color: "#8A8A8A" }}>Du musst als Admin eingeloggt sein.</p>
        </div>
        <Link href="/anmelden" className="px-5 py-3 rounded-[12px] bg-white text-black font-medium text-sm hover:opacity-90 transition-all">
          Zum Login
        </Link>
      </div>
    );
  }

  // ── Wrong account ──
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center" style={{ background: "#080808" }}>
        <XCircle className="w-10 h-10 text-red-400" />
        <div>
          <h1 className="text-xl font-semibold text-white mb-2">Kein Zugriff</h1>
          <p className="text-sm" style={{ color: "#8A8A8A" }}>Dieses Dashboard ist nur für den Admin zugänglich.</p>
        </div>
      </div>
    );
  }

  // ── Admin Console ──
  return (
    <div className="flex h-dvh w-full text-white selection:bg-white selection:text-black" style={{ background: "#080808" }}>

      {/* SIDEBAR */}
      <aside className="w-[280px] flex-col shrink-0 hidden lg:flex" style={{ background: "#0C0C0C", borderRight: "1px solid rgba(255,255,255,0.04)" }}>

        {/* Brand */}
        <div className="px-8 py-10 flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-9 h-9 flex items-center justify-center transition-all group-hover:scale-110">
              <img src="/talo-logo.png" alt="TALO" className="w-8 h-8" />
            </div>
            <div className="flex flex-col">
              <span className="font-logo text-[17px] font-black tracking-[0.25em] text-white uppercase leading-none">TALO</span>
              <span className="text-[9px] font-black tracking-[0.3em] uppercase mt-0.5" style={{ color: "#383838" }}>Admin</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-5 space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest px-4 mb-5 mt-2" style={{ color: "#383838" }}>
            Admin
          </p>
          {/* Newsletter nav item — always active here */}
          <div
            className="flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] relative"
            style={{ background: "rgba(255,255,255,0.05)", color: "#FFFFFF" }}
          >
            <motion.div
              layoutId="admin-nav-pill"
              className="absolute left-0 w-1 h-5 rounded-r-full"
              style={{ background: "#FFFFFF" }}
            />
            <Newspaper size={18} strokeWidth={2.5} />
            <span className="font-poppins font-semibold text-[14px]">Newsletter</span>
          </div>
        </nav>

        {/* User card */}
        <div className="p-5">
          <div className="rounded-[24px] p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                   style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}>
                P
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-poppins font-bold text-sm text-white truncate leading-tight">Philipp Pauli</span>
                <span className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: "#555" }}>Admin</span>
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

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden flex flex-col" style={{ background: "#080808" }}>
        <div className="absolute inset-0 lg:left-[280px] overflow-y-auto no-scrollbar">
          <div className="max-w-5xl mx-auto px-6 py-10">

            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white font-poppins">Newsletter</h1>
              <p className="text-sm mt-1" style={{ color: "#555" }}>Abonnenten verwalten und E-Mails versenden.</p>
            </div>

            <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">

              {/* ── Left: Subscribers ── */}
              <div className="flex flex-col gap-4">

                {/* Stats */}
                <div className="rounded-[1.25rem] p-5 flex items-center gap-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(125,216,216,0.15)" }}>
                    <Users className="w-5 h-5" style={{ color: "#7DD8D8" }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white leading-none">{loadingSubs ? "…" : subscribers.length}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Aktive Abonnenten</p>
                  </div>
                  <button
                    onClick={loadSubscribers}
                    disabled={loadingSubs}
                    className="ml-auto p-2 rounded-lg transition-colors"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                    title="Aktualisieren"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingSubs ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {/* List */}
                <div className="rounded-[1.25rem] overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <h2 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Abonnenten</h2>
                  </div>
                  {loadingSubs ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgba(255,255,255,0.15)" }} />
                    </div>
                  ) : subscribers.length === 0 ? (
                    <div className="text-center py-12 text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>Noch keine Abonnenten.</div>
                  ) : (
                    <ul className="max-h-[440px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                      {subscribers.map((s) => (
                        <li key={s.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                               style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                            {s.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{s.email}</p>
                            {s.subscribedAt && (
                              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                                {s.subscribedAt.toDate().toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* ── Right: Compose ── */}
              <div className="rounded-[1.25rem] overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2 font-poppins">
                    <Mail className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                    Newsletter verfassen
                  </h2>
                  <button
                    onClick={() => setPreview((p) => !p)}
                    className="flex items-center gap-1.5 text-xs transition-colors"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                  >
                    {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {preview ? "Editor" : "Vorschau"}
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                  {/* Subject */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Betreff</label>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="z.B. Talo Update – April 2026"
                      className="w-full px-4 py-3 rounded-[10px] text-white text-sm outline-none transition-all font-poppins"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(125,216,216,0.4)")}
                      onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")}
                    />
                  </div>

                  {/* Body */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Inhalt <span className="normal-case tracking-normal font-normal opacity-60">(HTML)</span>
                    </label>
                    {preview ? (
                      <div
                        className="min-h-[300px] p-5 rounded-[10px] bg-white text-[#1a1a1a] text-sm overflow-auto"
                        dangerouslySetInnerHTML={{ __html: htmlBody || "<p style='color:#aaa'>Kein Inhalt.</p>" }}
                      />
                    ) : (
                      <textarea
                        value={htmlBody}
                        onChange={(e) => setHtmlBody(e.target.value)}
                        rows={14}
                        placeholder={`<h2 style="font-size:22px;font-weight:600;margin:0 0 16px">Hey,</h2>\n<p style="color:#555;line-height:1.7;margin:0 0 16px">...</p>`}
                        className="w-full px-4 py-3 rounded-[10px] text-white text-sm font-mono outline-none resize-none transition-all"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                        onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(125,216,216,0.4)")}
                        onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")}
                      />
                    )}
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
                    Der Abmelde-Link wird automatisch an jede E-Mail angehängt.
                  </p>

                  {/* Error / Success */}
                  {sendError && (
                    <div className="flex items-start gap-2 p-3 rounded-[10px] text-sm" style={{ background: "rgba(255,69,58,0.1)", border: "1px solid rgba(255,69,58,0.2)", color: "#FF6B6B" }}>
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> {sendError}
                    </div>
                  )}
                  {sendResult && (
                    <div className="flex items-center gap-2 p-3 rounded-[10px] text-sm" style={{ background: "rgba(125,216,216,0.1)", border: "1px solid rgba(125,216,216,0.2)", color: "#7DD8D8" }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {sendResult.sent} E-Mails gesendet{sendResult.failed > 0 ? `, ${sendResult.failed} fehlgeschlagen` : " ✓"}.
                    </div>
                  )}

                  {/* Send */}
                  <button
                    onClick={handleSend}
                    disabled={sending || subscribers.length === 0}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[12px] font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed font-poppins"
                    style={{ background: "#7DD8D8", color: "#0D0D0D" }}
                    onMouseEnter={(e) => { if (!sending) (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                  >
                    {sending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Wird gesendet …</>
                    ) : (
                      <><Send className="w-4 h-4" /> An {subscribers.length} Abonnent{subscribers.length !== 1 ? "en" : "en"} senden</>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
