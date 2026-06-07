export interface ConventionSession {
  time: string;
  session_title: string;
  session_type: "plenary" | "workshop" | "breakout" | "special";
  room_or_venue: string;
}

export interface ConventionDay {
  day_number: number;
  date: string;
  sessions: ConventionSession[];
}

export interface ConventionSpeaker {
  name: string;
  title: string;
  organization: string;
  topic: string;
  photo_url: string;
}

export interface ConventionActivity {
  title: string;
  description: string;
  type: "workshop" | "forum" | "competition" | "cultural" | "other";
  date: string;
  venue: string;
}

export interface ConventionJournal {
  title: string;
  authors: string[];
  abstract_excerpt: string;
  volume: string;
  issue: string;
  download_url: string;
}

export interface ConventionGalleryItem {
  image_url: string;
  caption: string;
}

export interface Convention {
  slug: string;
  convention_number: string;
  theme: string;
  year: number;
  location: string;
  date_range: string;
  cover_image_url: string;
  intro_paragraph: string;
  program_schedule: ConventionDay[];
  speakers: ConventionSpeaker[];
  activities: ConventionActivity[];
  journals: ConventionJournal[];
  gallery: ConventionGalleryItem[];
}
