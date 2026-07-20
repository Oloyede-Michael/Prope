import fs from 'fs';
import path from 'path';

const dir = 'C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_documentation';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.md')) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = [];
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes('wallet') && (line.toLowerCase().includes('create') || line.toLowerCase().includes('post') || line.toLowerCase().includes('bvn') || line.toLowerCase().includes('account'))) {
        matches.push(`${idx + 1}: ${line.trim()}`);
      }
    });
    if (matches.length > 0) {
      console.log(`\n=== File: ${file} ===`);
      matches.slice(0, 10).forEach(m => console.log(m));
    }
  }
});
