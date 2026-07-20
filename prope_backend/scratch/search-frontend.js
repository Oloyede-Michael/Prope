import fs from 'fs';
import path from 'path';

const filePath = 'C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx';
const content = fs.readFileSync(filePath, 'utf8');

console.log('Searching for backend API interactions in App.jsx...');

// Look for URLs or api paths
const apiPaths = new Set();
const apiRegex = /\/api\/[a-zA-Z0-9_\-\/]+/g;
let match;
while ((match = apiRegex.exec(content)) !== null) {
  apiPaths.add(match[0]);
}
console.log('API Paths found:', Array.from(apiPaths));

// Look for graphql queries / mutations
console.log('\nSearching for GraphQL queries or mutations...');
const gqlRegex = /(query|mutation)\s+[a-zA-Z0-9_]+\s*\(/g;
const gqlMatches = new Set();
while ((match = gqlRegex.exec(content)) !== null) {
  gqlMatches.add(match[0]);
}
console.log('GraphQL matches:', Array.from(gqlMatches));

// Find any references to "nomba"
console.log('\nSearching for "nomba" (case-insensitive)...');
const nombaRegex = /nomba/gi;
const nombaCount = (content.match(nombaRegex) || []).length;
console.log('Number of occurrences of "nomba":', nombaCount);

// Let's print some lines containing "nomba"
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('nomba')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
