"use client";

import { useEffect, useMemo, useState } from "react";
import { db, auth } from "@/lib/firebase/config";
import {
  collection, query, where, getDocs, Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { ADMIN_EMAIL } from "@/lib/firebase/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, Send, RefreshCw, Mail,
  CheckCircle2, XCircle, LogIn,
  Loader2, Eye, EyeOff, Smartphone, Monitor,
} from "lucide-react";
import { buildNewsletterHtml } from "@/lib/newsletter/template";

interface Subscriber {
  id: string;
  email: string;
  token: string;
  subscribedAt: Timestamp | null;
}

export default function AdminNewsletterPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | "loading">("loading");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Compose state
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<"desktop" | "mobile">("desktop");
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
        where("active", "==", true)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({
        id: d.id,
        email: d.data().email as string,
        token: d.data().token as string,
        subscribedAt: (d.data().subscribedAt as Timestamp) ?? null,
      }));
      docs.sort((a, b) => {
        const ta = a.subscribedAt?.toMillis() ?? 0;
        const tb = b.subscribedAt?.toMillis() ?? 0;
        return tb - ta;
      });
      setSubscribers(docs);
    } catch (e) {
      console.error("[admin] loadSubscribers error:", e instanceof Error ? e.message : e);
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
      const token = user && user !== "loading" ? await user.getIdToken() : null;
      if (!token) {
        throw new Error("Admin-Authentifizierung fehlt.");
      }

      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Unbekannter Fehler");
    }
    setSending(false);
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/anmelden");
  };

  // Build identical-to-prod preview HTML
  const previewHtml = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return buildNewsletterHtml({
      htmlBody: htmlBody || "<p style='color:#9CA3AF;font-style:italic'>Noch kein Inhalt geschrieben …</p>",
      baseUrl: origin,
      unsubLink: `${origin}/newsletter/abmelden?token=PREVIEW`,
    });
  }, [htmlBody]);

  // ── Loading auth ──
  if (user === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAFA" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgba(0,0,0,0.2)" }} />
      </div>
    );
  }

  // ── Not logged in ──
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

  // ── Wrong account ──
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

  // ── Admin Console ──
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A] font-poppins">Newsletter</h1>
        <p className="text-sm mt-1" style={{ color: "#71717A" }}>Abonnenten verwalten und E-Mails versenden.</p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* ── Left: Subscribers ── */}
        <div className="flex flex-col gap-4">

          {/* Stats */}
          <div className="rounded-[1.25rem] p-5 flex items-center gap-4" style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(125,216,216,0.15)" }}>
              <Users className="w-5 h-5" style={{ color: "#3FA7A7" }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0A0A0A] leading-none">{loadingSubs ? "…" : subscribers.length}</p>
              <p className="text-xs mt-0.5" style={{ color: "#71717A" }}>Aktive Abonnenten</p>
            </div>
            <button
              onClick={loadSubscribers}
              disabled={loadingSubs}
              className="ml-auto p-2 rounded-lg transition-colors"
              style={{ color: "#71717A" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0A0A0A")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#71717A")}
              title="Aktualisieren"
            >
              <RefreshCw className={`w-4 h-4 ${loadingSubs ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* List */}
          <div className="rounded-[1.25rem] overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <h2 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#B4B4BA" }}>Abonnenten</h2>
            </div>
            {loadingSubs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgba(0,0,0,0.2)" }} />
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{ color: "#B4B4BA" }}>Noch keine Abonnenten.</div>
            ) : (
              <ul className="max-h-[440px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {subscribers.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                         style={{ background: "rgba(0,0,0,0.06)", color: "#71717A" }}>
                      {s.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0A0A0A] truncate">{s.email}</p>
                      {s.subscribedAt && (
                        <p className="text-[11px]" style={{ color: "#B4B4BA" }}>
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
        <div className="rounded-[1.25rem] overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <h2 className="text-sm font-semibold text-[#0A0A0A] flex items-center gap-2 font-poppins">
              <Mail className="w-4 h-4" style={{ color: "#71717A" }} />
              Newsletter verfassen
            </h2>
            <div className="flex items-center gap-2">
              {preview && (
                <div className="flex items-center gap-0.5 p-0.5 rounded-[10px]" style={{ background: "rgba(0,0,0,0.04)" }}>
                  <button
                    onClick={() => setPreviewWidth("desktop")}
                    className="px-2.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all flex items-center gap-1.5"
                    style={{
                      background: previewWidth === "desktop" ? "#FFFFFF" : "transparent",
                      color: previewWidth === "desktop" ? "#0A0A0A" : "#71717A",
                      boxShadow: previewWidth === "desktop" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                    }}
                    title="Desktop-Ansicht"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewWidth("mobile")}
                    className="px-2.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all flex items-center gap-1.5"
                    style={{
                      background: previewWidth === "mobile" ? "#FFFFFF" : "transparent",
                      color: previewWidth === "mobile" ? "#0A0A0A" : "#71717A",
                      boxShadow: previewWidth === "mobile" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                    }}
                    title="Mobile-Ansicht"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <button
                onClick={() => setPreview((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-colors"
                style={{
                  background: preview ? "rgba(0,0,0,0.06)" : "rgba(125,216,216,0.18)",
                  color: preview ? "#0A0A0A" : "#3FA7A7",
                }}
              >
                {preview ? <><EyeOff className="w-3.5 h-3.5" /> Editor</> : <><Eye className="w-3.5 h-3.5" /> Vorschau</>}
              </button>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-4">
            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#B4B4BA" }}>Betreff</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="z.B. Talo Update – April 2026"
                className="w-full px-4 py-3 rounded-[10px] text-[#0A0A0A] text-sm outline-none transition-all font-poppins"
                style={{ background: "#FAFAFA", border: "1px solid rgba(0,0,0,0.08)" }}
                onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(63,167,167,0.5)")}
                onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(0,0,0,0.08)")}
              />
            </div>

            {/* Body / Preview */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#B4B4BA" }}>
                {preview ? "Vorschau" : <>Inhalt <span className="normal-case tracking-normal font-normal opacity-60">(HTML)</span></>}
              </label>
              {preview ? (
                <div
                  className="rounded-[12px] overflow-hidden"
                  style={{ border: "1px solid rgba(0,0,0,0.08)", background: "#F3F4F6" }}
                >
                  {/* Email client mock header */}
                  <div
                    className="px-4 py-3 flex items-center gap-3"
                    style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#0A0A0A] truncate">
                        {subject || "Betreff (noch leer)"}
                      </p>
                      <p className="text-[10px] truncate" style={{ color: "#71717A" }}>
                        Talo Newsletter &lt;philipp@pauli-one.com&gt;
                      </p>
                    </div>
                  </div>

                  {/* Iframe preview — isolates email styles from app */}
                  <div className="flex justify-center py-6 px-4" style={{ background: "#F3F4F6", minHeight: 400 }}>
                    <iframe
                      title="Newsletter Vorschau"
                      srcDoc={previewHtml}
                      className="bg-white rounded-[8px] transition-all"
                      style={{
                        width: previewWidth === "mobile" ? 375 : "100%",
                        maxWidth: previewWidth === "mobile" ? 375 : 640,
                        height: 600,
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  value={htmlBody}
                  onChange={(e) => setHtmlBody(e.target.value)}
                  rows={14}
                  placeholder={`<h2 style="font-size:22px;font-weight:600;margin:0 0 16px">Hey,</h2>\n<p style="color:#555;line-height:1.7;margin:0 0 16px">...</p>`}
                  className="w-full px-4 py-3 rounded-[10px] text-[#0A0A0A] text-sm font-mono outline-none resize-none transition-all"
                  style={{ background: "#FAFAFA", border: "1px solid rgba(0,0,0,0.08)" }}
                  onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(63,167,167,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(0,0,0,0.08)")}
                />
              )}
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "#B4B4BA" }}>
              Logo, Footer und Abmelde-Link werden automatisch ergänzt. Die Vorschau zeigt exakt, was der Empfänger sieht.
            </p>

            {/* Error / Success */}
            {sendError && (
              <div className="flex items-start gap-2 p-3 rounded-[10px] text-sm" style={{ background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)", color: "#C53030" }}>
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> {sendError}
              </div>
            )}
            {sendResult && (
              <div className="flex items-center gap-2 p-3 rounded-[10px] text-sm" style={{ background: "rgba(63,167,167,0.1)", border: "1px solid rgba(63,167,167,0.25)", color: "#3FA7A7" }}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {sendResult.sent} E-Mails gesendet{sendResult.failed > 0 ? `, ${sendResult.failed} fehlgeschlagen` : " ✓"}.
              </div>
            )}

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={sending || subscribers.length === 0}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[12px] font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed font-poppins"
              style={{ background: "#0A0A0A", color: "#FFFFFF" }}
              onMouseEnter={(e) => { if (!sending) (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
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
  );
}
