import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_backend/src/resolvers.js', 'utf8');
const lines = content.split('\n');

for (let i = lines.length - 80; i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
