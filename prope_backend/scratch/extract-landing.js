import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');
const lines = content.split('\n');

// Find where currentView === 'landing' block is rendered
// It should be inside the main return statement of App
// Let's find the lines containing 'currentView === \'landing\'' or similar, and print the lines around it.
lines.forEach((line, idx) => {
  if (line.includes("currentView === 'landing'") || line.includes('currentView === "landing"')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
