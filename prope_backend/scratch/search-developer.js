import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');
const lines = content.split('\n');

const developerLines = [];
lines.forEach((line, idx) => {
  if (line.includes("landlordTab === 'developer'") || line.includes("landlordTab === \"developer\"") || line.includes("developerTab") || line.includes("activeSection === 'developer'")) {
    developerLines.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log('Total developer related lines:', developerLines.length);
developerLines.forEach(l => console.log(l));
