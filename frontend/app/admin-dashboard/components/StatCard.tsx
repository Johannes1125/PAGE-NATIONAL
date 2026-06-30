"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value?: number | string;
  valueTitle?: string;
  valueUnit?: string;
  subTimeLabel?: string;
  subTimeValue?: string;
  icon: LucideIcon;
  accent: "blue" | "emerald" | "amber" | "rose" | "navy";
  delay?: number;
};

const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" as const, delay },
  }),
  hover: {
    y: -2,
    boxShadow: "0 8px 24px rgba(30, 83, 142, 0.07)",
    borderColor: "rgba(30, 83, 142, 0.15)",
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

export default function StatCard({
  label,
  value,
  valueTitle,
  valueUnit,
  subTimeLabel,
  subTimeValue,
  icon: Icon,
  accent,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.article
      custom={delay}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={`dashboard-summary-card dashboard-summary-card--${accent}`}
    >
      <div className="dashboard-summary-card-inner">
        <div className={`dashboard-summary-icon-container dashboard-summary-icon-container--${accent}`}>
          <Icon size={28} strokeWidth={2.2} aria-hidden="true" />
        </div>
        <div className="dashboard-summary-details">
          <span className="dashboard-summary-label">{label}</span>
          {valueTitle ? (
            <span className="dashboard-summary-value-title">{valueTitle}</span>
          ) : (
            <span className="dashboard-summary-value">
              {value}
              {valueUnit && <span className="dashboard-summary-unit"> {valueUnit}</span>}
            </span>
          )}
          {subTimeValue && (
            <div className="dashboard-summary-time-wrapper">
              {subTimeLabel && <span className="dashboard-summary-label-sub">{subTimeLabel}</span>}
              <span className="dashboard-summary-value-time">{subTimeValue}</span>
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-summary-watermark" aria-hidden="true">
        <Icon size={120} />
      </div>
    </motion.article>
  );
}
