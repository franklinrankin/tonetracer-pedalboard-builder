#!/usr/bin/env node
/**
 * Scrape pedal images from Pedal Playground
 * 
 * Usage: node scripts/scrape-pedalplayground.js
 * 
 * This script will:
 * - Fetch pedal data from Pedal Playground
 * - Match pedals with our database
 * - Download images to public/images/pedals/
 * - Update pedal-images.json with local paths
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
const RATE_LIMIT_MS = 200; // Be nice to their server

// Pedal Playground API endpoint (they have a public JSON endpoint)
const PP_API = 'https://pedalplayground.com/api/pedals';

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Created ${OUTPUT_DIR}`);
}

// Load existing images
let existingImages = {};
if (fs.existsSync(JSON_OUTPUT)) {
  try {
    existingImages = JSON.parse(fs.readFileSync(JSON_OUTPUT, 'utf-8'));
    console.log(`📂 Found existing file with ${Object.keys(existingImages).length} entries`);
  } catch (e) {
    console.log('📂 Starting fresh');
  }
}

// Extract our pedals from TypeScript files
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

// Download image helper
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadImage(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
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
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

// Fetch JSON from URL
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Normalize string for matching
function normalize(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/pedal$/i, '')
    .trim();
}

// Calculate similarity score
function similarity(str1, str2) {
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  // Count matching characters
  let matches = 0;
  const shorter = s1.length < s2.length ? s1 : s2;
  const longer = s1.length < s2.length ? s2 : s1;
  
  for (const char of shorter) {
    if (longer.includes(char)) matches++;
  }
  
  return matches / longer.length;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('\n🎸 Pedal Playground Image Scraper\n');
  
  // Load our pedals
  const pedalsDir = path.join(__dirname, '../src/data/pedals');
  const pedalFiles = findPedalFiles(pedalsDir);
  
  const allPedals = [];
  for (const file of pedalFiles) {
    allPedals.push(...extractPedalsFromFile(file));
  }
  
  const ourPedals = [...new Map(allPedals.map(p => [p.id, p])).values()];
  console.log(`📋 Found ${ourPedals.length} pedals in our database\n`);
  
  // Try to fetch from Pedal Playground API
  console.log('🔍 Fetching Pedal Playground data...');
  
  let ppPedals = [];
  try {
    // Try their API first
    const apiData = await fetchJSON(PP_API);
    ppPedals = apiData.pedals || apiData || [];
    console.log(`✅ Got ${ppPedals.length} pedals from API\n`);
  } catch (e) {
    console.log('⚠️  API not accessible, trying alternative method...\n');
    
    // Alternative: scrape their main page for pedal data
    // Pedal Playground stores pedal data in a JavaScript variable
    try {
      const html = await new Promise((resolve, reject) => {
        https.get('https://pedalplayground.com/', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        }).on('error', reject);
      });
      
      // Look for pedal data in the HTML/JS
      const jsonMatch = html.match(/var\s+pedals\s*=\s*(\[[\s\S]*?\]);/);
      if (jsonMatch) {
        ppPedals = JSON.parse(jsonMatch[1]);
        console.log(`✅ Extracted ${ppPedals.length} pedals from page\n`);
      }
    } catch (e2) {
      console.log('❌ Could not fetch Pedal Playground data');
      console.log('   They may have changed their site structure.\n');
    }
  }
  
  if (ppPedals.length === 0) {
    console.log('\n📝 Alternative: Manual image URLs');
    console.log('   Pedal Playground images follow this pattern:');
    console.log('   https://pedalplayground.com/images/pedals/[brand]-[model].png\n');
    console.log('   You can manually add URLs to pedal-images.json');
    
    // Generate template based on our pedals
    console.log('\n🔧 Generating URL template...');
    
    const template = {};
    for (const pedal of ourPedals) {
      const filename = `${pedal.brand}-${pedal.model}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      template[pedal.id] = {
        // Common Pedal Playground URL pattern
        large: `https://pedalplayground.com/public/pedals/${filename}.png`,
        small: `https://pedalplayground.com/public/pedals/${filename}.png`,
      };
    }
    
    fs.writeFileSync(
      path.join(__dirname, '../pedal-image-urls-template.json'),
      JSON.stringify(template, null, 2)
    );
    console.log('✅ Saved URL template to pedal-image-urls-template.json');
    console.log('   Edit this file with correct URLs, then run download script.\n');
    return;
  }
  
  // Match our pedals to Pedal Playground pedals
  console.log('🔗 Matching pedals...\n');
  
  const matches = [];
  const unmatched = [];
  
  for (const ourPedal of ourPedals) {
    // Skip if we already have an image
    if (existingImages[ourPedal.id]?.large) {
      continue;
    }
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const ppPedal of ppPedals) {
      // Try matching by brand + model
      const ppBrand = ppPedal.brand || ppPedal.manufacturer || '';
      const ppModel = ppPedal.model || ppPedal.name || '';
      
      const brandScore = similarity(ourPedal.brand, ppBrand);
      const modelScore = similarity(ourPedal.model, ppModel);
      const combinedScore = (brandScore * 0.4) + (modelScore * 0.6);
      
      if (combinedScore > bestScore && combinedScore > 0.7) {
        bestScore = combinedScore;
        bestMatch = ppPedal;
      }
    }
    
    if (bestMatch) {
      matches.push({
        our: ourPedal,
        pp: bestMatch,
        score: bestScore,
      });
    } else {
      unmatched.push(ourPedal);
    }
  }
  
  console.log(`✅ Matched: ${matches.length}`);
  console.log(`❌ Unmatched: ${unmatched.length}\n`);
  
  // Download matched images
  if (matches.length > 0) {
    console.log('📥 Downloading images...\n');
    
    let downloaded = 0;
    let failed = 0;
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const imageUrl = match.pp.image || match.pp.imageUrl || match.pp.img;
      
      if (!imageUrl) {
        failed++;
        continue;
      }
      
      const ext = path.extname(imageUrl) || '.png';
      const filename = `${match.our.id}${ext}`;
      const destPath = path.join(OUTPUT_DIR, filename);
      
      process.stdout.write(`[${i+1}/${matches.length}] ${match.our.brand} ${match.our.model}... `);
      
      try {
        await downloadImage(imageUrl, destPath);
        
        // Save to our mapping
        existingImages[match.our.id] = {
          large: `/images/pedals/${filename}`,
          small: `/images/pedals/${filename}`,
        };
        
        downloaded++;
        console.log('✅');
      } catch (e) {
        failed++;
        console.log(`❌ ${e.message}`);
      }
      
      // Save progress every 20 images
      if ((i + 1) % 20 === 0) {
        fs.writeFileSync(JSON_OUTPUT, JSON.stringify(existingImages, null, 2));
      }
      
      await sleep(RATE_LIMIT_MS);
    }
    
    // Final save
    fs.writeFileSync(JSON_OUTPUT, JSON.stringify(existingImages, null, 2));
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Downloaded: ${downloaded}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📁 Images saved to: ${OUTPUT_DIR}`);
    console.log(`📄 Mapping saved to: ${JSON_OUTPUT}`);
    console.log('='.repeat(50));
  }
  
  // Log unmatched for manual review
  if (unmatched.length > 0) {
    const unmatchedFile = path.join(__dirname, '../unmatched-pedals.json');
    fs.writeFileSync(unmatchedFile, JSON.stringify(unmatched, null, 2));
    console.log(`\n📝 Unmatched pedals saved to: ${unmatchedFile}`);
  }
}

main().catch(console.error);


