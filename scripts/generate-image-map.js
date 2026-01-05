#!/usr/bin/env node
/**
 * Generate TypeScript image map from fetched JSON
 * 
 * Run this after fetch-reverb-images.js to update the TypeScript file
 * Usage: node scripts/generate-image-map.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../src/data/pedal-images.json');
const OUTPUT_FILE = path.join(__dirname, '../src/data/pedalImageMap.ts');

if (!fs.existsSync(INPUT_FILE)) {
  console.error('❌ Error: pedal-images.json not found');
  console.error('   Run fetch-reverb-images.js first');
  process.exit(1);
}

const images = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

// Count stats
const total = Object.keys(images).length;
const withImages = Object.values(images).filter(v => v !== null).length;

console.log(`📊 Stats: ${withImages}/${total} pedals have images (${Math.round(withImages/total*100)}%)`);

// Generate TypeScript content
const tsContent = `/**
 * Pedal Image Map
 * 
 * Auto-generated from Reverb API data.
 * Run \`node scripts/fetch-reverb-images.js\` to update.
 * 
 * Generated: ${new Date().toISOString()}
 * Total pedals: ${total}
 * With images: ${withImages}
 */

// Image data type
interface PedalImageData {
  large?: string;
  small?: string;
  full?: string;
}

// Pedal images fetched from Reverb
const PEDAL_IMAGES: Record<string, PedalImageData | null> = ${JSON.stringify(images, null, 2)};

/**
 * Get the image URL for a pedal
 * @param pedalId - The pedal's unique ID
 * @param size - 'small', 'large', or 'full'
 * @returns The image URL or null if not found
 */
export function getPedalImageUrl(
  pedalId: string, 
  size: 'small' | 'large' | 'full' = 'large'
): string | null {
  const imageData = PEDAL_IMAGES[pedalId];
  if (!imageData) return null;
  
  return imageData[size] || imageData.large || imageData.small || null;
}

/**
 * Check if a pedal has an image
 */
export function hasPedalImage(pedalId: string): boolean {
  return PEDAL_IMAGES[pedalId] !== undefined && PEDAL_IMAGES[pedalId] !== null;
}

/**
 * Get count of available images
 */
export function getImageCount(): number {
  return ${withImages};
}

export default PEDAL_IMAGES;
`;

fs.writeFileSync(OUTPUT_FILE, tsContent);

console.log(`✅ Generated ${OUTPUT_FILE}`);
console.log(`   ${withImages} pedal images available`);

