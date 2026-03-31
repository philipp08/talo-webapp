"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface CounterProps {
  value: number;
  direction?: "up" | "down";
  suffix?: string;
  prefix?: string;
  decimalPlaces?: number;
}

export default function Counter({
  value,
  direction = "up",
  suffix = "",
  prefix = "",
  decimalPlaces = 0,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = prefix + latest.toFixed(decimalPlaces).toLocaleString() + suffix;
      }
    });
  }, [springValue, prefix, suffix, decimalPlaces]);

  return <span ref={ref}>{prefix}{direction === "down" ? value : 0}{suffix}</span>;
}
