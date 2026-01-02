// Gain pedals index - combines all gain subcategories
import { Pedal } from '../../../types';
import { OVERDRIVE_PEDALS } from './overdrives';
import { DISTORTION_PEDALS } from './distortions';
import { FUZZ_PEDALS } from './fuzz';
import { BOOST_PEDALS } from './boosts';

// Combine all gain pedals (~250 total)
export const GAIN_PEDALS: Pedal[] = [
  ...OVERDRIVE_PEDALS,   // ~70 pedals
  ...DISTORTION_PEDALS,  // ~45 pedals
  ...FUZZ_PEDALS,        // ~50 pedals
  ...BOOST_PEDALS,       // ~30 pedals
];

// Export subcategories
export {
  OVERDRIVE_PEDALS,
  DISTORTION_PEDALS,
  FUZZ_PEDALS,
  BOOST_PEDALS,
};

export default GAIN_PEDALS;

