"use client";

import { Building2, MapPin, Map, Shield } from "lucide-react";
import { Chapter, ChapterStatsData } from "../types";
import StatCard from "../../components/StatCard";

type ChapterStatsProps = {
  chapters?: Chapter[];      // legacy: used for fallback computation
  stats?: ChapterStatsData;  // preferred: API-returned totals
};

export default function ChapterStats({ chapters = [], stats }: ChapterStatsProps) {
  // Prefer API stats; fall back to computing from local chapter list
  const total    = stats?.total    ?? chapters.length;
  const luzon    = stats?.luzon    ?? chapters.filter((c) => c.islandGroup === "Luzon").length;
  const visayas  = stats?.visayas  ?? chapters.filter((c) => c.islandGroup === "Visayas").length;
  const mindanao = stats?.mindanao ?? chapters.filter((c) => c.islandGroup === "Mindanao").length;

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
        />

        <StatCard
          label="Luzon Chapters"
          value={luzon}
          icon={MapPin}
          accent="emerald"
          delay={0.05}
        />

        <StatCard
          label="Visayas Chapters"
          value={visayas}
          icon={Map}
          accent="amber"
          delay={0.1}
        />

        <StatCard
          label="Mindanao Chapters"
          value={mindanao}
          icon={Shield}
          accent="rose"
          delay={0.15}
        />
      </div>
    </section>
  );
}
