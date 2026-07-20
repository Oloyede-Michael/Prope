import { query } from '../src/db.js';

async function run() {
  console.log("Dumping all properties currently in the database...");
  try {
    const res = await query('SELECT id, title, landlord_id, price, status, verification_status, beds, baths, size, built FROM properties');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("DB check failed:", err);
  }
}

run();
