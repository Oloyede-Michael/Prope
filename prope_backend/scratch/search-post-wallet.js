import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_documentation/monnify_api_reference.md', 'utf8');
const lines = content.split('\n');

const list = [];
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('disbursements/wallet') && line.toLowerCase().includes('post')) {
    list.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log('Results:');
list.forEach(l => console.log(l));
