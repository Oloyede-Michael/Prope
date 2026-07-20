import { query } from '../src/db.js';

async function run() {
  console.log("Running database migrations to add beds, baths, size, and built columns...");
  try {
    await query(`
      ALTER TABLE properties ADD COLUMN IF NOT EXISTS beds INTEGER DEFAULT 4;
      ALTER TABLE properties ADD COLUMN IF NOT EXISTS baths INTEGER DEFAULT 4;
      ALTER TABLE properties ADD COLUMN IF NOT EXISTS size NUMERIC(10, 2) DEFAULT 4500;
      ALTER TABLE properties ADD COLUMN IF NOT EXISTS built INTEGER DEFAULT 2023;
    `);
    console.log("Database migrations completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

run();
