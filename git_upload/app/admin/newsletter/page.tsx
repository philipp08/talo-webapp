"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase/config";
import {
  collection, query, where, getDocs, orderBy, Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import {
  Users, Send, Trash2, RefreshCw, Mail,
  CheckCircle2, XCircle, LogIn, ChevronDown, ChevronUp,
  Loader2, Eye, EyeOff,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  token: string;
  subscribedAt: Timestamp | null;
}

const ADMIN_EMAIL = "philipp@pauli-one.de";

export default function AdminNewsletterPage() {
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
      const q = query(
        collection(db, "newsletter_subscribers"),
        where("active", "==", true),
        orderBy("subscribedAt", "desc")
      );
      const snap = await getDocs(q);
      setSubscribers(
        snap.docs.map((d) => ({
          id: d.id,
          email: d.data().email,
          token: d.data().token,
          subscribedAt: d.data().subscribedAt ?? null,
        }))
      );
    } catch (e) {
      console.error(e);
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
      setSendResult({ sent: data.sent, failed: data.failed });
    } catch (e: any) {
      setSendError(e.message || "Unbekannter Fehler");
    }
    setSending(false);
  }

  // ── Loading auth ──
  if (user === "loading") {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  // ── Not logged in ──
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
          <LogIn className="w-6 h-6 text-white/40" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white mb-2">Nicht eingeloggt</h1>
          <p className="text-[#8A8A8A] text-sm">Du musst als Admin eingeloggt sein um diese Seite zu sehen.</p>
        </div>
        <Link
          href="/anmelden"
          className="px-5 py-3 rounded-[12px] bg-white text-black font-medium text-sm hover:opacity-90 transition-all"
        >
          Zum Login
        </Link>
      </div>
    );
  }

  // ── Wrong account ──
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <XCircle className="w-10 h-10 text-red-400" />
        <div>
          <h1 className="text-xl font-semibold text-white mb-2">Kein Zugriff</h1>
          <p className="text-[#8A8A8A] text-sm">Dieses Dashboard ist nur für den Admin zugänglich.</p>
        </div>
      </div>
    );
  }

  // ── Admin view ──
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm tracking-wider">T</span>
          </div>
          <span className="font-semibold text-sm">Newsletter Admin</span>
        </div>
        <Link href="/" className="text-xs text-white/40 hover:text-white/70 transition-colors">
          ← Zur Website
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 grid lg:grid-cols-[340px_1fr] gap-8 items-start">

        {/* ── Left: Subscriber list ── */}
        <div className="flex flex-col gap-4">
          {/* Stats card */}
          <div className="rounded-[1.25rem] bg-white/[0.04] border border-white/[0.08] p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white leading-none">{loadingSubs ? "…" : subscribers.length}</p>
              <p className="text-xs text-white/40 mt-0.5">Aktive Abonnenten</p>
            </div>
            <button
              onClick={loadSubscribers}
              disabled={loadingSubs}
              className="ml-auto p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-white/40 hover:text-white"
              title="Aktualisieren"
            >
              <RefreshCw className={`w-4 h-4 ${loadingSubs ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Subscriber list */}
          <div className="rounded-[1.25rem] bg-white/[0.04] border border-white/[0.08] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Abonnenten</h2>
            </div>
            {loadingSubs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-12 text-white/30 text-sm">Noch keine Abonnenten.</div>
            ) : (
              <ul className="divide-y divide-white/[0.05] max-h-[480px] overflow-y-auto">
                {subscribers.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/50 shrink-0">
                      {s.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{s.email}</p>
                      {s.subscribedAt && (
                        <p className="text-[11px] text-white/30">
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
        <div className="flex flex-col gap-4">
          <div className="rounded-[1.25rem] bg-white/[0.04] border border-white/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-white/40" />
                Newsletter verfassen
              </h2>
              <button
                onClick={() => setPreview((p) => !p)}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {preview ? "Editor" : "Vorschau"}
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/40 font-medium uppercase tracking-wider">Betreff</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="z.B. Talo Update – April 2026"
                  className="w-full px-4 py-3 rounded-[10px] bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/20 text-sm outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
                />
              </div>

              {/* Body */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/40 font-medium uppercase tracking-wider">
                  Inhalt <span className="normal-case tracking-normal opacity-60">(HTML)</span>
                </label>
                {preview ? (
                  <div
                    className="min-h-[300px] p-5 rounded-[10px] bg-white text-[#1a1a1a] text-sm overflow-auto"
                    dangerouslySetInnerHTML={{ __html: htmlBody || "<p class='text-gray-400'>Kein Inhalt.</p>" }}
                  />
                ) : (
                  <textarea
                    value={htmlBody}
                    onChange={(e) => setHtmlBody(e.target.value)}
                    rows={14}
                    placeholder={`<h2 style="font-size:22px;font-weight:600;margin:0 0 16px">Hey,</h2>\n<p style="color:#555;line-height:1.7;margin:0 0 16px">...</p>`}
                    className="w-full px-4 py-3 rounded-[10px] bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/20 text-sm font-mono outline-none focus:ring-2 focus:ring-violet-500/30 transition-all resize-none"
                  />
                )}
              </div>

              {/* Hint */}
              <p className="text-xs text-white/25 leading-relaxed">
                Der Abmelde-Link wird automatisch an jede E-Mail angehängt. Du musst ihn nicht selbst einfügen.
              </p>

              {/* Error / Success */}
              {sendError && (
                <div className="flex items-center gap-2 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <XCircle className="w-4 h-4 shrink-0" /> {sendError}
                </div>
              )}
              {sendResult && (
                <div className="flex items-center gap-2 p-3 rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {sendResult.sent} E-Mails gesendet{sendResult.failed > 0 ? `, ${sendResult.failed} fehlgeschlagen` : ""}.
                </div>
              )}

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={sending || subscribers.length === 0}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[12px] bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
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
  );
}
