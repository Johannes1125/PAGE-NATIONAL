"use client";

/* ─────────────────────────────────────────────────────────────────────────────
   Conventions – Loading Skeleton
   Uses .conv-skel (shimmer wave) defined in conventions.css
   ───────────────────────────────────────────────────────────────────────────── */

type LoadingSkeletonProps = {
  type: "cards" | "table" | "toolbar" | "all";
};

/** Reusable shimmer block */
function Skel({
  className = "",
  modifier = "",
  style,
}: {
  className?: string;
  modifier?: "circle" | "card" | "sm" | "";
  style?: React.CSSProperties;
}) {
  const base = "conv-skel" + (modifier ? ` conv-skel--${modifier}` : "");
  return <div className={`${base} ${className}`} style={style} />;
}

/* ── Toolbar: search + filters row ─────────────────────────────────────────── */
function SkeletonToolbar() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: 8,
      }}
    >
      {/* search bar */}
      <Skel className="h-[52px]" style={{ borderRadius: 14, flex: "1 1 260px", minWidth: 180 }} />

      {/* filter selects */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Skel
          key={i}
          className="h-[52px]"
          style={{ borderRadius: 14, width: 160, flexShrink: 0, animationDelay: `${i * 60}ms` }}
        />
      ))}

      {/* view toggle */}
      <Skel className="h-[52px] w-[110px]" style={{ borderRadius: 14, flexShrink: 0 }} />
    </div>
  );
}

/* ── Card grid: 6 convention cards ──────────────────────────────────────────── */
function SkeletonCards() {
  return (
    <div className="conv-grid" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="conv-card"
          style={{ minHeight: 300, animationDelay: `${i * 60}ms` }}
        >
          <div className="conv-card__body" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* ── top row: type badge + status badge ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <Skel modifier="circle" className="h-7 w-28" />
              <Skel modifier="circle" className="h-7 w-20" />
            </div>

            {/* ── convention title ── */}
            <Skel className="h-6 w-full mt-4" />

            {/* ── date + location row ── */}
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <Skel className="h-5 w-36" />
              <Skel className="h-5 w-28" />
            </div>

            {/* ── description lines ── */}
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
              <Skel className="h-[14px] w-full" />
              <Skel className="h-[14px] w-5/6" />
              <Skel className="h-[14px] w-2/3" />
            </div>

            {/* ── stats row ── */}
            <div
              style={{
                display: "flex",
                gap: 24,
                marginTop: "auto",
                paddingTop: 18,
              }}
            >
              {Array.from({ length: 3 }).map((_, s) => (
                <div key={s} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <Skel className="h-[12px] w-14" />
                  <Skel className="h-[15px] w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* ── footer action bar ── */}
          <div className="conv-card__footer-actions">
            <Skel className="h-11" style={{ flex: 1, borderRadius: 10 }} />
            <Skel className="h-11 w-11" style={{ borderRadius: 10, flexShrink: 0 }} />
            <Skel className="h-11 w-11" style={{ borderRadius: 10, flexShrink: 0 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Table: header + 7 rows ──────────────────────────────────────────────────── */
function SkeletonTable() {
  return (
    <div className="conv-table-wrap" aria-hidden="true">
      {/* ── table header row ── */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #e2e8f0",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        {["w-40", "w-28", "w-24", "w-24", "w-28", "w-20", "w-24"].map((w, i) => (
          <Skel key={i} className={`h-[13px] ${w} flex-shrink-0`} />
        ))}
      </div>

      {/* ── data rows ── */}
      <div>
        {Array.from({ length: 7 }).map((_, r) => (
          <div
            key={r}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              animationDelay: `${r * 55}ms`,
            }}
          >
            {/* convention title */}
            <div style={{ flex: "0 0 200px", display: "flex", flexDirection: "column", gap: 6 }}>
              <Skel className="h-[15px] w-full" />
              <Skel className="h-[12px] w-3/4" />
            </div>

            {/* date range */}
            <Skel className="h-5 w-36 flex-shrink-0" />

            {/* location */}
            <Skel className="h-5 w-28 flex-shrink-0" />

            {/* status badge */}
            <Skel modifier="circle" className="h-7 w-24 flex-shrink-0" />

            {/* type badge */}
            <Skel modifier="circle" className="h-7 w-20 flex-shrink-0" />

            {/* attendees */}
            <Skel className="h-5 w-16 flex-shrink-0" />

            {/* actions */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <Skel className="w-10 h-10" style={{ borderRadius: 10 }} />
              <Skel className="w-10 h-10" style={{ borderRadius: 10 }} />
              <Skel className="w-10 h-10" style={{ borderRadius: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Public component ──────────────────────────────────────────────────────── */
export default function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  if (type === "all") {
    return (
      <>
        <SkeletonToolbar />
        <SkeletonCards />
      </>
    );
  }

  if (type === "toolbar") return <SkeletonToolbar />;
  if (type === "cards")   return <SkeletonCards />;
  return <SkeletonTable />;
}
