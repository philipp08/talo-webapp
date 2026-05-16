"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { db, auth } from "@/lib/firebase/config";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { ADMIN_EMAIL } from "@/lib/firebase/constants";
import {
  Users, Send, RefreshCw, Mail, CheckCircle2, XCircle,
  Loader2, Eye, EyeOff, Smartphone, Monitor,
  Bold, Italic, List, Type, Minus, ImageIcon,
  GripVertical, Trash2, Plus, ArrowUp, ArrowDown, Quote,
} from "lucide-react";
import { buildNewsletterHtml, blocksToHtml } from "@/lib/newsletter/template";
import { GlassSection, TLine, TButton } from "@/app/components/ui/NativeUI";
import { motion, AnimatePresence } from "framer-motion";

/* ── Block Types ────────────────────────────────────── */
type BlockType = "text" | "heading" | "divider" | "image" | "quote";
interface Block { id: string; type: BlockType; content: string; }

function makeId() { return Math.random().toString(36).slice(2, 10); }
function newBlock(type: BlockType, content = ""): Block { return { id: makeId(), type, content }; }

/* ── Subscriber ─────────────────────────────────────── */
interface Subscriber { id: string; email: string; token: string; subscribedAt: Timestamp | null; }

/* ── Block Component ────────────────────────────────── */
function BlockEditor({ block, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: {
  block: Block; onChange: (b: Block) => void; onRemove: () => void;
  onMoveUp: () => void; onMoveDown: () => void; isFirst: boolean; isLast: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [block.content]);

  if (block.type === "divider") {
    return (
      <div className="group flex items-center gap-2 py-2">
        <GripVertical size={14} className="text-[#D4D4D8] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0" />
        <div className="flex-1 h-px bg-black/10" />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onMoveUp} disabled={isFirst} className="w-6 h-6 rounded flex items-center justify-center text-[#A1A1AA] hover:text-[#0A0A0A] disabled:opacity-20"><ArrowUp size={12} /></button>
          <button onClick={onMoveDown} disabled={isLast} className="w-6 h-6 rounded flex items-center justify-center text-[#A1A1AA] hover:text-[#0A0A0A] disabled:opacity-20"><ArrowDown size={12} /></button>
          <button onClick={onRemove} className="w-6 h-6 rounded flex items-center justify-center text-[#A1A1AA] hover:text-[#FF453A]"><Trash2 size={12} /></button>
        </div>
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div className="group flex items-start gap-2">
        <GripVertical size={14} className="text-[#D4D4D8] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0 mt-3" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <ImageIcon size={14} className="text-[#A1A1AA] shrink-0" />
            <input
              value={block.content}
              onChange={(e) => onChange({ ...block, content: e.target.value })}
              placeholder="Bild-URL einfügen (https://...)"
              className="flex-1 text-sm font-poppins text-[#0A0A0A] placeholder-[#A1A1AA] bg-transparent outline-none"
            />
          </div>
          {block.content && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.content} alt="" className="max-h-48 rounded-xl object-cover border border-black/5" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={onMoveUp} disabled={isFirst} className="w-6 h-6 rounded flex items-center justify-center text-[#A1A1AA] hover:text-[#0A0A0A] disabled:opacity-20"><ArrowUp size={12} /></button>
          <button onClick={onMoveDown} disabled={isLast} className="w-6 h-6 rounded flex items-center justify-center text-[#A1A1AA] hover:text-[#0A0A0A] disabled:opacity-20"><ArrowDown size={12} /></button>
          <button onClick={onRemove} className="w-6 h-6 rounded flex items-center justify-center text-[#A1A1AA] hover:text-[#FF453A]"><Trash2 size={12} /></button>
        </div>
      </div>
    );
  }

  const styles: Record<string, string> = {
    text: "text-[14px] font-normal",
    heading: "text-[18px] font-bold",
    quote: "text-[14px] italic border-l-2 border-black/20 pl-3",
  };

  const placeholders: Record<string, string> = {
    text: "Text eingeben…",
    heading: "Überschrift…",
    quote: "Zitat…",
  };

  return (
    <div className="group flex items-start gap-2">
      <GripVertical size={14} className="text-[#D4D4D8] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0 mt-2.5" />
      <textarea
        ref={ref}
        value={block.content}
        onChange={(e) => { onChange({ ...block, content: e.target.value }); }}
        placeholder={placeholders[block.type] || ""}
        rows={1}
        className={`flex-1 bg-transparent outline-none resize-none font-poppins text-[#0A0A0A] placeholder-[#C4C4C8] leading-relaxed ${styles[block.type] || ""}`}
      />
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onMoveUp} disabled={isFirst} className="w-6 h-6 rounded flex items-center justify-center text-[#A1A1AA] hover:text-[#0A0A0A] disabled:opacity-20"><ArrowUp size={12} /></button>
        <button onClick={onMoveDown} disabled={isLast} className="w-6 h-6 rounded flex items-center justify-center text-[#A1A1AA] hover:text-[#0A0A0A] disabled:opacity-20"><ArrowDown size={12} /></button>
        <button onClick={onRemove} className="w-6 h-6 rounded flex items-center justify-center text-[#A1A1AA] hover:text-[#FF453A]"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

/* ── Removed Legacy Plaintext Conversion ───────────── */

/* ── Main Page ──────────────────────────────────────── */
export default function AdminNewsletterPage() {
  const [user, setUser] = useState<User | null | "loading">("loading");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const [subject, setSubject] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([newBlock("text")]);
  const [preview, setPreview] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<"desktop" | "mobile">("desktop");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);
  const [sendError, setSendError] = useState("");

  useEffect(() => { return onAuthStateChanged(auth, (u) => setUser(u)); }, []);

  const loadSubscribers = useCallback(async () => {
    setLoadingSubs(true);
    try {
      console.log("[admin] Attempting to load subscribers...");
      // Try simple collection fetch first to see if it's a filter issue
      const colRef = collection(db, "newsletter_subscribers");
      const snap = await getDocs(colRef);
      
      const docs = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            email: data.email as string,
            token: data.token as string,
            active: data.active === true,
            subscribedAt: (data.subscribedAt as Timestamp) ?? null,
          };
        })
        .filter(d => d.active); // Filter in memory to bypass potential query-rule issues

      docs.sort((a, b) => (b.subscribedAt?.toMillis() ?? 0) - (a.subscribedAt?.toMillis() ?? 0));
      setSubscribers(docs);
      console.log(`[admin] Successfully loaded ${docs.length} subscribers.`);
    } catch (e) { 
      console.error("[admin] loadSubscribers error:", e);
      setSendError("Zugriffsfehler: Keine Berechtigung zum Laden der Abonnenten.");
    }
    setLoadingSubs(false);
  }, []);

  useEffect(() => {
    if (user && user !== "loading") {
      loadSubscribers();
    }
  }, [user, loadSubscribers]);

  // Block operations
  const updateBlock = (idx: number, b: Block) => setBlocks((prev) => prev.map((bl, i) => (i === idx ? b : bl)));
  const removeBlock = (idx: number) => setBlocks((prev) => prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx));
  const moveBlock = (idx: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };
  const addBlock = (type: BlockType) => setBlocks((prev) => [...prev, newBlock(type)]);

  const hasContent = blocks.some((b) => b.type === "divider" || b.content.trim().length > 0);
  const htmlBody = useMemo(() => blocksToHtml(blocks), [blocks]);

  const previewHtml = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const bodyOrPlaceholder = hasContent ? htmlBody : "<p style='color:#9CA3AF;font-style:italic'>Noch kein Inhalt …</p>";
    return buildNewsletterHtml({ htmlBody: bodyOrPlaceholder, baseUrl: origin, unsubLink: `${origin}/newsletter/abmelden?token=PREVIEW` });
  }, [htmlBody, hasContent]);

  async function handleSend() {
    if (!subject.trim() || !hasContent) { setSendError("Bitte Betreff und Inhalt ausfüllen."); return; }
    if (subscribers.length === 0) { setSendError("Keine aktiven Abonnenten."); return; }
    setSending(true); setSendError(""); setSendResult(null);
    try {
      const token = user && user !== "loading" ? await user.getIdToken() : null;
      if (!token) throw new Error("Admin-Authentifizierung fehlt.");
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject, htmlBody: htmlBody, plaintextMode: false,
          subscribers: subscribers.map(({ email, token }) => ({ email, token })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler beim Versand");
      if (data.failed > 0) setSendError(`${data.failed} E-Mail(s) fehlgeschlagen`);
      setSendResult({ sent: data.sent, failed: data.failed });
    } catch (e) { setSendError(e instanceof Error ? e.message : "Unbekannter Fehler"); }
    setSending(false);
  }

  if (user === "loading") return <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAFA" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgba(0,0,0,0.2)" }} /></div>;
  if (!user) return null;

  const blockTypes: { type: BlockType; icon: React.ElementType; label: string }[] = [
    { type: "text", icon: Type, label: "Text" },
    { type: "heading", icon: Bold, label: "Überschrift" },
    { type: "quote", icon: Quote, label: "Zitat" },
    { type: "divider", icon: Minus, label: "Trennlinie" },
    { type: "image", icon: ImageIcon, label: "Bild" },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Newsletter</h1>
            <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">Abonnenten verwalten &amp; E-Mails versenden</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">

          {/* LEFT: Subscribers */}
          <div className="flex flex-col gap-4">
            <GlassSection>
              <div className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <Users className="w-5 h-5" style={{ color: "#0A0A0A" }} />
                </div>
                <div>
                  <p className="text-[28px] font-poppins font-bold text-[#0A0A0A] leading-none">{loadingSubs ? "…" : subscribers.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-0.5" style={{ color: "#71717A" }}>Aktive Abonnenten</p>
                </div>
                <button onClick={loadSubscribers} disabled={loadingSubs} className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: "rgba(0,0,0,0.05)", color: "#71717A" }}>
                  <RefreshCw className={`w-4 h-4 ${loadingSubs ? "animate-spin" : ""}`} />
                </button>
              </div>
            </GlassSection>

            <GlassSection>
              <div className="px-4 py-3 flex items-center" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "#71717A" }}>Abonnenten</h2>
              </div>
              {loadingSubs ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgba(0,0,0,0.2)" }} /></div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-12 text-sm" style={{ color: "#A1A1AA" }}>Noch keine Abonnenten.</div>
              ) : (
                <ul className="max-h-[440px] overflow-y-auto no-scrollbar divide-y divide-black/5">
                  {subscribers.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "rgba(0,0,0,0.07)", color: "#52525B" }}>
                        {s.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-poppins text-[#0A0A0A] truncate">{s.email}</p>
                        {s.subscribedAt && <p className="text-[10px]" style={{ color: "#A1A1AA" }}>{s.subscribedAt.toDate().toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </GlassSection>
          </div>

          {/* RIGHT: Compose */}
          <div className="flex flex-col gap-4">
            <GlassSection>
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <h2 className="text-sm font-poppins font-bold text-[#0A0A0A] flex items-center gap-2">
                  <Mail className="w-4 h-4" style={{ color: "#71717A" }} />
                  Newsletter verfassen
                </h2>
                <div className="flex items-center gap-2">
                  {preview && (
                    <div className="flex items-center gap-0.5 p-0.5 rounded-[10px]" style={{ background: "rgba(0,0,0,0.04)" }}>
                      <button onClick={() => setPreviewWidth("desktop")} className="px-2.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all flex items-center gap-1.5" style={{ background: previewWidth === "desktop" ? "#FFF" : "transparent", color: previewWidth === "desktop" ? "#0A0A0A" : "#71717A", boxShadow: previewWidth === "desktop" ? "0 1px 2px rgba(0,0,0,0.06)" : "none" }}>
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setPreviewWidth("mobile")} className="px-2.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all flex items-center gap-1.5" style={{ background: previewWidth === "mobile" ? "#FFF" : "transparent", color: previewWidth === "mobile" ? "#0A0A0A" : "#71717A", boxShadow: previewWidth === "mobile" ? "0 1px 2px rgba(0,0,0,0.06)" : "none" }}>
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <button onClick={() => setPreview((p) => !p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-colors" style={{ background: preview ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.04)", color: preview ? "#0A0A0A" : "#71717A" }}>
                    {preview ? <><EyeOff className="w-3.5 h-3.5" /> Editor</> : <><Eye className="w-3.5 h-3.5" /> Vorschau</>}
                  </button>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-5">
                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest pl-1" style={{ color: "#71717A" }}>Betreff</label>
                  <input
                    value={subject} onChange={(e) => setSubject(e.target.value)}
                    placeholder="z.B. Talo Update – Mai 2026"
                    className="w-full px-4 py-3 rounded-2xl text-[#0A0A0A] text-sm outline-none transition-all font-poppins"
                    style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)")}
                  />
                </div>

                {/* Body */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest pl-1" style={{ color: "#71717A" }}>
                    {preview ? "Vorschau" : "Inhalt"}
                  </label>

                  {preview ? (
                    <div className="rounded-[12px] overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)", background: "#F3F4F6" }}>
                      <div className="px-4 py-3 flex items-center gap-3" style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-[#0A0A0A] truncate">{subject || "Betreff (noch leer)"}</p>
                          <p className="text-[10px] truncate" style={{ color: "#71717A" }}>Talo Newsletter</p>
                        </div>
                      </div>
                      <div className="flex justify-center py-6 px-4" style={{ background: "#F3F4F6", minHeight: 400 }}>
                        <iframe title="Vorschau" srcDoc={previewHtml} className="bg-white rounded-[8px] transition-all" style={{ width: previewWidth === "mobile" ? 375 : "100%", maxWidth: previewWidth === "mobile" ? 375 : 640, height: 600, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }} />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)", background: "#FAFAFA" }}>
                      {/* Block Toolbar */}
                      <div className="flex items-center gap-1 px-3 py-2 flex-wrap" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#F5F5F5" }}>
                        <span className="text-[9px] font-black uppercase tracking-widest mr-2" style={{ color: "#A1A1AA" }}>Block hinzufügen:</span>
                        {blockTypes.map((bt) => (
                          <button key={bt.type} onClick={() => addBlock(bt.type)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:bg-black/[0.06]" style={{ color: "#52525B" }}>
                            <bt.icon size={13} /> {bt.label}
                          </button>
                        ))}
                      </div>

                      {/* Blocks */}
                      <div className="p-4 flex flex-col gap-3 min-h-[300px]">
                        {blocks.map((block, idx) => (
                          <BlockEditor
                            key={block.id}
                            block={block}
                            onChange={(b) => updateBlock(idx, b)}
                            onRemove={() => removeBlock(idx)}
                            onMoveUp={() => moveBlock(idx, -1)}
                            onMoveDown={() => moveBlock(idx, 1)}
                            isFirst={idx === 0}
                            isLast={idx === blocks.length - 1}
                          />
                        ))}

                        {blocks.length === 0 && (
                          <button onClick={() => addBlock("text")} className="flex items-center justify-center gap-2 py-10 text-sm font-poppins transition-colors" style={{ color: "#A1A1AA" }}>
                            <Plus size={16} /> Block hinzufügen
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[11px] leading-relaxed" style={{ color: "#A1A1AA" }}>
                  Logo, Footer und Abmelde-Link werden automatisch ergänzt. **Text** = fett.
                </p>

                {/* Error / Success */}
                <AnimatePresence>
                  {sendError && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 p-3 rounded-2xl text-sm" style={{ background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)", color: "#C53030" }}>
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> {sendError}
                    </motion.div>
                  )}
                  {sendResult && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 p-3 rounded-2xl text-sm" style={{ background: "rgba(52,199,89,0.1)", border: "1px solid rgba(52,199,89,0.2)", color: "#34C759" }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {sendResult.sent} E-Mails gesendet{sendResult.failed > 0 ? `, ${sendResult.failed} fehlgeschlagen` : " ✓"}.
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Send */}
                <TButton
                  label={sending ? "Wird gesendet…" : `An ${subscribers.length} Abonnent${subscribers.length !== 1 ? "en" : ""} senden`}
                  icon={sending ? Loader2 : Send}
                  onClick={handleSend}
                  disabled={sending || subscribers.length === 0}
                />
              </div>
            </GlassSection>
          </div>
        </div>
      </div>
    </div>
  );
}
