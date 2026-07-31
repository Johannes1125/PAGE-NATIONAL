"use client";

/* ─────────────────────────────────────────────────────────────────────────────
   Chapters – Loading Skeleton
   Uses .chapters-skel (shimmer wave) defined in chapters.css
   ───────────────────────────────────────────────────────────────────────────── */

type LoadingSkeletonProps = {
  type: "stats" | "toolbar" | "cards" | "table" | "all";
};

/** One shimmer block. `delay` staggers the animation so items don't all wave in sync. */
function Skel({
  className = "",
  modifier = "",
  style,
}: {
  className?: string;
  modifier?: "circle" | "card" | "sm" | "";
  style?: React.CSSProperties;
}) {
  const base = "chapters-skel" + (modifier ? ` chapters-skel--${modifier}` : "");
  return <div className={`${base} ${className}`} style={style} />;
}

/* ── Stats row: 4 KPI cards ─────────────────────────────────────────────────── */
function SkeletonStats() {
  return (
    <div className="chapters-section" aria-hidden="true">
      {/* section label */}
      <Skel className="h-5 w-36" />

      <div className="chapters-stats-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="chapters-stat-card min-h-[120px]"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="chapters-stat-card__head">
              {/* icon box */}
              <Skel modifier="card" className="w-[60px] h-[60px] shrink-0" />

              <div className="flex-1 space-y-3 min-w-0">
                {/* label */}
                <Skel className="h-[14px] w-28" />
                {/* big number */}
                <Skel className="h-9 w-16" />
              </div>
            </div>

            {/* bottom sub-row */}
            <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
              <Skel modifier="circle" className="w-4 h-4" />
              <Skel className="h-[13px] w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Toolbar: search + 4 filters + view toggle ──────────────────────────────── */
function SkeletonToolbar() {
  return (
    <div className="chapters-section" aria-hidden="true">
      {/* section label */}
      <Skel className="h-5 w-40" />

      <div className="chapters-toolbar-panel">
        <div className="chapters-toolbar">
          {/* search */}
          <div className="chapters-toolbar__search">
            <Skel className="h-[52px] w-full" style={{ borderRadius: "14px" }} />
          </div>

          {/* filter selects */}
          <div className="chapters-toolbar__filters">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="chapters-toolbar__filter">
                <Skel
                  className="h-[52px] w-full"
                  style={{ borderRadius: "14px", animationDelay: `${i * 60}ms` }}
                />
              </div>
            ))}
          </div>

          {/* view toggle pill */}
          <Skel className="h-[52px] w-[130px]" style={{ borderRadius: "14px" }} />
        </div>
      </div>
    </div>
  );
}

/* ── Card grid: 8 chapter cards ──────────────────────────────────────────────── */
function SkeletonCards() {
  return (
    <div className="chapters-grid" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="chapters-card"
          style={{ minHeight: 380, animationDelay: `${i * 55}ms` }}
        >
          {/* ── header: title + status badge ── */}
          <div className="chapters-card__header" style={{ position: "relative", paddingRight: "96px" }}>
            {/* status badge (absolute top-right) */}
            <Skel
              modifier="circle"
              className="h-7 w-24"
              style={{ position: "absolute", top: 0, right: 0 }}
            />
            {/* chapter name */}
            <Skel className="h-7 w-full" />
            {/* region + island chips */}
            <div className="flex gap-2 mt-3">
              <Skel modifier="circle" className="h-7 w-20" />
              <Skel modifier="circle" className="h-7 w-28" />
            </div>
          </div>

          {/* ── description lines ── */}
          <div className="chapters-card__description-wrap mt-4 space-y-2">
            <Skel className="h-[15px] w-full" />
            <Skel className="h-[15px] w-full" />
            <Skel className="h-[15px] w-2/3" />
          </div>

          {/* ── officer avatars ── */}
          <div className="mt-6 flex -space-x-2">
            {Array.from({ length: 3 }).map((_, a) => (
              <Skel key={a} modifier="circle" className="w-11 h-11" style={{ border: "2px solid #fff" }} />
            ))}
            {/* "+N more" bubble */}
            <Skel modifier="circle" className="w-11 h-11" style={{ border: "2px solid #fff" }} />
          </div>

          {/* ── footer ── */}
          <div className="chapters-card__footer mt-auto">
            {/* date/meta block */}
            <div className="space-y-1.5">
              <Skel className="h-[13px] w-20" />
              <Skel className="h-5 w-32" />
            </div>

            {/* action buttons */}
            <div className="flex gap-2">
              <Skel className="w-11 h-11" style={{ borderRadius: "10px" }} />
              <Skel className="w-11 h-11" style={{ borderRadius: "10px" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Table: header + 7 rows ──────────────────────────────────────────────────── */
function SkeletonTable() {
  return (
    <div className="chapters-table-wrap" aria-hidden="true">
      {/* ── table header ── */}
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
        {/* checkbox col */}
        <Skel className="w-5 h-5 shrink-0" modifier="sm" />
        {/* column labels */}
        {["w-40", "w-24", "w-28", "w-24", "w-20", "w-28", "w-20"].map((w, i) => (
          <Skel key={i} className={`h-[13px] ${w} flex-shrink-0`} />
        ))}
      </div>

      {/* ── rows ── */}
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
            {/* checkbox */}
            <Skel className="w-5 h-5 shrink-0" modifier="sm" />

            {/* chapter name + region */}
            <div style={{ flex: "0 0 200px", display: "flex", flexDirection: "column", gap: 6 }}>
              <Skel className="h-[15px] w-full" />
              <Skel className="h-[13px] w-3/4" />
            </div>

            {/* island group badge */}
            <Skel modifier="circle" className="h-7 w-24 flex-shrink-0" />

            {/* status badge */}
            <Skel modifier="circle" className="h-7 w-24 flex-shrink-0" />

            {/* type badge */}
            <Skel modifier="circle" className="h-7 w-20 flex-shrink-0" />

            {/* officers count */}
            <Skel className="h-5 w-16 flex-shrink-0" />

            {/* date */}
            <Skel className="h-5 w-28 flex-shrink-0" />

            {/* action buttons */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <Skel className="w-10 h-10" style={{ borderRadius: "10px" }} />
              <Skel className="w-10 h-10" style={{ borderRadius: "10px" }} />
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
        <SkeletonStats />
        <SkeletonToolbar />
        <SkeletonCards />
      </>
    );
  }

  if (type === "stats")   return <SkeletonStats />;
  if (type === "toolbar") return <SkeletonToolbar />;
  if (type === "cards")   return <SkeletonCards />;
  return <SkeletonTable />;
}
