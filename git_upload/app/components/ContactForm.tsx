"use client";

import { useState } from "react";
import { EmailService } from "@/lib/firebase/emailService";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [club, setClub] = useState("");
  const [message, setMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await EmailService.sendContactMail({ name, email, club, message });
      setIsSuccess(true);
      // Reset form
      setName("");
      setEmail("");
      setClub("");
      setMessage("");
    } catch (err: any) {
      setError("Hoppla, da ist etwas schiefgelaufen. Bitte versuche es später erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[40px] p-12 text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-bold font-logo text-gray-950 dark:text-white mb-4 uppercase tracking-widest">Anfrage gesendet!</h3>
        <p className="text-[#8A8A8A] font-medium leading-relaxed max-w-sm">
          Vielen Dank für dein Interesse. Philipp wird sich in Kürze unter <span className="text-gray-950 dark:text-white">{email}</span> bei dir melden.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-10 text-sm font-bold text-gray-500 hover:text-gray-950 dark:hover:text-white transition-colors uppercase tracking-widest"
        >
          Noch eine Nachricht senden
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:shadow-none relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
      
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 ml-1">Vollständiger Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Max Mustermann"
              className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-all outline-none placeholder:text-gray-400"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 ml-1">E-Mail Adresse</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@verein.de"
              className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-all outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="club" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 ml-1">Name deines Vereins</label>
          <input
            id="club"
            type="text"
            required
            value={club}
            onChange={(e) => setClub(e.target.value)}
            placeholder="Musterverein e.V."
            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-all outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 ml-1">Deine Nachricht</label>
          <textarea
            id="message"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Wie können wir euch helfen?"
            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-all outline-none placeholder:text-gray-400 resize-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-3 text-red-500 bg-red-500/5 p-4 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-16 rounded-[20px] bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-black/10"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white dark:border-black/20 dark:border-t-black rounded-full animate-spin" />
          ) : (
            <>
              Anfrage absenden <Send size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
