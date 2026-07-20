import fs from 'fs';
import path from 'path';

const srcDir = 'C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend';
const destDir = 'C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_frontend';

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (src.includes('node_modules') || src.includes('.git') || src.includes('dist')) {
      return;
    }
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Copying frontend files from AcreWise to Prope...');
try {
  copyRecursiveSync(srcDir, destDir);
  console.log('Frontend files copied successfully!');
} catch (err) {
  console.error('Error copying frontend files:', err);
}
