"use client";

import { Building2, MapPin, Map, Shield } from "lucide-react";
import { Chapter } from "../types";
import StatCard from "../../components/StatCard";

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
