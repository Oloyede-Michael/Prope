import fs from 'fs';

const filePath = 'C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx';
const content = fs.readFileSync(filePath, 'utf8');

const regex = /executeNombaApi\(\s*\{([\s\S]*?)\}\s*\)/g;
let match;
let count = 0;
while ((match = regex.exec(content)) !== null) {
  count++;
  console.log(`--- Match ${count} ---`);
  console.log(match[0].trim());
  console.log();
}
