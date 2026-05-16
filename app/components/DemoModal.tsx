"use client";

import { useDemo } from "@/lib/context/DemoContext";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ContactForm from "./ContactForm";

export default function DemoModal() {
  const { isDemoOpen, closeDemo } = useDemo();

  return (
    <AnimatePresence>
      {isDemoOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDemo}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl z-20"
          >
            <button 
              onClick={closeDemo}
              className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors flex items-center gap-2 group font-bold text-xs uppercase tracking-widest"
            >
              Schließen <X size={20} className="group-hover:rotate-90 transition-transform" />
            </button>
            <div className="max-h-[90vh] overflow-y-auto rounded-3xl">
               <ContactForm />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
