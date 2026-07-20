import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: "aws-1-us-west-2.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.dcppvlzzevgvbmvnvqrv",
  password: "HkRflj7d9cJQAixG",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT id, status, nomba_payout_reference, payout_error FROM escrow_transactions');
  console.log("=== Escrow Transactions ===");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run();
