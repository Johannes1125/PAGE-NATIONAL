import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const INITIAL_CBL_DATA = {
  title: "Constitution and By-Laws",
  subtitle: "The official governance framework, organizational principles, and rules guiding the operations of PAGE.",
  introduction: "The Constitution and By-Laws (CBL) of the Philippine Association for Graduate Education, Inc. (PAGE) outlines the fundamental laws, structural framework, and code of conduct governing our national organization. It defines the relationships between regional chapters, the national board, and individual graduate school members.",
  pdfUrl: "/CBL-draft.pdf",
  resolution: "NOW THEREFORE, BE IT RESOLVED, AS IT IS HEREBY RESOLVED, THAT upon unanimous vote of all members present, the foregoing corrections be effected and adopted.",
  adoptionDate: "Adopted, this 3rd day of August, 2012.",
  secretary: {
    name: "DR. JULIANA M. LARAYA",
    title: "Secretary",
    signed: true,
    signatureType: "SGD."
  },
  attestedBy: [
    { name: "DR. REYNALDO C. CRUZ", title: "VP for Luzon (Acting President)", signed: true, signatureType: "SGD." },
    { name: "REV. DR. JOSE ANTONIO E. AUREADA, OP", title: "Director (Convener – PAGE 50th Foundation Anniversary)", signed: true, signatureType: "SGD." },
    { name: "DR. RUBY C. CATALAN", title: "VP for Visayas", signed: true, signatureType: "Sgd" },
    { name: "DR. DESIDERIO N. NOVENO, JR.", title: "VP for Mindanao", signed: true, signatureType: "Sgd" },
    { name: "DR. MELCHOR S. JULIANES", title: "Treasurer", signed: true, signatureType: "Sgd" },
    { name: "DR. AVELINO S. DE CHAVEZ", title: "Auditor", signed: true, signatureType: "Sgd" },
    { name: "DR. BENJAMIN C. DAYRIT", title: "Director", signed: true, signatureType: "Sgd" },
    { name: "FR. ANTONIO P. PUEYO, Ed.D", title: "Director", signed: true, signatureType: "Sgd" },
    { name: "DR. NENITA I. PRADO", title: "Director", signed: true, signatureType: "Sgd" },
    { name: "DR. NORMA MARIA P. RUTAB", title: "PRO", signed: true, signatureType: "Sgd" },
    { name: "DR. EPHRAIM K. ESTACION", title: "Director", signed: true, signatureType: "Sgd" },
    { name: "DR. FLORIZA N. LAPLAP", title: "Director", signed: true, signatureType: "Sgd" }
  ],
  articles: [
    {
      id: "art-1",
      articleNumber: "Article I",
      title: "Name",
      sections: [
        "SECTION 1. Name of the Corporation – The name of the Corporation shall be the PHILIPPINE ASSOCIATION FOR GRADUAGE EDUCATION, INC., (PAGE), a non-stock, non-profit corporation, hereinafter called the Corporation."
      ]
    },
    {
      id: "art-2",
      articleNumber: "Article II",
      title: "Office and Seal",
      sections: [
        "SECTION 1. Office – The principal office of the Corporation shall be located in Manila Philippines or such other place or places in Metro Manila as may hereinafter be fixed and determined by the Board of Directors.",
        "SECTION 2. Seal – A circular seal with the words “PHILIPPINE ASSOCIATION FOR GRADUATE EDUCATION, INC., Manila, Philippines- 1962” shall be the seal of the Corporation, which shall be in custody of the Treasurer."
      ]
    },
    {
      id: "art-3",
      articleNumber: "Article III",
      title: "Purposes",
      sections: [
        "Section 1. Purposes – The purpose for which this Corporation is formed are as follows:",
        "1. In general it shall be the primary purpose of this Corporation to pursue the quest for quality and excellence in graduate education through encouragement and promotion of development programs, projects and activities in research, scholarship, faculty and staff development, curricular relevance and refinement and other activities conducive to the attainment of graduate education goals.",
        "2. In particular:",
        "• a. To encourage and promote the production and dissemination of basic and functional researches;",
        "• b. To promote scholarship, professional growth, and administrative, supervisory and faculty competence;",
        "• c. To make reciprocally available the library and other research facilities and resources of members through consortium arrangement;",
        "• d. To participate in the solution of educational problems;",
        "• e. To contribute to the attainment of the goals of national development."
      ]
    },
    {
      id: "art-4",
      articleNumber: "Article IV",
      title: "Membership",
      sections: [
        "SECTION 1. Membership – The association classifies its membership into the following categories: (1) Institutional, (2) Individual: a) Regular, b) Associate, and c) Life; and (3) Sustaining members.",
        "1. Institutional members – Colleges, universities, institutes, or institutions of higher learning offering graduate course/s and/or other entities engaged in research.",
        "2. Individual members – Those who are engaged in graduate education or research and those who are no longer actively engaged in graduate education or research but have necessary degree qualification.",
        "These may either be:",
        "• a. Regular members – Those who are holders of at least a doctoral degree and have passed the membership criteria of the Board of Directors.",
        "• b. Associate Members – Those who are holders of at least a Master’s degree and have passed the membership criteria of the Board of Directors of the Regional Chapter to which they belong.",
        "• c. Life Members – Those whose membership is approved by the Board of Directors based on certain criteria and who have paid life membership fees.",
        "3. Sustaining members – These shall include individuals, institutions, enterprises, or associations who are willing to support the association.",
        "SECTION 2. Members in Good Standing - Are those members who are not delinquent in their annual dues.",
        "SECTION 3. Representatives of Institutional Members – Institutional member shall be represented by the Dean of the Graduate School or his representative. In the event that an institution may have more than one graduate school dean, the official delegate or representative shall be appointed by the head of the institution.",
        "SECTION 4. Application for Membership – Application for membership shall be endorsed by the Membership Committee for approval of the PAGE National President.",
        "SECTION 5. Withdrawal of Membership – Any member may withdraw without prejudice to reinstatement, at any time by serving a written notice of his withdrawal to the Corporate Secretary at least six (6) months before the annual or general meeting of the Corporation. He shall not be entitled to any share in the assets of the Corporation but shall be liable to the payment of his unpaid dues, contribution and/or charges.",
        "SECTION 6. Suspension and Expulsion of Member – Any member, institutional, regular or sustaining which/who fails to comply with rules and regulations of the Corporation, violates the provisions of the By-Laws, makes improper and/or illegal use of the name of the Corporation may be suspended for a definite period of time permanently expelled from the Corporation by two-thirds (2/3) vote of all the members of the Board of Directors after a fair hearing has been made."
      ]
    }
  ]
};

const INITIAL_HISTORY_EVENTS = [
  {
    year: "1962",
    title: "Foundation of PAGE",
    description: "The Philippine Association for Graduate Education Philippines, Inc. (PAGE) was officially established on September 26, 1962 to assist the government in improving the quality of graduate education in the country. PAGE was founded by nine pioneering higher education institutions.",
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
    year: "1994",
    title: "Antedating CHED",
    description: "PAGE's establishment pre-dates the Commission on Higher Education (CHED) by 32 years. Since then, the association has actively collaborated as a key consultant and constructive policy advocate.",
    milestone_type: "partnership"
  },
  {
    year: "2012",
    title: "Golden Anniversary",
    description: "PAGE marked 50 years of excellence at its Annual Assembly in Manila Hotel. The official PAGE National Anthem was subsequently launched, and international plenary speakers were introduced.",
    milestone_type: "conference"
  },
  {
    year: "2020",
    title: "New Leadership",
    description: "Dr. Lino C. Reynoso of Emilio Aguinaldo College was elected PAGE President. Under his term, the organization guided graduate schools through COVID-19 and transition to hybrid learning.",
    milestone_type: "program"
  },
  {
    year: "2024",
    title: "SEC Re-registration",
    description: "The association successfully renewed its corporate identity under its new official name: 'Philippine Association for Graduate Education Philippines, Inc. (PAGE)', reactivating chapters nationwide.",
    milestone_type: "initiative"
  },
  {
    year: "2025 & Beyond",
    title: "Ongoing Legacy",
    description: "Entering its 63rd year, PAGE continues to lead discussions on graduate education reforms, collaborative research, and digital innovations to meet global higher education standards.",
    milestone_type: "program"
  }
];

const INITIAL_OFFICERS = [
  { name: "Dr. Lino C. Reynoso", position: "President", chapter: "National", term_start: "2024", term_end: "2026", status: "active", sort_order: 1 },
  { name: "Dr. Alper V. Pineda", position: "Vice President for Luzon", chapter: "Luzon", term_start: "2024", term_end: "2026", status: "active", sort_order: 2 },
  { name: "Dr. Remedios C. Bacus", position: "Vice President for Visayas", chapter: "Visayas", term_start: "2024", term_end: "2026", status: "active", sort_order: 3 },
  { name: "Dr. Judith C. Chavez", position: "Vice President for Mindanao", chapter: "Mindanao", term_start: "2024", term_end: "2026", status: "active", sort_order: 4 },
  { name: "Dr. Arnel D. Bravo", position: "Secretary", chapter: "National", term_start: "2024", term_end: "2026", status: "active", sort_order: 5 },
  { name: "Dr. Ma. Kathleen C. Tiglao", position: "Treasurer", chapter: "National", term_start: "2024", term_end: "2026", status: "active", sort_order: 6 },
  { name: "Dr. Rowena R. Abrea", position: "Auditor", chapter: "National", term_start: "2024", term_end: "2026", status: "active", sort_order: 7 },
  { name: "Dr. Dolores T. Quambo", position: "Press Relations Officer", chapter: "National", term_start: "2024", term_end: "2026", status: "active", sort_order: 8 }
];

const INITIAL_HISTORICAL_RECORDS = [
  {
    yearStart: 1962,
    programType: 'Initiative',
    title: 'Founding of PAGE',
    description: 'PAGE was established on September 26, 1962, through the efforts of Dr. Jesus E. Perpiñan and Atty. Pablo T. Mateo Jr. to improve graduate education standards in the Philippines.',
  },
  {
    yearStart: 1962,
    programType: 'Conference',
    title: 'First National Conference on Graduate Education',
    description: 'PAGE held its first national conference at Philippine Women’s University with the theme "Graduate Education Today."',
  },
  {
    yearStart: 1963,
    programType: 'Initiative',
    title: 'Graduate Education Standards Advocacy',
    description: 'PAGE contributed to the development of the first government regulations for graduate education through BPS Circular No. 4, Series of 1963.',
  },
  {
    yearStart: 1964,
    programType: 'Initiative',
    title: 'Improved Graduate Education Policies',
    description: 'PAGE recommendations influenced Department Order No. 15, Series of 1964, improving standards and procedures for graduate education.',
  },
  {
    yearStart: 1969,
    programType: 'Convention',
    title: 'First Convention Outside Manila',
    description: 'PAGE expanded beyond Metro Manila through its 8th Annual Convention in Cebu City.',
  },
  {
    yearStart: 1974,
    programType: 'Initiative',
    title: 'Research-Oriented Graduate Education Reform',
    description: 'PAGE recommendations influenced Circular No. 10, Series of 1974, emphasizing functional research and national development.',
  },
  {
    yearStart: 1980,
    programType: 'Convention',
    title: 'First Mindanao Convention',
    description: 'PAGE held its first annual convention in Mindanao at Zamboanga City.',
  },
  {
    yearStart: 1984,
    programType: 'Initiative',
    title: 'SOTARE Research Project',
    description: 'PAGE collaborated with PRODED to produce SOTARE I, a landmark review of educational research in the Philippines.',
  },
  {
    yearStart: 1994,
    programType: 'Initiative',
    title: 'Partnership with Higher Education Reforms',
    description: 'PAGE continued its role as consultant and critic following the creation of CHED through RA 7722.',
  },
  {
    yearStart: 2000,
    programType: 'Initiative',
    title: 'Strategic Plan 2001–2006',
    description: 'PAGE launched a strategic blueprint focusing on organizational development, quality assurance, innovation, and access.',
  },
  {
    yearStart: 2003,
    programType: 'Initiative',
    title: 'Launch of PAGE Website',
    description: 'Under Fr. José Antonio E. Aureada, PAGE established its first official website to strengthen communication and coordination nationwide.',
  },
  {
    yearStart: 2005,
    programType: 'Initiative',
    title: 'Expansion of Membership Categories',
    description: 'PAGE introduced Associate Membership through constitutional amendments.',
  },
  {
    yearStart: 2012,
    programType: 'Convention',
    title: 'Golden Anniversary Celebration',
    description: 'PAGE celebrated its 50th anniversary and reaffirmed its commitment to graduate education excellence.',
  },
  {
    yearStart: 2012,
    programType: 'Initiative',
    title: 'Establishment of PAGE National Headquarters',
    description: 'PAGE opened a permanent national headquarters in Manila.',
  },
  {
    yearStart: 2015,
    programType: 'Initiative',
    title: 'Launch of Philippine Journal of Graduate Education',
    description: 'PAGE transformed its journal into a refereed publication known as the Philippine Journal of Graduate Education (PJGE).',
  },
  {
    yearStart: 2017,
    programType: 'Convention',
    title: '50th Annual National Convention',
    description: 'PAGE hosted its Golden Convention featuring international plenary speakers, founding institution awards, and the launch of the PAGE National Anthem.',
  },
  {
    yearStart: 2019,
    programType: 'Convention',
    title: 'Fourth Industrial Revolution Focus',
    description: 'PAGE\'s 51st Convention addressed the opportunities and challenges of the Fourth Industrial Revolution for graduate education.',
  },
  {
    yearStart: 2020,
    programType: 'Convention',
    title: '52nd Annual Convention',
    description: 'Dr. Lino C. Reynoso was elected President during the convention themed "New Policies and Standards: Transforming the Landscape of Graduate Education."',
  },
  {
    yearStart: 2022,
    programType: 'Convention',
    title: 'Post-Pandemic Graduate Education Transformation',
    description: 'PAGE conducted its hybrid 53rd Annual Convention focused on resilience and responsiveness in graduate education after COVID-19.',
  },
  {
    yearStart: 2023,
    programType: 'Convention',
    title: 'Graduate Education Reform Convention',
    description: 'PAGE\'s 54th Annual Convention focused on implementing CHED CMO No. 15, Series of 2019.',
  },
  {
    yearStart: 2024,
    programType: 'Initiative',
    title: 'SEC Re-registration and New Corporate Name',
    description: 'PAGE successfully renewed its SEC registration and adopted the corporate name "Philippine Association for Graduate Education Philippines, Inc. (PAGE)."',
  },
  {
    yearStart: 2024,
    programType: 'Initiative',
    title: 'Chapter Reactivation Program',
    description: 'PAGE began reactivating regional chapters nationwide to strengthen organizational presence and support graduate education initiatives.',
  },
];

async function main() {
  console.log('Cleaning up existing database data...');
  
  // Clear tables in appropriate order due to FK constraints
  await prisma.cbl_articles.deleteMany({});
  await prisma.cbl_governance_documents.deleteMany({});
  await prisma.about_page_documents.deleteMany({});
  await prisma.about_page_officers.deleteMany({});
  await prisma.about_page_sections.deleteMany({});
  await prisma.user_activities.deleteMany({});
  await prisma.message_attachments.deleteMany({});
  await prisma.messages.deleteMany({});
  await prisma.post_attachments.deleteMany({});
  await prisma.posts.deleteMany({});
  await prisma.article_submissions.deleteMany({});
  await prisma.historical_records.deleteMany({});
  await prisma.users.deleteMany({});


  console.log('Database cleaned. Seeding new data...');

  // Create users
  const admin = await prisma.users.create({
    data: {
      name: 'PAGE Admin Directory',
      email: 'admin@page.edu',
      password: bcrypt.hashSync('AdminSecret123!', 12),
      role: 'admin',
      university: 'Philippine Association for Graduate Education (PAGE)',
      position: 'Executive Director',
      status: 'active',
    },
  });

  const org = await prisma.users.create({
    data: {
      name: 'Gordon College Graduate Council',
      email: 'gordon@page.edu',
      password: bcrypt.hashSync('OrgSecret123!', 12),
      role: 'organization',
      university: 'Gordon College',
      position: 'Council Chair',
      status: 'active',
    },
  });

  const member = await prisma.users.create({
    data: {
      name: 'Dr. Maria Santos',
      email: 'member@page.edu',
      password: bcrypt.hashSync('MemberSecret123!', 12),
      role: 'member',
      university: 'University of Santo Tomas',
      position: 'Professor of Graduate Studies',
      status: 'active',
    },
  });

  // Preseed Sample Posts
  const publishedPost = await prisma.posts.create({
    data: {
      user_id: admin.id,
      title: 'PAGE National Convention 2026: Graduate Research Excellence',
      category: 'announcement',
      author: 'PAGE Admin Directory',
      excerpt: 'Join the upcoming PAGE National Convention this year. Gathering leading educators and researchers from across the Philippines.',
      content_html: '<p>We are pleased to announce the <strong>PAGE National Convention 2026</strong>. This event focuses on sharing cutting edge pedagogical methodologies and breakthrough research in graduate studies across local universities.</p>',
      status: 'published',
      published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });

  // Bind attachment to convention post
  await prisma.post_attachments.create({
    data: {
      post_id: publishedPost.id,
      file_path: 'https://res.cloudinary.com/dsvxqj0wj/image/upload/v1700000000/sample_convention.jpg',
      file_type: 'featured_image',
      file_name: 'sample_convention.jpg',
    },
  });

  await prisma.posts.create({
    data: {
      user_id: org.id,
      title: 'Innovative Digital Classrooms in Graduate Engineering Studies',
      category: 'article',
      author: 'Gordon College Graduate Council',
      excerpt: 'A comprehensive review of digital workspace adoption inside post-graduate engineering courses.',
      content_html: '<p>Integrating cloud computing platforms and collaborative visual canvases inside mechanical engineering and systems architectures has seen a 40% user adoption growth...</p>',
      status: 'pending',
    },
  });

  // Preseed Article Submissions
  await prisma.article_submissions.create({
    data: {
      user_id: org.id,
      title: 'Optimizing Hybrid Educational Ecosystems in Philippine Graduate Schools',
      author: 'Dr. Alexander Gomez',
      abstract: 'This paper explores the efficacy of blended educational ecosystems within graduate programs. Through a comprehensive mixed-method analysis involving 15 member institutions, we study student retention, satisfaction index, and academic results.',
      keywords: ['hybrid learning', 'graduate school', 'philippines', 'retention index'],
      file_path: 'https://res.cloudinary.com/dsvxqj0wj/raw/upload/v1700000001/sample_research_doc.pdf',
      file_name: 'hybrid_education_efficacy_UST.pdf',
      status: 'pending',
    },
  });

  // Preseed Chat Thread Conversations
  const convId = `conv_admin_gordon_${Math.floor(Date.now() / 1000)}`;

  await prisma.messages.create({
    data: {
      conversation_id: convId,
      sender_id: org.id,
      receiver_id: admin.id,
      subject: 'Payment Verification Issue',
      text: 'Greetings Admin! We have submitted our post for approval, but we are unsure if our proof of payment receipt has been uploaded successfully. Could you please double check?',
      status: 'sent',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
  });

  await prisma.messages.create({
    data: {
      conversation_id: convId,
      sender_id: admin.id,
      receiver_id: org.id,
      subject: 'Payment Verification Issue',
      text: 'Hello Gordon College. Yes, we can confirm the proof of payment receipt has been received and verified. Your post status is currently in the review queue and will be published shortly.',
      status: 'sent',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  // Preseed About PAGE sections
  await prisma.about_page_sections.create({
    data: {
      section_key: 'cbl_information',
      title: 'Constitution and By-Laws',
      content: JSON.stringify(INITIAL_CBL_DATA),
      status: 'published',
      published_at: new Date(),
    }
  });

  // Preseed CBL Governance document
  await prisma.cbl_governance_documents.create({
    data: {
      title: INITIAL_CBL_DATA.title,
      general_description: INITIAL_CBL_DATA.introduction,
      file_name: 'CBL-draft.pdf',
      file_url: INITIAL_CBL_DATA.pdfUrl,
      file_size: 1048576,
      uploaded_by: 'PAGE Admin Directory',
    }
  });

  // Preseed CBL Articles
  for (let i = 0; i < INITIAL_CBL_DATA.articles.length; i++) {
    const art = INITIAL_CBL_DATA.articles[i];
    await prisma.cbl_articles.create({
      data: {
        article_number: art.articleNumber,
        article_name: art.title,
        article_description: art.sections.map(s => `<p>${s}</p>`).join(''),
        sort_order: i + 1,
      }
    });
  }

  await prisma.about_page_sections.create({
    data: {
      section_key: 'history',
      title: 'History of PAGE',
      content: JSON.stringify(INITIAL_HISTORY_EVENTS),
      status: 'published',
      published_at: new Date(),
    }
  });

  await prisma.about_page_sections.create({
    data: {
      section_key: 'logo_description',
      title: 'PAGE Logo & Description',
      content: 'The Philippine Association for Graduate Education logo represents excellence, academic unity, and professional standards since 1962.',
      status: 'published',
      published_at: new Date(),
    }
  });

  await prisma.about_page_sections.create({
    data: {
      section_key: 'national_officers',
      title: 'PAGE National Officers',
      content: 'Leadership profile meta content.',
      status: 'published',
      published_at: new Date(),
    }
  });

  await prisma.about_page_sections.create({
    data: {
      section_key: 'sec_registration',
      title: 'SEC Registration',
      content: 'PAGE is a duly registered non-stock, non-profit organization under the Securities and Exchange Commission (SEC) of the Republic of the Philippines. This registration verifies our legal corporate identity, operational authority, and compliance with national governance standards to support graduate education.',
      status: 'published',
      published_at: new Date(),
    }
  });

  await prisma.about_page_sections.create({
    data: {
      section_key: 'bir_certification',
      title: 'BIR Certification',
      content: 'Tax exemption certification details.',
      status: 'published',
      published_at: new Date(),
    }
  });

  // Preseed officers
  for (const officer of INITIAL_OFFICERS) {
    await prisma.about_page_officers.create({
      data: {
        name: officer.name,
        position: officer.position,
        chapter: officer.chapter,
        status: officer.status as 'active' | 'inactive',
        sort_order: officer.sort_order,
        term_start: officer.term_start,
        term_end: officer.term_end
      }
    });
  }

  // Preseed mock documents
  await prisma.about_page_documents.create({
    data: {
      section_key: 'sec_registration',
      file_name: 'SEC_Certificate_PAGE.pdf',
      file_url: 'https://res.cloudinary.com/dsvxqj0wj/image/upload/v1700000002/sec_sample.pdf',
      file_type: 'pdf'
    }
  });

  await prisma.about_page_documents.create({
    data: {
      section_key: 'bir_certification',
      file_name: 'BIR_Exemption_PAGE.pdf',
      file_url: 'https://res.cloudinary.com/dsvxqj0wj/image/upload/v1700000003/bir_sample.pdf',
      file_type: 'pdf'
    }
  });

  await prisma.about_page_documents.create({
    data: {
      section_key: 'logo_description',
      file_name: 'PAGE_Logo_Official.jpg',
      file_url: '/PAGE.jpg',
      file_type: 'image'
    }
  });

  // Preseed User Log entries
  await prisma.user_activities.create({
    data: {
      user_id: admin.id,
      action: 'PAGE Administration Portal database initialized and seeded.',
      ip_address: '127.0.0.1',
    },
  });

  await prisma.user_activities.create({
    data: {
      user_id: org.id,
      action: 'Submitted draft article: Innovative Digital Classrooms.',
      ip_address: '192.168.1.45',
    },
  });

  // Seed Historical Records
  console.log('Seeding historical records...');
  for (const record of INITIAL_HISTORICAL_RECORDS) {
    await prisma.historical_records.create({
      data: {
        title: record.title,
        yearStart: record.yearStart,
        programType: record.programType,
        description: record.description,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
    console.log('Database seeded successfully.');
  })
  .catch(async (e) => {
    console.error('Error during database seed:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
