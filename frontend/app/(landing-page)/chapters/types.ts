export interface ChapterOfficer {
  name: string;
  position: string;
  term: string;
  university: string;
  photo_url: string;
}

export type ActivityType = "conference" | "seminar" | "workshop" | "other";

export interface ChapterActivity {
  title: string;
  date: string;
  venue: string;
  description: string;
  description_excerpt: string;
  type: ActivityType;
}

export interface ChapterAnnouncement {
  title: string;
  date: string;
  body: string;
  body_excerpt: string;
}

export interface ChapterGalleryItem {
  image_url: string;
  caption: string;
}

export type DocumentFileType = "pdf" | "docx" | "pptx" | "image";

export interface ChapterDocument {
  file_name: string;
  file_type: DocumentFileType;
  upload_date: string;
  download_url: string;
}

export interface Chapter {
  slug: string;
  chapter_name: string;
  region: "Luzon" | "Visayas" | "Mindanao";
  established_year: number;
  member_institutions_count: number;
  cover_image_url: string;
  tagline: string;
  description: string;
  mission: string;
  vision: string;
  officers: ChapterOfficer[];
  activities: ChapterActivity[];
  announcements: ChapterAnnouncement[];
  gallery: ChapterGalleryItem[];
  documents: ChapterDocument[];
}
