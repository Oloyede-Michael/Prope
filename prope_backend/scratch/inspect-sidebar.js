import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');
const lines = content.split('\n');

let start = -1;
lines.forEach((line, idx) => {
  if (line.includes('ROLE: Landlord Navigation') || line.includes('Active Workspace Role') || line.includes('sidebar') && line.includes('overview')) {
    start = idx;
  }
});

console.log('Sidebar start line candidate:', start);
if (start !== -1) {
  for (let i = start - 10; i < start + 50; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
