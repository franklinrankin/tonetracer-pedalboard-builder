import { Category } from '../types';

export interface GenreProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  artists: string[];
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
    sectionTargets: {
      gain: { min: 3, ideal: 8, max: 12 },
      dynamics: { min: 4, ideal: 7, max: 10 },
      reverb: { min: 2, ideal: 5, max: 8 },
      modulation: { min: 0, ideal: 3, max: 6 },
    },
    preferredSubtypes: ['Overdrive', 'Boost', 'Compressor', 'Wah'],
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
    sectionTargets: {
      gain: { min: 8, ideal: 15, max: 20 },
      modulation: { min: 2, ideal: 5, max: 8 },
      delay: { min: 2, ideal: 5, max: 8 },
      reverb: { min: 2, ideal: 5, max: 8 },
    },
    preferredSubtypes: ['Overdrive', 'Distortion', 'Phaser', 'Chorus', 'Wah'],
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
    sectionTargets: {
      gain: { min: 18, ideal: 25, max: 30 },
      dynamics: { min: 5, ideal: 8, max: 12 },
      eq: { min: 4, ideal: 7, max: 10 },
      volume: { min: 5, ideal: 8, max: 10 },
    },
    preferredSubtypes: ['Distortion', 'Boost', 'Gate', 'Compressor', 'Graphic'],
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
    name: 'Indie / Alternative',
    description: 'Textured tones with creative modulation and spatial effects',
    icon: '🌙',
    color: '#8b5cf6',
    artists: ['Radiohead', 'Arctic Monkeys', 'Tame Impala', 'The Strokes'],
    sectionTargets: {
      gain: { min: 4, ideal: 10, max: 15 },
      modulation: { min: 5, ideal: 10, max: 15 },
      delay: { min: 5, ideal: 9, max: 13 },
      reverb: { min: 5, ideal: 9, max: 13 },
    },
    preferredSubtypes: ['Overdrive', 'Chorus', 'Tremolo', 'Tape', 'Digital'],
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
    sectionTargets: {
      gain: { min: 8, ideal: 16, max: 22 },
      modulation: { min: 10, ideal: 14, max: 15 },
      delay: { min: 8, ideal: 12, max: 15 },
      reverb: { min: 12, ideal: 15, max: 15 },
    },
    preferredSubtypes: ['Fuzz', 'Distortion', 'Chorus', 'Flanger', 'Ambient', 'Multi'],
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
    sectionTargets: {
      gain: { min: 2, ideal: 6, max: 12 },
      modulation: { min: 6, ideal: 10, max: 15 },
      delay: { min: 10, ideal: 14, max: 15 },
      reverb: { min: 12, ideal: 15, max: 15 },
      volume: { min: 5, ideal: 8, max: 10 },
    },
    preferredSubtypes: ['Overdrive', 'Tremolo', 'Tape', 'Multi', 'Ambient', 'Volume', 'Looper'],
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
    sectionTargets: {
      gain: { min: 2, ideal: 5, max: 8 },
      dynamics: { min: 6, ideal: 10, max: 15 },
      delay: { min: 3, ideal: 6, max: 9 },
      reverb: { min: 2, ideal: 5, max: 8 },
    },
    preferredSubtypes: ['Compressor', 'Boost', 'Overdrive', 'Analog', 'Digital'],
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
    sectionTargets: {
      gain: { min: 0, ideal: 3, max: 6 },
      dynamics: { min: 3, ideal: 6, max: 10 },
      reverb: { min: 2, ideal: 5, max: 8 },
      eq: { min: 3, ideal: 6, max: 10 },
    },
    preferredSubtypes: ['Boost', 'Compressor', 'Chorus', 'Parametric'],
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
    sectionTargets: {
      gain: { min: 2, ideal: 6, max: 10 },
      filter: { min: 5, ideal: 8, max: 10 },
      dynamics: { min: 5, ideal: 9, max: 15 },
      modulation: { min: 3, ideal: 6, max: 10 },
    },
    preferredSubtypes: ['Compressor', 'Wah', 'Envelope', 'Auto-Wah', 'Phaser', 'Chorus'],
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
    sectionTargets: {
      gain: { min: 10, ideal: 18, max: 25 },
      modulation: { min: 6, ideal: 12, max: 15 },
      delay: { min: 8, ideal: 12, max: 15 },
      pitch: { min: 5, ideal: 8, max: 10 },
      utility: { min: 6, ideal: 12, max: 15 },
    },
    preferredSubtypes: ['Overdrive', 'Distortion', 'Multi', 'Harmonizer', 'Shifter', 'Loop Switcher'],
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
    sectionTargets: {
      gain: { min: 4, ideal: 10, max: 15 },
      modulation: { min: 5, ideal: 9, max: 13 },
      delay: { min: 8, ideal: 12, max: 15 },
      reverb: { min: 10, ideal: 14, max: 15 },
      volume: { min: 5, ideal: 8, max: 10 },
    },
    preferredSubtypes: ['Overdrive', 'Tremolo', 'Tape', 'Multi', 'Ambient', 'Volume'],
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
    sectionTargets: {
      gain: { min: 8, ideal: 18, max: 28 },
      synth: { min: 6, ideal: 10, max: 10 },
      pitch: { min: 5, ideal: 9, max: 10 },
      modulation: { min: 8, ideal: 13, max: 15 },
      delay: { min: 6, ideal: 11, max: 15 },
    },
    preferredSubtypes: ['Fuzz', 'Synth', 'Fuzz/Synth', 'Shifter', 'Whammy', 'Special', 'Glitch'],
    keywords: ['experimental', 'noise', 'synth', 'glitch', 'weird', 'unconventional'],
    characteristics: {
      gainLevel: 'high',
      modulationAmount: 'heavy',
      ambience: 'moderate',
      complexity: 'complex',
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

