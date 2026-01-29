/**
 * Reverb Affiliate Link Utilities
 * 
 * To set up:
 * 1. Apply at https://reverb.com/page/affiliates (or search "Reverb affiliate program")
 * 2. Get approved and receive your affiliate ID
 * 3. Replace AFFILIATE_ID below with your actual ID
 */

// TODO: Replace with your actual Reverb affiliate ID once approved
const AFFILIATE_ID: string = 'boardsie';

/**
 * Generate a Reverb search link for a pedal
 */
export function getReverbSearchUrl(brand: string, model: string): string {
  const query = encodeURIComponent(`${brand} ${model}`);
  const baseUrl = `https://reverb.com/marketplace?query=${query}&product_type=effects-and-pedals`;
  
  // Add affiliate tracking
  return `${baseUrl}&utm_source=affiliate&utm_medium=${AFFILIATE_ID}&utm_campaign=pedal_builder`;
}

/**
 * Generate a direct Reverb link (if you have a specific listing ID)
 */
export function getReverbListingUrl(listingId: string): string {
  const baseUrl = `https://reverb.com/item/${listingId}`;
  return `${baseUrl}?utm_source=affiliate&utm_medium=${AFFILIATE_ID}&utm_campaign=pedal_builder`;
}

/**
 * Check if affiliate ID has been configured
 */
export function isAffiliateConfigured(): boolean {
  return AFFILIATE_ID !== 'boardsie' && AFFILIATE_ID.length > 0;
}
