"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  confirmPasswordReset, 
  verifyPasswordResetCode, 
  applyActionCode, 
  checkActionCode 
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// === Floating Input Component (Consistent with login) ===
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

function AuthActionHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  
  // Password Reset State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus("error");
      setError("Ungültiger oder fehlender Aktions-Link.");
      return;
    }

    const verifyCode = async () => {
      try {
        switch (mode) {
          case "resetPassword":
            const userEmail = await verifyPasswordResetCode(auth, oobCode);
            setEmail(userEmail);
            setStatus("ready");
            break;
          case "verifyEmail":
            await applyActionCode(auth, oobCode);
            setStatus("success");
            break;
          case "recoverEmail":
            const info = await checkActionCode(auth, oobCode);
            setEmail(info.data.email || "");
            await applyActionCode(auth, oobCode);
            setStatus("success");
            break;
          default:
            setStatus("error");
            setError("Nicht unterstützter Aktions-Modus.");
        }
      } catch (err: any) {
        console.error("Auth Action Error:", err);
        setStatus("error");
        switch (err.code) {
          case "auth/expired-action-code":
            setError("Der Link ist bereits abgelaufen.");
            break;
          case "auth/invalid-action-code":
            setError("Der Link ist ungültig oder wurde bereits verwendet.");
            break;
          case "auth/user-disabled":
            setError("Dieser Account wurde deaktiviert.");
            break;
          case "auth/user-not-found":
            setError("Der zugehörige Nutzer wurde nicht gefunden.");
            break;
          default:
            setError("Ein unerwarteter Fehler ist aufgetreten.");
        }
      }
    };

    verifyCode();
  }, [mode, oobCode]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;
    
    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setSubmitting(true);
    setError("");
    
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus("success");
    } catch (err: any) {
      console.error("Password Reset Submit Error:", err);
      setError("Fehler beim Zurücksetzen des Passworts. Bitte versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          <p className="text-sm font-poppins text-gray-500">Link wird überprüft...</p>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white">Hoppla!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-poppins leading-relaxed">
              {error}
            </p>
          </div>
          <Link
            href="/anmelden"
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#080808] dark:bg-white text-white dark:text-[#080808] font-poppins font-bold text-[16px] shadow-lg transition-transform active:scale-95"
          >
            Zurück zur Anmeldung
          </Link>
        </div>
      );
    }

    if (status === "success") {
      let title = "Erfolg!";
      let message = "Aktion erfolgreich abgeschlossen.";

      if (mode === "resetPassword") {
        title = "Passwort geändert";
        message = "Dein Passwort wurde erfolgreich aktualisiert. Du kannst dich jetzt mit deinem neuen Passwort anmelden.";
      } else if (mode === "verifyEmail") {
        title = "E-Mail bestätigt";
        message = "Vielen Dank! Deine E-Mail-Adresse wurde erfolgreich verifiziert.";
      } else if (mode === "recoverEmail") {
        title = "E-Mail wiederhergestellt";
        message = `Deine E-Mail-Adresse wurde auf ${email} zurückgesetzt.`;
      }

      return (
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-poppins leading-relaxed">
              {message}
            </p>
          </div>
          <Link
            href="/anmelden"
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#080808] dark:bg-white text-white dark:text-[#080808] font-poppins font-bold text-[16px] shadow-lg transition-transform active:scale-95"
          >
            Jetzt anmelden
          </Link>
        </div>
      );
    }

    if (mode === "resetPassword" && status === "ready") {
      return (
        <form onSubmit={handlePasswordReset} className="flex flex-col gap-5 py-2">
          <div className="text-center space-y-2 mb-2">
            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white">Neues Passwort</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-poppins">
              Für Account: <span className="text-gray-900 dark:text-white font-medium">{email}</span>
            </p>
          </div>

          <FloatingInput 
            label="Neues Passwort" 
            value={password} 
            onChange={setPassword} 
            type="password" 
          />
          <FloatingInput 
            label="Passwort bestätigen" 
            value={confirmPassword} 
            onChange={setConfirmPassword} 
            type="password" 
          />

          {error && (
            <p className="text-sm font-poppins text-red-500 text-center">{error}</p>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={submitting}
            className="relative flex h-14 w-full items-center justify-center rounded-full bg-[#080808] dark:bg-white text-white dark:text-[#080808] font-poppins font-bold text-[16px] shadow-lg transition-opacity disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Passwort speichern"
            )}
          </motion.button>
        </form>
      );
    }

    return null;
  };

  return (
    <div className="z-10 w-full max-w-[400px] px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.65 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.85, bounce: 0.45 }}
        className="mb-10 flex flex-col items-center"
      >
        <Image src="/talo-logo.png" alt="Talo Logo" width={64} height={64} className="mb-4 h-16 w-16 invert dark:invert-0" />
        <h1 className="font-logo text-3xl text-gray-900 dark:text-white tracking-[0.35em] uppercase">TALO</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-[#9CA3AF] font-poppins">Account Sicherheit</p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white dark:bg-[#080808]">
      {/* Background Blobs */}
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

      <Suspense fallback={
        <div className="z-10 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        </div>
      }>
        <AuthActionHandler />
      </Suspense>
    </div>
  );
}
