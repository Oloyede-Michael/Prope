import fs from 'fs';

const content = fs.readFileSync('C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/src/App.jsx', 'utf8');
const lines = content.split('\n');

const logLines = [];
lines.forEach((line, idx) => {
  if (line.includes('webhookLogs') || line.includes('setWebhookLogs')) {
    logLines.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log('WebhookLogs lines:');
logLines.forEach(l => console.log(l));
