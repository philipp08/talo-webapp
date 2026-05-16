"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import Link from "next/link";
import Image from "next/image";

function getFirebaseErrorCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }

    if (!auth) {
      setError("Firebase nicht initialisiert. Bitte versuche es später erneut.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setSent(true);
    } catch (err) {
      const code = getFirebaseErrorCode(err);
      switch (code) {
        case "auth/invalid-email":
          setError("Die E-Mail-Adresse ist ungültig.");
          break;
        case "auth/user-not-found":
          setError("Kein Account mit dieser E-Mail gefunden.");
          break;
        case "auth/too-many-requests":
          setError("Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.");
          break;
        case "auth/network-request-failed":
          setError("Netzwerkfehler. Bitte prüfe deine Internetverbindung.");
          break;
        default:
          setError("Fehler beim Senden. Bitte versuche es erneut.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isActive = focused || email.length > 0;

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white dark:bg-[#080808]">
      <motion.div
        animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 top-0 h-[300px] w-[300px] -translate-y-1/2 translate-x-1/2 rounded-full bg-black/5 dark:bg-white/5 blur-[100px]"
      />
      <motion.div
        animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/3 rounded-full bg-black/5 dark:bg-white/5 blur-[120px]"
      />

      <div className="z-10 w-full max-w-[400px] px-6">
        <div className="absolute top-6 left-6 z-20">
          <Link href="/anmelden" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
            &larr; Zurück zur Anmeldung
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.65 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.85, bounce: 0.45 }}
          className="mb-10 flex flex-col items-center"
        >
          <Image src="/talo-logo.png" alt="Talo Logo" width={64} height={64} className="mb-4 h-16 w-16 invert dark:invert-0" />
          <h1 className="font-logo text-3xl text-gray-900 dark:text-white tracking-[0.35em] uppercase">TALO</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-[#9CA3AF] font-poppins">Passwort zurücksetzen</p>
        </motion.div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 p-5 text-center"
          >
            <p className="font-poppins text-sm text-emerald-700 dark:text-emerald-300">
              ✓ Wir haben dir einen Link zum Zurücksetzen deines Passworts an <strong>{email.trim()}</strong> geschickt.
            </p>
            <p className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-300/80 font-poppins">
              Schaue auch im Spam-Ordner nach, falls die E-Mail nicht ankommt.
            </p>
            <Link
              href="/anmelden"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#080808] dark:bg-white text-white dark:text-[#080808] font-poppins text-sm font-semibold px-6"
            >
              Zurück zur Anmeldung
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm font-poppins text-gray-600 dark:text-white/70 text-center mb-2">
              Gib deine E-Mail-Adresse ein und wir senden dir einen Link, mit dem du dein Passwort zurücksetzen kannst.
            </p>

            <div
              className={`relative h-[60px] rounded-2xl border bg-gray-50 dark:bg-[#131313] transition-all duration-300 ${
                focused ? "border-gray-400 dark:border-white/55 shadow-[0_0_14px_rgba(0,0,0,0.05)] dark:shadow-[0_0_14px_rgba(255,255,255,0.12)]" : "border-gray-200 dark:border-white/10"
              }`}
            >
              <motion.label
                initial={false}
                animate={{
                  y: isActive ? 10 : 19,
                  fontSize: isActive ? "11px" : "15px",
                  color: isActive ? (focused ? "currentColor" : "#9CA3AF") : "#6B7280",
                }}
                className="absolute left-4 font-poppins pointer-events-none text-gray-600 dark:text-white/65"
              >
                E-Mail
              </motion.label>
              <div className="flex h-full items-center px-4 pt-4">
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="w-full bg-transparent text-[15px] font-poppins text-gray-900 dark:text-white outline-none"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-poppins text-red-500 text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={loading}
              className="relative flex h-14 w-full items-center justify-center rounded-full bg-[#080808] dark:bg-white text-white dark:text-[#080808] font-poppins font-bold text-[16px] shadow-[0_8px_18px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_18px_rgba(255,255,255,0.22)] transition-opacity disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white dark:border-[#080808] border-t-transparent" />
              ) : (
                "Reset-Link senden"
              )}
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
}
