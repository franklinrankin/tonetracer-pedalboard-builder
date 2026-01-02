// Central pedal database - imports from category files
// Priority order: gain, mod, reverb, delay, dynamics, filter, pitch, eq, synth, amp, utility, volume
import { Pedal } from '../../types';
import { GAIN_PEDALS } from './gain';
import { MODULATION_PEDALS } from './modulation';
import { REVERB_PEDALS } from './reverb';
import { DELAY_PEDALS } from './delay';
import { DYNAMICS_PEDALS } from './dynamics';
import { FILTER_PEDALS } from './filter';
import { PITCH_PEDALS } from './pitch';
import { EQ_PEDALS } from './eq';
import { SYNTH_PEDALS } from './synth';
import { AMP_PEDALS } from './amp';
import { UTILITY_PEDALS } from './utility';
import { VOLUME_PEDALS } from './volume';

// Combine all pedals into single array (100 total)
export const PEDALS: Pedal[] = [
  ...GAIN_PEDALS,        // 25 pedals - Priority 1
  ...MODULATION_PEDALS,  // 15 pedals - Priority 2
  ...REVERB_PEDALS,      // 12 pedals - Priority 3 (tied)
  ...DELAY_PEDALS,       // 12 pedals - Priority 3 (tied)
  ...DYNAMICS_PEDALS,    // 8 pedals - Priority 5
  ...FILTER_PEDALS,      // 6 pedals - Priority 6
  ...PITCH_PEDALS,       // 5 pedals - Priority 7
  ...EQ_PEDALS,          // 4 pedals - Priority 8
  ...SYNTH_PEDALS,       // 3 pedals - Priority 9
  ...AMP_PEDALS,         // 2 pedals - Priority 10
  ...UTILITY_PEDALS,     // 2 pedals - Priority 11
  ...VOLUME_PEDALS,      // 2 pedals - Priority 12
];

// Export individual category arrays for filtering
export {
  GAIN_PEDALS,
  MODULATION_PEDALS,
  REVERB_PEDALS,
  DELAY_PEDALS,
  DYNAMICS_PEDALS,
  FILTER_PEDALS,
  PITCH_PEDALS,
  EQ_PEDALS,
  SYNTH_PEDALS,
  AMP_PEDALS,
  UTILITY_PEDALS,
  VOLUME_PEDALS,
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
