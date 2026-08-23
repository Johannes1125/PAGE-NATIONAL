"use client";

import { Officer } from "../types";

export const AVATAR_PHOTOS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", // Female
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", // Male
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", // Female
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", // Male
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face", // Female
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face", // Male
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face", // Female
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face", // Male
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face", // Female
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face", // Male
];

// Consistent avatar photo selection based on name hash
export const getOfficerAvatar = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PHOTOS.length;
  return AVATAR_PHOTOS[index];
};

type OfficerPreviewProps = {
  officers: Officer[];
  onViewMoreClick?: () => void;
};

export default function OfficerPreview({ officers, onViewMoreClick }: OfficerPreviewProps) {
  const displayLimit = 3;
  const displayedOfficers = officers.slice(0, displayLimit);
  const remainingCount = officers.length - displayLimit;

  return (
    <div className="space-y-4 select-none">
      {/* Uppercase heading with count */}
      <h4 className="text-[14px] font-bold text-slate-500 uppercase tracking-wider mb-2">
        OFFICERS ({officers.length})
      </h4>

      {officers.length === 0 ? (
        <div className="text-slate-500 italic text-[15px] py-1">
          No officers assigned yet.
        </div>
      ) : (
        <div className="space-y-3">
          {displayedOfficers.map((officer) => {
            const photoUrl = officer.avatarUrl || "/images/officer-placeholder.png";
            return (
              <div 
                key={officer.id} 
                className="flex items-center gap-3.5 p-1 rounded-xl transition-colors"
              >
                {/* Avatar */}
                <img
                  src={photoUrl}
                  alt={officer.name}
                  className="w-11 h-11 rounded-full border border-slate-200 object-cover shadow-sm bg-slate-50 shrink-0"
                />
                
                {/* Name & Role */}
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-slate-800 truncate leading-tight">
                    {officer.name}
                  </p>
                  <p className="text-[14px] text-slate-500 font-semibold mt-1">
                    {officer.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {remainingCount > 0 && (
        <button
          type="button"
          onClick={onViewMoreClick}
          className="w-full h-[52px] rounded-xl bg-blue-50/50 hover:bg-blue-100/50 text-blue-700 text-[15px] font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
          aria-label={`View ${remainingCount} more officers`}
        >
          <span>+{remainingCount} More Officers</span>
        </button>
      )}
    </div>
  );
}
