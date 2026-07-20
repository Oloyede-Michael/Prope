import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');
const lines = content.split('\n');

const list = [];
let start = -1;
lines.forEach((line, idx) => {
  if (line.includes('handleExecutePlaygroundApi') && (line.includes('const') || line.includes('function'))) {
    start = idx;
  }
});

if (start !== -1) {
  console.log('handleExecutePlaygroundApi definition:');
  for (let i = start; i < start + 40; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
} else {
  console.log('Not found handleExecutePlaygroundApi');
}
