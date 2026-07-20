import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_documentation/monnify_api_reference.md', 'utf8');
const lines = content.split('\n');

const results = [];
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('wallet') && (line.includes('post') || line.includes('POST'))) {
    results.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log('Results:');
results.forEach(r => console.log(r));
