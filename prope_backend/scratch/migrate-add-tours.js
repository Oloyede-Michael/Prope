import { query } from '../src/db.js';

async function run() {
  console.log("Running database migrations to create tour_appointments table...");
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS tour_appointments (
        id UUID PRIMARY KEY,
        property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        tenant_email VARCHAR(255) NOT NULL,
        tour_date VARCHAR(100) NOT NULL,
        tour_time VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database migrations completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

run();
