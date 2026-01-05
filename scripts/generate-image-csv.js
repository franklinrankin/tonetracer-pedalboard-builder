#!/usr/bin/env node
/**
 * Generate CSV with Google Image search links for all pedals
 * For manual image collection
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_OUTPUT = path.join(__dirname, '../pedal-images-todo.csv');

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

// Load our pedals
const pedalsDir = path.join(__dirname, '../src/data/pedals');
const pedalFiles = findPedalFiles(pedalsDir);

const allPedals = [];
for (const file of pedalFiles) {
  allPedals.push(...extractPedalsFromFile(file));
}

const ourPedals = [...new Map(allPedals.map(p => [p.id, p])).values()];
console.log(`📋 Found ${ourPedals.length} pedals\n`);

// Generate CSV
const csvLines = ['ID,Brand,Model,Google Images'];
for (const pedal of ourPedals) {
  const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(pedal.brand + ' ' + pedal.model + ' pedal')}`;
  csvLines.push(`"${pedal.id}","${pedal.brand}","${pedal.model}","${searchUrl}"`);
}

fs.writeFileSync(CSV_OUTPUT, csvLines.join('\n'));
console.log(`✅ Generated: ${CSV_OUTPUT}`);
console.log(`   Open in Google Sheets or Excel to get image links`);

