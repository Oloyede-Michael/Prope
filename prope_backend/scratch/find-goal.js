import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(walk(fullPath));
      }
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = walk('C:/Users/eniai/OneDrive/Desktop/monnify/Prope');
console.log('Total files in Prope:', allFiles.length);
allFiles.forEach(f => {
  if (f.toLowerCase().includes('goal')) {
    console.log('Found goal-related file:', f);
  }
});
