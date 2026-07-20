import fs from 'fs';
const pkg = JSON.parse(fs.readFileSync('./node_modules/@apollo/server/package.json', 'utf8'));
console.log('exports:', pkg.exports);
