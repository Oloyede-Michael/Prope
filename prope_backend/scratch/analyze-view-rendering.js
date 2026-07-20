import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');
const lines = content.split('\n');

let block = [];
let record = false;
let braceCount = 0;

lines.forEach((line, idx) => {
  if (line.includes('return (') || line.includes('return  (')) {
    record = true;
  }
  if (record) {
    block.push(`${idx + 1}: ${line}`);
    // Count braces to find the end of the return statement
    if (line.includes('(')) braceCount++;
    if (line.includes(')')) braceCount--;
    if (braceCount === 0 && block.length > 10) {
      record = false;
    }
  }
});

// Print the last 1500 lines of the file since the return statement is at the end of App.jsx
console.log('App.jsx total lines:', lines.length);
console.log('Printing from line 1850 onwards...');
for (let i = 1850; i < Math.min(lines.length, 2100); i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
