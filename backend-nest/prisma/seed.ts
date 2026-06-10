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

async function main() {
  console.log('Cleaning up existing database data...');
  
  // Clear tables in appropriate order due to FK constraints
  await prisma.user_activities.deleteMany({});
  await prisma.message_attachments.deleteMany({});
  await prisma.messages.deleteMany({});
  await prisma.post_attachments.deleteMany({});
  await prisma.posts.deleteMany({});
  await prisma.article_submissions.deleteMany({});
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
