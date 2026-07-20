import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');
const lines = content.split('\n');

const dashboardLines = [];
let record = false;
let braceCount = 0;

lines.forEach((line, idx) => {
  if (line.includes("currentView === 'dashboard'")) {
    record = true;
    console.log(`Dashboard view starts at line ${idx + 1}`);
  }
  if (record) {
    if (line.includes('landlordTab ===') || line.includes('tenantTab ===')) {
      dashboardLines.push(`${idx + 1}: ${line.trim()}`);
    }
  }
});

console.log('Tabs rendered in dashboard view:');
dashboardLines.forEach(l => console.log(l));
