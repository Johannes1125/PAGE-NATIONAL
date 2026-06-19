import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set!');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('Testing Prisma connection...');
    await prisma.$connect();
    console.log('Connected to Prisma successfully!');
    
    console.log('Fetching posts...');
    const posts = await prisma.posts.findMany({
      take: 5
    });
    console.log('Posts count:', posts.length);
    console.log('Posts:', posts);
  } catch (err) {
    console.error('Prisma query failed with error:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
    console.log('Prisma disconnected.');
  }
}

main().catch(console.error);
