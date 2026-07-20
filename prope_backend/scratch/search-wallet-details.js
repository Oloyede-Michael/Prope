import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_documentation/creating_wallet.md', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('api/') || line.includes('v1/') || line.includes('disbursements/') || line.includes('wallet') || line.includes('Url')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
