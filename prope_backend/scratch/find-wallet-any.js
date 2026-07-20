import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_documentation/monnify_api_reference.md', 'utf8');
const lines = content.split('\n');

const results = [];
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('wallet')) {
    results.push(idx);
  }
});

console.log('Total wallet lines found:', results.length);
// print first 40 unique lines
const printed = new Set();
results.forEach(lineIdx => {
  for (let i = Math.max(0, lineIdx - 1); i <= Math.min(lines.length - 1, lineIdx + 1); i++) {
    if (!printed.has(i)) {
      console.log(`${i + 1}: ${lines[i]}`);
      printed.add(i);
    }
  }
});
