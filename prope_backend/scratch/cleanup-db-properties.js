import { query } from '../src/db.js';

async function run() {
  console.log("Cleaning up old test properties with null prices or Ocean View titles...");
  try {
    // 1. Delete tenancies referencing these properties
    const tenanciesRes = await query(`
      DELETE FROM tenancies 
      WHERE property_id IN (SELECT id FROM properties WHERE price IS NULL OR title = 'Unit 3B Ocean View')
      RETURNING *
    `);
    console.log(`Deleted ${tenanciesRes.rows.length} test tenancies.`);

    // 2. Delete escrows referencing these properties
    const escrowsRes = await query(`
      DELETE FROM escrow_transactions 
      WHERE property_id IN (SELECT id FROM properties WHERE price IS NULL OR title = 'Unit 3B Ocean View')
      RETURNING *
    `);
    console.log(`Deleted ${escrowsRes.rows.length} test escrows.`);

    // 3. Delete properties themselves
    const propsRes = await query(`
      DELETE FROM properties 
      WHERE price IS NULL OR title = 'Unit 3B Ocean View'
      RETURNING *
    `);
    console.log(`Deleted ${propsRes.rows.length} test properties.`);
    console.log("Database clean up completed successfully!");
  } catch (err) {
    console.error("Cleanup failed:", err);
  }
}

run();
