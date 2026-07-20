import fs from 'fs';

const filePath = 'C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx';
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let found = false;
let startLine = -1;

lines.forEach((line, index) => {
  if (line.includes('provisionNombaVirtualAccount')) {
    console.log(`Found reference on Line ${index + 1}: ${line.trim()}`);
    if (line.includes('function') || line.includes('const provisionNombaVirtualAccount')) {
      startLine = index;
    }
  }
});

if (startLine !== -1) {
  console.log('\nPrinting function body starting from line ' + (startLine + 1) + ':');
  for (let i = startLine; i < startLine + 100; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
    if (lines[i].trim() === '}' && i > startLine + 5) {
      break;
    }
  }
}
