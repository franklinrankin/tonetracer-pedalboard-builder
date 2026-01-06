#!/usr/bin/env node
/**
 * Download pedal images locally from Reverb URLs
 * 
 * Usage: node scripts/download-images.js
 * 
 * Downloads all images from pedal-images.json to public/images/pedals/
 * and updates the JSON to use local paths
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const JSON_FILE = path.join(__dirname, '../src/data/pedal-images.json');
const OUTPUT_DIR = path.join(__dirname, '../public/images/pedals');
const RATE_LIMIT_MS = 100;

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Created ${OUTPUT_DIR}`);
}

// Load existing image URLs
if (!fs.existsSync(JSON_FILE)) {
  console.error('❌ pedal-images.json not found. Run fetch-reverb-images.js first.');
  process.exit(1);
}

const imageData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
console.log(`📋 Found ${Object.keys(imageData).length} pedals with image data\n`);

// Download image helper
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('No URL'));
      return;
    }
    
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    
    const req = protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        file.close();
        fs.unlinkSync(destPath);
        downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
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
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      file.close();
      fs.unlink(destPath, () => {});
      reject(new Error('Timeout'));
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🎸 Downloading Pedal Images Locally\n');
  
  const entries = Object.entries(imageData);
  const toDownload = entries.filter(([id, data]) => {
    if (!data || !data.large) return false;
    // Skip if already local path
    if (data.large.startsWith('/images/pedals/')) return false;
    return true;
  });
  
  console.log(`📥 Need to download ${toDownload.length} images\n`);
  
  if (toDownload.length === 0) {
    console.log('✅ All images already downloaded!');
    return;
  }
  
  let downloaded = 0;
  let failed = 0;
  const updatedData = { ...imageData };
  
  for (let i = 0; i < toDownload.length; i++) {
    const [pedalId, data] = toDownload[i];
    const progress = `[${i + 1}/${toDownload.length}]`;
    
    process.stdout.write(`${progress} ${pedalId}... `);
    
    // Determine file extension from URL
    const url = data.large || data.small || data.full;
    let ext = '.jpg';
    if (url.includes('.png')) ext = '.png';
    else if (url.includes('.webp')) ext = '.webp';
    else if (url.includes('.gif')) ext = '.gif';
    
    const filename = `${pedalId}${ext}`;
    const destPath = path.join(OUTPUT_DIR, filename);
    
    // Skip if file already exists
    if (fs.existsSync(destPath)) {
      updatedData[pedalId] = {
        large: `/images/pedals/${filename}`,
        small: `/images/pedals/${filename}`,
      };
      downloaded++;
      console.log('⏭️ Already exists');
      continue;
    }
    
    try {
      await downloadImage(url, destPath);
      
      // Update to local path
      updatedData[pedalId] = {
        large: `/images/pedals/${filename}`,
        small: `/images/pedals/${filename}`,
      };
      
      downloaded++;
      console.log('✅');
    } catch (e) {
      failed++;
      console.log(`❌ ${e.message}`);
    }
    
    // Save progress every 50 images
    if ((i + 1) % 50 === 0) {
      fs.writeFileSync(JSON_FILE, JSON.stringify(updatedData, null, 2));
      console.log(`  💾 Progress saved (${downloaded} downloaded, ${failed} failed)`);
    }
    
    await sleep(RATE_LIMIT_MS);
  }
  
  // Final save
  fs.writeFileSync(JSON_FILE, JSON.stringify(updatedData, null, 2));
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Downloaded: ${downloaded}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Images: ${OUTPUT_DIR}`);
  console.log('='.repeat(50));
  
  // Calculate total size
  let totalSize = 0;
  const files = fs.readdirSync(OUTPUT_DIR);
  for (const file of files) {
    const stats = fs.statSync(path.join(OUTPUT_DIR, file));
    totalSize += stats.size;
  }
  console.log(`📦 Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
}

main().catch(console.error);


