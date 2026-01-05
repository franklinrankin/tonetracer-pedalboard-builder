import { Category } from '../types';

export interface GenreProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconImage?: string; // Optional image URL to use instead of emoji
  iconImagePosition?: string; // Optional CSS background-position (e.g., 'top', 'center', '50% 30%')
  iconImageSize?: string; // Optional CSS background-size (e.g., 'cover', 'contain', '150%')
  color: string;
  artists: string[];
  // Essential categories - ONE of each should be filled first, in priority order
  // These define the "core sound" of the genre
  essentialCategories: Category[];
  // Extra categories - added after essentials are filled (for larger boards)
  // Can include duplicates like a second gain pedal
  extraCategories: Category[];
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
    iconImage: '/images/genres/blues.jpg',
    color: '#3b82f6',
    artists: ['Stevie Ray Vaughan', 'B.B. King', 'John Mayer', 'Gary Clark Jr.'],
    // Core blues: drive for tone, dynamics for feel, delay/reverb for space
    essentialCategories: ['gain', 'dynamics', 'delay', 'reverb'],
    // Extras: second gain (boost), EQ for tone shaping
    extraCategories: ['gain', 'eq'],
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
    iconImage: '/images/genres/classic-rock.jpg',
    color: '#ef4444',
    artists: ['Led Zeppelin', 'AC/DC', 'The Rolling Stones', 'Foo Fighters'],
    // Core rock: drive is king, modulation for color, delay/reverb for depth
    essentialCategories: ['gain', 'modulation', 'delay', 'reverb'],
    // Extras: second gain for stacking/boost
    extraCategories: ['gain'],
    sectionTargets: {
      gain: { min: 8, ideal: 15, max: 20 },
      modulation: { min: 2, ideal: 5, max: 8 },
      delay: { min: 2, ideal: 5, max: 8 },
      reverb: { min: 2, ideal: 5, max: 8 },
    },
    preferredSubtypes: ['Overdrive', 'Distortion', 'Phaser', 'Chorus', 'Wah', 'Analog', 'Tape'],
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
    iconImage: '/images/genres/metal.jpg',
    color: '#1f2937',
    artists: ['Metallica', 'Slipknot', 'Gojira', 'Meshuggah'],
    // Core metal: high gain distortion, noise gate, EQ for tight sound
    essentialCategories: ['gain', 'dynamics', 'eq'],
    // Extras: boost for leads, delay for atmosphere
    extraCategories: ['gain', 'delay'],
    sectionTargets: {
      gain: { min: 18, ideal: 25, max: 30 },
      dynamics: { min: 5, ideal: 8, max: 12 },
      eq: { min: 4, ideal: 7, max: 10 },
    },
    preferredSubtypes: ['Distortion', 'Boost', 'Gate', 'Compressor', 'Graphic', 'Parametric'],
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
    iconImage: '/images/genres/alternative.jpg',
    color: '#8b5cf6',
    artists: ['Radiohead', 'Arctic Monkeys', 'Tame Impala', 'The Strokes'],
    // Core alt: drive for grit, mod for texture, delay/reverb for atmosphere
    essentialCategories: ['gain', 'modulation', 'delay', 'reverb'],
    // Extras: fuzz or second drive
    extraCategories: ['gain'],
    sectionTargets: {
      gain: { min: 4, ideal: 10, max: 15 },
      modulation: { min: 5, ideal: 10, max: 15 },
      delay: { min: 5, ideal: 9, max: 13 },
      reverb: { min: 5, ideal: 9, max: 13 },
    },
    preferredSubtypes: ['Overdrive', 'Fuzz', 'Chorus', 'Tremolo', 'Phaser', 'Tape', 'Digital', 'Looper'],
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
    iconImage: '/images/genres/shoegaze.jpg',
    color: '#ec4899',
    artists: ['My Bloody Valentine', 'Slowdive', 'Ride', 'Nothing'],
    // Core shoegaze: fuzz, heavy mod, massive reverb, delay for wash
    essentialCategories: ['gain', 'modulation', 'reverb', 'delay'],
    // Extras: pitch for shimmer/octave, more modulation
    extraCategories: ['pitch', 'modulation'],
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
    iconImage: '/images/genres/ambient.jpg',
    color: '#06b6d4',
    artists: ['Explosions in the Sky', 'Sigur Rós', 'Mogwai', 'Hammock'],
    // Core ambient: reverb is KING, delay for texture, mod for movement, light gain
    essentialCategories: ['reverb', 'delay', 'modulation', 'gain'],
    // Extras: volume for swells, pitch for shimmer
    extraCategories: ['volume', 'pitch'],
    sectionTargets: {
      gain: { min: 2, ideal: 4, max: 8 },
      modulation: { min: 6, ideal: 10, max: 15 },
      delay: { min: 10, ideal: 14, max: 15 },
      reverb: { min: 12, ideal: 15, max: 15 },
      pitch: { min: 3, ideal: 6, max: 10 },
      volume: { min: 5, ideal: 10, max: 10 },
    },
    preferredSubtypes: ['Boost', 'Overdrive', 'Tremolo', 'Chorus', 'Tape', 'Multi', 'Ambient', 'Shimmer', 'Octave', 'Volume', 'Looper'],
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
    iconImage: '/images/genres/country.jpg',
    color: '#f59e0b',
    artists: ['Brad Paisley', 'Keith Urban', 'Brent Mason', 'Vince Gill'],
    // Core country: compressor is essential, light drive, delay for slapback, reverb
    essentialCategories: ['dynamics', 'gain', 'delay', 'reverb'],
    // Extras: volume pedal for swells
    extraCategories: ['volume'],
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
    iconImage: '/images/genres/jazz.jpg',
    color: '#6366f1',
    artists: ['Pat Metheny', 'John Scofield', 'Julian Lage', 'Kurt Rosenwinkel'],
    // Core jazz: dynamics for touch, reverb for room, EQ for tone, subtle mod
    essentialCategories: ['dynamics', 'reverb', 'eq', 'modulation'],
    // Extras: light boost, volume pedal
    extraCategories: ['gain', 'volume'],
    sectionTargets: {
      gain: { min: 0, ideal: 3, max: 6 },
      dynamics: { min: 3, ideal: 6, max: 10 },
      modulation: { min: 2, ideal: 4, max: 7 },
      reverb: { min: 2, ideal: 5, max: 8 },
      eq: { min: 3, ideal: 6, max: 10 },
      volume: { min: 3, ideal: 6, max: 10 },
    },
    preferredSubtypes: ['Boost', 'Compressor', 'Chorus', 'Vibrato', 'Parametric', 'Spring', 'Volume', 'Expression'],
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
    iconImage: '/images/genres/funk.jpg',
    color: '#10b981',
    artists: ['Nile Rodgers', 'Prince', 'Cory Wong', 'John Mayer'],
    // Core funk: compressor for snap, wah/envelope for quack, phaser, light drive
    essentialCategories: ['dynamics', 'filter', 'modulation', 'gain'],
    // Extras: none typically needed
    extraCategories: [],
    sectionTargets: {
      dynamics: { min: 5, ideal: 9, max: 15 },
      filter: { min: 5, ideal: 8, max: 10 },
      modulation: { min: 3, ideal: 6, max: 10 },
      gain: { min: 2, ideal: 6, max: 10 },
    },
    preferredSubtypes: ['Compressor', 'Wah', 'Envelope', 'Auto-Wah', 'Phaser', 'Chorus', 'Overdrive', 'Boost'],
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
    iconImage: '/images/genres/progressive.jpg',
    iconImagePosition: '50% 25%', // Move crop up
    color: '#7c3aed',
    artists: ['Dream Theater', 'Tool', 'Porcupine Tree', 'Animals as Leaders'],
    // Core prog: versatile gain, modulation, delay, pitch effects
    essentialCategories: ['gain', 'modulation', 'delay', 'pitch'],
    // Extras: additional gain, more modulation
    extraCategories: ['gain', 'modulation'],
    sectionTargets: {
      gain: { min: 10, ideal: 18, max: 25 },
      modulation: { min: 6, ideal: 12, max: 15 },
      delay: { min: 8, ideal: 12, max: 15 },
      pitch: { min: 5, ideal: 8, max: 10 },
    },
    preferredSubtypes: ['Overdrive', 'Distortion', 'Boost', 'Multi', 'Chorus', 'Phaser', 'Harmonizer', 'Shifter', 'Whammy', 'Looper'],
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
    iconImage: '/images/genres/worship.jpg',
    color: '#0ea5e9',
    artists: ['Lincoln Brewster', 'The War on Drugs', 'Hillsong', 'Bethel'],
    // Core worship: reverb for wash, delay for texture, mod for shimmer, drive
    essentialCategories: ['reverb', 'delay', 'modulation', 'gain'],
    // Extras: volume for swells
    extraCategories: ['volume'],
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
    iconImage: '/images/genres/noise.jpg',
    color: '#f43f5e',
    artists: ['Sonic Youth', 'Nine Inch Nails', 'St. Vincent', 'Battles'],
    // Core experimental: fuzz, pitch shifter, filter, wild modulation
    essentialCategories: ['gain', 'pitch', 'filter', 'modulation'],
    // Extras: synth pedals, more chaos
    extraCategories: ['synth', 'gain'],
    sectionTargets: {
      gain: { min: 8, ideal: 18, max: 28 },
      pitch: { min: 5, ideal: 9, max: 10 },
      filter: { min: 4, ideal: 7, max: 10 },
      modulation: { min: 8, ideal: 13, max: 15 },
      synth: { min: 4, ideal: 8, max: 10 },
    },
    preferredSubtypes: ['Fuzz', 'Distortion', 'Synth', 'Fuzz/Synth', 'Shifter', 'Whammy', 'Harmonizer', 'Wah', 'Envelope', 'Special', 'Glitch', 'Looper'],
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
    iconImage: '/images/genres/pop.jpg',
    iconImagePosition: '50% 75%',
    iconImageSize: '180%',
    color: '#f472b6',
    artists: ['John Mayer', 'Ed Sheeran', 'Taylor Swift', 'Harry Styles'],
    // Core pop: compressor for polish, light drive, subtle mod, reverb for space
    essentialCategories: ['dynamics', 'gain', 'modulation', 'reverb'],
    // Extras: delay for depth
    extraCategories: ['delay'],
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
    iconImage: '/images/genres/lo-fi.jpg',
    color: '#a78bfa',
    artists: ['Mac DeMarco', 'Clairo', 'Boy Pablo', 'Men I Trust'],
    // Core lo-fi: vibrato/chorus for wobble, tape delay, warm reverb, light drive
    essentialCategories: ['modulation', 'delay', 'reverb', 'gain'],
    // Extras: compression
    extraCategories: ['dynamics'],
    sectionTargets: {
      gain: { min: 2, ideal: 5, max: 9 },
      modulation: { min: 5, ideal: 9, max: 13 },
      delay: { min: 4, ideal: 8, max: 12 },
      reverb: { min: 4, ideal: 8, max: 12 },
      dynamics: { min: 4, ideal: 7, max: 10 },
    },
    preferredSubtypes: ['Overdrive', 'Boost', 'Preamp', 'Vibrato', 'Chorus', 'Tape', 'Analog', 'Lo-Fi', 'Compressor', 'Spring', 'Room'],
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
    iconImage: '/images/genres/singer-songwriter.jpg',
    iconImagePosition: '30% 25%', // Show faces higher up and to the left
    color: '#fbbf24',
    artists: ['James Taylor', 'Joni Mitchell', 'Iron & Wine', 'Phoebe Bridgers'],
    // Core singer-songwriter: compression, reverb, subtle delay, light modulation
    essentialCategories: ['dynamics', 'reverb', 'delay', 'modulation'],
    // Extras: none typically needed
    extraCategories: [],
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
    iconImage: '/images/genres/indie-rock.jpg',
    color: '#fb923c',
    artists: ['The National', 'Interpol', 'Spoon', 'Vampire Weekend'],
    // Core indie rock: drive for grit, modulation for character, delay/reverb for space
    essentialCategories: ['gain', 'modulation', 'delay', 'reverb'],
    // Extras: second gain for stacking
    extraCategories: ['gain'],
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

export interface GenreMatchReason {
  category: Category;
  reason: string;
  strength: 'strong' | 'moderate' | 'weak';
}

export interface GenreMatch {
  genre: GenreProfile;
  fitPercent: number;
  reasons: GenreMatchReason[];
  summary: string;
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

// Get detailed genre matches with explanations
export function getTopGenreMatches(
  sectionScores: { category: Category; totalScore: number }[],
  topN: number = 3
): GenreMatch[] {
  const matches: GenreMatch[] = [];

  for (const genre of GENRES) {
    const reasons: GenreMatchReason[] = [];
    let totalFit = 0;
    let targetCount = 0;

    for (const [category, target] of Object.entries(genre.sectionTargets)) {
      const score = sectionScores.find(s => s.category === category as Category);
      const currentScore = score?.totalScore || 0;

      if (target) {
        targetCount++;
        
        // Calculate fit and generate reason
        if (currentScore >= target.min && currentScore <= target.max) {
          const distanceFromIdeal = Math.abs(currentScore - target.ideal);
          const maxDistance = Math.max(target.ideal - target.min, target.max - target.ideal);
          const fitPercent = 1 - (distanceFromIdeal / maxDistance) * 0.5;
          totalFit += fitPercent;

          // Generate reason based on how close to ideal
          if (distanceFromIdeal <= maxDistance * 0.3) {
            reasons.push({
              category: category as Category,
              reason: `Your ${category} level (${currentScore}) is spot-on for ${genre.name}`,
              strength: 'strong',
            });
          } else {
            reasons.push({
              category: category as Category,
              reason: `Your ${category} level works well for ${genre.name}`,
              strength: 'moderate',
            });
          }
        } else if (currentScore < target.min && currentScore > 0) {
          totalFit += Math.max(0, currentScore / target.min) * 0.5;
          reasons.push({
            category: category as Category,
            reason: `A bit more ${category} would be typical for ${genre.name}`,
            strength: 'weak',
          });
        } else if (currentScore > target.max) {
          totalFit += 0.3;
          reasons.push({
            category: category as Category,
            reason: `More ${category} than typical ${genre.name}, but can still work`,
            strength: 'weak',
          });
        }
      }
    }

    const fitPercent = targetCount > 0 ? (totalFit / targetCount) * 100 : 0;
    
    // Only include if there's a reasonable fit
    if (fitPercent > 30) {
      // Generate summary
      const strongReasons = reasons.filter(r => r.strength === 'strong');
      let summary = '';
      
      if (fitPercent >= 80) {
        summary = `Perfect match! Your board has classic ${genre.name} DNA.`;
      } else if (fitPercent >= 60) {
        summary = `Strong fit. Your tones lean ${genre.name} with room for exploration.`;
      } else if (fitPercent >= 45) {
        summary = `Decent match. You share some ${genre.name} sensibilities.`;
      } else {
        summary = `Some overlap with ${genre.name} tones.`;
      }

      if (strongReasons.length > 0) {
        const cats = strongReasons.slice(0, 2).map(r => r.category).join(' and ');
        summary += ` Your ${cats} choices nail it.`;
      }

      matches.push({
        genre,
        fitPercent,
        reasons: reasons.filter(r => r.strength !== 'weak' || reasons.length <= 3).slice(0, 4),
        summary,
      });
    }
  }

  // Sort by fit and return top N
  return matches
    .sort((a, b) => b.fitPercent - a.fitPercent)
    .slice(0, topN);
}
