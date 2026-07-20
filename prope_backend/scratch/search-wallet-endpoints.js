import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_documentation/monnify_api_reference.md', 'utf8');

// Find occurrences of endpoints containing wallet or vas or verification
const lines = content.split('\n');
console.log('Total lines in API reference:', lines.length);

const results = [];
lines.forEach((line, idx) => {
  if (line.includes('disbursements/wallet') || line.includes('vas/') || line.includes('wallet') || line.includes('bvn-account-match')) {
    results.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log('Results found:', results.length);
results.slice(0, 50).forEach(r => console.log(r));
