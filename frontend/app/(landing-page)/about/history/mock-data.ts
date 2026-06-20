export type MilestoneType = "founding" | "conference" | "partnership" | "initiative" | "program";

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  milestone_type: MilestoneType;
  list?: {
    title: string;
    items: string[];
  };
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: "1962",
    title: "Foundation of PAGE",
    description: "The Philippine Association for Graduate Education Philippines, Inc. (PAGE) was officially established on September 26, 1962 to assist the government in improving the quality of graduate education in the country. The initiative began through the efforts of Dr. Jesus E. Perpiñan and Atty. Pablo T. Mateo Jr., who convened graduate school deans to address issues in graduate education management and standards. PAGE was founded by nine pioneering higher education institutions and became the country's first national organization dedicated to graduate education.",
    milestone_type: "founding",
    list: {
      title: "Founding Institutions",
      items: [
        "Arellano University",
        "Centro Escolar University",
        "Far Eastern University",
        "Manuel L. Quezon University",
        "National Teachers' College",
        "Philippine Normal University",
        "Philippine Women's University",
        "University of the East",
        "University of Santo Tomas"
      ]
    }
  },
  {
    year: "1960s",
    title: "Establishing Standards",
    description: "PAGE organized its first national conventions and advocated for reforms in graduate education, including improved thesis and dissertation procedures, expanded access to research facilities, and the development of policies for graduate degree programs. Its recommendations contributed to the issuance of the country's first standards for graduate education.",
    milestone_type: "initiative",
  },
  {
    year: "1970s",
    title: "Expansion and Research Development",
    description: "PAGE expanded beyond Metro Manila and established regional chapters across Luzon, Visayas, and Mindanao. It strengthened its role in policy development by influencing government regulations on graduate education and promoting research as a foundation for national development.",
    milestone_type: "program",
  },
  {
    year: "1980s",
    title: "Strengthening Research Culture",
    description: "The organization intensified its focus on research quality and collaboration through projects such as the State-of-the-Art Review of Educational Research (SOTARE). PAGE also developed evaluation instruments and situational analyses to improve graduate school performance nationwide.",
    milestone_type: "program",
  },
  {
    year: "1990s",
    title: "Responding to Emerging Challenges",
    description: "PAGE addressed globalization, curriculum reforms, environmental concerns, and quality assurance in graduate education. The organization continued to strengthen partnerships with higher education institutions and government agencies to ensure responsive and relevant graduate programs.",
    milestone_type: "partnership",
  },
  {
    year: "2000s",
    title: "Strategic Growth and Digital Transformation",
    description: "PAGE introduced its Strategic Plan 2001–2006, focusing on organizational development, quality assurance, innovation, relevance, and access. During this period, PAGE launched its official website and expanded collaboration among regional chapters nationwide.",
    milestone_type: "initiative",
  },
  {
    year: "2010s",
    title: "Regional and International Engagement",
    description: "As PAGE celebrated its Golden Anniversary in 2012, it strengthened its international outlook through ASEAN-focused initiatives, research collaborations, and benchmarking activities. In 2017, the organization held its 50th Annual National Convention, introduced international plenary speakers, launched the PAGE National Anthem, and established national recognition programs for outstanding graduate education practices.",
    milestone_type: "conference",
  },
  {
    year: "2020s",
    title: "Transformation and Resilience",
    description: "Under the leadership of Dr. Lino C. Reynoso, PAGE guided graduate education institutions through the challenges of the COVID-19 pandemic, the implementation of new graduate education policies, and the transition toward flexible and technology-enabled learning environments. The organization strengthened collaborative research initiatives and promoted resilient and responsive graduate education systems.",
    milestone_type: "program",
  },
  {
    year: "2024",
    title: "Organizational Renewal",
    description: "PAGE successfully renewed its registration under the new official name 'Philippine Association for Graduate Education Philippines, Inc. (PAGE)' with SEC Registration Number 2024090169660-00 and BIR TIN 661-807-029-000. Under the leadership of Dr. Lino C. Reynoso and Technical Adviser Dr. Edizon Fermin, the organization reactivated regional chapters (I, III, IV-A, IV-B, V, VI, IX, XI, and CAR), launched its official Facebook page, and established a new email address (page.org.ph@gmail.com).",
    milestone_type: "initiative",
  },
  {
    year: "2025",
    title: "Advancing Graduate Education Through Artificial Intelligence",
    description: "Celebrating its 63rd year, PAGE continues to lead discussions on the future of graduate education through its 56th Annual National Convention with the theme, \"Advancing Philippine Graduate Education Through Artificial Intelligence.\" This reflects the organization's commitment to innovation, digital transformation, and the evolving needs of higher education in the Philippines.",
    milestone_type: "conference",
  }
];
