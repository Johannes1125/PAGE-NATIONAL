/**
 * PAGE Chapters Mock Data
 *
 * This file contains the complete mock data for all 18 regional chapters of PAGE.
 * The chapters represent the official regions of the Philippines.
 *
 * Each chapter has unique metadata and:
 * - At least 3 officers per active term (grouped into "2024-2026" and "2022-2024" terms)
 * - At least 3 activities (conferences, seminars, workshops, other)
 * - At least 2 announcements
 * - At least 4 gallery images (using SVG data URIs for deterministic placeholder loading)
 * - At least 2 document records (PDFs, DOCX, PPTX, etc. with download paths)
 */

import { Chapter, ChapterOfficer, ChapterActivity, ChapterAnnouncement, ChapterGalleryItem, ChapterDocument } from "./types";

// Helper to generate colored cover SVG data url
const makeCoverSvg = (name: string, bgColor: string) =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="100%" height="100%" fill="${encodeURIComponent(bgColor)}"/><rect width="90%" height="90%" x="5%" y="5%" fill="none" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold" font-size="36" fill="%23ffffff">${encodeURIComponent(name)}</text></svg>`;

const makeGallerySvg = (name: string, num: number, bgColor: string) =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="${encodeURIComponent(bgColor)}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="%23ffffff">${encodeURIComponent(name)} - Photo ${num}</text></svg>`;

// Standard base definitions for chapters
const CHAPTER_BASES = [
  {
    slug: "ncr",
    name: "National Capital Region",
    short: "NCR",
    region: "Luzon" as const,
    color: "#0f172a", // Slate
    established: 2010,
    institutions: 45,
    tagline: "Leading graduate education excellence in the metropolitan hub.",
    uni1: "University of the Philippines Diliman",
    uni2: "De La Salle University",
    uni3: "Ateneo de Manila University",
  },
  {
    slug: "car",
    name: "Cordillera Administrative Region",
    short: "CAR",
    region: "Luzon" as const,
    color: "#1e3a8a", // Blue
    established: 2012,
    institutions: 15,
    tagline: "Elevating research standards across the highlands.",
    uni1: "Saint Louis University",
    uni2: "University of the Cordilleras",
    uni3: "Benguet State University",
  },
  {
    slug: "region-1",
    name: "Region I (Ilocos Region)",
    short: "Region I",
    region: "Luzon" as const,
    color: "#065f46", // Emerald
    established: 2011,
    institutions: 18,
    tagline: "Preserving heritage through advanced educational inquiry.",
    uni1: "Don Mariano Marcos Memorial State University",
    uni2: "University of Northern Philippines",
    uni3: "Mariano Marcos State University",
  },
  {
    slug: "region-2",
    name: "Region II (Cagayan Valley)",
    short: "Region II",
    region: "Luzon" as const,
    color: "#3730a3", // Indigo
    established: 2013,
    institutions: 12,
    tagline: "Advancing graduate learning and research in the valley.",
    uni1: "Cagayan State University",
    uni2: "Saint Mary's University",
    uni3: "Isabela State University",
  },
  {
    slug: "region-3",
    name: "Region III (Central Luzon)",
    short: "Region III",
    region: "Luzon" as const,
    color: "#831843", // Pink
    established: 2011,
    institutions: 28,
    tagline: "A center of research and development in central Luzon.",
    uni1: "Central Luzon State University",
    uni2: "Holy Angel University",
    uni3: "Bulacan State University",
  },
  {
    slug: "region-4a",
    name: "Region IV-A (CALABARZON)",
    short: "Region IV-A",
    region: "Luzon" as const,
    color: "#581c87", // Purple
    established: 2011,
    institutions: 38,
    tagline: "Linking graduate research to regional industrial innovation.",
    uni1: "University of the Philippines Los Baños",
    uni2: "Batangas State University",
    uni3: "De La Salle University - Dasmariñas",
  },
  {
    slug: "region-4b",
    name: "Region IV-B (MIMAROPA)",
    short: "Region IV-B",
    region: "Luzon" as const,
    color: "#7c2d12", // Orange/Rust
    established: 2014,
    institutions: 10,
    tagline: "Empowering island communities through advanced education.",
    uni1: "Mindoro State University",
    uni2: "Palawan State University",
    uni3: "Western Philippines University",
  },
  {
    slug: "region-5",
    name: "Region V (Bicol Region)",
    short: "Region V",
    region: "Luzon" as const,
    color: "#1c1917", // Stone
    established: 2012,
    institutions: 20,
    tagline: "Igniting regional development through academic inquiry.",
    uni1: "Bicol University",
    uni2: "Ateneo de Naga University",
    uni3: "Catanduanes State University",
  },
  {
    slug: "region-6",
    name: "Region VI (Western Visayas)",
    short: "Region VI",
    region: "Visayas" as const,
    color: "#1e1b4b", // Dark Violet
    established: 2011,
    institutions: 24,
    tagline: "Cultivating academic leadership and research in Panay and Negros.",
    uni1: "Central Philippine University",
    uni2: "West Visayas State University",
    uni3: "University of San Agustin",
  },
  {
    slug: "region-7",
    name: "Region VII (Central Visayas)",
    short: "Region VII",
    region: "Visayas" as const,
    color: "#0f766e", // Teal
    established: 2010,
    institutions: 32,
    tagline: "Driving academic and research competitiveness in the central islands.",
    uni1: "University of San Carlos",
    uni2: "University of San Jose - Recoletos",
    uni3: "Cebu Technological University",
  },
  {
    slug: "region-8",
    name: "Region VIII (Eastern Visayas)",
    short: "Region VIII",
    region: "Visayas" as const,
    color: "#701a75", // Magenta
    established: 2013,
    institutions: 14,
    tagline: "Rebuilding and strengthening educational structures with research.",
    uni1: "Leyte Normal University",
    uni2: "Visayas State University",
    uni3: "Eastern Visayas State University",
  },
  {
    slug: "nir",
    name: "Negros Island Region",
    short: "NIR",
    region: "Visayas" as const,
    color: "#b45309", // Amber
    established: 2015,
    institutions: 12,
    tagline: "Fostering academic harmony and research collaboration in Negros.",
    uni1: "Silliman University",
    uni2: "University of St. La Salle",
    uni3: "Negros Oriental State University",
  },
  {
    slug: "region-9",
    name: "Region IX (Zamboanga Peninsula)",
    short: "Region IX",
    region: "Mindanao" as const,
    color: "#451a03", // Brown
    established: 2013,
    institutions: 11,
    tagline: "Bridging cultures and communities with advanced studies.",
    uni1: "Western Mindanao State University",
    uni2: "Ateneo de Zamboanga University",
    uni3: "Jose Rizal Memorial State University",
  },
  {
    slug: "region-10",
    name: "Region X (Northern Mindanao)",
    short: "Region X",
    region: "Mindanao" as const,
    color: "#0284c7", // Sky Blue
    established: 2011,
    institutions: 22,
    tagline: "Expanding horizons in graduate research and technology.",
    uni1: "Xavier University - Ateneo de Cagayan",
    uni2: "Mindanao State University - Iligan Institute of Technology",
    uni3: "Central Mindanao University",
  },
  {
    slug: "region-11",
    name: "Region XI (Davao Region)",
    short: "Region XI",
    region: "Mindanao" as const,
    color: "#047857", // Emerald Light
    established: 2011,
    institutions: 25,
    tagline: "Empowering global graduate education in southern Mindanao.",
    uni1: "Ateneo de Davao University",
    uni2: "University of Southeastern Philippines",
    uni3: "University of Mindanao",
  },
  {
    slug: "region-12",
    name: "Region XII (SOCCSKSARGEN)",
    short: "Region XII",
    region: "Mindanao" as const,
    color: "#c2410c", // Red-Orange
    established: 2014,
    institutions: 15,
    tagline: "Harmonizing educational excellence and development in central Mindanao.",
    uni1: "Mindanao State University - General Santos",
    uni2: "University of Southern Mindanao",
    uni3: "Notre Dame of Marbel University",
  },
  {
    slug: "region-13",
    name: "Region XIII (Caraga)",
    short: "Region XIII",
    region: "Mindanao" as const,
    color: "#111827", // Neutral Black
    established: 2014,
    institutions: 10,
    tagline: "Advancing ecological and resource management graduate studies.",
    uni1: "Caraga State University",
    uni2: "Father Saturnino Urios University",
    uni3: "Surigao Del Norte State University",
  },
  {
    slug: "barmm",
    name: "Bangsamoro Autonomous Region in Muslim Mindanao",
    short: "BARMM",
    region: "Mindanao" as const,
    color: "#064e3b", // Deep Forest Green
    established: 2016,
    institutions: 9,
    tagline: "Supporting peace and institutional building through quality graduate education.",
    uni1: "Mindanao State University - Main Campus Marawi",
    uni2: "Cotabato State University",
    uni3: "Basilan State College",
  },
];

// Generate the full detailed mock data array
export const CHAPTERS_DATA: Chapter[] = CHAPTER_BASES.map((base) => {
  // Define custom officers per chapter
  const officers: ChapterOfficer[] = [
    // 2024-2026 Term
    {
      name: `Dr. Maria Carmen Santos`,
      position: "President",
      term: "2024-2026",
      university: base.uni1,
      photo_url: `https://api.dicebear.com/7.x/initials/svg?seed=MCS-${base.short}`,
    },
    {
      name: `Dr. Franklin A. Lopez`,
      position: "Vice President",
      term: "2024-2026",
      university: base.uni2,
      photo_url: `https://api.dicebear.com/7.x/initials/svg?seed=FAL-${base.short}`,
    },
    {
      name: `Dr. Evelyn T. Cruz`,
      position: "Secretary",
      term: "2024-2026",
      university: base.uni3,
      photo_url: `https://api.dicebear.com/7.x/initials/svg?seed=ETC-${base.short}`,
    },
    // 2022-2024 Term
    {
      name: `Dr. Arturo D. Vergara`,
      position: "President",
      term: "2022-2024",
      university: base.uni2,
      photo_url: `https://api.dicebear.com/7.x/initials/svg?seed=ADV-${base.short}`,
    },
    {
      name: `Dr. Beatrice L. Imperial`,
      position: "Vice President",
      term: "2022-2024",
      university: base.uni3,
      photo_url: `https://api.dicebear.com/7.x/initials/svg?seed=BLI-${base.short}`,
    },
    {
      name: `Dr. Carlos M. Pineda`,
      position: "Secretary-Treasurer",
      term: "2022-2024",
      university: base.uni1,
      photo_url: `https://api.dicebear.com/7.x/initials/svg?seed=CMP-${base.short}`,
    },
  ];

  // Define activities
  const activities: ChapterActivity[] = [
    {
      title: `${base.short} Regional Graduate Research Conference 2025`,
      date: "2025-10-18T09:00:00.000Z",
      venue: `${base.uni1} Auditorium`,
      description: `This conference brings together graduate school students, faculty members, and academic administrators from all over the region to present their latest research discoveries. Submissions cover education, social sciences, STEM, and business administration. Selected peer-reviewed papers will be considered for publication in the PAGE National Research Journal. Includes keynote speeches from prominent local and international experts.`,
      description_excerpt: `Gathering graduate scholars and academic leaders to showcase breakthrough research in education, technology, and governance.`,
      type: "conference",
    },
    {
      title: "Workshop on Advanced Research Methodologies & Data Analytics",
      date: "2025-08-04T08:30:00.000Z",
      venue: `${base.uni2} IT Laboratory`,
      description: `A hands-on capacity building workshop focused on structural equation modeling (SEM), qualitative analysis software (NVivo/MAXQDA), and research design methodologies. Participants will analyze mock datasets and consult with seasoned statisticians on their actual dissertation designs. Ideal for thesis advisers and graduating doctoral candidates.`,
      description_excerpt: `A masterclass workshop on utilizing statistical packages and qualitative software to conduct high-impact academic analyses.`,
      type: "workshop",
    },
    {
      title: "Seminar on CHED Policies & International Publication Standards",
      date: "2025-11-12T13:30:00.000Z",
      venue: `${base.uni3} Multi-Purpose Hall`,
      description: `A lecture and forum addressing recent directives from the Commission on Higher Education (CHED) regarding graduate curriculum alignments, institutional quality assurance, and ethics in publishing. Expert speakers will discuss strategies to avoid predatory journals and maximize indexing visibility in Scopus and Web of Science.`,
      description_excerpt: `Navigating the latest quality standards and publishing frameworks mandated by regulatory and international research indices.`,
      type: "seminar",
    },
  ];

  // Define announcements
  const announcements: ChapterAnnouncement[] = [
    {
      title: `Call for Papers: ${base.short} Graduate Journal 2025 Vol 15`,
      date: "2025-06-15T00:00:00.000Z",
      body: `The editorial board of the ${base.name} Graduate Journal is now accepting submissions for the upcoming issue. We welcome original research papers, literature reviews, and policy analyses from graduate students and faculty. Please submit your fully formatted manuscripts (maximum 6,000 words) using the APA 7th edition citation style via our online portal on or before October 15, 2025. Contact the regional secretariat for templates and submission guidelines.`,
      body_excerpt: `Submissions are now open for our peer-reviewed regional journal. Graduate students and faculty are highly encouraged to submit original research.`,
    },
    {
      title: `Search for Outstanding Graduate Advisers and Researchers`,
      date: "2025-07-20T00:00:00.000Z",
      body: `Nominations are officially open for the regional Outstanding Graduate Advisers and Researchers Awards. This annual initiative recognizes thesis/dissertation mentors and graduate students who have demonstrated exemplary dedication to academic publishing, ethics, and community-oriented development research. Awardees will receive plaque recognition, cash incentives, and automatic nomination to the National PAGE Excellence Awards. Deadline for submission of portfolios is November 1, 2025.`,
      body_excerpt: `Nominations are open for the annual Regional Excellence Awards, honoring outstanding mentors and students in research and publishing.`,
    },
  ];

  // Define gallery
  const gallery: ChapterGalleryItem[] = [
    {
      image_url: makeGallerySvg(base.name, 1, base.color),
      caption: `Opening ceremonies of the ${base.short} Regional Assembly.`,
    },
    {
      image_url: makeGallerySvg(base.name, 2, base.color),
      caption: `Plenary panel discussions led by CHED directors.`,
    },
    {
      image_url: makeGallerySvg(base.name, 3, base.color),
      caption: `Parallel paper presentation sessions in educational leadership.`,
    },
    {
      image_url: makeGallerySvg(base.name, 4, base.color),
      caption: `Outstanding researcher awards ceremony and fellowship dinner.`,
    },
  ];

  // Define documents
  const documents: ChapterDocument[] = [
    {
      file_name: `${base.slug.toUpperCase()}-Chapter-ByLaws-Approved.pdf`,
      file_type: "pdf",
      upload_date: "2025-01-22T08:00:00.000Z",
      download_url: `/mock-docs/${base.slug}-bylaws.pdf`,
    },
    {
      file_name: `PAGE-${base.short}-Research-Journal-Template.docx`,
      file_type: "docx",
      upload_date: "2025-02-14T08:00:00.000Z",
      download_url: `/mock-docs/PAGE-${base.short}-template.docx`,
    },
  ];

  return {
    slug: base.slug,
    chapter_name: base.name,
    region: base.region,
    established_year: base.established,
    member_institutions_count: base.institutions,
    cover_image_url: makeCoverSvg(base.name, base.color),
    tagline: base.tagline,
    description: `The ${base.name} Chapter (PAGE ${base.short}) is dedicated to serving graduate programs, administrators, faculty, and scholars across its territory. Established in ${base.established}, it has grown to encompass ${base.institutions} member institutions, actively working to align curricula, research methodologies, and faculty competencies with modern national and international standards. Through regular regional research assemblies, writing colloquiums, and collaborative initiatives under the CHED program, the chapter fosters a supportive ecosystem that pushes the boundaries of Philippine scholarship.`,
    mission: `To cultivate a vibrant, ethical, and highly collaborative community of graduate school educators, researchers, and administrators in ${base.name} that champion rigorous research and academic innovations.`,
    vision: `To become a leading regional authority in graduate research administration and an influential advocate for quality and relevance in post-graduate education.`,
    officers,
    activities,
    announcements,
    gallery,
    documents,
  };
});
