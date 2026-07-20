import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/components/Dashboard.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('activeTab ===') || line.includes('setActiveTab') || line.includes('Leases Vault') || line.includes('Escrow Accounts')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
