"use client";

import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

/** Wrap a grid/list of cards in this; give each direct child a StaggerItem
 * (or just render plain children — they'll still fade in together). */
export function StaggerGroup({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div initial="hidden" animate="show" variants={container} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
