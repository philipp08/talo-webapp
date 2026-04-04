"use client";

import { motion } from "framer-motion";
import { LucideIcon, Search, X } from "lucide-react";
import { ReactNode } from "react";

// ─── Colors – 1:1 wie native DesignSystem.swift ──────────────────────────────
export const colors = {
  bg:         "#080808",
  bgSoft:     "#0D0D0D",
  bgCard:     "#101010",
  bgMuted:    "#1A1A1A",
  text:       "#FFFFFF",
  textSub:    "#8A8A8A",
  textMuted:  "#383838",
  border:     "#242424",
  teal:       "#FFFFFF",   // Akzentfarbe = weiß, wie native tTeal
  pink:       "#E87AA0",
  green:      "#34C759",
  orange:     "#FF9500",
  red:        "#FF453A",
};

// ─── TCatBadge ────────────────────────────────────────────────────────────────
/** Category-Badge: A=pink, B=white, C=green, S=orange – wie native TCatBadge */
export const TCatBadge = ({
  category,
  size = 40,
  className = "",
}: {
  category: string;
  size?: number;
  className?: string;
}) => {
  const styles: Record<string, { bg: string; color: string }> = {
    A: { bg: "rgba(232,122,160,0.15)", color: "#E87AA0" },
    B: { bg: "rgba(255,255,255,0.08)", color: "#FFFFFF" },
    C: { bg: "rgba(52,199,89,0.15)",   color: "#34C759" },
    S: { bg: "rgba(255,149,0,0.15)",   color: "#FF9500" },
  };
  const s = styles[category] ?? styles.B;

  return (
    <div
      className={`rounded-xl flex items-center justify-center font-poppins font-bold shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: s.bg,
        color: s.color,
      }}
    >
      {category}
    </div>
  );
};

// ─── GlassSection ─────────────────────────────────────────────────────────────
export const GlassSection = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-[18px] overflow-hidden ${className}`}
    style={{
      background: "rgba(16,16,16,0.85)",
      border: "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }}
  >
    {children}
  </div>
);

// ─── TLine ────────────────────────────────────────────────────────────────────
export const TLine = ({ className = "" }: { className?: string }) => (
  <div className={`h-[1px] w-full ${className}`} style={{ background: "rgba(255,255,255,0.06)" }} />
);

// ─── TAvatar ──────────────────────────────────────────────────────────────────
export const TAvatar = ({
  name,
  id,
  size = 40,
  imageUrl,
  className = "",
}: {
  name: string;
  id: string;
  size?: number;
  imageUrl?: string | null;
  className?: string;
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: "rgba(255,255,255,0.08)",
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span
          className="font-poppins font-bold text-white/80"
          style={{ fontSize: size * 0.38 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
};

// ─── TButton ──────────────────────────────────────────────────────────────────
export const TButton = ({
  label,
  icon: Icon,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  type = "button",
}: {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) => {
  const themes: Record<string, string> = {
    primary:   "bg-white text-[#080808] hover:bg-white/90",
    secondary: "bg-white/8 text-white hover:bg-white/15 border border-white/10",
    danger:    "bg-[#FF453A]/10 text-[#FF453A] hover:bg-[#FF453A]/20 border border-[#FF453A]/20",
    ghost:     "bg-transparent text-[#8A8A8A] hover:text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-poppins font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${themes[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  );
};

// ─── TSearchBar ───────────────────────────────────────────────────────────────
export const TSearchBar = ({
  value,
  onChange,
  placeholder = "Suchen…",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) => (
  <div className="relative w-full">
    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl pl-11 pr-10 py-3.5 text-sm font-poppins text-white placeholder-[#444] focus:outline-none transition-all"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)")}
      onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
      >
        <X size={15} />
      </button>
    )}
  </div>
);

// ─── AmbientBackground ────────────────────────────────────────────────────────
export const AmbientBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-24 -left-12 w-96 h-72 rounded-full blur-[120px]"
         style={{ background: "rgba(232,122,160,0.06)" }} />
    <div className="absolute top-1/3 -right-20 w-80 h-60 rounded-full blur-[100px]"
         style={{ background: "rgba(255,255,255,0.03)" }} />
    <div className="absolute -bottom-20 left-1/4 w-72 h-48 rounded-full blur-[90px]"
         style={{ background: "rgba(52,199,89,0.04)" }} />
  </div>
);

// ─── TBadge ───────────────────────────────────────────────────────────────────
export const TBadge = ({
  label,
  icon: Icon,
  color = "white",
  className = "",
}: {
  label: string;
  icon?: LucideIcon;
  color?: string;
  className?: string;
}) => (
  <div
    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-poppins font-bold uppercase tracking-wider ${className}`}
    style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      color,
    }}
  >
    {Icon && <Icon size={10} />}
    {label}
  </div>
);

// ─── TStatusBadge ─────────────────────────────────────────────────────────────
/** Zeigt Genehmigt / Ausstehend / Abgelehnt in nativer Farbe */
export const TStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    Genehmigt:   { label: "Genehmigt",   color: "#34C759", bg: "rgba(52,199,89,0.12)"   },
    Ausstehend:  { label: "Ausstehend",  color: "#FF9500", bg: "rgba(255,149,0,0.12)"   },
    Abgelehnt:   { label: "Abgelehnt",   color: "#FF453A", bg: "rgba(255,69,58,0.12)"   },
  };
  const s = map[status] ?? map.Ausstehend;
  return (
    <span
      className="text-[11px] font-poppins font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

// ─── TFilterPill ──────────────────────────────────────────────────────────────
export const TFilterPill = ({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="shrink-0 px-4 py-1.5 rounded-full text-xs font-poppins font-bold transition-all"
    style={
      isSelected
        ? { background: "#FFFFFF", color: "#080808", border: "1px solid #FFFFFF" }
        : { background: "rgba(255,255,255,0.05)", color: "#8A8A8A", border: "1px solid rgba(255,255,255,0.08)" }
    }
  >
    {label}
  </button>
);
