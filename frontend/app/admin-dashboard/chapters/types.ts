// ─── Existing dashboard types (backward-compatible) ───────────────────────────

export interface Officer {
  id: string;
  name: string;
  role: string;
  term: string;
  avatarUrl?: string;
}

export interface Chapter {
  id: string;
  name: string;             // mapped from API's `title`
  islandGroup: "Luzon" | "Visayas" | "Mindanao"; // mapped from `island_group`
  region: string;
  description: string;      // mapped from `short_description`
  status: "published" | "draft" | "archived";
  officers: Officer[];      // mapped from `officers` relation (ChapterOfficer[])
  createdAt: string;        // mapped from `created_at`
  updatedAt: string;        // mapped from `updated_at`
}

// ─── API response types (from backend) ────────────────────────────────────────

export interface ChapterImage {
  id: string;
  file_url: string;
  file_name: string;
  sort_order: number;
  created_at: string;
}

export interface ChapterDocument {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

export interface ChapterOfficerRecord {
  id: string;
  name: string;
  category_type: string;
  year_joined: number;
  sort_order: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ChapterActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ChapterAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  created_at: string;
  updated_at: string;
}

/** Full chapter record as returned by GET /chapters/:id */
export interface ChapterFull {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  island_group: "Luzon" | "Visayas" | "Mindanao";
  region: string;
  overview: string;
  mission?: string;
  vision?: string;
  status: "published" | "draft" | "archived";
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  images: ChapterImage[];
  documents: ChapterDocument[];
  officers: ChapterOfficerRecord[];
  activities: ChapterActivity[];
  announcements: ChapterAnnouncement[];
}

/** Stats shape from GET /chapters/stats */
export interface ChapterStatsData {
  total: number;
  luzon: number;
  visayas: number;
  mindanao: number;
}

// ─── Wizard state types ────────────────────────────────────────────────────────

export interface WizardImageEntry {
  file_url: string;
  file_name: string;
  sort_order: number;
  /** Local preview URL (from FileReader) — not sent to API */
  previewUrl?: string;
}

export interface WizardDocumentEntry {
  file_url: string;
  file_name: string;
  file_type: string;
}

export interface WizardOfficerEntry {
  _key: string;          // local unique key for React list
  name: string;
  category_type: string;
  year_joined: number | "";
  sort_order: number;
  image_url?: string;
}

export interface WizardActivityEntry {
  _key: string;
  title: string;
  description: string;
  date: string;
  image_url?: string;
}

export interface WizardAnnouncementEntry {
  _key: string;
  title: string;
  content: string;
  date: string;
}

export interface WizardStep1 {
  title: string;
  short_description: string;
  island_group: "Luzon" | "Visayas" | "Mindanao" | "";
  region: string;
  images: WizardImageEntry[];
  documents: WizardDocumentEntry[];
}

export interface WizardStep2 {
  overview: string;
  mission: string;
  vision: string;
}

export interface WizardStep3 {
  officers: WizardOfficerEntry[];
}

export interface WizardStep4 {
  activities: WizardActivityEntry[];
  announcements: WizardAnnouncementEntry[];
}

export interface WizardFormData {
  step1: WizardStep1;
  step2: WizardStep2;
  step3: WizardStep3;
  step4: WizardStep4;
}

/** Helper to map a ChapterFull API record to the dashboard Chapter type */
export function mapChapterFullToChapter(ch: ChapterFull): Chapter {
  return {
    id: ch.id,
    name: ch.title,
    islandGroup: ch.island_group,
    region: ch.region,
    description: ch.short_description,
    status: ch.status,
    officers: ch.officers.map((o) => ({
      id: o.id,
      name: o.name,
      role: o.category_type,
      term: String(o.year_joined),
    })),
    createdAt: ch.created_at,
    updatedAt: ch.updated_at,
  };
}

/** Helper to map a list API record to the dashboard Chapter type */
export function mapApiChapterToChapter(ch: {
  id: string;
  title: string;
  island_group: string;
  region: string;
  short_description: string;
  status: string;
  officers?: { id: string; name: string; category_type: string; year_joined: number }[];
  created_at: string;
  updated_at: string;
}): Chapter {
  return {
    id: ch.id,
    name: ch.title,
    islandGroup: ch.island_group as "Luzon" | "Visayas" | "Mindanao",
    region: ch.region,
    description: ch.short_description,
    status: ch.status as "published" | "draft" | "archived",
    officers: (ch.officers ?? []).map((o) => ({
      id: o.id,
      name: o.name,
      role: o.category_type,
      term: String(o.year_joined),
    })),
    createdAt: ch.created_at,
    updatedAt: ch.updated_at,
  };
}
