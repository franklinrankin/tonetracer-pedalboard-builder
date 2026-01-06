/**
 * Save All Images From a Webpage
 * 
 * Usage:
 *   node scripts/save-page-images.js "https://example.com/page" ./output-folder
 * 
 * Requirements:
 *   npm install puppeteer
 */

const puppeteer = require('puppeteer');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

async function downloadImage(imageUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(outputPath);
    protocol.get(imageUrl, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

function getFilenameFromUrl(imageUrl, index) {
  try {
    const parsed = new URL(imageUrl);
    let filename = path.basename(parsed.pathname);
    
    // Clean up filename
    filename = filename.split('?')[0]; // Remove query params
    
    // If no extension, add .jpg
    if (!filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      filename = `image-${index}.jpg`;
    }
    
    // Sanitize filename
    filename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return filename;
  } catch {
    return `image-${index}.jpg`;
  }
}

async function savePageImages(pageUrl, outputDir, options = {}) {
  const {
    minWidth = 100,      // Minimum image width
    minHeight = 100,     // Minimum image height
    waitTime = 3000,     // Time to wait for page to load
    scrollPage = true,   // Scroll to load lazy images
  } = options;

  console.log(`🌐 Opening: ${pageUrl}`);
  console.log(`📁 Output:  ${outputDir}\n`);

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to page
    await page.goto(pageUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for dynamic content
    await new Promise(r => setTimeout(r, waitTime));

    // Scroll page to trigger lazy loading
    if (scrollPage) {
      console.log('📜 Scrolling page to load lazy images...');
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 500;
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= document.body.scrollHeight) {
              clearInterval(timer);
              window.scrollTo(0, 0);
              resolve();
            }
          }, 100);
        });
      });
      await new Promise(r => setTimeout(r, 2000));
    }

    // Get all image URLs
    const images = await page.evaluate((minW, minH) => {
      const imgs = [];
      
      // Get <img> elements
      document.querySelectorAll('img').forEach(img => {
        if (img.src && img.naturalWidth >= minW && img.naturalHeight >= minH) {
          imgs.push({
            src: img.src,
            width: img.naturalWidth,
            height: img.naturalHeight,
            alt: img.alt || ''
          });
        }
      });
      
      // Get background images
      document.querySelectorAll('*').forEach(el => {
        const bg = window.getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none') {
          const match = bg.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (match && match[1]) {
            imgs.push({
              src: match[1],
              width: 0,
              height: 0,
              alt: 'background'
            });
          }
        }
      });
      
      return imgs;
    }, minWidth, minHeight);

    // Remove duplicates
    const uniqueImages = [...new Map(images.map(img => [img.src, img])).values()];
    
    console.log(`🖼️  Found ${uniqueImages.length} images\n`);

    // Download each image
    let downloaded = 0;
    let failed = 0;

    for (let i = 0; i < uniqueImages.length; i++) {
      const img = uniqueImages[i];
      const filename = getFilenameFromUrl(img.src, i);
      const outputPath = path.join(outputDir, filename);

      // Skip if already exists
      if (fs.existsSync(outputPath)) {
        console.log(`⏭️  [${i + 1}/${uniqueImages.length}] Skipped (exists): ${filename}`);
        continue;
      }

      try {
        console.log(`⬇️  [${i + 1}/${uniqueImages.length}] ${filename}`);
        await downloadImage(img.src, outputPath);
        downloaded++;
      } catch (err) {
        console.log(`❌ [${i + 1}/${uniqueImages.length}] Failed: ${filename} - ${err.message}`);
        failed++;
      }
    }

    console.log(`\n✅ Downloaded: ${downloaded}`);
    if (failed > 0) console.log(`❌ Failed: ${failed}`);
    console.log(`📁 Saved to: ${outputDir}`);

  } finally {
    await browser.close();
  }
}

// CLI
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node save-page-images.js <url> <output-folder>');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/save-page-images.js "https://example.com" ./downloaded-images');
  process.exit(1);
}

const [pageUrl, outputDir] = args;

savePageImages(pageUrl, outputDir, {
  minWidth: 50,
  minHeight: 50,
  waitTime: 3000,
  scrollPage: true
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

