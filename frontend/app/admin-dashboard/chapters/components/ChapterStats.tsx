"use client";

import { Building2, MapPin, Map, Shield } from "lucide-react";
import { Chapter } from "../types";
import StatCard from "./StatCard";

type ChapterStatsProps = {
  chapters: Chapter[];
};

export default function ChapterStats({ chapters }: ChapterStatsProps) {
  const total = chapters.length;
  const luzon = chapters.filter((c) => c.islandGroup === "Luzon").length;
  const visayas = chapters.filter((c) => c.islandGroup === "Visayas").length;
  const mindanao = chapters.filter((c) => c.islandGroup === "Mindanao").length;

  const visayasPublished = chapters.filter(
    (c) => c.islandGroup === "Visayas" && c.status === "published"
  ).length;
  const visayasDraft = chapters.filter(
    (c) => c.islandGroup === "Visayas" && c.status === "draft"
  ).length;
  const visayasTotal = visayasPublished + visayasDraft || 1;

  const luzonShare = total > 0 ? Math.round((luzon / total) * 100) : 0;

  const mindanaoChapters = chapters.filter((c) => c.islandGroup === "Mindanao");
  const latestMindanao = mindanaoChapters.reduce<string | null>((latest, ch) => {
    if (!latest) return ch.updatedAt;
    return new Date(ch.updatedAt) > new Date(latest) ? ch.updatedAt : latest;
  }, null);

  const latestLabel = latestMindanao
    ? new Date(latestMindanao).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "No updates";

  return (
    <section className="chapters-section" aria-label="Chapter analytics overview">
      <h2 className="chapters-section__label">Overview</h2>
      <div className="chapters-stats-grid">
        <StatCard
          label="Total Chapters"
          value={total}
          icon={Building2}
          accent="blue"
          delay={0}
          footer={
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                <span className="font-bold text-emerald-600">↑ 2 this month</span>
                <span className="text-slate-500 font-medium">All island groups</span>
              </div>
              <div className="chapters-stat-card__sparkline" aria-hidden="true">
                <svg width="56" height="20" viewBox="0 0 65 24" fill="none">
                  <path
                    d="M1 22C6 21 8 2 15 2C22 2 24 19 31 19C38 19 41 9 50 8C56 7.2 60 16 64 15"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          }
        />

        <StatCard
          label="Luzon Chapters"
          value={luzon}
          icon={MapPin}
          accent="emerald"
          delay={0.05}
          footer={
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center gap-3">
                <span className="text-slate-500 font-medium">Share of all chapters</span>
                <span className="text-slate-700 font-bold shrink-0">{luzonShare}%</span>
              </div>
              <div className="chapters-stat-card__progress" role="progressbar" aria-valuenow={luzonShare} aria-valuemin={0} aria-valuemax={100} aria-label="Share of all chapters progress">
                <div
                  className="chapters-stat-card__progress-bar bg-emerald-500"
                  style={{ width: `${luzonShare}%` }}
                />
              </div>
            </div>
          }
        />

        <StatCard
          label="Visayas Chapters"
          value={visayas}
          icon={Map}
          accent="amber"
          delay={0.1}
          footer={
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center gap-3 text-[16px]">
                <span className="text-slate-500 font-medium">Published / Draft</span>
                <span className="text-amber-700 font-bold">
                  {visayasPublished} / {visayasDraft}
                </span>
              </div>
              <div className="chapters-stat-card__distribution" role="progressbar" aria-label="Distribution of published vs draft chapters">
                <div
                  className="chapters-stat-card__distribution-published"
                  style={{ width: `${(visayasPublished / visayasTotal) * 100}%` }}
                />
                <div
                  className="chapters-stat-card__distribution-draft"
                  style={{ width: `${(visayasDraft / visayasTotal) * 100}%` }}
                />
              </div>
            </div>
          }
        />

        <StatCard
          label="Mindanao Chapters"
          value={mindanao}
          icon={Shield}
          accent="rose"
          delay={0.15}
          footer={
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">Latest activity</span>
              <span className="chapters-stat-card__health">
                <span className="chapters-stat-card__health-dot" aria-hidden="true" />
                {latestLabel}
              </span>
            </div>
          }
        />
      </div>
    </section>
  );
}
