import { Pedal, BoardSlot, Category } from '../types';

// Standard signal chain order for pedal categories and subtypes
// Lower number = earlier in chain (closer to guitar)
const SIGNAL_CHAIN_ORDER: Record<string, number> = {
  // Tuner - always first (can mute signal)
  'Tuner': 1,
  
  // Filters - early in chain for expressiveness
  'Wah': 10,
  'Envelope': 11,
  'Auto-Wah': 12,
  'filter': 15, // Default for filter category
  
  // Dynamics - compress before dirt
  'Compressor': 20,
  'Limiter': 21,
  'Noise Gate': 22,
  'dynamics': 25,
  
  // Pitch effects - before or after dirt depending on taste
  'Octave': 30,
  'Pitch': 31,
  'Shifter': 32,
  'Harmonizer': 33,
  'Whammy': 34,
  'pitch': 35,
  
  // Gain/Dirt section - the heart of your tone
  'Boost': 40,
  'Overdrive': 45,
  'Distortion': 50,
  'Fuzz': 55,
  'gain': 48,
  
  // EQ - shape your tone after dirt
  'Graphic': 60,
  'Parametric': 61,
  'eq': 62,
  
  // Synth effects
  'Synth': 65,
  'Fuzz/Synth': 66,
  'synth': 67,
  
  // Modulation - after dirt for traditional sounds
  'Phaser': 70,
  'Flanger': 71,
  'Chorus': 72,
  'Vibrato': 73,
  'Tremolo': 74,
  'Rotary': 75,
  'modulation': 72,
  
  // Volume - control dynamics after effects
  'Volume': 80,
  'volume': 81,
  
  // Amp/Cab simulation
  'Preamp': 85,
  'Cab Sim': 86,
  'amp': 87,
  
  // Time-based effects - end of chain
  'Analog': 90, // Analog delay
  'Tape': 91,
  'Digital': 92,
  'Multi': 93,
  'delay': 92,
  
  // Reverb - usually last
  'Spring': 95,
  'Hall': 96,
  'Plate': 97,
  'Room': 98,
  'Ambient': 99,
  'Shimmer': 100,
  'reverb': 98,
  
  // Utility - depends on type
  'Buffer': 5, // Buffers often go early
  'Loop Switcher': 105,
  'Looper': 110, // Loopers usually last
  'utility': 105,
};

// Get the signal chain position for a pedal
export function getSignalChainPosition(pedal: Pedal): number {
  // First check subtype for more specific positioning
  if (pedal.subtype && SIGNAL_CHAIN_ORDER[pedal.subtype] !== undefined) {
    return SIGNAL_CHAIN_ORDER[pedal.subtype];
  }
  
  // Fall back to category
  if (SIGNAL_CHAIN_ORDER[pedal.category] !== undefined) {
    return SIGNAL_CHAIN_ORDER[pedal.category];
  }
  
  // Default to middle of chain
  return 50;
}

// Sort slots by signal chain order
export function sortBySignalChain(slots: BoardSlot[]): BoardSlot[] {
  return [...slots].sort((a, b) => {
    const posA = getSignalChainPosition(a.pedal);
    const posB = getSignalChainPosition(b.pedal);
    return posA - posB;
  });
}

// Find the correct index to insert a new pedal
export function findInsertIndex(slots: BoardSlot[], newPedal: Pedal): number {
  const newPosition = getSignalChainPosition(newPedal);
  
  for (let i = 0; i < slots.length; i++) {
    const slotPosition = getSignalChainPosition(slots[i].pedal);
    if (newPosition < slotPosition) {
      return i;
    }
  }
  
  // If no position found, add at end
  return slots.length;
}

// Get signal chain section name for display
export function getSignalChainSection(pedal: Pedal): string {
  const position = getSignalChainPosition(pedal);
  
  if (position <= 5) return 'Buffer';
  if (position <= 15) return 'Tuner & Filters';
  if (position <= 25) return 'Dynamics';
  if (position <= 35) return 'Pitch';
  if (position <= 55) return 'Gain';
  if (position <= 67) return 'EQ & Synth';
  if (position <= 80) return 'Modulation';
  if (position <= 87) return 'Volume & Amp';
  if (position <= 93) return 'Delay';
  if (position <= 105) return 'Reverb';
  return 'Utility';
}

