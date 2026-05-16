"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DemoContextType {
  isDemoOpen: boolean;
  openDemo: () => void;
  closeDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const openDemo = () => setIsDemoOpen(true);
  const closeDemo = () => setIsDemoOpen(false);

  useEffect(() => {
    if (isDemoOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isDemoOpen]);

  return (
    <DemoContext.Provider value={{ isDemoOpen, openDemo, closeDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    // If used outside provider (e.g. on blog pages), return a no-op to prevent crashes
    return {
      isDemoOpen: false,
      openDemo: () => console.warn("DemoProvider not found"),
      closeDemo: () => {}
    };
  }
  return context;
};
