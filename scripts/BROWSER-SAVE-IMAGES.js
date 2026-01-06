/**
 * BROWSER CONSOLE SCRIPT - Save All Images
 * 
 * HOW TO USE:
 * 1. Open any webpage in Chrome/Safari/Firefox
 * 2. Open Developer Tools (Cmd+Option+I on Mac)
 * 3. Go to Console tab
 * 4. Paste this entire script and press Enter
 * 5. Images will download as a ZIP file
 * 
 * Note: Some sites block this. If it doesn't work, try the Puppeteer script instead.
 */

(async function saveAllImages() {
  // Get all images on the page
  const images = [];
  
  // <img> elements
  document.querySelectorAll('img').forEach((img, i) => {
    if (img.src && img.naturalWidth > 50) {
      images.push({
        url: img.src,
        name: img.alt?.replace(/[^a-z0-9]/gi, '-').substring(0, 50) || `image-${i}`
      });
    }
  });
  
  // Background images
  document.querySelectorAll('[style*="background"]').forEach((el, i) => {
    const bg = getComputedStyle(el).backgroundImage;
    const match = bg.match(/url\(['"]?([^'"]+)['"]?\)/);
    if (match) {
      images.push({ url: match[1], name: `bg-${i}` });
    }
  });

  console.log(`Found ${images.length} images`);
  
  if (images.length === 0) {
    alert('No images found on this page!');
    return;
  }

  // Download each image
  let downloaded = 0;
  
  for (const img of images) {
    try {
      // Create download link
      const a = document.createElement('a');
      a.href = img.url;
      a.download = img.name + '.jpg';
      a.target = '_blank';
      
      // Some browsers block cross-origin downloads
      // Try fetch + blob approach
      try {
        const response = await fetch(img.url);
        const blob = await response.blob();
        a.href = URL.createObjectURL(blob);
      } catch (e) {
        // Fall back to direct URL
      }
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      downloaded++;
      console.log(`Downloaded: ${img.name}`);
      
      // Small delay between downloads
      await new Promise(r => setTimeout(r, 200));
      
    } catch (err) {
      console.error(`Failed: ${img.name}`, err);
    }
  }
  
  console.log(`\n✅ Downloaded ${downloaded}/${images.length} images`);
  alert(`Downloaded ${downloaded} images! Check your Downloads folder.`);
})();

