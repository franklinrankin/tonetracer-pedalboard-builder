#!/usr/bin/env node
/**
 * Fetch pedal images from Reverb API
 * 
 * Usage:
 * 1. Get your API token from https://reverb.com/my/api_settings
 * 2. Run: REVERB_TOKEN=your_token_here node scripts/fetch-reverb-images.js
 * 
 * This script will:
 * - Read all pedals from the TypeScript files
 * - Query Reverb API for each pedal
 * - Save image URLs to pedal-images.json
 * - Rate limit to avoid API throttling
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const REVERB_TOKEN = process.env.REVERB_TOKEN;
const OUTPUT_FILE = path.join(__dirname, '../src/data/pedal-images.json');
const RATE_LIMIT_MS = 600; // ~100 requests per minute
const MAX_RETRIES = 3;

if (!REVERB_TOKEN) {
  console.error('❌ Error: REVERB_TOKEN environment variable is required');
  console.error('');
  console.error('To get your token:');
  console.error('1. Go to https://reverb.com/my/api_settings');
  console.error('2. Generate a new Personal Access Token');
  console.error('3. Run: REVERB_TOKEN=your_token_here node scripts/fetch-reverb-images.js');
  process.exit(1);
}

// Read existing progress if any
let existingImages = {};
if (fs.existsSync(OUTPUT_FILE)) {
  try {
    existingImages = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    console.log(`📂 Found existing file with ${Object.keys(existingImages).length} images`);
  } catch (e) {
    console.log('📂 Starting fresh (could not read existing file)');
  }
}

// Extract pedals from TypeScript files
function extractPedalsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const pedals = [];
  
  // Match pedal objects with id, brand, model
  const pedalRegex = /\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*brand:\s*['"]([^'"]+)['"]\s*,\s*model:\s*['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = pedalRegex.exec(content)) !== null) {
    pedals.push({
      id: match[1],
      brand: match[2],
      model: match[3],
    });
  }
  
  return pedals;
}

// Recursively find all .ts files in pedals directory
function findPedalFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findPedalFiles(fullPath));
    } else if (entry.name.endsWith('.ts') && entry.name !== 'index.ts') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fetch image from Reverb API
async function fetchImageFromReverb(brand, model, retries = 0) {
  const query = encodeURIComponent(`${brand} ${model} pedal`);
  const url = `https://api.reverb.com/api/listings?query=${query}&per_page=3&state=live`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${REVERB_TOKEN}`,
        'Accept-Version': '3.0',
        'Content-Type': 'application/hal+json',
      },
    });
    
    if (response.status === 429) {
      // Rate limited - wait and retry
      console.log('  ⏳ Rate limited, waiting 60s...');
      await sleep(60000);
      return fetchImageFromReverb(brand, model, retries);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Find the best matching listing
    if (data.listings && data.listings.length > 0) {
      // Prefer listings with photos
      const listingWithPhotos = data.listings.find(l => l.photos && l.photos.length > 0);
      
      if (listingWithPhotos && listingWithPhotos.photos[0]) {
        const photo = listingWithPhotos.photos[0];
        return {
          large: photo._links?.large_crop?.href || photo._links?.full?.href,
          small: photo._links?.small_crop?.href || photo._links?.thumbnail?.href,
          full: photo._links?.full?.href,
        };
      }
    }
    
    return null;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`  ⚠️ Retry ${retries + 1}/${MAX_RETRIES}: ${error.message}`);
      await sleep(2000);
      return fetchImageFromReverb(brand, model, retries + 1);
    }
    console.log(`  ❌ Failed: ${error.message}`);
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
async function main() {
  const pedalsDir = path.join(__dirname, '../src/data/pedals');
  const pedalFiles = findPedalFiles(pedalsDir);
  
  console.log(`\n📁 Found ${pedalFiles.length} pedal files`);
  
  // Extract all pedals
  const allPedals = [];
  for (const file of pedalFiles) {
    const pedals = extractPedalsFromFile(file);
    allPedals.push(...pedals);
  }
  
  // Deduplicate by ID
  const uniquePedals = [...new Map(allPedals.map(p => [p.id, p])).values()];
  console.log(`🎸 Found ${uniquePedals.length} unique pedals\n`);
  
  // Filter out pedals we already have images for
  const pedalsToFetch = uniquePedals.filter(p => !existingImages[p.id]);
  console.log(`📥 Need to fetch ${pedalsToFetch.length} images (${Object.keys(existingImages).length} already cached)\n`);
  
  if (pedalsToFetch.length === 0) {
    console.log('✅ All images already fetched!');
    return;
  }
  
  // Fetch images with rate limiting
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < pedalsToFetch.length; i++) {
    const pedal = pedalsToFetch[i];
    const progress = `[${i + 1}/${pedalsToFetch.length}]`;
    
    process.stdout.write(`${progress} ${pedal.brand} ${pedal.model}... `);
    
    const images = await fetchImageFromReverb(pedal.brand, pedal.model);
    
    if (images) {
      existingImages[pedal.id] = images;
      successCount++;
      console.log('✅');
    } else {
      existingImages[pedal.id] = null; // Mark as attempted
      failCount++;
      console.log('❌ No image found');
    }
    
    // Save progress every 10 pedals
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingImages, null, 2));
      console.log(`  💾 Progress saved (${successCount} success, ${failCount} failed)`);
    }
    
    // Rate limiting
    if (i < pedalsToFetch.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }
  
  // Final save
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingImages, null, 2));
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed:  ${failCount}`);
  console.log(`   Output:  ${OUTPUT_FILE}`);
  console.log('='.repeat(50));
}

main().catch(console.error);

