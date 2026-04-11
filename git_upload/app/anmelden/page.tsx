"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

// === Floating Input Component ===
const FloatingInput = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const currentType = isPassword && !showPassword ? "password" : "text";
  const isActive = focused || value.length > 0;

  return (
    <div
      className={`relative h-[60px] rounded-2xl border bg-gray-50 dark:bg-[#131313] transition-all duration-300 ${
        focused ? "border-gray-400 dark:border-white/55 shadow-[0_0_14px_rgba(0,0,0,0.05)] dark:shadow-[0_0_14px_rgba(255,255,255,0.12)]" : "border-gray-200 dark:border-white/10"
      }`}
      onClick={() => setFocused(true)}
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
        {label}
      </motion.label>

      <div className="flex h-full items-center px-4 pt-4">
        <input
          type={currentType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent text-[15px] font-poppins text-gray-900 dark:text-white outline-none"
        />

        {isPassword && isActive && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPassword(!showPassword);
            }}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

// === Glow Button Component ===
const GlowButton = ({ label, loading, type = "button" }: { label: string; loading: boolean; type?: "button" | "submit" }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      disabled={loading}
      type={type}
      className="relative flex h-14 w-full items-center justify-center rounded-full bg-[#080808] dark:bg-white text-white dark:text-[#080808] font-poppins font-bold text-[16px] shadow-[0_8px_18px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_18px_rgba(255,255,255,0.22)] transition-opacity disabled:opacity-50"
    >
      {loading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white dark:border-[#080808] border-t-transparent" />
      ) : (
        label
      )}
    </motion.button>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleReset = async () => {
    if (!email) { setError("Bitte zuerst E-Mail eingeben."); return; }
    setResetLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      if (err.code === "auth/user-not-found") setError("Kein Account mit dieser E-Mail gefunden.");
      else setError("Fehler beim Senden. Bitte versuche es erneut.");
    }
    setResetLoading(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    if (!auth) {
      setError("Firebase nicht initialisiert. Bitte prüfe deine Web-Konfiguration.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        router.push(email === "philipp@pauli-one.de" ? "/admin/newsletter" : "/dashboard");
      } else {
        if (!firstName || !lastName) {
          setError("Bitte fülle alle Namensfelder aus.");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Firebase Firestore Init für neue User
        await setDoc(doc(db, "members", user.uid), {
          firstName,
          lastName,
          email,
          memberType: "Aktiv", // Default Setup analog iOS
          isAdmin: false,
          isTrainer: false,
          clubId: "",
          clubIds: [],
        });
        
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      
      switch (err.code) {
        case "auth/user-not-found":
          setError("Kein Account mit dieser E-Mail gefunden.");
          break;
        case "auth/wrong-password":
          setError("Das Passwort ist nicht korrekt.");
          break;
        case "auth/email-already-in-use":
          setError("Diese E-Mail wird bereits verwendet.");
          break;
        case "auth/invalid-email":
          setError("Die E-Mail-Adresse ist ungültig.");
          break;
        case "auth/weak-password":
          setError("Das Passwort sollte mindestens 6 Zeichen lang sein.");
          break;
        case "auth/network-request-failed":
          setError("Netzwerkfehler. Bitte prüfe deine Internetverbindung.");
          break;
        default:
          setError("Authentifizierung fehlgeschlagen. Bitte prüfe deine Eingaben.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white dark:bg-[#080808]">
      {/* Background Blobs (Recreating iOS LoginBlob) */}
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
        {/* Header Navigation */}
        <div className="absolute top-6 left-6 z-20">
          <Link href="/" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
            &larr; Zurück
          </Link>
        </div>

        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.65 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.85, bounce: 0.45 }}
          className="mb-12 flex flex-col items-center"
        >
          <img src="/talo-logo.png" alt="Talo Logo" className="mb-4 h-16 w-16 invert dark:invert-0" />
          <h1 className="font-logo text-3xl text-gray-900 dark:text-white tracking-[0.35em] uppercase">TALO</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-[#9CA3AF] font-poppins">Jeder Beitrag zählt.</p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.7, delay: 0.2 }}
          className="mb-8 flex h-12 rounded-full bg-gray-100 dark:bg-[#1A1A1A] p-1 border border-gray-200 dark:border-white/5"
        >
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full font-poppins text-sm font-medium transition-colors ${
              mode === "login" ? "bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-md border border-gray-200/50 dark:border-none" : "text-gray-500 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Anmelden
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 rounded-full font-poppins text-sm font-medium transition-colors ${
              mode === "register" ? "bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-md border border-gray-200/50 dark:border-none" : "text-gray-500 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Registrieren
          </button>
        </motion.div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
          >
            {mode === "register" && (
              <>
                <FloatingInput label="Vorname" value={firstName} onChange={setFirstName} />
                <FloatingInput label="Nachname" value={lastName} onChange={setLastName} />
              </>
            )}

            <FloatingInput label="E-Mail" value={email} onChange={setEmail} type="email" />
            <FloatingInput label="Passwort" value={password} onChange={setPassword} type="password" />

            {mode === "login" && (
              <div className="flex justify-end -mt-1">
                {resetSent ? (
                  <span className="text-xs text-emerald-500 font-poppins">
                    ✓ Reset-Link wurde gesendet!
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={resetLoading}
                    className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-poppins disabled:opacity-50"
                  >
                    {resetLoading ? "Wird gesendet …" : "Passwort vergessen?"}
                  </button>
                )}
              </div>
            )}

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-poppins text-red-500 text-center mt-2"
              >
                {error}
              </motion.p>
            )}

            <div className="mt-4">
              <GlowButton 
                label={mode === "login" ? "Anmelden" : "Registrieren"} 
                loading={loading} 
                type="submit" 
              />
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
