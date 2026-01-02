import { Category } from '../types';

export interface GenreProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  artists: string[];
  // Recommended pedal categories for this genre (in order of importance)
  recommendedCategories: Category[];
  // Target section scores (what this genre typically needs)
  sectionTargets: Partial<Record<Category, { min: number; ideal: number; max: number }>>;
  // Preferred pedal subtypes
  preferredSubtypes: string[];
  // Keywords to match in pedal descriptions
  keywords: string[];
  // Board characteristics
  characteristics: {
    gainLevel: 'clean' | 'low' | 'medium' | 'high' | 'extreme';
    modulationAmount: 'none' | 'subtle' | 'moderate' | 'heavy';
    ambience: 'dry' | 'subtle' | 'moderate' | 'lush' | 'ambient';
    complexity: 'minimal' | 'standard' | 'complex';
  };
}

export const GENRES: GenreProfile[] = [
  {
    id: 'blues',
    name: 'Blues',
    description: 'Warm, expressive tones with smooth overdrive and vocal-like sustain',
    icon: '🎸',
    color: '#3b82f6',
    artists: ['Stevie Ray Vaughan', 'B.B. King', 'John Mayer', 'Gary Clark Jr.'],
    recommendedCategories: ['gain', 'dynamics', 'delay', 'reverb', 'eq'],
    sectionTargets: {
      gain: { min: 3, ideal: 8, max: 12 },
      dynamics: { min: 4, ideal: 7, max: 10 },
      delay: { min: 2, ideal: 5, max: 8 },
      reverb: { min: 2, ideal: 5, max: 8 },
      eq: { min: 2, ideal: 5, max: 8 },
    },
    preferredSubtypes: ['Overdrive', 'Boost', 'Compressor', 'Wah', 'Analog', 'Spring', 'Parametric'],
    keywords: ['warm', 'smooth', 'bluesy', 'expressive', 'dynamic'],
    characteristics: {
      gainLevel: 'low',
      modulationAmount: 'subtle',
      ambience: 'subtle',
      complexity: 'minimal',
    },
  },
  {
    id: 'rock',
    name: 'Classic Rock',
    description: 'Punchy overdrive and distortion with classic tone shaping',
    icon: '🤘',
    color: '#ef4444',
    artists: ['Led Zeppelin', 'AC/DC', 'The Rolling Stones', 'Foo Fighters'],
    recommendedCategories: ['gain', 'modulation', 'delay', 'reverb', 'utility'],
    sectionTargets: {
      gain: { min: 8, ideal: 15, max: 20 },
      modulation: { min: 2, ideal: 5, max: 8 },
      delay: { min: 2, ideal: 5, max: 8 },
      reverb: { min: 2, ideal: 5, max: 8 },
      utility: { min: 2, ideal: 5, max: 10 },
    },
    preferredSubtypes: ['Overdrive', 'Distortion', 'Phaser', 'Chorus', 'Wah', 'Analog', 'Tape', 'Tuner', 'ABY'],
    keywords: ['classic', 'crunchy', 'punchy', 'rock', 'powerful'],
    characteristics: {
      gainLevel: 'medium',
      modulationAmount: 'moderate',
      ambience: 'moderate',
      complexity: 'standard',
    },
  },
  {
    id: 'metal',
    name: 'Metal',
    description: 'High-gain aggression with tight low end and cutting mids',
    icon: '🔥',
    color: '#1f2937',
    artists: ['Metallica', 'Slipknot', 'Gojira', 'Meshuggah'],
    recommendedCategories: ['gain', 'dynamics', 'eq', 'utility', 'amp'],
    sectionTargets: {
      gain: { min: 18, ideal: 25, max: 30 },
      dynamics: { min: 5, ideal: 8, max: 12 },
      eq: { min: 4, ideal: 7, max: 10 },
      utility: { min: 4, ideal: 8, max: 12 },
      amp: { min: 3, ideal: 6, max: 10 },
    },
    preferredSubtypes: ['Distortion', 'Boost', 'Gate', 'Compressor', 'Graphic', 'Parametric', 'Cab Sim', 'Amp Sim'],
    keywords: ['high-gain', 'metal', 'tight', 'aggressive', 'heavy'],
    characteristics: {
      gainLevel: 'extreme',
      modulationAmount: 'none',
      ambience: 'dry',
      complexity: 'standard',
    },
  },
  {
    id: 'indie',
    name: 'Alternative',
    description: 'Textured tones with creative modulation and spatial effects',
    icon: '🌙',
    color: '#8b5cf6',
    artists: ['Radiohead', 'Arctic Monkeys', 'Tame Impala', 'The Strokes'],
    recommendedCategories: ['gain', 'modulation', 'delay', 'reverb', 'utility'],
    sectionTargets: {
      gain: { min: 4, ideal: 10, max: 15 },
      modulation: { min: 5, ideal: 10, max: 15 },
      delay: { min: 5, ideal: 9, max: 13 },
      reverb: { min: 5, ideal: 9, max: 13 },
      utility: { min: 2, ideal: 5, max: 10 },
    },
    preferredSubtypes: ['Overdrive', 'Fuzz', 'Chorus', 'Tremolo', 'Phaser', 'Tape', 'Digital', 'Looper', 'ABY'],
    keywords: ['textured', 'creative', 'indie', 'alternative', 'dreamy'],
    characteristics: {
      gainLevel: 'low',
      modulationAmount: 'moderate',
      ambience: 'lush',
      complexity: 'standard',
    },
  },
  {
    id: 'shoegaze',
    name: 'Shoegaze',
    description: 'Walls of sound with heavy reverb, modulation, and dreamy textures',
    icon: '🌊',
    color: '#ec4899',
    artists: ['My Bloody Valentine', 'Slowdive', 'Ride', 'Nothing'],
    recommendedCategories: ['gain', 'modulation', 'delay', 'reverb', 'pitch'],
    sectionTargets: {
      gain: { min: 8, ideal: 16, max: 22 },
      modulation: { min: 10, ideal: 14, max: 15 },
      delay: { min: 8, ideal: 12, max: 15 },
      reverb: { min: 12, ideal: 15, max: 15 },
      pitch: { min: 3, ideal: 6, max: 10 },
    },
    preferredSubtypes: ['Fuzz', 'Distortion', 'Chorus', 'Flanger', 'Vibrato', 'Ambient', 'Multi', 'Shimmer', 'Octave', 'Shifter'],
    keywords: ['ambient', 'dreamy', 'lush', 'wall of sound', 'ethereal'],
    characteristics: {
      gainLevel: 'medium',
      modulationAmount: 'heavy',
      ambience: 'ambient',
      complexity: 'complex',
    },
  },
  {
    id: 'ambient',
    name: 'Ambient / Post-Rock',
    description: 'Expansive soundscapes with pristine delays and ethereal reverbs',
    icon: '✨',
    color: '#06b6d4',
    artists: ['Explosions in the Sky', 'Sigur Rós', 'Mogwai', 'Hammock'],
    recommendedCategories: ['modulation', 'delay', 'reverb', 'pitch', 'utility'],
    sectionTargets: {
      modulation: { min: 6, ideal: 10, max: 15 },
      delay: { min: 10, ideal: 14, max: 15 },
      reverb: { min: 12, ideal: 15, max: 15 },
      pitch: { min: 3, ideal: 6, max: 10 },
      utility: { min: 5, ideal: 10, max: 15 },
    },
    preferredSubtypes: ['Overdrive', 'Tremolo', 'Chorus', 'Tape', 'Multi', 'Ambient', 'Shimmer', 'Octave', 'Volume', 'Looper', 'ABY'],
    keywords: ['ambient', 'atmospheric', 'ethereal', 'expansive', 'cinematic'],
    characteristics: {
      gainLevel: 'low',
      modulationAmount: 'moderate',
      ambience: 'ambient',
      complexity: 'complex',
    },
  },
  {
    id: 'country',
    name: 'Country',
    description: 'Clean, compressed tones with twangy character and subtle effects',
    icon: '🤠',
    color: '#f59e0b',
    artists: ['Brad Paisley', 'Keith Urban', 'Brent Mason', 'Vince Gill'],
    recommendedCategories: ['gain', 'dynamics', 'delay', 'reverb', 'volume'],
    sectionTargets: {
      gain: { min: 2, ideal: 5, max: 8 },
      dynamics: { min: 6, ideal: 10, max: 15 },
      delay: { min: 3, ideal: 6, max: 9 },
      reverb: { min: 2, ideal: 5, max: 8 },
      volume: { min: 5, ideal: 8, max: 10 },
    },
    preferredSubtypes: ['Compressor', 'Boost', 'Overdrive', 'Analog', 'Digital', 'Spring', 'Volume', 'Expression'],
    keywords: ['twang', 'chicken', 'clean', 'compressed', 'country'],
    characteristics: {
      gainLevel: 'clean',
      modulationAmount: 'subtle',
      ambience: 'subtle',
      complexity: 'minimal',
    },
  },
  {
    id: 'jazz',
    name: 'Jazz',
    description: 'Clean, warm tones with minimal effects and maximum expression',
    icon: '🎷',
    color: '#6366f1',
    artists: ['Pat Metheny', 'John Scofield', 'Julian Lage', 'Kurt Rosenwinkel'],
    recommendedCategories: ['gain', 'dynamics', 'reverb', 'eq', 'volume'],
    sectionTargets: {
      gain: { min: 0, ideal: 3, max: 6 },
      dynamics: { min: 3, ideal: 6, max: 10 },
      reverb: { min: 2, ideal: 5, max: 8 },
      eq: { min: 3, ideal: 6, max: 10 },
      volume: { min: 3, ideal: 6, max: 10 },
    },
    preferredSubtypes: ['Boost', 'Compressor', 'Chorus', 'Parametric', 'Spring', 'Volume', 'Expression'],
    keywords: ['warm', 'clean', 'jazz', 'smooth', 'articulate'],
    characteristics: {
      gainLevel: 'clean',
      modulationAmount: 'subtle',
      ambience: 'subtle',
      complexity: 'minimal',
    },
  },
  {
    id: 'funk',
    name: 'Funk / R&B',
    description: 'Dynamic, expressive tones with envelope filters and funky wahs',
    icon: '🕺',
    color: '#10b981',
    artists: ['Nile Rodgers', 'Prince', 'Cory Wong', 'John Mayer'],
    recommendedCategories: ['dynamics', 'filter', 'modulation', 'gain', 'utility'],
    sectionTargets: {
      dynamics: { min: 5, ideal: 9, max: 15 },
      filter: { min: 5, ideal: 8, max: 10 },
      modulation: { min: 3, ideal: 6, max: 10 },
      gain: { min: 2, ideal: 6, max: 10 },
      utility: { min: 2, ideal: 5, max: 10 },
    },
    preferredSubtypes: ['Compressor', 'Wah', 'Envelope', 'Auto-Wah', 'Phaser', 'Chorus', 'Overdrive', 'Boost', 'Tuner', 'ABY'],
    keywords: ['funky', 'quack', 'dynamic', 'groove', 'envelope'],
    characteristics: {
      gainLevel: 'clean',
      modulationAmount: 'moderate',
      ambience: 'dry',
      complexity: 'standard',
    },
  },
  {
    id: 'prog',
    name: 'Progressive',
    description: 'Versatile rig for complex compositions with diverse tonal palette',
    icon: '🎹',
    color: '#7c3aed',
    artists: ['Dream Theater', 'Tool', 'Porcupine Tree', 'Animals as Leaders'],
    recommendedCategories: ['gain', 'modulation', 'delay', 'pitch', 'utility'],
    sectionTargets: {
      gain: { min: 10, ideal: 18, max: 25 },
      modulation: { min: 6, ideal: 12, max: 15 },
      delay: { min: 8, ideal: 12, max: 15 },
      pitch: { min: 5, ideal: 8, max: 10 },
      utility: { min: 6, ideal: 12, max: 15 },
    },
    preferredSubtypes: ['Overdrive', 'Distortion', 'Boost', 'Multi', 'Chorus', 'Phaser', 'Harmonizer', 'Shifter', 'Whammy', 'Loop Switcher', 'Looper'],
    keywords: ['versatile', 'complex', 'progressive', 'technical', 'dynamic'],
    characteristics: {
      gainLevel: 'high',
      modulationAmount: 'heavy',
      ambience: 'moderate',
      complexity: 'complex',
    },
  },
  {
    id: 'worship',
    name: 'Worship / CCM',
    description: 'Lush ambient tones with shimmer, swells, and textured delays',
    icon: '🙏',
    color: '#0ea5e9',
    artists: ['Lincoln Brewster', 'The War on Drugs', 'Hillsong', 'Bethel'],
    recommendedCategories: ['gain', 'modulation', 'delay', 'reverb', 'volume'],
    sectionTargets: {
      gain: { min: 4, ideal: 10, max: 15 },
      modulation: { min: 5, ideal: 9, max: 13 },
      delay: { min: 8, ideal: 12, max: 15 },
      reverb: { min: 10, ideal: 14, max: 15 },
      volume: { min: 5, ideal: 8, max: 10 },
    },
    preferredSubtypes: ['Overdrive', 'Boost', 'Tremolo', 'Chorus', 'Tape', 'Multi', 'Ambient', 'Shimmer', 'Volume', 'Expression'],
    keywords: ['shimmer', 'ambient', 'lush', 'swell', 'worship'],
    characteristics: {
      gainLevel: 'low',
      modulationAmount: 'moderate',
      ambience: 'ambient',
      complexity: 'standard',
    },
  },
  {
    id: 'experimental',
    name: 'Experimental / Noise',
    description: 'Unconventional sounds with synthesis, glitch, and sonic exploration',
    icon: '🔮',
    color: '#f43f5e',
    artists: ['Sonic Youth', 'Nine Inch Nails', 'St. Vincent', 'Battles'],
    recommendedCategories: ['gain', 'pitch', 'filter', 'modulation', 'utility'],
    sectionTargets: {
      gain: { min: 8, ideal: 18, max: 28 },
      pitch: { min: 5, ideal: 9, max: 10 },
      filter: { min: 4, ideal: 7, max: 10 },
      modulation: { min: 8, ideal: 13, max: 15 },
      utility: { min: 6, ideal: 10, max: 15 },
    },
    preferredSubtypes: ['Fuzz', 'Distortion', 'Synth', 'Fuzz/Synth', 'Shifter', 'Whammy', 'Harmonizer', 'Wah', 'Envelope', 'Special', 'Glitch', 'Looper', 'ABY'],
    keywords: ['experimental', 'noise', 'synth', 'glitch', 'weird', 'unconventional'],
    characteristics: {
      gainLevel: 'high',
      modulationAmount: 'heavy',
      ambience: 'moderate',
      complexity: 'complex',
    },
  },
  {
    id: 'pop',
    name: 'Pop',
    description: 'Polished, radio-ready tones with clean clarity and subtle enhancement',
    icon: '🎤',
    color: '#f472b6',
    artists: ['John Mayer', 'Ed Sheeran', 'Taylor Swift', 'Harry Styles'],
    recommendedCategories: ['gain', 'modulation', 'dynamics', 'delay', 'reverb'],
    sectionTargets: {
      gain: { min: 2, ideal: 5, max: 8 },
      modulation: { min: 3, ideal: 6, max: 10 },
      dynamics: { min: 5, ideal: 8, max: 12 },
      delay: { min: 3, ideal: 6, max: 9 },
      reverb: { min: 4, ideal: 7, max: 10 },
    },
    preferredSubtypes: ['Overdrive', 'Boost', 'Chorus', 'Compressor', 'Digital', 'Plate', 'Hall', 'Room'],
    keywords: ['polished', 'clean', 'radio', 'pop', 'bright', 'clear'],
    characteristics: {
      gainLevel: 'clean',
      modulationAmount: 'subtle',
      ambience: 'moderate',
      complexity: 'minimal',
    },
  },
  {
    id: 'lofi',
    name: 'Lo-Fi',
    description: 'Warm, degraded tones with tape character and vintage imperfections',
    icon: '📼',
    color: '#a78bfa',
    artists: ['Mac DeMarco', 'Clairo', 'Boy Pablo', 'Men I Trust'],
    recommendedCategories: ['modulation', 'delay', 'reverb', 'dynamics'],
    sectionTargets: {
      modulation: { min: 5, ideal: 9, max: 13 },
      delay: { min: 4, ideal: 8, max: 12 },
      reverb: { min: 4, ideal: 8, max: 12 },
      dynamics: { min: 4, ideal: 7, max: 10 },
    },
    preferredSubtypes: ['Vibrato', 'Chorus', 'Tape', 'Analog', 'Lo-Fi', 'Compressor', 'Spring', 'Room'],
    keywords: ['lofi', 'tape', 'warm', 'vintage', 'wobbly', 'degraded', 'cassette'],
    characteristics: {
      gainLevel: 'clean',
      modulationAmount: 'moderate',
      ambience: 'moderate',
      complexity: 'standard',
    },
  },
  {
    id: 'singer-songwriter',
    name: 'Singer-Songwriter',
    description: 'Intimate, acoustic-friendly tones that support vocals without overpowering',
    icon: '🎵',
    color: '#fbbf24',
    artists: ['James Taylor', 'Joni Mitchell', 'Iron & Wine', 'Phoebe Bridgers'],
    recommendedCategories: ['dynamics', 'reverb', 'delay', 'modulation'],
    sectionTargets: {
      dynamics: { min: 4, ideal: 7, max: 10 },
      reverb: { min: 3, ideal: 6, max: 9 },
      delay: { min: 2, ideal: 5, max: 8 },
      modulation: { min: 2, ideal: 4, max: 7 },
    },
    preferredSubtypes: ['Compressor', 'Plate', 'Room', 'Analog', 'Chorus', 'Tremolo', 'Boost'],
    keywords: ['acoustic', 'intimate', 'warm', 'subtle', 'songwriter', 'gentle'],
    characteristics: {
      gainLevel: 'clean',
      modulationAmount: 'subtle',
      ambience: 'subtle',
      complexity: 'minimal',
    },
  },
  {
    id: 'indie-rock',
    name: 'Indie Rock',
    description: 'Raw, character-driven tones with creative effects and multiple gain stages',
    icon: '🎸',
    color: '#fb923c',
    artists: ['The National', 'Interpol', 'Spoon', 'Vampire Weekend'],
    recommendedCategories: ['gain', 'modulation', 'delay', 'reverb'],
    sectionTargets: {
      gain: { min: 6, ideal: 12, max: 18 },
      modulation: { min: 4, ideal: 8, max: 12 },
      delay: { min: 4, ideal: 8, max: 12 },
      reverb: { min: 4, ideal: 7, max: 11 },
    },
    preferredSubtypes: ['Overdrive', 'Distortion', 'Fuzz', 'Chorus', 'Phaser', 'Vibrato', 'Tape', 'Analog', 'Digital'],
    keywords: ['indie', 'raw', 'character', 'creative', 'textured', 'organic'],
    characteristics: {
      gainLevel: 'medium',
      modulationAmount: 'moderate',
      ambience: 'moderate',
      complexity: 'standard',
    },
  },
];

export function getGenreById(id: string): GenreProfile | undefined {
  return GENRES.find(g => g.id === id);
}

export function calculateGenreFit(
  genre: GenreProfile,
  sectionScores: { category: Category; totalScore: number }[]
): number {
  let totalFit = 0;
  let targetCount = 0;

  for (const [category, target] of Object.entries(genre.sectionTargets)) {
    const score = sectionScores.find(s => s.category === category);
    const currentScore = score?.totalScore || 0;

    if (target) {
      targetCount++;
      // Calculate how close we are to ideal
      if (currentScore >= target.min && currentScore <= target.max) {
        // Within acceptable range
        const distanceFromIdeal = Math.abs(currentScore - target.ideal);
        const maxDistance = Math.max(target.ideal - target.min, target.max - target.ideal);
        const fitPercent = 1 - (distanceFromIdeal / maxDistance) * 0.5; // 50-100% if in range
        totalFit += fitPercent;
      } else if (currentScore < target.min) {
        // Below minimum
        totalFit += Math.max(0, currentScore / target.min) * 0.5; // 0-50%
      } else {
        // Above maximum - still give some credit
        totalFit += 0.3;
      }
    }
  }

  return targetCount > 0 ? (totalFit / targetCount) * 100 : 0;
}
