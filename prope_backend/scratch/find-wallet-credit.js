import fs from 'fs';

const resolvers = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_backend/src/resolvers.js', 'utf8');
const webhook = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_backend/src/webhook.js', 'utf8');

console.log("=== Resolvers wallet updates ===");
resolvers.split('\n').forEach((line, idx) => {
  if (line.includes('wallet_balance') || line.includes('UPDATE user_profiles SET')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});

console.log("=== Webhook wallet updates ===");
webhook.split('\n').forEach((line, idx) => {
  if (line.includes('wallet_balance') || line.includes('UPDATE user_profiles SET')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
