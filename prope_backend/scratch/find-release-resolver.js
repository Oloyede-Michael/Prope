import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_backend/src/resolvers.js', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('releaseEscrow') || line.includes('payout') || line.includes('initiateTransfer')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
