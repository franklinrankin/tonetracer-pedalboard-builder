// Central pedal database - imports from category files
import { Pedal } from '../../types';
import { GAIN_PEDALS } from './gain';
import { MODULATION_PEDALS } from './modulation';
import { DELAY_PEDALS } from './delay';
import { REVERB_PEDALS } from './reverb';
import { DYNAMICS_PEDALS } from './dynamics';
import { UTILITY_PEDALS } from './utility';

// Combine all pedals into single array
export const PEDALS: Pedal[] = [
  ...GAIN_PEDALS,
  ...MODULATION_PEDALS,
  ...DELAY_PEDALS,
  ...REVERB_PEDALS,
  ...DYNAMICS_PEDALS,
  ...UTILITY_PEDALS,
];

// Export individual category arrays for filtering
export {
  GAIN_PEDALS,
  MODULATION_PEDALS,
  DELAY_PEDALS,
  REVERB_PEDALS,
  DYNAMICS_PEDALS,
  UTILITY_PEDALS,
};

// Helper function to find pedal by ID
export function getPedalById(id: string): Pedal | undefined {
  return PEDALS.find(p => p.id === id);
}

// Helper function to get pedals by category
export function getPedalsByCategory(category: Pedal['category']): Pedal[] {
  return PEDALS.filter(p => p.category === category);
}

// Helper function to get pedals by subtype
export function getPedalsBySubtype(subtype: string): Pedal[] {
  return PEDALS.filter(p => p.subtype === subtype);
}

// Helper function to get pedals by brand
export function getPedalsByBrand(brand: string): Pedal[] {
  return PEDALS.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
}

// Helper to get pedals within a price range
export function getPedalsByPriceRange(min: number, max: number): Pedal[] {
  return PEDALS.filter(p => p.reverbPrice >= min && p.reverbPrice <= max);
}

// Export pedal count for reference
export const PEDAL_COUNT = PEDALS.length;

export default PEDALS;

