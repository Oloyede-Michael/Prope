import fs from 'fs';

const filePath = 'C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_documentation/monnify_api_reference.md';
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('/banks') || line.includes('/banks/')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
