import { Journal } from "./types";

export const MOCK_JOURNALS: Journal[] = [
  {
    id: "jr-pjge",
    title: "Philippine Journal of Graduate Education (PJGE)",
    subtitle: "Philippine Journal of Graduate Education",
    description: "The flagship publication of the Philippine Association for Graduate Education (PAGE). PJGE is a peer-reviewed academic journal dedicated to high-quality research on postgraduate school administration, curriculum innovation, educational reforms, and academic policy reviews across Philippine universities.",
    cover_image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=400&auto=format&fit=crop",
    discipline: "Humanities and Social Sciences",
    publisher: "PAGE National Publications",
    issn: "1908-1122",
    email: "publications@page.org.ph",
    phone: "+63 2 8999 1234",
    volume: "Vol. 15",
    issue: "No. 1",
    year: 2026,
    articles: [
      {
        id: "art-pjge-01",
        title: "From the Chief Editor: Charting New Directions in Graduate Studies",
        authors: ["Dr. Remedios C. Santos"],
        pages: "pp. 1-4",
        download_url: "/mock-journals/pjge-editor-notes.pdf"
      },
      {
        id: "art-pjge-02",
        title: "Challenges and Opportunities in Transnational Graduate Education: The Philippine Experience",
        authors: ["Dr. Remedios C. Santos", "Dr. Mark Anthony V. Lopez"],
        pages: "pp. 5-25",
        download_url: "/mock-journals/transnational-education.pdf"
      },
      {
        id: "art-pjge-03",
        title: "Integrating Artificial Intelligence in Graduate School Curricula: A Delphi Study",
        authors: ["Dr. Mark Anthony V. Lopez"],
        pages: "pp. 26-48",
        download_url: "/mock-journals/ai-curricula-delphi.pdf"
      },
      {
        id: "art-pjge-04",
        title: "A Comparative Analysis of Research Productivity in Private and State Universities",
        authors: ["Prof. Eleanor G. Reyes"],
        pages: "pp. 49-70",
        download_url: "/mock-journals/research-productivity-analysis.pdf"
      }
    ]
  },
  {
    id: "jr-pmrj",
    title: "PAGE Multidisciplinary Research Journal (PMRJ)",
    subtitle: "PAGE Multidisciplinary Research Journal",
    description: "An internationally-refereed publication showcasing interdisciplinary studies and collaboration across natural sciences, business, humanities, and social sciences. It serves as a premium platform for graduate students and faculty members to publish diverse research findings.",
    cover_image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=400&auto=format&fit=crop",
    discipline: "Other Disciplines",
    publisher: "PAGE National Publications",
    issn: "2094-8899",
    email: "pmrj@page.org.ph",
    phone: "+63 2 8999 1235",
    volume: "Vol. 8",
    issue: "No. 2",
    year: 2025,
    articles: [
      {
        id: "art-pmrj-01",
        title: "Sustainable Ecotourism Models for Coastal Communities in Visayas",
        authors: ["Dr. Carlos M. Mendoza"],
        pages: "pp. 5-28",
        download_url: "/mock-journals/sustainable-ecotourism-visayas.pdf"
      },
      {
        id: "art-pmrj-02",
        title: "The Visual Semiotics of Pre-Colonial Artifacts in Mindanao Museums",
        authors: ["Prof. Maria Clara B. Castro"],
        pages: "pp. 29-52",
        download_url: "/mock-journals/visual-semiotics-mindanao.pdf"
      },
      {
        id: "art-pmrj-03",
        title: "Evaluating Waste-to-Energy Initiatives in Selected Metropolitan Areas",
        authors: ["Engr. Danilo J. Gomez"],
        pages: "pp. 53-75",
        download_url: "/mock-journals/waste-to-energy-initiatives.pdf"
      }
    ]
  },
  {
    id: "jr-jali",
    title: "Journal of Academic Leadership and Innovation (JALI)",
    subtitle: "Journal of Academic Leadership and Innovation",
    description: "Focuses on administrative excellence, transformational leadership practices, and pedagogical innovations in higher education. It features peer-reviewed research and analytical articles aimed at university managers, deans, and academic policymakers.",
    cover_image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400&auto=format&fit=crop",
    discipline: "Humanities and Social Sciences",
    publisher: "PAGE Leadership Institute",
    issn: "2244-7788",
    email: "jali@page.org.ph",
    phone: "+63 2 8999 1236",
    volume: "Vol. 10",
    issue: "No. 1",
    year: 2026,
    articles: [
      {
        id: "art-jali-01",
        title: "Transformational Leadership and Faculty Morale during Institutional Transition",
        authors: ["Dr. Evelyn S. Pascual"],
        pages: "pp. 1-18",
        download_url: "/mock-journals/transformational-leadership-faculty.pdf"
      },
      {
        id: "art-jali-02",
        title: "Evaluating Quality Assurance Frameworks in Philippine Higher Education Institutions",
        authors: ["Dr. Jose P. Roxas", "Prof. Sarah Mae N. Dizon"],
        pages: "pp. 19-42",
        download_url: "/mock-journals/quality-assurance-frameworks.pdf"
      },
      {
        id: "art-jali-03",
        title: "Student-Centered Learning Environments in Postgraduate Seminars: A Mixed-Methods Study",
        authors: ["Prof. Sarah Mae N. Dizon"],
        pages: "pp. 43-65",
        download_url: "/mock-journals/student-centered-learning.pdf"
      }
    ]
  },
  {
    id: "jr-atasr",
    title: "Advanced Technology and Applied Sciences Review (ATASR)",
    subtitle: "Advanced Technology and Applied Sciences Review",
    description: "Disseminates innovative designs, breakthroughs, and applied solutions in IT, computer science, and engineering. ATASR accepts peer-reviewed reviews and studies on machine learning, cybersecurity systems, and clean energy tech.",
    cover_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop",
    discipline: "Engineering and Technology",
    publisher: "PAGE Tech Committee",
    issn: "2362-9012",
    email: "atasr@page.org.ph",
    phone: "+63 2 8999 1237",
    volume: "Vol. 12",
    issue: "No. 1",
    year: 2026,
    articles: [
      {
        id: "art-atasr-01",
        title: "Predictive Maintenance of Smart Grid Infrastructure Using Deep Learning Models",
        authors: ["Dr. Ferdinand R. Cruz"],
        pages: "pp. 10-32",
        download_url: "/mock-journals/predictive-maintenance-smartgrids.pdf"
      },
      {
        id: "art-atasr-02",
        title: "A Blockchain-Based Decentralized Identity Framework for Philippine Local Governments",
        authors: ["Prof. Raymond G. Blanco", "Dr. Rachel G. Hizon"],
        pages: "pp. 33-58",
        download_url: "/mock-journals/blockchain-identity-localgov.pdf"
      },
      {
        id: "art-atasr-03",
        title: "Phytochemical Profiles and Antimicrobial Actions of Selected Philippine Highland Flora",
        authors: ["Dr. Rachel G. Hizon"],
        pages: "pp. 59-81",
        download_url: "/mock-journals/phytochemical-profiles-highland-flora.pdf"
      }
    ]
  },
  {
    id: "jr-psshq",
    title: "Philippine Social Sciences and Humanities Quarterly (PSSHQ)",
    subtitle: "Philippine Social Sciences and Humanities Quarterly",
    description: "Explores cultural heritage, local histories, linguistics, sociology, and indigenous arts in the local Philippine context. It aims to support scholarship highlighting heritage preservation and community studies.",
    cover_image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop",
    discipline: "Humanities and Social Sciences",
    publisher: "PAGE Culture Committee",
    issn: "1655-1122",
    email: "psshq@page.org.ph",
    phone: "+63 2 8999 1238",
    volume: "Vol. 18",
    issue: "No. 3",
    year: 2025,
    articles: [
      {
        id: "art-psshq-01",
        title: "Oral Histories of Indigenous Weavers in Cordillera: Documenting Cultural Heritage",
        authors: ["Dr. Sonia P. De Vega"],
        pages: "pp. 12-35",
        download_url: "/mock-journals/cordillera-weavers-oralhistory.pdf"
      },
      {
        id: "art-psshq-02",
        title: "Linguistic Nuances in Tagalog-English Code-Switching in Modern Digital Classrooms",
        authors: ["Prof. Ricardo D. Reyes", "Dr. Helen Grace Lim"],
        pages: "pp. 36-59",
        download_url: "/mock-journals/taglish-code-switching-classrooms.pdf"
      },
      {
        id: "art-psshq-03",
        title: "Representations of Agrarian Livelihoods in Contemporary Philippine Literature",
        authors: ["Dr. Helen Grace Lim"],
        pages: "pp. 60-84",
        download_url: "/mock-journals/agrarian-livelihoods-literature.pdf"
      }
    ]
  },
  {
    id: "jr-pber",
    title: "PAGE Business and Economics Review (PBER)",
    subtitle: "PAGE Business and Economics Review",
    description: "Features studies on corporate governance, microfinance opportunities, local economic resilience, and marketing innovations in the ASEAN region. PBER supports research contributing to regional economic growth.",
    cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop",
    discipline: "Business Education",
    publisher: "PAGE Business Forum",
    issn: "1855-3344",
    email: "pber@page.org.ph",
    phone: "+63 2 8999 1239",
    volume: "Vol. 9",
    issue: "No. 2",
    year: 2025,
    articles: [
      {
        id: "art-pber-01",
        title: "Assessing the Impact of Microfinance Programs on Rural Women Entrepreneurs",
        authors: ["Dr. Helen Grace Lim"],
        pages: "pp. 1-25",
        download_url: "/mock-journals/microfinance-women-entrepreneurs.pdf"
      },
      {
        id: "art-pber-02",
        title: "Digital Transformation Strategies of Small and Medium Enterprises in Metro Manila",
        authors: ["Prof. James K. Lee", "Dr. Anita S. Ramirez"],
        pages: "pp. 26-48",
        download_url: "/mock-journals/digital-transformation-smes.pdf"
      },
      {
        id: "art-pber-03",
        title: "Corporate Social Responsibility and Financial Performance of Listed Local Firms",
        authors: ["Dr. Anita S. Ramirez"],
        pages: "pp. 49-72",
        download_url: "/mock-journals/csr-financial-performance-firms.pdf"
      }
    ]
  },
  {
    id: "jr-pjer",
    title: "PAGE Journal of Education and Pedagogical Studies (PJEPS)",
    subtitle: "PAGE Journal of Education",
    description: "Serves as an intellectual platform for research in teaching methodologies, curriculum design, learning technologies, and educational leadership policy updates across Philippine schools.",
    cover_image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop",
    discipline: "Education",
    publisher: "PAGE Education Committee",
    issn: "1724-4455",
    email: "pjeps@page.org.ph",
    phone: "+63 2 8999 1240",
    volume: "Vol. 11",
    issue: "No. 1",
    year: 2026,
    articles: [
      {
        id: "art-pjeps-01",
        title: "Active Learning Protocols in Secondary Science Classes: A Regional Study",
        authors: ["Dr. Maria Carmen Santos"],
        pages: "pp. 1-22",
        download_url: "#"
      }
    ]
  },
  {
    id: "jr-pjhs",
    title: "PAGE Journal of Health and Sciences (PJHS)",
    subtitle: "PAGE Journal of Health and Sciences",
    description: "Focuses on clinical research, public health innovations, pharmacology, nursing administration, and biotechnology applications in the Philippine healthcare system.",
    cover_image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=400&auto=format&fit=crop",
    discipline: "Health and Sciences",
    publisher: "PAGE Health Science Panel",
    issn: "1928-3344",
    email: "pjhs@page.org.ph",
    phone: "+63 2 8999 1241",
    volume: "Vol. 6",
    issue: "No. 2",
    year: 2025,
    articles: [
      {
        id: "art-pjhs-01",
        title: "Community Health Assessment and Telemedicine Adaptations in Remote Municipalities",
        authors: ["Dr. Evelyn T. Cruz"],
        pages: "pp. 10-30",
        download_url: "#"
      }
    ]
  },
  {
    id: "jr-pjpa",
    title: "PAGE Journal of Public Administration and Governance (PJPAG)",
    subtitle: "PAGE Journal of Public Administration",
    description: "Publishes papers focusing on municipal administration, development policy, public finance structures, transparent governance, and political economy in emerging regions.",
    cover_image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=400&auto=format&fit=crop",
    discipline: "Public Administration",
    publisher: "PAGE Governance Council",
    issn: "2122-8899",
    email: "pjpag@page.org.ph",
    phone: "+63 2 8999 1242",
    volume: "Vol. 14",
    issue: "No. 1",
    year: 2026,
    articles: [
      {
        id: "art-pjpag-01",
        title: "Fiscal Autonomy and Local Development Outcomes in Caraga Municipalities",
        authors: ["Dr. Franklin A. Lopez"],
        pages: "pp. 5-24",
        download_url: "#"
      }
    ]
  }
];
