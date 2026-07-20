import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_documentation/monnify_api_reference.md', 'utf8');
const lines = content.split('\n');

const results = [];
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('create') && line.toLowerCase().includes('wallet')) {
    results.push(`${idx + 1}: ${line.trim()}`);
  }
  // check for POST /api/v1/disbursements/wallet or similar
  if (line.includes('POST') && line.includes('wallet')) {
    results.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log('Results:');
results.forEach(r => console.log(r));
