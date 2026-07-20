import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');
const lines = content.split('\n');

const menuLines = [];
lines.forEach((line, idx) => {
  if (line.includes('overview') || line.includes('properties') || line.includes('leases') || line.includes('escrow') || line.includes('developer') || line.includes('my-rent') || line.includes('marketplace') || line.includes('receipts')) {
    if (line.includes('button') || line.includes('onClick') || line.includes('setLandlordTab') || line.includes('setTenantTab')) {
      menuLines.push(`${idx + 1}: ${line.trim()}`);
    }
  }
});

console.log('Total menu lines:', menuLines.length);
menuLines.slice(0, 30).forEach(l => console.log(l));
