import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/components/Dashboard.jsx', 'utf8');

// Find all JSX tags that look like Lucide icons (Capitalized tag names)
const tagRegex = /<([A-Z][a-zA-Z0-9]+)/g;
const tagsUsed = new Set();
let match;
while ((match = tagRegex.exec(content)) !== null) {
  tagsUsed.add(match[1]);
}

// Read the import statement
const importLineStart = content.indexOf('import {');
const importLineEnd = content.indexOf('} from \'lucide-react\';');
const importText = content.substring(importLineStart, importLineEnd);
const importedIcons = importText
  .replace('import {', '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

console.log('Icons used in JSX:', Array.from(tagsUsed));
console.log('Icons imported:', importedIcons);

const missing = [];
tagsUsed.forEach(tag => {
  if (!importedIcons.includes(tag) && tag !== 'Dashboard' && tag !== 'LandingPage' && tag !== 'APIS_METADATA' && tag !== 'React' && tag !== 'Navbar' && tag !== 'Hero' && tag !== 'HowItWorks' && tag !== 'WhyAcrewise' && tag !== 'FAQ' && tag !== 'Footer') {
    missing.push(tag);
  }
});

console.log('\nMissing Icon Imports:');
console.log(missing);
