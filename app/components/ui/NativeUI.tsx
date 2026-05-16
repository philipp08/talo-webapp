"use client";

import { LucideIcon, Search, X, Lock } from "lucide-react";
import Image from "next/image";
import React, { ReactNode } from "react";

// ─── Colors – 1:1 wie native DesignSystem.swift ──────────────────────────────
export const colors = {
  bg:         "#FAFAFA",
  bgSoft:     "#FFFFFF",
  bgCard:     "#FFFFFF",
  bgMuted:    "#F4F4F5",
  text:       "#0A0A0A",
  textSub:    "#52525B",
  textMuted:  "#B4B4BA",
  border:     "#E4E4E7",
  teal:       "#0A0A0A",   // Akzentfarbe = dunkel (light mode)
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
    B: { bg: "rgba(0,0,0,0.09)", color: "#0A0A0A" },
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
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`rounded-[18px] overflow-hidden ${className}`}
    style={{
      background: "#FFFFFF",
      border: "1px solid rgba(0,0,0,0.06)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.03)",
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── TLine ────────────────────────────────────────────────────────────────────
export const TLine = ({ className = "" }: { className?: string }) => (
  <div className={`h-[1px] w-full ${className}`} style={{ background: "rgba(0,0,0,0.07)" }} />
);

// ─── TAvatar ──────────────────────────────────────────────────────────────────
export const TAvatar = ({
  name,
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
        background: "rgba(0,0,0,0.09)",
      }}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={name} width={size} height={size} className="w-full h-full object-cover" />
      ) : (
        <span
          className="font-poppins font-bold text-[#0A0A0A]/80"
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
    primary:   "bg-[var(--accent-color,#0A0A0A)] text-white hover:opacity-90 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]",
    secondary: "bg-black/[0.06] text-[#0A0A0A] hover:bg-black/[0.1] border border-black/10",
    danger:    "bg-[#FF453A]/10 text-[#FF453A] hover:bg-[#FF453A]/20 border border-[#FF453A]/20",
    ghost:     "bg-transparent text-[#52525B] hover:text-[#0A0A0A]",
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
    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl pl-11 pr-10 py-3.5 text-base font-poppins text-[#0A0A0A] placeholder-[#A1A1AA] focus:outline-none transition-all"
      style={{
        background: "rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.09)",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-color, rgba(0,0,0,0.2))")}
      onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.09)")}
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#0A0A0A] transition-colors"
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
         style={{ background: "var(--brand-color, rgba(232,122,160,0.06))", opacity: 0.12 }} />
    <div className="absolute top-1/3 -right-20 w-80 h-60 rounded-full blur-[100px]"
         style={{ background: "var(--accent-color, rgba(0,0,0,0.04))", opacity: 0.08 }} />
    <div className="absolute -bottom-20 left-1/4 w-72 h-48 rounded-full blur-[90px]"
         style={{ background: "var(--brand-color, rgba(52,199,89,0.04))", opacity: 0.08 }} />
  </div>
);

// ─── TBadge ───────────────────────────────────────────────────────────────────
export const TBadge = ({
  label,
  icon: Icon,
  color = "#0A0A0A",
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
      background: "rgba(0,0,0,0.06)",
      border: "1px solid rgba(0,0,0,0.11)",
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
        ? { background: "#0A0A0A", color: "#FAFAFA", border: "1px solid #FFFFFF" }
        : { background: "rgba(0,0,0,0.06)", color: "#52525B", border: "1px solid rgba(0,0,0,0.09)" }
    }
  >
    {label}
  </button>
);

// ─── PlanLockedField ──────────────────────────────────────────────────────────
export const PlanLockedField = ({
  locked,
  label,
  unlockText,
  children,
}: {
  locked: boolean;
  label: string;
  unlockText: string;
  children: React.ReactNode;
}) => {
  if (!locked) return <>{children}</>;

  return (
    <div className="rounded-2xl border border-black/5 bg-black/[0.03] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-poppins font-bold text-[#0A0A0A]">{label}</p>
          <p className="text-[11px] font-poppins text-[#71717A]">Freischalten {unlockText}</p>
        </div>
        <Lock size={16} className="text-[#A1A1AA]" />
      </div>
    </div>
  );
};

// ─── PlanUpsell ───────────────────────────────────────────────────────────────
export const PlanUpsell = ({ title, text }: { title: string; text: string }) => {
  return (
    <div className="p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-black/[0.05] flex items-center justify-center shrink-0">
        <Lock size={17} className="text-[#52525B]" />
      </div>
      <div>
        <p className="font-poppins font-bold text-[#0A0A0A] text-sm">{title}</p>
        <p className="text-xs text-[#71717A] mt-1 leading-relaxed">{text}</p>
      </div>
    </div>
  );
};

// ─── BrandingBar ──────────────────────────────────────────────────────────────
export const BrandingBar = () => (
  <div className="absolute top-0 left-0 right-0 h-1 z-50 overflow-hidden">
    <div className="h-full w-full opacity-60" style={{ background: "linear-gradient(90deg, var(--brand-color) 0%, var(--accent-color) 100%)" }} />
  </div>
);
