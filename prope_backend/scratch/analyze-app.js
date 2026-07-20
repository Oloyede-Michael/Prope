import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');

// Search for functions, page states, or route state
const lines = content.split('\n');

const viewMatches = [];
lines.forEach((line, idx) => {
  if (line.includes('const [current') || line.includes('const [view') || line.includes('useState(') && (line.includes('landing') || line.includes('dashboard'))) {
    viewMatches.push({ line: idx + 1, content: line.trim() });
  }
  if (line.includes('function ') && (line.toLowerCase().includes('page') || line.toLowerCase().includes('screen') || line.toLowerCase().includes('dashboard') || line.toLowerCase().includes('landing'))) {
    viewMatches.push({ line: idx + 1, content: line.trim() });
  }
  if (line.includes('const ') && line.includes(' = () =>') && (line.toLowerCase().includes('page') || line.toLowerCase().includes('screen') || line.toLowerCase().includes('dashboard') || line.toLowerCase().includes('landing'))) {
    viewMatches.push({ line: idx + 1, content: line.trim() });
  }
});

console.log('View matches:', viewMatches);

// Find navigation state
const navLines = lines.filter(l => l.includes('navigation') || l.includes('navigateTo') || l.includes('currentPage') || l.includes('activeSection'));
console.log('Sample nav lines:', navLines.slice(0, 15));
