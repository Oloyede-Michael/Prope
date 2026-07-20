import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');

// Find all arrays or state variables that might be "sections" or similar
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('const sections') || line.includes('let sections') || line.includes('sections =') || line.includes('const [activeSection')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
