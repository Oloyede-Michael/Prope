import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/components/Dashboard.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('activeTab === \'escrow\'') || line.includes('releaseEscrow') || line.includes('Claim Payout')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
