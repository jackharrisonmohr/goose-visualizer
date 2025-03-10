/**
 * Simple script to convert SVG files to PNG 
 * This requires Node.js and the 'sharp' library
 * Install with: npm install sharp
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing SVG files
const SVG_DIR = __dirname;
// Where to output PNG files (same directory)
const OUTPUT_DIR = SVG_DIR;

// Get all SVG files
const svgFiles = fs.readdirSync(SVG_DIR)
  .filter(file => file.endsWith('.svg'));

console.log(`Found ${svgFiles.length} SVG files to convert.`);

// Convert each SVG to PNG
async function convertSvgToPng(filePath) {
  const fileName = path.basename(filePath, '.svg');
  const outputPath = path.join(OUTPUT_DIR, `${fileName}.png`);
  
  try {
    const svgBuffer = fs.readFileSync(filePath);
    await sharp(svgBuffer)
      .png()
      .toFile(outputPath);
    
    console.log(`Converted ${fileName}.svg to ${fileName}.png`);
  } catch (error) {
    console.error(`Error converting ${fileName}.svg:`, error);
  }
}

// Convert all SVG files
async function convertAllSvgs() {
  for (const svgFile of svgFiles) {
    const filePath = path.join(SVG_DIR, svgFile);
    await convertSvgToPng(filePath);
  }
  console.log('Conversion complete!');
}

convertAllSvgs().catch(error => {
  console.error('Error during conversion:', error);
});