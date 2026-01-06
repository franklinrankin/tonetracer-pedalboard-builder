const fs = require('fs');
const path = require('path');

// Read the pedal-images.json
const imagesPath = path.join(__dirname, '..', 'src', 'data', 'pedal-images.json');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'pedalImageMap.ts');

const imageData = JSON.parse(fs.readFileSync(imagesPath, 'utf8'));

// Count valid images
let validCount = 0;
const entries = Object.entries(imageData);
entries.forEach(([id, data]) => {
  if (data && data.large) validCount++;
});

// Generate TypeScript file
let output = `/**
 * Pedal Image Map - ALL IMAGES
 * 
 * Generated: ${new Date().toISOString()}
 * Total pedals with images: ${validCount}
 */

// Image data type
interface PedalImageData {
  large?: string;
  small?: string;
  full?: string;
}

// All pedal images
const PEDAL_IMAGES: Record<string, PedalImageData | null> = {\n`;

entries.forEach(([id, data], index) => {
  if (data === null) {
    output += `  "${id}": null`;
  } else {
    output += `  "${id}": {\n`;
    if (data.large) output += `    "large": "${data.large}",\n`;
    if (data.small) output += `    "small": "${data.small}"\n`;
    output += `  }`;
  }
  output += index < entries.length - 1 ? ',\n' : '\n';
});

output += `};

export function getPedalImageUrl(
  pedalId: string, 
  size: 'small' | 'large' | 'full' = 'large'
): string | null {
  const imageData = PEDAL_IMAGES[pedalId];
  if (!imageData) return null;
  
  return imageData[size] || imageData.large || imageData.small || null;
}

export function hasPedalImage(pedalId: string): boolean {
  return PEDAL_IMAGES[pedalId] !== undefined && PEDAL_IMAGES[pedalId] !== null;
}

export function getImageCount(): number {
  return ${validCount};
}

export default PEDAL_IMAGES;
`;

fs.writeFileSync(outputPath, output);
console.log(`Generated pedalImageMap.ts with ${validCount} images`);
