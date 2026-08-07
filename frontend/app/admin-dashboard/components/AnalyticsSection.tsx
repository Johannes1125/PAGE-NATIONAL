"use client";

import React, { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type AnalyticsSectionProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
};

export default function AnalyticsSection({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
  actions,
}: AnalyticsSectionProps) {
  return (
    <section className={`analytics-section ${className}`.trim()}>
      <div className="analytics-section__header">
        <div className="analytics-section__header-left">
          {Icon && (
            <span className="analytics-section__icon" aria-hidden="true">
              <Icon size={18} strokeWidth={2} />
            </span>
          )}
          <div className="analytics-section__titles">
            <h2 className="analytics-section__title">{title}</h2>
            {subtitle && (
              <p className="analytics-section__subtitle">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="analytics-section__actions">{actions}</div>
        )}
      </div>
      <div className="analytics-section__body">{children}</div>
    </section>
  );
}
