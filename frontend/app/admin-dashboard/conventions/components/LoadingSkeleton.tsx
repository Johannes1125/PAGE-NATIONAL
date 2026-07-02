"use client";

type LoadingSkeletonProps = {
  type: "cards" | "table";
};

export default function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  const shimmer = "animate-pulse bg-slate-200 rounded";

  if (type === "cards") {
    return (
      <div className="conv-grid" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="conv-card min-h-[280px]">
            <div className="conv-card__body">
              <div className="flex items-start justify-between gap-4">
                <div className={`${shimmer} h-7 w-28 rounded-full`} />
                <div className={`${shimmer} h-7 w-20 rounded-full`} />
              </div>
              <div className={`${shimmer} h-6 w-full mt-4`} />
              <div className="flex gap-3 mt-4">
                <div className={`${shimmer} h-5 w-32`} />
                <div className={`${shimmer} h-5 w-28`} />
              </div>
              <div className="space-y-2 mt-4">
                <div className={`${shimmer} h-4 w-full`} />
                <div className={`${shimmer} h-4 w-2/3`} />
              </div>
              <div className="flex gap-6 mt-auto pt-6">
                <div className="space-y-1">
                  <div className={`${shimmer} h-3 w-12`} />
                  <div className={`${shimmer} h-4 w-20`} />
                </div>
                <div className="space-y-1">
                  <div className={`${shimmer} h-3 w-12`} />
                  <div className={`${shimmer} h-4 w-20`} />
                </div>
              </div>
            </div>
            <div className="conv-card__footer-actions">
              <div className={`${shimmer} h-11 flex-1`} />
              <div className={`${shimmer} h-11 w-24`} />
              <div className={`${shimmer} h-11 w-24`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table skeleton
  return (
    <div className="conv-table-wrap" aria-hidden="true">
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex gap-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`${shimmer} h-5 flex-1`} />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, r) => (
          <div key={r} className="flex items-center gap-6 px-5 py-5 min-h-[56px]">
            <div className="flex-1 space-y-2 min-w-0">
              <div className={`${shimmer} h-5 w-3/4`} />
            </div>
            <div className={`${shimmer} h-5 w-32`} />
            <div className={`${shimmer} h-7 w-20 rounded-full`} />
            <div className={`${shimmer} h-5 w-28`} />
            <div className={`${shimmer} h-5 w-24`} />
            <div className="flex gap-2">
              <div className={`${shimmer} w-20 h-10 rounded-xl`} />
              <div className={`${shimmer} w-20 h-10 rounded-xl`} />
              <div className={`${shimmer} w-20 h-10 rounded-xl`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
