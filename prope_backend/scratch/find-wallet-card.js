import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/components/Dashboard.jsx', 'utf8');
const lines = content.split('\n');

const list = [];
lines.forEach((line, idx) => {
  if (line.includes('Wallet Balance')) {
    list.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log('Results:');
list.forEach(l => console.log(l));
