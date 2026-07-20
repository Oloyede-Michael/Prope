import fs from 'fs';

const filePath = 'C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx';
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let startLine = -1;

lines.forEach((line, index) => {
  if (line.includes('async function executeNombaApi(') || line.includes('const executeNombaApi =')) {
    startLine = index;
  }
});

if (startLine !== -1) {
  console.log('Printing executeNombaApi starting from line ' + (startLine + 1));
  for (let i = startLine; i < startLine + 100; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
    if (lines[i].trim() === '}' && i > startLine + 5) {
      break;
    }
  }
} else {
  console.log('Not found executeNombaApi definition.');
}
