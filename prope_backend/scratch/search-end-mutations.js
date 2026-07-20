import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_backend/src/resolvers.js', 'utf8');
const lines = content.split('\n');

const list = [];
lines.forEach((line, idx) => {
  if (line.includes('upgradeToLandlord') || line.includes('decrementPropertyUnits') || line.includes('assignPropertyCaretaker') || line.includes('createReceipt')) {
    list.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log('Results:');
list.forEach(l => console.log(l));
