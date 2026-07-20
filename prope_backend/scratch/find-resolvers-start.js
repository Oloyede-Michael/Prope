import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_backend/src/resolvers.js', 'utf8');
const lines = content.split('\n');

lines.slice(0, 80).forEach((line, idx) => {
  console.log(`${idx + 1}: ${line}`);
});
