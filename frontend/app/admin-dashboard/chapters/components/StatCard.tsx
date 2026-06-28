"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: "blue" | "emerald" | "amber" | "rose";
  footer: ReactNode;
  delay?: number;
};

const ACCENT_CLASSES = {
  blue: {
    border: "chapters-stat-card--blue",
    icon: "chapters-stat-card__icon--blue",
  },
  emerald: {
    border: "chapters-stat-card--emerald",
    icon: "chapters-stat-card__icon--emerald",
  },
  amber: {
    border: "chapters-stat-card--amber",
    icon: "chapters-stat-card__icon--amber",
  },
  rose: {
    border: "chapters-stat-card--rose",
    icon: "chapters-stat-card__icon--rose",
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" as const, delay },
  }),
  hover: {
    y: -4,
    boxShadow: "0 12px 28px -8px rgba(20, 49, 82, 0.12)",
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

export default function StatCard({ label, value, icon: Icon, accent, footer, delay = 0 }: StatCardProps) {
  const classes = ACCENT_CLASSES[accent];

  return (
    <motion.article
      custom={delay}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={`chapters-stat-card ${classes.border}`}
    >
      <div className="chapters-stat-card__head">
        <div className={`chapters-stat-card__icon ${classes.icon}`}>
          <Icon size={28} strokeWidth={2.2} aria-hidden="true" />
        </div>
        <div className="chapters-stat-card__body">
          <h3 className="chapters-stat-card__label">{label}</h3>
          <p className="chapters-stat-card__value">{value}</p>
        </div>
      </div>
      <div className="chapters-stat-card__footer">{footer}</div>
    </motion.article>
  );
}
