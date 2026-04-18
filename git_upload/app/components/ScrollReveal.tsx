import React from "react";
import { motion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  className?: string;
  scale?: number;
  blur?: boolean;
  key?: string | number;
}

const directionOffset = (direction: Direction, distance: number) => {
  switch (direction) {
    case "up":    return { y: distance };
    case "down":  return { y: -distance };
    case "left":  return { x: distance };
    case "right": return { x: -distance };
    case "none":  return {};
  }
};

// Strong ease-out — starts fast, feels instantly responsive
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance = 16,
  once = true,
  className = "",
  scale = 1,
  blur = false,
}: ScrollRevealProps) {
  const offsets = directionOffset(direction, distance);

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...offsets,
        scale: scale !== 1 ? scale : undefined,
        // blur is only allowed on fixed overlays — not on scrolling content
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{ once, amount: 0.15 }}
      transition={{
        duration,
        delay,
        ease: EASE_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Staggered children container */
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.055,
  className = "",
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
  direction = "up",
  distance = 10,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  distance?: number;
  key?: string | number;
}) {
  const offsets = directionOffset(direction, distance);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...offsets },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          // No blur — blur on scrolling content triggers continuous GPU repaints
          transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
