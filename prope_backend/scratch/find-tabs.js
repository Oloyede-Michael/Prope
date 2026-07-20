import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');
const lines = content.split('\n');

const tabLines = [];
lines.forEach((line, idx) => {
  if (line.includes('activeTab') || line.includes('setActiveTab') || line.includes('tab ===') || line.includes('switch(activeTab)')) {
    tabLines.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log('Total activeTab related lines:', tabLines.length);
console.log('Sample activeTab lines:');
tabLines.slice(0, 40).forEach(l => console.log(l));
