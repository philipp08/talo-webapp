"use client";

import { motion } from "framer-motion";
import { LucideIcon, Search, X } from "lucide-react";
import { ReactNode } from "react";

// --- Colors & Constants ---
export const colors = {
  bg: "#080808",
  bgCard: "#101010",
  bgMuted: "#1A1A1A",
  text: "#FFFFFF",
  textSub: "#8A8A8A",
  textMuted: "#555555",
  teal: "#FFFFFF",
  green: "#8A8A8A",
  orange: "#555555",
  red: "#333333",
  border: "#ffffff0f",
};

// --- Components ---

/**
 * TCatBadge: Native-style category badge (A, B, C, S)
 */
export const TCatBadge = ({ category }: { category: string }) => {
  const styles: Record<string, string> = {
    A: "bg-white/10 text-white",
    B: "bg-white/[0.05] text-[#8A8A8A]",
    C: "bg-white/5 text-[#555555]",
    S: "bg-white/[0.03] text-[#333333] border border-white/5",
  };
  const style = styles[category] || styles.B;
  
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-poppins font-bold text-sm shrink-0 ${style}`}>
      {category}
    </div>
  );
};

/**
 * GlassSection: Native-style container with blur and border stroke
 */
export const GlassSection = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-[18px] border border-[#ffffff0f] bg-[#111111]/80 backdrop-blur-md overflow-hidden ${className}`}>
    {children}
  </div>
);

/**
 * TLine: The native 1px divider
 */
export const TLine = ({ className = "" }: { className?: string }) => (
  <div className={`h-[1px] bg-[#ffffff0a] w-full ${className}`} />
);

/**
 * TAvatar: Standard native avatar
 */
export const TAvatar = ({ name, id, size = 40, imageUrl, className = "" }: { name: string; id: string; size?: number; imageUrl?: string | null; className?: string }) => {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
  
  return (
    <div 
      className={`rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-white/10 ${className}`}
      style={{ width: size, height: size }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-poppins font-bold text-white/80" style={{ fontSize: size * 0.4 }}>
          {initials}
        </span>
      )}
    </div>
  );
};

/**
 * TButton: Pill-shaped native buttons
 */
export const TButton = ({ 
  label, 
  icon: Icon, 
  onClick, 
  variant = "primary", 
  disabled = false,
  className = "" 
}: { 
  label: string; 
  icon?: LucideIcon; 
  onClick?: () => void; 
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  className?: string;
}) => {
  const themes = {
    primary: "bg-white text-[#071212] hover:bg-gray-100",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    danger: "bg-white/[0.05] text-white/40 hover:text-white hover:bg-white/10 border border-white/5",
    ghost: "bg-transparent text-[#8A8A8A] hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-poppins font-semibold text-sm transition-all disabled:opacity-40 ${themes[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  );
};

/**
 * TSearchBar: Glassmorphism search bar
 */
export const TSearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Suchen…" 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
}) => (
  <div className="relative w-full">
    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-[#ffffff0f] bg-[#111111]/60 backdrop-blur-md pl-11 pr-4 py-3.5 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20 transition-all"
    />
    {value && (
      <button 
        onClick={() => onChange("")}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white"
      >
        <X size={16} />
      </button>
    )}
  </div>
);

/**
 * AmbientBackground: Suble native-style glow effects
 */
export const AmbientBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div 
      className="absolute -top-[100px] -left-[50px] w-[400px] h-[300px] bg-white/5 rounded-full blur-[100px]"
      style={{ opacity: 0.8 }}
    />
    <div 
      className="absolute top-[20%] -right-[100px] w-[350px] h-[250px] bg-white/[0.03] rounded-full blur-[80px]"
      style={{ opacity: 0.5 }}
    />
    <div 
      className="absolute bottom-[-100px] left-[10%] w-[300px] h-[200px] bg-white/[0.02] rounded-full blur-[90px]"
      style={{ opacity: 0.3 }}
    />
  </div>
);

/**
 * TBadge: Small role badges
 */
export const TBadge = ({ label, icon: Icon, color = "white", className = "" }: { label: string; icon?: LucideIcon; color?: string; className?: string }) => (
  <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-poppins font-bold uppercase tracking-wider bg-white/5 border border-white/10 ${className}`} style={{ color }}>
    {Icon && <Icon size={10} />}
    {label}
  </div>
);
