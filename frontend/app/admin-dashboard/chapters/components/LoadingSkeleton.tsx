"use client";

type LoadingSkeletonProps = {
  type: "stats" | "toolbar" | "cards" | "table" | "all";
};

export default function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  const shimmer = "animate-pulse bg-slate-200 rounded";

  const renderStats = () => (
    <div className="chapters-section" aria-hidden="true">
      <div className={`${shimmer} h-6 w-32 mb-4`} />
      <div className="chapters-stats-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="chapters-stat-card min-h-[196px]">
            <div className="chapters-stat-card__head">
              <div className={`${shimmer} w-16 h-16 rounded-2xl shrink-0`} />
              <div className="flex-1 space-y-3 min-w-0">
                <div className={`${shimmer} h-5 w-36`} />
                <div className={`${shimmer} h-10 w-20`} />
              </div>
            </div>
            <div className={`${shimmer} h-5 w-full chapters-stat-card__footer`} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderToolbar = () => (
    <div className="chapters-section" aria-hidden="true">
      <div className={`${shimmer} h-6 w-40 mb-4`} />
      <div className="chapters-toolbar-panel">
        <div className="chapters-toolbar">
          <div className="chapters-toolbar__search">
            <div className={`${shimmer} h-[52px] w-full`} />
          </div>
          <div className="chapters-toolbar__filters">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="chapters-toolbar__filter">
                <div className={`${shimmer} h-[52px] w-full`} />
              </div>
            ))}
          </div>
          <div className={`${shimmer} h-[52px] w-[260px] rounded-xl`} />
        </div>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="chapters-grid" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="chapters-card min-h-[380px]">
          <div className="chapters-card__header pr-24">
            <div className={`${shimmer} h-7 w-28 absolute top-0 right-0 rounded-full`} />
            <div className={`${shimmer} h-7 w-full`} />
            <div className="flex gap-2 mt-3">
              <div className={`${shimmer} h-7 w-20 rounded-full`} />
              <div className={`${shimmer} h-7 w-28 rounded-full`} />
            </div>
          </div>
          <div className="chapters-card__description-wrap mt-4 space-y-2">
            <div className={`${shimmer} h-5 w-full`} />
            <div className={`${shimmer} h-5 w-full`} />
            <div className={`${shimmer} h-5 w-2/3`} />
          </div>
          <div className="mt-6 flex -space-x-2">
            {Array.from({ length: 3 }).map((_, a) => (
              <div key={a} className={`${shimmer} w-11 h-11 rounded-full`} />
            ))}
          </div>
          <div className="chapters-card__footer mt-auto">
            <div className={`${shimmer} h-12 w-2/3`} />
            <div className="flex gap-2">
              <div className={`${shimmer} w-11 h-11 rounded-lg`} />
              <div className={`${shimmer} w-11 h-11 rounded-lg`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTable = () => (
    <div className="chapters-table-wrap" aria-hidden="true">
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex gap-6">
        <div className={`${shimmer} w-6 h-6 rounded`} />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`${shimmer} h-5 flex-1`} />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, r) => (
          <div key={r} className="flex items-center gap-6 px-5 py-5 min-h-[64px]">
            <div className={`${shimmer} w-6 h-6 rounded shrink-0`} />
            <div className="flex-1 space-y-2 min-w-0">
              <div className={`${shimmer} h-5 w-3/4`} />
              <div className={`${shimmer} h-4 w-1/2`} />
            </div>
            <div className={`${shimmer} h-7 w-20 rounded-full`} />
            <div className={`${shimmer} h-7 w-24 rounded-full`} />
            <div className={`${shimmer} h-8 w-24 rounded-full`} />
            <div className={`${shimmer} h-7 w-20 rounded-full`} />
            <div className={`${shimmer} h-5 w-28`} />
            <div className="flex gap-2">
              <div className={`${shimmer} w-11 h-11 rounded-lg`} />
              <div className={`${shimmer} w-11 h-11 rounded-lg`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === "all") {
    return (
      <>
        {renderStats()}
        {renderToolbar()}
        {renderCards()}
      </>
    );
  }

  if (type === "stats") return renderStats();
  if (type === "toolbar") return renderToolbar();
  if (type === "cards") return renderCards();
  return renderTable();
}
