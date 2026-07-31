export interface TimelineEvent {
  year: string;
  milestone_type: "founding" | "conference" | "partnership" | "initiative" | "program";
  title: string;
  description: string;
  list?: {
    title: string;
    items: string[];
  };
}

export const TIMELINE_EVENTS: TimelineEvent[] = [];
