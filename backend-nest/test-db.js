import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection string:', connectionString ? connectionString.replace(/:[^:@]+@/, ':***@') : 'undefined');

if (!connectionString) {
  console.error('DATABASE_URL is not set!');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

async function main() {
  try {
    console.log('Connecting to pool...');
    const client = await pool.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT 1 as result');
    console.log('Query result:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error('Connection failed with error:', err);
  } finally {
    await pool.end();
    console.log('Pool closed.');
  }
}

main().catch(console.error);
