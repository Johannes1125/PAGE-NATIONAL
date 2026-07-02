// ─── Convention dashboard types ───────────────────────────────────────────────

/** Convention record as returned by the backend REST API */
export interface Convention {
  id: string;
  convention_number: string;
  title: string;
  location: string;
  convention_date: string;       // ISO date string
  status: "draft" | "published";
  banner_url: string | null;
  description: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
  published_at: string | null;   // ISO timestamp
}

/** Wrapper returned by all convention endpoints */
export interface ConventionApiResponse {
  success: boolean;
  data: Convention | Convention[];
  message: string;
}

/** Shape for the Create / Edit form's local state */
export interface ConventionFormData {
  convention_number: string;
  title: string;
  location: string;
  convention_date: string;
  description: string;
  banner: File | null;
  existing_banner_url: string | null;
}

/** Per-field validation errors */
export type ConventionFormErrors = Partial<Record<keyof ConventionFormData, string>>;
