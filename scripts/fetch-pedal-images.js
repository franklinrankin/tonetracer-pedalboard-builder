#!/usr/bin/env node
/**
 * Fetch pedal images from multiple sources
 * 
 * Usage: node scripts/fetch-pedal-images.js
 * 
 * Tries multiple image sources:
 * 1. Pedal Playground CDN patterns
 * 2. Google Images (search URL for manual review)
 * 3. Generates a CSV for manual image collection
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OUTPUT_DIR = path.join(__dirname, '../public/images/pedals');
const JSON_OUTPUT = path.join(__dirname, '../src/data/pedal-images.json');
const CSV_OUTPUT = path.join(__dirname, '../pedal-images-todo.csv');
const RATE_LIMIT_MS = 300;

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load existing images
let existingImages = {};
if (fs.existsSync(JSON_OUTPUT)) {
  try {
    existingImages = JSON.parse(fs.readFileSync(JSON_OUTPUT, 'utf-8'));
  } catch (e) {}
}

// Extract pedals from TypeScript files
function extractPedalsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const pedals = [];
  
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

// Check if URL exists (HEAD request)
function urlExists(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// Download image
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    
    const req = protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate URL variations for a pedal
function generateUrlVariations(brand, model) {
  const variations = [];
  
  // Normalize brand and model
  const cleanBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanModel = model.toLowerCase().replace(/[^a-z0-9]/g, '');
  const dashBrand = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const dashModel = model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const underBrand = brand.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const underModel = model.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  
  // Pedal Playground patterns (based on their CDN structure)
  const ppPatterns = [
    `https://pedalplayground.com/public/pedals/${dashBrand}-${dashModel}.png`,
    `https://pedalplayground.com/public/pedals/${dashBrand}_${dashModel}.png`,
    `https://pedalplayground.com/public/pedals/${cleanBrand}${cleanModel}.png`,
    `https://pedalplayground.com/images/pedals/${dashBrand}-${dashModel}.png`,
    `https://pedalplayground.com/pedals/${dashBrand}-${dashModel}.png`,
  ];
  
  // Modulargrid patterns (another popular pedal site)
  const mgPatterns = [
    `https://modulargrid.net/img/instruments/${cleanBrand}-${cleanModel}.jpg`,
  ];
  
  // Combine all patterns
  variations.push(...ppPatterns, ...mgPatterns);
  
  return variations;
}

async function main() {
  console.log('\n🎸 Pedal Image Fetcher\n');
  
  // Load our pedals
  const pedalsDir = path.join(__dirname, '../src/data/pedals');
  const pedalFiles = findPedalFiles(pedalsDir);
  
  const allPedals = [];
  for (const file of pedalFiles) {
    allPedals.push(...extractPedalsFromFile(file));
  }
  
  const ourPedals = [...new Map(allPedals.map(p => [p.id, p])).values()];
  console.log(`📋 Found ${ourPedals.length} pedals in database`);
  
  // Filter out pedals we already have images for
  const pedalsToFetch = ourPedals.filter(p => !existingImages[p.id]?.large);
  console.log(`📥 Need images for ${pedalsToFetch.length} pedals\n`);
  
  if (pedalsToFetch.length === 0) {
    console.log('✅ All pedals already have images!');
    return;
  }
  
  // Try to find images
  let found = 0;
  let notFound = 0;
  const notFoundPedals = [];
  
  for (let i = 0; i < pedalsToFetch.length; i++) {
    const pedal = pedalsToFetch[i];
    const progress = `[${i + 1}/${pedalsToFetch.length}]`;
    
    process.stdout.write(`${progress} ${pedal.brand} ${pedal.model}... `);
    
    const urls = generateUrlVariations(pedal.brand, pedal.model);
    let foundUrl = null;
    
    // Try each URL pattern
    for (const url of urls) {
      const exists = await urlExists(url);
      if (exists) {
        foundUrl = url;
        break;
      }
      await sleep(50); // Small delay between checks
    }
    
    if (foundUrl) {
      // Download the image
      const ext = path.extname(foundUrl) || '.png';
      const filename = `${pedal.id}${ext}`;
      const destPath = path.join(OUTPUT_DIR, filename);
      
      try {
        await downloadImage(foundUrl, destPath);
        existingImages[pedal.id] = {
          large: `/images/pedals/${filename}`,
          small: `/images/pedals/${filename}`,
        };
        found++;
        console.log('✅');
      } catch (e) {
        notFound++;
        notFoundPedals.push(pedal);
        console.log(`❌ Download failed`);
      }
    } else {
      notFound++;
      notFoundPedals.push(pedal);
      console.log('❌ Not found');
    }
    
    // Save progress every 20 pedals
    if ((i + 1) % 20 === 0) {
      fs.writeFileSync(JSON_OUTPUT, JSON.stringify(existingImages, null, 2));
    }
    
    await sleep(RATE_LIMIT_MS);
  }
  
  // Final save
  fs.writeFileSync(JSON_OUTPUT, JSON.stringify(existingImages, null, 2));
  
  // Generate CSV for manual image collection
  if (notFoundPedals.length > 0) {
    const csvLines = ['ID,Brand,Model,Google Search URL'];
    for (const pedal of notFoundPedals) {
      const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(pedal.brand + ' ' + pedal.model + ' pedal')}`;
      csvLines.push(`"${pedal.id}","${pedal.brand}","${pedal.model}","${searchUrl}"`);
    }
    fs.writeFileSync(CSV_OUTPUT, csvLines.join('\n'));
    console.log(`\n📝 Missing pedals CSV: ${CSV_OUTPUT}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Found: ${found}`);
  console.log(`❌ Not found: ${notFound}`);
  console.log(`📁 Images: ${OUTPUT_DIR}`);
  console.log(`📄 Mapping: ${JSON_OUTPUT}`);
  console.log('='.repeat(50));
  
  // Run generate script
  console.log('\n🔧 Generating TypeScript file...');
}

main().catch(console.error);

