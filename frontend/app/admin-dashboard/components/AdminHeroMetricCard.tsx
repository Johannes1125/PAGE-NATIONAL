import type { LucideIcon } from "lucide-react";

type AdminHeroMetricCardProps = {
  label: string;
  value: number | string;
  meta: string;
  tone: "blue" | "gold" | "red" | "green" | "cyan" | "violet";
  icon: LucideIcon;
  delay?: number;
  suffix?: string;
};

export default function AdminHeroMetricCard({
  label,
  value,
  meta,
  tone,
  icon: Icon,
  delay = 0,
  suffix,
}: AdminHeroMetricCardProps) {
  return (
    <article
      className={`admin-hero-card admin-hero-card--${tone} admin-hero-card--animated`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="admin-hero-card__top">
        <div className="admin-hero-card__icon" aria-hidden="true">
          <Icon size={16} strokeWidth={2} />
        </div>
        <p className="admin-hero-card__title">{label}</p>
      </div>
      <p className="admin-hero-card__value">
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix && <span className="admin-hero-card__unit">{suffix}</span>}
      </p>
      <p className="admin-hero-card__meta">{meta}</p>
    </article>
  );
}
