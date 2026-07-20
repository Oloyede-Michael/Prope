import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/components/Dashboard.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('kycVerified') || line.includes('verifyCustomer') || line.includes('nin') || line.includes('bvn') || line.includes('NIN') || line.includes('BVN')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
