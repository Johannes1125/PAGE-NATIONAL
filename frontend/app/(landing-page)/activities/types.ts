// ── National Activities — TypeScript Interfaces ──────────────────────────────
// BACKEND TODO: Validate these interfaces match the Laravel API response shapes
// once ActivityController is implemented.

export type ActivityType = 'conference' | 'seminar' | 'workshop' | 'other';
export type ActivityStatus = 'draft' | 'published';

export interface ActivityMaterial {
  file_name: string;
  file_path: string;
}

export interface Activity {
  id: number;
  title: string;
  slug: string;
  description: string;
  venue: string;
  date: string; // ISO date string e.g. "2026-04-14"
  type: ActivityType;
  status: ActivityStatus;
  gallery: string[];          // array of image URLs (Cloudinary or Unsplash for mock)
  materials: ActivityMaterial[];
}

export interface PaginatedActivitiesResponse {
  success: boolean;
  activities: Activity[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  years: number[];            // unique years derived from published activities
}

export interface ActivityDetailResponse {
  success: boolean;
  activity: Activity | null;
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType | 'all', string> = {
  all:        'All Activities',
  conference: 'Conferences',
  seminar:    'Seminars',
  workshop:   'Workshops',
  other:      'Other Events',
};
