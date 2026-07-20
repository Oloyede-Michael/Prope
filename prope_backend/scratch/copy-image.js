import fs from 'fs';
import path from 'path';

const src = 'C:/Users/eniai/.gemini/antigravity-cli/brain/297656ac-cf52-4eee-8aaf-423d3d7dc959/dashboard_preview_1784485248762.jpg';
const dest = 'C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/public/dashboard_preview.jpg';

console.log('Copying generated image to public folder...');
try {
  fs.copyFileSync(src, dest);
  console.log('Image copied successfully!');
} catch (err) {
  console.error('Error copying image:', err);
}
