// Central pedal database - imports from category files
// Priority order: gain, mod, reverb, delay, dynamics, filter, pitch, eq, synth, amp, utility, volume
import { Pedal } from '../../types';
import { ALL_PEDALS as GAIN_PEDALS } from './gain';
import { ALL_PEDALS as MODULATION_PEDALS } from './modulation';
import { ALL_PEDALS as REVERB_PEDALS } from './reverb';
import { ALL_PEDALS as DELAY_PEDALS } from './delay';
import { ALL_PEDALS as DYNAMICS_PEDALS } from './dynamics';
import { ALL_PEDALS as FILTER_PEDALS } from './filter';
import { ALL_PEDALS as PITCH_PEDALS } from './pitch';
import { ALL_PEDALS as EQ_PEDALS } from './eq';
import { ALL_PEDALS as SYNTH_PEDALS } from './synth';
import { ALL_PEDALS as AMP_PEDALS } from './amp';
import { ALL_PEDALS as UTILITY_PEDALS } from './utility';
import { ALL_PEDALS as VOLUME_PEDALS } from './volume';
import VINTAGE_PEDALS from './vintage';
import ADDITIONAL_PEDALS from './additional';

// Combine all pedals into single array (~1100+ total)
export const PEDALS: Pedal[] = [
  ...GAIN_PEDALS,        // ~250 pedals - Priority 1
  ...MODULATION_PEDALS,  // ~120 pedals - Priority 2
  ...REVERB_PEDALS,      // ~120 pedals - Priority 3 (tied)
  ...DELAY_PEDALS,       // ~120 pedals - Priority 3 (tied)
  ...DYNAMICS_PEDALS,    // ~80 pedals - Priority 5
  ...FILTER_PEDALS,      // ~60 pedals - Priority 6
  ...PITCH_PEDALS,       // ~50 pedals - Priority 7
  ...EQ_PEDALS,          // ~40 pedals - Priority 8
  ...SYNTH_PEDALS,       // ~30 pedals - Priority 9
  ...AMP_PEDALS,         // ~20 pedals - Priority 10
  ...UTILITY_PEDALS,     // ~20 pedals - Priority 11
  ...VOLUME_PEDALS,      // ~20 pedals - Priority 12
  ...VINTAGE_PEDALS,     // ~50+ vintage & discontinued classics
  ...ADDITIONAL_PEDALS,  // ~70+ additional current pedals
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
