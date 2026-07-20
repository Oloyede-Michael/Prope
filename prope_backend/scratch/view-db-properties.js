import { query } from '../src/db.js';

async function run() {
  try {
    const res = await query('SELECT * FROM properties');
    console.log(`Total properties in DB: ${res.rows.length}`);
    res.rows.forEach(p => {
      console.log(`ID: ${p.id}, Title: "${p.title}", Price: ${p.price}, Type: ${p.type}`);
    });
  } catch (err) {
    console.error(err);
  }
}

run();
