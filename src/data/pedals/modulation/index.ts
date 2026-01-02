// Modulation pedals index - combines all modulation subcategories
import { Pedal } from '../../../types';
import { CHORUS_PEDALS } from './chorus';
import { PHASER_PEDALS } from './phaser';
import { OTHER_MODULATION_PEDALS } from './other';

// Combine all modulation pedals (~120 total)
export const ALL_PEDALS: Pedal[] = [
  ...CHORUS_PEDALS,           // ~35 pedals
  ...PHASER_PEDALS,           // ~25 pedals
  ...OTHER_MODULATION_PEDALS, // ~60 pedals (flanger, tremolo, vibrato, rotary)
];

// Alias for backwards compatibility
export const MODULATION_PEDALS = ALL_PEDALS;

// Export subcategories
export {
  CHORUS_PEDALS,
  PHASER_PEDALS,
  OTHER_MODULATION_PEDALS,
};

export default ALL_PEDALS;

