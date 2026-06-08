export type MilestoneType = "founding" | "conference" | "partnership" | "initiative" | "program";

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  milestone_type: MilestoneType;
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: "2010",
    title: "PAGE Foundation",
    description: "PAGE was officially established as a special project under the Commission on Higher Education (CHED), marking the beginning of a national movement to elevate graduate education standards across the Philippines.",
    milestone_type: "founding",
  },
  {
    year: "2012",
    title: "First National Conference",
    description: "PAGE hosted its inaugural national conference, bringing together graduate school deans and faculty from over 80 universities across the Philippine archipelago to share research and best practices.",
    milestone_type: "conference",
  },
  {
    year: "2015",
    title: "International Partnerships",
    description: "PAGE established formal partnerships with leading graduate education organizations in Asia, Europe, and North America, opening doors for international research collaboration and faculty exchange programs.",
    milestone_type: "partnership",
  },
  {
    year: "2018",
    title: "Digital Research Repository",
    description: "Launched the national digital repository for Philippine graduate research, providing open access to thousands of theses, dissertations, and peer-reviewed articles from member institutions.",
    milestone_type: "initiative",
  },
  {
    year: "2021",
    title: "Virtual Learning Initiative",
    description: "In response to the global pandemic, PAGE pioneered hybrid graduate education frameworks adopted by over 120 universities, ensuring continuity and quality in graduate programs nationwide.",
    milestone_type: "program",
  },
  {
    year: "2024",
    title: "Excellence Awards Program",
    description: "PAGE introduced the annual Graduate Education Excellence Awards, recognizing outstanding contributions by faculty, researchers, and graduate students across the Philippines.",
    milestone_type: "initiative",
  },
];
