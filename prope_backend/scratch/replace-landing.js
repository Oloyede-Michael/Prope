import fs from 'fs';

const filePath = 'C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the index of the landing page check
const startStr = "if (currentView === 'landing') {";
const startIndex = content.indexOf(startStr);
if (startIndex === -1) {
  throw new Error("Could not find start index of landing block");
}

// Find the marker for the next section
const endStrNormal = "// ==========================================================\n  // VIEW: Register / Login Profile";
const endStrCRLF = "// ==========================================================\r\n  // VIEW: Register / Login Profile";

let endIndex = content.indexOf(endStrNormal);
if (endIndex === -1) {
  endIndex = content.indexOf(endStrCRLF);
}
if (endIndex === -1) {
  // Try fallback search
  endIndex = content.indexOf("currentView === 'login'");
}

if (endIndex === -1) {
  throw new Error("Could not find end marker for landing block");
}

// Trace backwards from endIndex to find the closing brace '}' of the landing if block
const searchSnippet = content.substring(startIndex, endIndex);
const lastBraceOffset = searchSnippet.lastIndexOf('}');
if (lastBraceOffset === -1) {
  throw new Error("Could not find closing brace in snippet");
}

const braceIndex = startIndex + lastBraceOffset;

const before = content.substring(0, startIndex);
const after = content.substring(braceIndex + 1);

const newLandingBlock = `if (currentView === 'landing') {
    return <LandingPage navigateTo={navigateTo} />;
  }`;

fs.writeFileSync(filePath, before + newLandingBlock + after, 'utf8');
console.log('App.jsx landing page replaced successfully!');
