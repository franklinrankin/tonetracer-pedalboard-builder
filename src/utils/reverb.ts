/**
 * Reverb Affiliate Link Utilities (via Awin)
 * 
 * Commission: 5% per sale, $5 per new buyer
 * Cookie window: 30 days
 */

// Awin affiliate credentials
const AWIN_AFFILIATE_ID = '2748608';
const AWIN_MERCHANT_ID = '67144'; // Reverb's merchant ID on Awin

/**
 * Generate an Awin-tracked Reverb search link for a pedal
 */
export function getReverbSearchUrl(brand: string, model: string): string {
  const query = encodeURIComponent(`${brand} ${model}`);
  const destinationUrl = `https://reverb.com/marketplace?query=${query}&product_type=effects-and-pedals`;
  
  // Awin tracking format
  return `https://www.awin1.com/cread.php?awinmid=${AWIN_MERCHANT_ID}&awinaffid=${AWIN_AFFILIATE_ID}&ued=${encodeURIComponent(destinationUrl)}`;
}

/**
 * Generate an Awin-tracked direct Reverb link (for specific listings)
 */
export function getReverbListingUrl(listingId: string): string {
  const destinationUrl = `https://reverb.com/item/${listingId}`;
  return `https://www.awin1.com/cread.php?awinmid=${AWIN_MERCHANT_ID}&awinaffid=${AWIN_AFFILIATE_ID}&ued=${encodeURIComponent(destinationUrl)}`;
}

/**
 * Generate an Awin-tracked link to the Reverb homepage
 */
export function getReverbHomeUrl(): string {
  const destinationUrl = 'https://reverb.com';
  return `https://www.awin1.com/cread.php?awinmid=${AWIN_MERCHANT_ID}&awinaffid=${AWIN_AFFILIATE_ID}&ued=${encodeURIComponent(destinationUrl)}`;
}

/**
 * Check if affiliate is configured
 */
export function isAffiliateConfigured(): boolean {
  return AWIN_AFFILIATE_ID.length > 0;
}
