import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: {
    rejectUnauthorized: false
  }
});

async function init() {
  try {
    const sqlPath = path.join(__dirname, '../src/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    const client = await pool.connect();
    console.log('Connected to DB. Initializing schema...');
    await client.query(sql);
    console.log('Schema initialized successfully!');
    
    // Check tables again
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in database:', res.rows.map(r => r.table_name));
    
    client.release();
  } catch (err) {
    console.error('Error initializing schema:', err);
  } finally {
    await pool.end();
  }
}

init();
