import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');

// Find all occurrences of tab states, activeTab, or sections
const lines = content.split('\n');
console.log('App.jsx total lines:', lines.length);

const tabMatches = [];
const sectionMatches = [];

lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('tab') && line.includes('const') && line.includes('state')) {
    tabMatches.push({ line: idx + 1, content: line.trim() });
  }
  if (line.toLowerCase().includes('active') && line.toLowerCase().includes('tab')) {
    tabMatches.push({ line: idx + 1, content: line.trim() });
  }
  if (line.includes('case ') || line.includes('switch')) {
    sectionMatches.push({ line: idx + 1, content: line.trim() });
  }
});

console.log('Tab matches:', tabMatches.slice(0, 20));
console.log('Section/Switch matches:', sectionMatches.slice(0, 20));
