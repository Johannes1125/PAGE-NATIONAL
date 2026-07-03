// ─── Convention dashboard & wizard types ─────────────────────────────────────

/** Attachment record from the backend */
export interface ConventionAttachment {
  id: string;
  convention_id: string;
  file_url: string;
  file_name: string;
  file_type: "image" | "pdf";
  created_at: string;
}

/** Schedule record from the backend */
export interface ConventionSchedule {
  id: string;
  convention_id: string;
  schedule_date: string;
  title: string;
  event_type: string;
  start_time: string | null;
  end_time: string | null;
  location: string;
  created_at: string;
  updated_at: string;
}

/** Speaker record from the backend */
export interface ConventionSpeaker {
  id: string;
  convention_id: string;
  name: string;
  role_position: string;
  institution: string;
  presentation_topic: string;
  created_at: string;
  updated_at: string;
}

/** Convention record as returned by list/detail endpoints */
export interface Convention {
  id: string;
  convention_number: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  status: "draft" | "published";
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/** Full convention with nested relations (GET /conventions/:id/full) */
export interface ConventionFull extends Convention {
  schedules: ConventionSchedule[];
  speakers: ConventionSpeaker[];
  attachments: ConventionAttachment[];
}

/** Standard API wrapper */
export interface ConventionApiResponse<T = Convention | Convention[]> {
  success: boolean;
  data: T;
  message: string;
}

// ─── Wizard-local types ───────────────────────────────────────────────────────

export interface WizardStep1 {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  /** Already persisted server attachments */
  attachments: ConventionAttachment[];
  /** Local files queued for upload on Step 1 save */
  pendingImages: WizardPendingFile[];
  pendingPdfs: WizardPendingFile[];
}

export interface WizardPendingFile {
  _key: string;
  file: File;
  previewUrl?: string;
}

export interface WizardScheduleEntry {
  _key: string;
  id?: string;
  schedule_date: string;
  title: string;
  event_type: string;
  start_time: string;
  end_time: string;
  location: string;
}

export interface WizardSpeakerEntry {
  _key: string;
  id?: string;
  name: string;
  role_position: string;
  institution: string;
  presentation_topic: string;
}

export interface WizardFormData {
  step1: WizardStep1;
  schedules: WizardScheduleEntry[];
  speakers: WizardSpeakerEntry[];
}

/** Create convention JSON payload */
export interface CreateConventionPayload {
  convention_number: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  status?: "draft" | "published";
  attachments?: Array<{
    file_url: string;
    file_name: string;
    file_type: "image" | "pdf";
  }>;
}

/** Update convention JSON payload */
export interface UpdateConventionPayload {
  convention_number?: string;
  title?: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
}

export interface CreateSchedulePayload {
  schedule_date: string;
  title: string;
  event_type: string;
  start_time?: string;
  end_time?: string;
  location: string;
}

export interface UpdateSchedulePayload {
  schedule_date?: string;
  title?: string;
  event_type?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
}

export interface CreateSpeakerPayload {
  name: string;
  role_position: string;
  institution: string;
  presentation_topic: string;
}

export interface UpdateSpeakerPayload {
  name?: string;
  role_position?: string;
  institution?: string;
  presentation_topic?: string;
}

export const CONVENTION_EVENT_TYPES = [
  "Plenary",
  "Special Session",
  "Workshop",
  "Breakout Session",
  "Panel Discussion",
  "Opening Ceremony",
  "Closing Ceremony",
  "Other",
] as const;

export type ConventionEventType = (typeof CONVENTION_EVENT_TYPES)[number];
