"use client";

import { motion } from "framer-motion";
import { Check, CheckCircle2, Copy, FileSpreadsheet, Key, MessageCircle, ArrowRightCircle } from "lucide-react";

export function ApprovalWorkflowMock() {
  return (
    <div className="h-48 w-full flex items-center justify-center p-4 bg-[#f8f9fa] dark:bg-[#0a0a0a]">
      <div className="w-full max-w-xs bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 text-[10px] font-bold">JW</div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Julian W.</p>
              <p className="text-[10px] text-gray-500">Vorstandsarbeit · 15 Pkt.</p>
            </div>
          </div>
          <div className="text-[10px] font-mono text-gray-400">Heute</div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-red-50 hover:text-red-600 rounded-lg py-2 text-[11px] font-bold text-gray-600 dark:text-gray-400 transition-colors">Ablehnen</button>
          <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-lg py-2 text-[11px] font-bold text-white shadow-sm transition-colors flex items-center justify-center gap-1">
            <CheckCircle2 size={14} /> Freigeben
          </button>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppShareMock() {
  return (
    <div className="h-48 w-full flex items-center justify-center p-4 bg-[#E5DDD5]/50 dark:bg-[#0b141a]">
      <div className="w-full max-w-[260px] flex flex-col gap-2">
        <div className="self-end bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-[#e9edef] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm max-w-[85%] relative text-left">
          <p className="text-xs mb-1">Hey, ich habe dich in unsere TALO-Vereinsapp eingeladen! Hier ist dein sicherer Link:</p>
          <a href="#" className="text-[11px] text-blue-500 underline break-all">talo.app/join/xyz123</a>
          <span className="text-[9px] text-gray-500 dark:text-white/40 absolute bottom-1.5 right-2">14:23 <Check size={10} className="inline ml-0.5 text-blue-400" /></span>
        </div>
      </div>
    </div>
  );
}

export function ImportMock() {
  return (
    <div className="h-48 w-full flex flex-col items-center justify-center px-4 bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100 z-10 shadow-sm">
          <FileSpreadsheet size={24} className="text-green-600" />
        </div>
        <div className="absolute w-24 h-px border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
        <div className="w-14 h-14 bg-white dark:bg-[#111] rounded-2xl flex items-center justify-center border border-gray-200 dark:border-white/10 z-10 shadow-sm ml-20">
          <span className="text-[11px] font-black tracking-widest">TALO</span>
        </div>
      </div>
      <div className="flex gap-2">
         <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-medium shadow-sm">Mitglieder.csv</span>
         <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-medium shadow-sm">Clubdesk-Export</span>
      </div>
    </div>
  );
}

export function LicenseKeysMock() {
  return (
    <div className="h-48 w-full flex items-center justify-center p-4 bg-[#f8f9fa] dark:bg-[#0a0a0a]">
       <div className="w-full max-w-xs bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-5 text-center">
          <div className="inline-flex w-12 h-12 bg-purple-50 dark:bg-purple-500/20 text-purple-600 items-center justify-center rounded-full mb-3">
             <Key size={20} />
          </div>
          <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-2">Lizenzschlüssel eingeben</p>
          <div className="flex gap-1.5 justify-center mb-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-8 h-10 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded flex items-center justify-center text-sm font-mono">&times;</div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400">Kein Abo, kein Abo-Zwang.</p>
       </div>
    </div>
  );
}

export function ComingSoonMock() {
  return (
    <div className="h-48 w-full flex items-center justify-center p-4 bg-orange-50/50 dark:bg-orange-900/10 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-200/50 dark:bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="w-full max-w-[220px] bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 p-5 text-center relative z-10">
          <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-orange-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full rotate-12 shadow-sm">Coming Soon</div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">-25 Pkt.</p>
          <p className="text-[10px] text-gray-500 mb-3 border-b border-gray-100 dark:border-white/10 pb-3">Strafausgleich für diese Saison</p>
          <button className="w-full bg-[#0a0a0a] dark:bg-white text-white dark:text-black py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5">
            Jetzt mit Apple Pay zahlen
          </button>
        </div>
    </div>
  );
}
