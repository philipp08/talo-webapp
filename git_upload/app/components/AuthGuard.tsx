"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAppStore((state) => state.user);
  const isLoading = useAppStore((state) => state.isLoadingAuthedState);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/anmelden");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#0A0A0A]" />
      </div>
    );
  }

  if (!user) {
    return null; // Wird eh umgeleitet
  }

  return <>{children}</>;
}
