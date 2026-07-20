import fs from 'fs';

const files = [
  'C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_documentation/single_transfers.md',
  'C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_documentation/monnify_api_reference.md'
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes('get banks') || line.toLowerCase().includes('/banks') || line.toLowerCase().includes('/bank-transfer/banks')) {
      console.log(`[${file.split('/').pop()}] Line ${index + 1}: ${line.trim()}`);
    }
  });
});
