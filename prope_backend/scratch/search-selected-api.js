import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');
const lines = content.split('\n');

const list = [];
lines.forEach((line, idx) => {
  if (line.includes('selectedApiIndex') || line.includes('setSelectedApiIndex')) {
    list.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log('Selected API lines:');
list.forEach(l => console.log(l));
