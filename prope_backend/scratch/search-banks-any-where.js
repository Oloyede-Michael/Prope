import fs from 'fs';

const filePath = 'C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_documentation/monnify_api_reference.md';
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let count = 0;
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('banks') || line.toLowerCase().includes('/banks')) {
    count++;
    if (count < 100) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  }
});
