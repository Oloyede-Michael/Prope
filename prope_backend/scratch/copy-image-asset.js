import fs from 'fs';
import path from 'path';

const source = 'C:/Users/eniai/.gemini/antigravity-cli/brain/297656ac-cf52-4eee-8aaf-423d3d7dc959/modern_house_preview_1784506408468.jpg';
const dest1 = 'C:/Users/eniai/OneDrive/Desktop/monnify/AcreWise/acrewise_frontend/public/modern_house_preview.jpg';
const dest2 = 'C:/Users/eniai/OneDrive/Desktop/monnify/Prope/prope_frontend/public/modern_house_preview.jpg';

try {
  fs.copyFileSync(source, dest1);
  fs.copyFileSync(source, dest2);
  console.log("Image asset copied successfully to frontend public directories!");
} catch (err) {
  console.error("Copy failed:", err);
}
