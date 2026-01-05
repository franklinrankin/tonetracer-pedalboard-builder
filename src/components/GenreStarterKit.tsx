import { useState, useRef, useMemo } from 'react';
import { GraduationCap, Plus, ChevronLeft, ChevronRight, Lightbulb, Info, Check, SkipForward, PartyPopper, Sparkles, ArrowUpDown, RefreshCw } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { getGenreById, GenreProfile } from '../data/genres';
import { getPedalEducation } from '../data/pedalEducation';
import { CATEGORY_INFO } from '../data/categories';
import { PedalWithStatus, Category } from '../types';
import { formatInches } from '../utils/measurements';
import { PedalImage } from './PedalImage';
import { estimatePedalCapacity, getRecommendedEssentialCount, getRecommendedBonusCount } from '../data/boardTemplates';
import { getYouTubeReviewUrl } from '../utils/youtube';

// Fisher-Yates shuffle for variety in recommendations
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Shuffle among "good enough" pedals - groups by score tier then shuffles within tiers
function shuffleByTier<T extends { score: number }>(items: T[]): T[] {
  if (items.length <= 1) return items;
  
  // Group by score (rounded to create tiers)
  const tiers = new Map<number, T[]>();
  items.forEach(item => {
    // Create tiers of 2 points each (scores 9-10, 7-8, 5-6, etc.)
    const tier = Math.floor(item.score / 2);
    if (!tiers.has(tier)) tiers.set(tier, []);
    tiers.get(tier)!.push(item);
  });
  
  // Shuffle within each tier, then flatten in tier order (highest first)
  const sortedTiers = [...tiers.entries()].sort((a, b) => b[0] - a[0]);
  return sortedTiers.flatMap(([, tierItems]) => shuffleArray(tierItems));
}

type SortOption = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating-asc' | 'rating-desc' | 'size-asc' | 'size-desc';

type PriceRange = 'all' | 'budget' | 'mid' | 'premium' | 'luxury';

const PRICE_RANGES: Record<PriceRange, { label: string; min: number; max: number }> = {
  all: { label: 'All Prices', min: 0, max: Infinity },
  budget: { label: 'Budget ($0-75)', min: 0, max: 75 },
  mid: { label: 'Mid ($75-150)', min: 75, max: 150 },
  premium: { label: 'Premium ($150-300)', min: 150, max: 300 },
  luxury: { label: 'Luxury ($300+)', min: 300, max: Infinity },
};

interface StarterKitStep {
  id: string;
  name: string;
  description: string;
  category?: Category;
  subtype?: string;
  pedals: PedalWithStatus[];
  education?: {
    whatItDoes: string;
    beginnerTip: string;
  };
}

interface BonusAddition {
  id: string;
  name: string;
  reason: string;
  category?: Category;
  subtype?: string;
  pedals: PedalWithStatus[];
}

interface GenreStarterKitProps {
  onFinishUp?: () => void;
}

// Genre-specific bonus additions logic
function getGenreBonusAdditions(
  genre: GenreProfile,
  allPedals: PedalWithStatus[],
  onBoardIds: Set<string>,
  onBoardSubtypes: Set<string | undefined>,
  budget: number = 500,
  priceRangeFilter: PriceRange = 'all',
  explorationLevel: number = 0
): BonusAddition[] {
  const additions: BonusAddition[] = [];
  
  // Get price range config
  const priceRangeConfig = PRICE_RANGES[priceRangeFilter];
  
  // Exploration config - higher levels = more lenient scoring
  const exploration = EXPLORATION_LEVELS[explorationLevel] || EXPLORATION_LEVELS[0];
  
  // Genre-aware sorting helper with variety - shuffles among similar-scoring pedals
  // Exploration level affects how strictly we score for genre fit
  const sortByGenreFit = (pedals: PedalWithStatus[], category?: Category) => {
    const categoryTarget = category ? genre.sectionTargets[category] : null;
    const idealRating = categoryTarget ? Math.min(categoryTarget.ideal, 10) : 5;
    
    // Score each pedal - exploration level makes scoring more lenient
    const scored = pedals.map(pedal => {
      // Base rating score - with exploration tolerance
      const ratingDiff = Math.abs(pedal.categoryRating - idealRating);
      // Higher exploration = less penalty for being far from ideal
      const ratingScore = 10 - Math.max(0, ratingDiff - exploration.ratingTolerance);
      
      // Bonus for preferred subtypes (less important at higher exploration)
      const subtypeBonus = genre.preferredSubtypes.includes(pedal.subtype || '') 
        ? (3 - explorationLevel) // Reduces from 3 to 0 as we explore
        : (explorationLevel > 1 ? 1 : 0); // Non-preferred get bonus at high exploration
      
      // Small price bonus for affordability
      const priceBonus = pedal.reverbPrice < 100 ? 2 : pedal.reverbPrice < 200 ? 1 : 0;
      
      // Random bonus at high exploration to mix things up
      const explorationBonus = explorationLevel >= 2 ? Math.random() * 3 : 0;
      
      return {
        pedal,
        score: ratingScore + subtypeBonus + priceBonus + explorationBonus,
      };
    });
    
    // Shuffle within score tiers for variety, then extract pedals
    return shuffleByTier(scored).map(s => s.pedal);
  };
  
  const findPedals = (category: Category, subtypes?: string[], excludeSubtypes?: string[]) => {
    // Skip amp/cab sim category - not recommended for most setups
    if (category === 'amp') return [];
    
    let filtered = allPedals.filter(p => 
      p.category === category && 
      p.fits && 
      !onBoardIds.has(p.id) &&
      (!subtypes || subtypes.includes(p.subtype || '')) &&
      (!excludeSubtypes || !excludeSubtypes.includes(p.subtype || ''))
    );
    
    // Apply price range filter
    if (priceRangeFilter !== 'all') {
      const inRange = filtered.filter(p => p.reverbPrice >= priceRangeConfig.min && p.reverbPrice < priceRangeConfig.max);
      if (inRange.length > 0) {
        filtered = inRange;
      }
    }
    
    return sortByGenreFit(filtered, category).slice(0, 40);
  };
  
  const findBySubtype = (subtypes: string[]) => {
    let filtered = allPedals.filter(p => 
      p.fits && 
      !onBoardIds.has(p.id) &&
      p.category !== 'amp' && // Exclude amp/cab sim
      subtypes.includes(p.subtype || '')
    );
    
    // Apply price range filter
    if (priceRangeFilter !== 'all') {
      const inRange = filtered.filter(p => p.reverbPrice >= priceRangeConfig.min && p.reverbPrice < priceRangeConfig.max);
      if (inRange.length > 0) {
        filtered = inRange;
      }
    }
    
    return sortByGenreFit(filtered, filtered[0]?.category).slice(0, 40);
  };

  // Genre-specific bonus additions
  switch (genre.id) {
    case 'blues':
      // Tremolo
      if (!onBoardSubtypes.has('Tremolo')) {
        const trems = findPedals('modulation', ['Tremolo']);
        if (trems.length > 0) {
          additions.push({
            id: 'tremolo',
            name: 'Tremolo',
            reason: 'Classic vintage wobble - think B.B. King ballads',
            category: 'modulation',
            subtype: 'Tremolo',
            pedals: trems,
          });
        }
      }
      // Slapback Delay
      const slapbackBlues = findPedals('delay', ['Analog', 'Tape']);
      if (slapbackBlues.length > 0) {
        additions.push({
          id: 'slapback',
          name: 'Slapback Delay',
          reason: 'Short, rhythmic repeats for that vintage blues sound',
          category: 'delay',
          pedals: slapbackBlues,
        });
      }
      // Spring Reverb
      const springBlues = findPedals('reverb', ['Spring']);
      if (springBlues.length > 0) {
        additions.push({
          id: 'spring-reverb',
          name: 'Spring Reverb',
          reason: 'Classic amp-style reverb for authentic blues tone',
          category: 'reverb',
          subtype: 'Spring',
          pedals: springBlues,
        });
      }
      // Boost (post-drive)
      if (!onBoardSubtypes.has('Boost')) {
        const boosts = findPedals('gain', ['Boost']);
        if (boosts.length > 0) {
          additions.push({
            id: 'boost',
            name: 'Clean Boost',
            reason: 'Push your amp or add volume for solos',
            category: 'gain',
            subtype: 'Boost',
            pedals: boosts,
          });
        }
      }
      break;
      
    case 'rock':
      // Phaser
      if (!onBoardSubtypes.has('Phaser')) {
        const phasers = findPedals('modulation', ['Phaser']);
        if (phasers.length > 0) {
          additions.push({
            id: 'phaser',
            name: 'Phaser',
            reason: 'Classic swooshy effect - Van Halen, Pink Floyd vibes',
            category: 'modulation',
            subtype: 'Phaser',
            pedals: phasers,
          });
        }
      }
      // Flanger
      if (!onBoardSubtypes.has('Flanger')) {
        const flangers = findPedals('modulation', ['Flanger']);
        if (flangers.length > 0) {
          additions.push({
            id: 'flanger',
            name: 'Flanger',
            reason: 'Jet-like swoosh for dramatic moments',
            category: 'modulation',
            subtype: 'Flanger',
            pedals: flangers,
          });
        }
      }
      // Tape-style Delay
      const tapeDelays = findPedals('delay', ['Tape']);
      if (tapeDelays.length > 0) {
        additions.push({
          id: 'tape-delay',
          name: 'Tape Delay',
          reason: 'Warm, analog-style repeats with character',
          category: 'delay',
          subtype: 'Tape',
          pedals: tapeDelays,
        });
      }
      // Wah
      if (!onBoardSubtypes.has('Wah')) {
        const wahs = findPedals('filter', ['Wah']);
        if (wahs.length > 0) {
          additions.push({
            id: 'wah',
            name: 'Wah Pedal',
            reason: 'Essential for expressive leads - Hendrix, Clapton style',
            category: 'filter',
            subtype: 'Wah',
            pedals: wahs,
          });
        }
      }
      break;
      
    case 'metal':
      // Noise Gate
      if (!onBoardSubtypes.has('Gate')) {
        const gates = findBySubtype(['Gate', 'Noise Gate']);
        if (gates.length > 0) {
          additions.push({
            id: 'noise-gate',
            name: 'Noise Gate',
            reason: 'Eliminate hum and tighten high-gain tones',
            subtype: 'Gate',
            pedals: gates,
          });
        }
      }
      // Graphic EQ (post-gain)
      if (!onBoardSubtypes.has('Graphic')) {
        const eqs = findPedals('eq', ['Graphic']);
        if (eqs.length > 0) {
          additions.push({
            id: 'graphic-eq',
            name: 'Graphic EQ',
            reason: 'Sculpt your tone - boost mids, tighten lows',
            category: 'eq',
            subtype: 'Graphic',
            pedals: eqs,
          });
        }
      }
      // Pitch (octave down / harmonizer)
      const metalPitch = findPedals('pitch', ['Octave', 'Harmonizer', 'Shifter']);
      if (metalPitch.length > 0) {
        additions.push({
          id: 'pitch',
          name: 'Pitch Shifter',
          reason: 'Drop-tune on the fly or add harmonies',
          category: 'pitch',
          pedals: metalPitch,
        });
      }
      // Boost (tightening, not gain)
      if (!onBoardSubtypes.has('Boost')) {
        const boosts = findPedals('gain', ['Boost']);
        if (boosts.length > 0) {
          additions.push({
            id: 'boost',
            name: 'Tight Boost',
            reason: 'Tighten your amp\'s response without adding gain',
            category: 'gain',
            subtype: 'Boost',
            pedals: boosts,
          });
        }
      }
      break;
      
    case 'indie':
      // Chorus
      if (!onBoardSubtypes.has('Chorus')) {
        const choruses = findPedals('modulation', ['Chorus']);
        if (choruses.length > 0) {
          additions.push({
            id: 'chorus',
            name: 'Chorus',
            reason: 'Lush, shimmering texture for clean and dirty tones',
            category: 'modulation',
            subtype: 'Chorus',
            pedals: choruses,
          });
        }
      }
      // Lo-fi / Degradation
      const lofi = findBySubtype(['Lo-Fi', 'Bitcrusher', 'Degrader']);
      if (lofi.length > 0) {
        additions.push({
          id: 'lofi',
          name: 'Lo-Fi Effects',
          reason: 'Add character with tape wobble or bit reduction',
          pedals: lofi,
        });
      }
      // Multi-Delay
      const multiDelay = findPedals('delay', ['Multi', 'Digital']);
      if (multiDelay.length > 0) {
        additions.push({
          id: 'multi-delay',
          name: 'Multi-Mode Delay',
          reason: 'Versatile delay with multiple algorithms',
          category: 'delay',
          pedals: multiDelay,
        });
      }
      // Weird Modulation (ring mod, etc.)
      const weirdMod = findBySubtype(['Ring Mod', 'Vibrato', 'Rotary']);
      if (weirdMod.length > 0) {
        additions.push({
          id: 'weird-mod',
          name: 'Weird Modulation',
          reason: 'Ring mod, vibrato, or rotary for unique textures',
          pedals: weirdMod,
        });
      }
      break;
      
    case 'shoegaze':
      // Big Reverb
      const bigReverb = findPedals('reverb', ['Ambient', 'Shimmer', 'Multi']);
      if (bigReverb.length > 0) {
        additions.push({
          id: 'big-reverb',
          name: 'Big Reverb',
          reason: 'Massive, washy reverb for walls of sound',
          category: 'reverb',
          pedals: bigReverb,
        });
      }
      // Modulated Delay
      const modDelay = findPedals('delay', ['Tape', 'Multi', 'Analog']);
      if (modDelay.length > 0) {
        additions.push({
          id: 'mod-delay',
          name: 'Modulated Delay',
          reason: 'Delays with built-in modulation for dreamy textures',
          category: 'delay',
          pedals: modDelay,
        });
      }
      // Reverse / Swell effects
      const reverseEffects = findBySubtype(['Reverse', 'Shimmer', 'Ambient']);
      if (reverseEffects.length > 0) {
        additions.push({
          id: 'reverse',
          name: 'Reverse / Swell',
          reason: 'Create backwards sounds and ethereal swells',
          pedals: reverseEffects,
        });
      }
      // Volume Pedal
      if (!onBoardSubtypes.has('Volume')) {
        const volumes = findPedals('volume', ['Volume']);
        if (volumes.length > 0) {
          additions.push({
            id: 'volume',
            name: 'Volume Pedal',
            reason: 'Essential for swells and dynamic control',
            category: 'volume',
            subtype: 'Volume',
            pedals: volumes,
          });
        }
      }
      break;
      
    case 'ambient':
      // Ambient Reverb
      const ambientReverb = findPedals('reverb', ['Ambient', 'Shimmer', 'Multi']);
      if (ambientReverb.length > 0) {
        additions.push({
          id: 'ambient-reverb',
          name: 'Ambient Reverb',
          reason: 'Lush, infinite reverb for soundscapes',
          category: 'reverb',
          pedals: ambientReverb,
        });
      }
      // Multi / Preset Delay
      const presetDelay = findPedals('delay', ['Multi', 'Digital']);
      if (presetDelay.length > 0) {
        additions.push({
          id: 'preset-delay',
          name: 'Preset Delay',
          reason: 'Save your favorite delay settings for instant recall',
          category: 'delay',
          pedals: presetDelay,
        });
      }
      // Freeze / Sustain
      const freezePedals = findBySubtype(['Freeze', 'Sustain', 'Infinite']);
      if (freezePedals.length > 0) {
        additions.push({
          id: 'freeze',
          name: 'Freeze / Sustain',
          reason: 'Create infinite drones and pads from any note',
          pedals: freezePedals,
        });
      }
      // Expression Control
      const expression = findPedals('volume', ['Expression', 'Volume']);
      if (expression.length > 0) {
        additions.push({
          id: 'expression',
          name: 'Expression Pedal',
          reason: 'Control parameters in real-time with your foot',
          category: 'volume',
          pedals: expression,
        });
      }
      break;
      
    case 'country':
      // Compressor (characterful)
      if (!onBoardSubtypes.has('Compressor')) {
        const comps = findPedals('dynamics', ['Compressor']);
        if (comps.length > 0) {
          additions.push({
            id: 'compressor',
            name: 'Compressor',
            reason: 'Essential for chicken pickin\' and sustain',
            category: 'dynamics',
            subtype: 'Compressor',
            pedals: comps,
          });
        }
      }
      // Slapback Delay
      const slapbackCountry = findPedals('delay', ['Analog', 'Tape']);
      if (slapbackCountry.length > 0) {
        additions.push({
          id: 'slapback',
          name: 'Slapback Delay',
          reason: 'Classic country/rockabilly short delay',
          category: 'delay',
          pedals: slapbackCountry,
        });
      }
      // Tremolo
      if (!onBoardSubtypes.has('Tremolo')) {
        const trems = findPedals('modulation', ['Tremolo']);
        if (trems.length > 0) {
          additions.push({
            id: 'tremolo',
            name: 'Tremolo',
            reason: 'Vintage amp-style wobble for ballads',
            category: 'modulation',
            subtype: 'Tremolo',
            pedals: trems,
          });
        }
      }
      // Clean Boost
      if (!onBoardSubtypes.has('Boost')) {
        const boosts = findPedals('gain', ['Boost']);
        if (boosts.length > 0) {
          additions.push({
            id: 'boost',
            name: 'Clean Boost',
            reason: 'Add sparkle and volume for solos',
            category: 'gain',
            subtype: 'Boost',
            pedals: boosts,
          });
        }
      }
      break;
      
    case 'jazz':
      // EQ / Tone Shaping
      if (!onBoardSubtypes.has('Parametric') && !onBoardSubtypes.has('Graphic')) {
        const eqs = findPedals('eq', ['Parametric', 'Graphic']);
        if (eqs.length > 0) {
          additions.push({
            id: 'eq',
            name: 'EQ Pedal',
            reason: 'Fine-tune your tone for different rooms',
            category: 'eq',
            pedals: eqs,
          });
        }
      }
      // Subtle Reverb
      const subtleReverb = findPedals('reverb', ['Spring', 'Room', 'Plate']);
      if (subtleReverb.length > 0) {
        additions.push({
          id: 'subtle-reverb',
          name: 'Subtle Reverb',
          reason: 'Just enough space without washing out your tone',
          category: 'reverb',
          pedals: subtleReverb,
        });
      }
      // Clean Boost
      if (!onBoardSubtypes.has('Boost')) {
        const boosts = findPedals('gain', ['Boost']);
        if (boosts.length > 0) {
          additions.push({
            id: 'boost',
            name: 'Clean Boost',
            reason: 'Add presence without changing your tone',
            category: 'gain',
            subtype: 'Boost',
            pedals: boosts,
          });
        }
      }
      // Compressor (very light)
      if (!onBoardSubtypes.has('Compressor')) {
        const comps = findPedals('dynamics', ['Compressor']);
        if (comps.length > 0) {
          additions.push({
            id: 'compressor',
            name: 'Light Compressor',
            reason: 'Subtle compression for even dynamics',
            category: 'dynamics',
            subtype: 'Compressor',
            pedals: comps,
          });
        }
      }
      break;
      
    case 'funk':
      // Envelope Filter
      if (!onBoardSubtypes.has('Envelope') && !onBoardSubtypes.has('Auto-Wah')) {
        const envelopes = findPedals('filter', ['Envelope', 'Auto-Wah']);
        if (envelopes.length > 0) {
          additions.push({
            id: 'envelope',
            name: 'Envelope Filter',
            reason: 'Auto-wah quack that responds to your playing',
            category: 'filter',
            pedals: envelopes,
          });
        }
      }
      // Phaser
      if (!onBoardSubtypes.has('Phaser')) {
        const phasers = findPedals('modulation', ['Phaser']);
        if (phasers.length > 0) {
          additions.push({
            id: 'phaser',
            name: 'Phaser',
            reason: 'Classic funk swirl - think Isaac Hayes',
            category: 'modulation',
            subtype: 'Phaser',
            pedals: phasers,
          });
        }
      }
      // Compressor (snappy)
      if (!onBoardSubtypes.has('Compressor')) {
        const comps = findPedals('dynamics', ['Compressor']);
        if (comps.length > 0) {
          additions.push({
            id: 'compressor',
            name: 'Snappy Compressor',
            reason: 'Keep your funk tight and punchy',
            category: 'dynamics',
            subtype: 'Compressor',
            pedals: comps,
          });
        }
      }
      // Auto-Wah
      const autoWahs = findBySubtype(['Auto-Wah', 'Envelope']);
      if (autoWahs.length > 0 && !onBoardSubtypes.has('Auto-Wah')) {
        additions.push({
          id: 'autowah',
          name: 'Auto-Wah',
          reason: 'Hands-free funky filter sweeps',
          pedals: autoWahs,
        });
      }
      break;
      
    case 'prog':
      // Multi-Modulation
      const multiMod = findPedals('modulation', ['Multi', 'Chorus', 'Phaser', 'Flanger']);
      if (multiMod.length > 0) {
        additions.push({
          id: 'multi-mod',
          name: 'Multi-Modulation',
          reason: 'Multiple mod effects in one pedal for versatility',
          category: 'modulation',
          pedals: multiMod,
        });
      }
      // Advanced Delay
      const advancedDelay = findPedals('delay', ['Multi', 'Digital']);
      if (advancedDelay.length > 0) {
        additions.push({
          id: 'advanced-delay',
          name: 'Advanced Delay',
          reason: 'Complex delay patterns and tap tempo',
          category: 'delay',
          pedals: advancedDelay,
        });
      }
      // Pitch / Harmonizer
      const progPitch = findPedals('pitch', ['Harmonizer', 'Shifter', 'Whammy']);
      if (progPitch.length > 0) {
        additions.push({
          id: 'harmonizer',
          name: 'Pitch / Harmonizer',
          reason: 'Create harmonies and pitch effects on the fly',
          category: 'pitch',
          pedals: progPitch,
        });
      }
      // MIDI / Loop Switching
      const midiPedals = findBySubtype(['Loop Switcher', 'MIDI Controller', 'Switcher']);
      if (midiPedals.length > 0) {
        additions.push({
          id: 'midi',
          name: 'MIDI / Loop Switcher',
          reason: 'Control your rig with presets and MIDI',
          pedals: midiPedals,
        });
      }
      break;
      
    case 'worship':
      // Ambient Reverb
      const worshipReverb = findPedals('reverb', ['Ambient', 'Shimmer', 'Multi']);
      if (worshipReverb.length > 0) {
        additions.push({
          id: 'ambient-reverb',
          name: 'Ambient Reverb',
          reason: 'Lush, pad-like reverb for atmospheric playing',
          category: 'reverb',
          pedals: worshipReverb,
        });
      }
      // Stereo Delay
      const stereoDelay = findPedals('delay', ['Multi', 'Digital', 'Tape']);
      if (stereoDelay.length > 0) {
        additions.push({
          id: 'stereo-delay',
          name: 'Stereo Delay',
          reason: 'Wide, spacious delays for huge soundscapes',
          category: 'delay',
          pedals: stereoDelay,
        });
      }
      // Volume / Swell Control
      if (!onBoardSubtypes.has('Volume')) {
        const volumes = findPedals('volume', ['Volume', 'Expression']);
        if (volumes.length > 0) {
          additions.push({
            id: 'volume',
            name: 'Volume Pedal',
            reason: 'Essential for swells and pad-like playing',
            category: 'volume',
            pedals: volumes,
          });
        }
      }
      // MIDI / Preset Control
      const worshipMidi = findBySubtype(['Loop Switcher', 'MIDI Controller', 'Switcher']);
      if (worshipMidi.length > 0) {
        additions.push({
          id: 'midi',
          name: 'Preset Controller',
          reason: 'Switch between songs instantly with presets',
          pedals: worshipMidi,
        });
      }
      break;
      
    case 'experimental':
      // Feedback / Oscillation
      const feedback = findBySubtype(['Feedback', 'Oscillator', 'Noise', 'Drone']);
      if (feedback.length > 0) {
        additions.push({
          id: 'feedback',
          name: 'Feedback / Oscillation',
          reason: 'Create controlled chaos and self-oscillation',
          pedals: feedback,
        });
      }
      // Bitcrusher / Lo-fi
      const bitcrush = findBySubtype(['Bitcrusher', 'Lo-Fi', 'Degrader']);
      if (bitcrush.length > 0) {
        additions.push({
          id: 'bitcrusher',
          name: 'Bitcrusher / Lo-Fi',
          reason: 'Destroy your signal in creative ways',
          pedals: bitcrush,
        });
      }
      // Pitch / Glitch
      const glitchPitch = findBySubtype(['Glitch', 'Shifter', 'Whammy', 'Harmonizer']);
      if (glitchPitch.length > 0) {
        additions.push({
          id: 'glitch',
          name: 'Pitch / Glitch',
          reason: 'Random pitch jumps and digital artifacts',
          pedals: glitchPitch,
        });
      }
      // Routing / Loopers
      const routing = findBySubtype(['Looper', 'ABY', 'Loop Switcher', 'Mixer']);
      if (routing.length > 0) {
        additions.push({
          id: 'routing',
          name: 'Routing / Looper',
          reason: 'Create complex signal paths and layer sounds',
          pedals: routing,
        });
      }
      break;
      
    case 'pop':
      // Pitch (micro-shift / doubler)
      const popPitch = findPedals('pitch', ['Doubler', 'Detune', 'Shifter', 'Micro']);
      if (popPitch.length > 0) {
        additions.push({
          id: 'pitch-doubler',
          name: 'Pitch Doubler',
          reason: 'Subtle thickening and width for polished tones',
          category: 'pitch',
          pedals: popPitch,
        });
      }
      // Tremolo
      if (!onBoardSubtypes.has('Tremolo')) {
        const popTrem = findPedals('modulation', ['Tremolo']);
        if (popTrem.length > 0) {
          additions.push({
            id: 'tremolo',
            name: 'Tremolo',
            reason: 'Add rhythmic pulse and movement',
            category: 'modulation',
            subtype: 'Tremolo',
            pedals: popTrem,
          });
        }
      }
      // EQ (tone shaping)
      if (!onBoardSubtypes.has('Parametric') && !onBoardSubtypes.has('Graphic')) {
        const popEq = findPedals('eq', ['Parametric', 'Graphic']);
        if (popEq.length > 0) {
          additions.push({
            id: 'eq',
            name: 'EQ Pedal',
            reason: 'Shape your tone to sit perfectly in the mix',
            category: 'eq',
            pedals: popEq,
          });
        }
      }
      // Auto-filter (very subtle)
      const popFilter = findPedals('filter', ['Envelope', 'Auto-Wah']);
      if (popFilter.length > 0) {
        additions.push({
          id: 'auto-filter',
          name: 'Auto Filter',
          reason: 'Subtle filter sweeps for texture',
          category: 'filter',
          pedals: popFilter,
        });
      }
      break;
      
    case 'lofi':
      // Bitcrusher / Sample Rate Reducer
      const lofiBitcrush = findBySubtype(['Bitcrusher', 'Lo-Fi', 'Degrader', 'Sample Rate']);
      if (lofiBitcrush.length > 0) {
        additions.push({
          id: 'bitcrusher',
          name: 'Bitcrusher',
          reason: 'Digital degradation for that crunchy lo-fi sound',
          pedals: lofiBitcrush,
        });
      }
      // Warble / Cassette Mod
      const lofiWarble = findBySubtype(['Vibrato', 'Chorus', 'Warble', 'Cassette']);
      if (lofiWarble.length > 0) {
        additions.push({
          id: 'warble',
          name: 'Warble / Cassette',
          reason: 'Tape-style pitch wobble and wow/flutter',
          pedals: lofiWarble,
        });
      }
      // Low-pass Filter
      const lofiFilter = findPedals('filter', ['Low-Pass', 'Filter', 'Tone']);
      if (lofiFilter.length > 0) {
        additions.push({
          id: 'lowpass',
          name: 'Low-Pass Filter',
          reason: 'Roll off highs for that muffled vintage sound',
          category: 'filter',
          pedals: lofiFilter,
        });
      }
      // Saturation / Preamp
      const lofiSat = findPedals('gain', ['Preamp', 'Boost', 'Overdrive']);
      if (lofiSat.length > 0) {
        additions.push({
          id: 'saturation',
          name: 'Saturation / Preamp',
          reason: 'Add warmth and harmonic richness',
          category: 'gain',
          pedals: lofiSat,
        });
      }
      break;
      
    case 'singer-songwriter':
      // Volume Pedal
      if (!onBoardSubtypes.has('Volume')) {
        const sswVolume = findPedals('volume', ['Volume', 'Expression']);
        if (sswVolume.length > 0) {
          additions.push({
            id: 'volume',
            name: 'Volume Pedal',
            reason: 'Smooth dynamics without touching your guitar',
            category: 'volume',
            subtype: 'Volume',
            pedals: sswVolume,
          });
        }
      }
      // EQ (tone sweetening)
      if (!onBoardSubtypes.has('Parametric') && !onBoardSubtypes.has('Graphic')) {
        const sswEq = findPedals('eq', ['Parametric', 'Graphic']);
        if (sswEq.length > 0) {
          additions.push({
            id: 'eq',
            name: 'EQ Pedal',
            reason: 'Sweeten your acoustic tone for any room',
            category: 'eq',
            pedals: sswEq,
          });
        }
      }
      // Subtle Modulation
      const sswMod = findPedals('modulation', ['Chorus', 'Tremolo', 'Vibrato']);
      if (sswMod.length > 0) {
        additions.push({
          id: 'subtle-mod',
          name: 'Subtle Modulation',
          reason: 'Light movement without overwhelming your tone',
          category: 'modulation',
          pedals: sswMod,
        });
      }
      // Boost (clean)
      if (!onBoardSubtypes.has('Boost')) {
        const sswBoost = findPedals('gain', ['Boost']);
        if (sswBoost.length > 0) {
          additions.push({
            id: 'boost',
            name: 'Clean Boost',
            reason: 'Lift your signal for solos or emphasis',
            category: 'gain',
            subtype: 'Boost',
            pedals: sswBoost,
          });
        }
      }
      break;
      
    case 'indie-rock':
      // Fuzz
      if (!onBoardSubtypes.has('Fuzz')) {
        const irFuzz = findPedals('gain', ['Fuzz']);
        if (irFuzz.length > 0) {
          additions.push({
            id: 'fuzz',
            name: 'Fuzz',
            reason: 'Thick, woolly saturation for big moments',
            category: 'gain',
            subtype: 'Fuzz',
            pedals: irFuzz,
          });
        }
      }
      // Pitch (octave / detune)
      const irPitch = findPedals('pitch', ['Octave', 'Detune', 'Shifter']);
      if (irPitch.length > 0) {
        additions.push({
          id: 'pitch',
          name: 'Pitch / Octave',
          reason: 'Add depth with octaves or detuned doubling',
          category: 'pitch',
          pedals: irPitch,
        });
      }
      // Tremolo
      if (!onBoardSubtypes.has('Tremolo')) {
        const irTrem = findPedals('modulation', ['Tremolo']);
        if (irTrem.length > 0) {
          additions.push({
            id: 'tremolo',
            name: 'Tremolo',
            reason: 'Classic indie texture and rhythmic pulse',
            category: 'modulation',
            subtype: 'Tremolo',
            pedals: irTrem,
          });
        }
      }
      // Experimental Modulation
      const irWeirdMod = findBySubtype(['Ring Mod', 'Rotary', 'Vibrato', 'Flanger']);
      if (irWeirdMod.length > 0) {
        additions.push({
          id: 'weird-mod',
          name: 'Experimental Mod',
          reason: 'Ring mod, vibrato, or flanger for unique textures',
          pedals: irWeirdMod,
        });
      }
      break;
  }
  
  return additions.slice(0, 4); // Max 4 bonus additions
}

// Exploration levels for progressive widening of suggestions
const EXPLORATION_LEVELS = [
  { name: 'Genre Fit', description: 'Best matches for your genre', ratingTolerance: 2, includeAllSubtypes: false },
  { name: 'Nearby', description: 'Similar options, slightly different', ratingTolerance: 4, includeAllSubtypes: false },
  { name: 'Exploring', description: 'Branching out a bit', ratingTolerance: 6, includeAllSubtypes: true },
  { name: 'Wild Card', description: 'Unexpected choices', ratingTolerance: 10, includeAllSubtypes: true },
];

export function GenreStarterKit({ onFinishUp }: GenreStarterKitProps) {
  const { state, dispatch } = useBoard();
  const { selectedGenres, allPedals, board } = state;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [expandedPedal, setExpandedPedal] = useState<string | null>(null);
  const [skippedSteps, setSkippedSteps] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<'essentials' | 'additions'>('essentials');
  const [currentAdditionIndex, setCurrentAdditionIndex] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [skipTuner, setSkipTuner] = useState(false); // Option to skip tuner pedal
  const [skipSecondGain, setSkipSecondGain] = useState(false); // Option to skip second gain pedal
  const [explorationLevel, setExplorationLevel] = useState(0); // 0-3, cycles through exploration levels
  const [refreshCycle, setRefreshCycle] = useState(0); // Increments each full cycle for new random pedals
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Current exploration config
  const currentExploration = EXPLORATION_LEVELS[explorationLevel];
  
  // Filter pedals by price range
  const filterByPriceRange = (pedals: PedalWithStatus[]): PedalWithStatus[] => {
    if (priceRange === 'all') return pedals;
    
    const range = PRICE_RANGES[priceRange];
    return pedals.filter(p => p.reverbPrice >= range.min && p.reverbPrice < range.max);
  };
  
  // Sort pedals helper function
  const sortPedals = (pedals: PedalWithStatus[]): PedalWithStatus[] => {
    // First filter by price range
    let result = filterByPriceRange(pedals);
    
    if (sortBy === 'default') return result;
    
    const sorted = [...result];
    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.model.localeCompare(b.model));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.model.localeCompare(a.model));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.reverbPrice - b.reverbPrice);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.reverbPrice - a.reverbPrice);
        break;
      case 'rating-asc':
        sorted.sort((a, b) => a.categoryRating - b.categoryRating);
        break;
      case 'rating-desc':
        sorted.sort((a, b) => b.categoryRating - a.categoryRating);
        break;
      case 'size-asc':
        sorted.sort((a, b) => (a.widthMm * a.depthMm) - (b.widthMm * b.depthMm));
        break;
      case 'size-desc':
        sorted.sort((a, b) => (b.widthMm * b.depthMm) - (a.widthMm * a.depthMm));
        break;
    }
    return sorted;
  };
  
  // Get all selected genres
  const genres = selectedGenres.map(id => getGenreById(id)).filter(Boolean) as GenreProfile[];
  const primaryGenre = genres[0]; // Use first genre as primary for colors
  
  if (genres.length === 0) {
    return (
      <div className="bg-board-surface border border-board-border rounded-xl p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <GraduationCap className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Genre Starter Kits</h2>
        <p className="text-sm text-board-muted max-w-sm mx-auto">
          Select a genre from the Genre Guide to see recommended pedals with beginner-friendly explanations.
        </p>
      </div>
    );
  }
  
  // Merge essential categories from all genres (these are the CORE sound - one of each first)
  const mergedEssentials = (() => {
    if (genres.length === 1) {
      // Single genre - use its essential categories directly
      return genres[0].essentialCategories;
    }
    // Multiple genres - merge by frequency
    const categoryCount = new Map<Category, number>();
    genres.forEach(g => {
      g.essentialCategories.forEach(cat => {
        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
      });
    });
    return Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
  })();
  
  // Merge extra categories (added AFTER essentials for larger boards)
  const mergedExtras = (() => {
    if (genres.length === 1) {
      return genres[0].extraCategories;
    }
    // Multiple genres - merge extras
    const categoryCount = new Map<Category, number>();
    genres.forEach(g => {
      g.extraCategories.forEach(cat => {
        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
      });
    });
    return Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
  })();
  
  // Merge preferred subtypes from all genres
  const mergedSubtypes = [...new Set(genres.flatMap(g => g.preferredSubtypes))];
  
  // Create a combined "genre" object for compatibility
  const genre: GenreProfile = {
    ...primaryGenre,
    name: genres.length === 1 ? primaryGenre.name : genres.map(g => g.name).join(' + '),
    essentialCategories: mergedEssentials,
    extraCategories: mergedExtras,
    preferredSubtypes: mergedSubtypes,
  };
  
  const onBoardIds = new Set(board.slots.map(s => s.pedal.id));
  const onBoardCategories = new Set(board.slots.map(s => s.pedal.category));
  const onBoardSubtypes = new Set(board.slots.map(s => s.pedal.subtype));
  
  // Calculate how many pedals the board can fit
  // Use maxPedalCount if set, otherwise estimate from board size
  const boardCapacity = board.constraints.maxPedalCount || 
    estimatePedalCapacity(board.constraints.maxWidthMm, board.constraints.maxDepthMm);
  
  // Calculate recommended essentials and bonus based on capacity
  const recommendedEssentials = board.constraints.maxPedalCount
    ? Math.max(1, Math.min(board.constraints.maxPedalCount - 1, 10)) // At least 1 essential, leave room for bonus if possible
    : getRecommendedEssentialCount(board.constraints.maxWidthMm, board.constraints.maxDepthMm);
  
  const recommendedBonus = board.constraints.maxPedalCount
    ? Math.max(0, Math.min(board.constraints.maxPedalCount - recommendedEssentials, 5))
    : getRecommendedBonusCount(board.constraints.maxWidthMm, board.constraints.maxDepthMm);

  // Helper functions for step generation
  const getDisplayName = (subtype: string, category: Category): string => {
    const categoryInfo = CATEGORY_INFO[category];
    // These subtypes need the category name added for clarity (beginner-friendly)
    const needsCategorySuffix: Record<string, string[]> = {
      delay: ['Analog', 'Digital', 'Tape', 'Multi'],
      reverb: ['Spring', 'Hall', 'Plate', 'Room', 'Shimmer', 'Ambient'],
      modulation: ['Multi'],
      gain: ['Multi'],
      eq: ['Parametric', 'Graphic'], // "Parametric EQ" is clearer than just "Parametric"
    };
    if (needsCategorySuffix[category]?.includes(subtype)) {
      return `${subtype} ${categoryInfo.displayName}`;
    }
    return subtype;
  };

  const getCategoryDescription = (cat: Category, isSecond?: boolean): string => {
    const descriptions: Record<Category, string> = {
      gain: isSecond ? 'Stack another drive for more tonal options' : 'Drive and distortion for your tone',
      dynamics: isSecond ? 'Add another dynamics tool' : 'Control your dynamics and sustain',
      filter: isSecond ? 'More filtering options' : 'Shape your tone with filtering effects',
      eq: isSecond ? 'Additional tone shaping' : 'Fine-tune your frequencies',
      modulation: isSecond ? 'Layer more movement and texture' : 'Add movement and texture to your sound',
      delay: isSecond ? 'A second delay for layered echoes' : 'Create echoes and rhythmic repeats',
      reverb: isSecond ? 'Stack reverbs for lush ambience' : 'Add space and ambience',
      pitch: isSecond ? 'More pitch options' : 'Shift and harmonize your pitch',
      volume: isSecond ? 'Additional volume control' : 'Control your volume and expression',
      utility: 'Essential tools for your signal chain',
      amp: isSecond ? 'More amp options' : 'Amp and cab simulation',
      synth: isSecond ? 'More synth textures' : 'Synth and special effects',
    };
    return descriptions[cat] || `${CATEGORY_INFO[cat].displayName} pedal`;
  };

  // Short purpose phrases for the "Choose a X" heading
  const getShortPurpose = (subtype?: string, category?: Category): string => {
    // Subtype-specific purposes
    const subtypePurposes: Record<string, string> = {
      'Tuner': 'to stay in tune',
      'Compressor': 'to control dynamics',
      'Limiter': 'to tame peaks',
      'Gate': 'to cut noise',
      'Overdrive': 'to add warmth and grit',
      'Distortion': 'to add crunch and saturation',
      'Fuzz': 'for thick, fuzzy tones',
      'Boost': 'to push your amp harder',
      'Chorus': 'for shimmering movement',
      'Flanger': 'for jet-like swoosh',
      'Phaser': 'for swirling motion',
      'Tremolo': 'for rhythmic pulsing',
      'Vibrato': 'for pitch wobble',
      'Rotary': 'for spinning speaker effect',
      'Analog': 'for warm repeats',
      'Digital': 'for precise echoes',
      'Tape': 'for vintage echo character',
      'Multi': 'for versatile options',
      'Spring': 'for classic amp reverb',
      'Hall': 'for spacious ambience',
      'Plate': 'for smooth decay',
      'Room': 'for natural space',
      'Shimmer': 'for ethereal textures',
      'Ambient': 'for lush soundscapes',
      'Wah': 'for expressive sweeps',
      'Envelope': 'for auto-wah funk',
      'Graphic': 'to sculpt your tone',
      'Parametric': 'for precise EQ control',
      'Volume': 'for swells and dynamics',
      'Expression': 'to control effects live',
      'Octave': 'for pitch shifting',
      'Harmonizer': 'to add harmonies',
      'Whammy': 'for dramatic pitch bends',
    };
    
    if (subtype && subtypePurposes[subtype]) {
      return subtypePurposes[subtype];
    }
    
    // Category fallback purposes
    if (category) {
      const categoryPurposes: Record<Category, string> = {
        gain: 'for drive and distortion',
        dynamics: 'to control dynamics',
        filter: 'to shape your tone',
        eq: 'to fine-tune frequencies',
        modulation: 'for movement and texture',
        delay: 'for echoes and repeats',
        reverb: 'for space and ambience',
        pitch: 'for pitch effects',
        volume: 'for volume control',
        utility: 'for your signal chain',
        amp: 'for amp simulation',
        synth: 'for synth sounds',
      };
      return categoryPurposes[category] || '';
    }
    
    return '';
  };

  // Calculate average budget per pedal to ensure we can fill the board
  const totalPedalsToFill = recommendedEssentials + recommendedBonus;
  const avgBudgetPerPedal = board.constraints.maxBudget / Math.max(totalPedalsToFill, 4);

  // Generate essential steps based on genre's recommended categories AND board capacity
  const generateSteps = (): StarterKitStep[] => {
    const steps: StarterKitStep[] = [];
    const offeredSubtypes = new Set<string>(['Tuner']);
    
    // Step 1: Tuner (first, unless user opted out)
    if (!skipTuner) {
      let tunerPedals = allPedals.filter(p => p.subtype === 'Tuner' && p.fits);
      
      // Apply price range filter to tuners
      if (priceRange !== 'all') {
        const range = PRICE_RANGES[priceRange];
        const tunersInRange = tunerPedals.filter(p => p.reverbPrice >= range.min && p.reverbPrice < range.max);
        if (tunersInRange.length > 0) {
          tunerPedals = tunersInRange;
        }
      }
      
      if (tunerPedals.length > 0) {
        const education = getPedalEducation('Tuner');
        const sortedTuners = [...tunerPedals].sort((a, b) => {
          // When price range selected, sort by rating (best tuner in range)
          if (priceRange !== 'all') {
            if (b.categoryRating !== a.categoryRating) {
              return b.categoryRating - a.categoryRating;
            }
            return a.reverbPrice - b.reverbPrice; // Prefer cheaper for same rating
          }
          // Default: prefer mid-range priced tuners
          const aMidRange = Math.abs(a.reverbPrice - 80);
          const bMidRange = Math.abs(b.reverbPrice - 80);
          return aMidRange - bMidRange;
        });
        steps.push({
          id: 'tuner',
          name: 'Tuner',
          description: 'Every guitarist needs a tuner! It keeps you in tune and can mute your signal.',
          subtype: 'Tuner',
          pedals: sortedTuners.slice(0, 40),
          education: education ? { whatItDoes: education.whatItDoes, beginnerTip: education.beginnerTip } : undefined,
        });
      }
    }
    
    // NEW PRIORITY SYSTEM: 
    // 1. First, fill ESSENTIAL categories (one of each) - these define the core sound
    // 2. Then, fill EXTRA categories for larger boards (second gain, etc.)
    
    // Track how many of each category we've added
    const categoryStepCount = new Map<Category, number>();
    
    // PHASE 1: Essential categories first (one of each, in priority order)
    for (const category of genre.essentialCategories) {
      if (steps.length >= recommendedEssentials) break;
      
      // Skip amp/cab sim category - not recommended for most setups
      if (category === 'amp') continue;
      
      // Only add ONE of each essential category
      const currentCategoryCount = categoryStepCount.get(category) || 0;
      if (currentCategoryCount >= 1) continue;
      
      const categoryInfo = CATEGORY_INFO[category];
      
      // Get pedals not yet offered
      const categoryPedals = allPedals.filter(p => 
        p.category === category && 
        p.fits &&
        !offeredSubtypes.has(p.subtype || '')
      );
      
      if (categoryPedals.length === 0) continue;
      
      // Group by subtype
      const subtypeGroups = new Map<string, typeof categoryPedals>();
      categoryPedals.forEach(p => {
        const subtype = p.subtype || categoryInfo.displayName;
        if (!subtypeGroups.has(subtype)) {
          subtypeGroups.set(subtype, []);
        }
        subtypeGroups.get(subtype)!.push(p);
      });
      
      // Find best subtype to offer (prefer genre's preferred subtypes)
      let bestSubtype: string | null = null;
      let bestPedals: typeof categoryPedals = [];
      
      // First try preferred subtypes
      for (const subtype of genre.preferredSubtypes) {
        if (subtypeGroups.has(subtype) && !offeredSubtypes.has(subtype)) {
          bestSubtype = subtype;
          bestPedals = subtypeGroups.get(subtype)!;
          break;
        }
      }
      
      // Fall back to any available subtype
      if (!bestSubtype) {
        for (const [subtype, pedals] of subtypeGroups) {
          if (!offeredSubtypes.has(subtype)) {
            bestSubtype = subtype;
            bestPedals = pedals;
            break;
          }
        }
      }
      
      if (!bestSubtype || bestPedals.length === 0) continue;
      
      // Genre-aware sorting: prioritize pedals that match the genre's target rating
      const categoryTarget = genre.sectionTargets[category];
      const idealRating = categoryTarget ? Math.min(categoryTarget.ideal, 10) : 5;
      
      // Calculate ideal price based on budget AND category importance for this genre
      const targetIdeal = categoryTarget?.ideal || 5;
      const importanceScore = targetIdeal / 10;
      
      // Also consider position in essentialCategories (earlier = more important)
      const categoryIndex = genre.essentialCategories.indexOf(category);
      const positionBonus = categoryIndex >= 0 && categoryIndex <= 1 ? 0.2 : 
                            categoryIndex >= 0 && categoryIndex <= 3 ? 0.1 : 0;
      
      // Budget per category based on average budget per pedal, with multipliers for importance
      // This ensures we can fill the board within budget
      const budgetMultiplier = Math.min(importanceScore + positionBonus + 0.8, 1.8);
      const maxForCategory = avgBudgetPerPedal * budgetMultiplier;
      
      // For the FIRST pedal in each category, consider ALL subtypes to find the best
      const isFirstOfCategory = !steps.some(s => s.category === category);
      let pedalsToSort = bestPedals;
      if (isFirstOfCategory) {
        const allCategoryPedals = allPedals.filter(p => 
          p.category === category && 
          p.fits &&
          !onBoardIds.has(p.id)
        );
        if (allCategoryPedals.length > 0) {
          pedalsToSort = allCategoryPedals;
        }
      }
      
      // Apply price range filter FIRST if user selected one
      const priceRangeConfig = PRICE_RANGES[priceRange];
      let pedalsInRange = pedalsToSort;
      if (priceRange !== 'all') {
        pedalsInRange = pedalsToSort.filter(p => 
          p.reverbPrice >= priceRangeConfig.min && p.reverbPrice < priceRangeConfig.max
        );
        if (pedalsInRange.length === 0) {
          pedalsInRange = pedalsToSort;
        }
      }
      
      // Score each pedal for genre fit, then shuffle within tiers for variety
      // Exploration level makes scoring more lenient
      const exploration = EXPLORATION_LEVELS[explorationLevel] || EXPLORATION_LEVELS[0];
      const scoredPedals = pedalsInRange.map(pedal => {
        // Genre fit score - exploration makes it more lenient
        const ratingDiff = Math.abs(pedal.categoryRating - idealRating);
        const ratingScore = 10 - Math.max(0, ratingDiff - exploration.ratingTolerance);
        
        // Subtype bonus reduces as we explore more
        const subtypeBonus = genre.preferredSubtypes.includes(pedal.subtype || '') 
          ? (2 - explorationLevel * 0.5)
          : (explorationLevel > 1 ? 1 : 0);
        
        // Small affordability bonus (within budget = +1)
        const affordableBonus = pedal.reverbPrice <= maxForCategory ? 1 : 0;
        
        // Random exploration bonus at higher levels
        const explorationBonus = explorationLevel >= 2 ? Math.random() * 3 : 0;
        
        return {
          pedal,
          score: ratingScore + subtypeBonus + affordableBonus + explorationBonus,
        };
      });
      
      // Shuffle within score tiers for variety - users should rarely see the same recommendations twice!
      const sortedPedals = shuffleByTier(scoredPedals).map(s => s.pedal);
      
      // Use the top pedal's actual subtype
      const topPedal = sortedPedals[0];
      const actualSubtype = isFirstOfCategory && topPedal 
        ? (topPedal.subtype || bestSubtype) 
        : bestSubtype;
      
      const education = getPedalEducation(actualSubtype);
      
      // Special naming for gain category
      let stepName: string;
      let stepDescription: string;
      if (category === 'gain') {
        stepName = 'Gain 1 (Main Drive)';
        stepDescription = 'Your primary drive sound - overdrive or distortion for your main tone.';
      } else {
        // Use actual subtype name (e.g., "Compressor") not category name (e.g., "Dynamics")
        stepName = getDisplayName(actualSubtype, category);
        stepDescription = getCategoryDescription(category, false);
      }
      
      steps.push({
        id: `${category}-${actualSubtype}-${currentCategoryCount}`,
        name: stepName,
        description: stepDescription,
        category: category,
        subtype: actualSubtype,
        pedals: sortedPedals.slice(0, 40),
        education: education ? { whatItDoes: education.whatItDoes, beginnerTip: education.beginnerTip } : undefined,
      });
        
      // Track category count for skip logic and naming
      categoryStepCount.set(category, currentCategoryCount + 1);
      
      // Only track the SELECTED subtype as offered - not all subtypes from displayed pedals
      // This allows subsequent passes to offer different subtypes from the same category
      if (actualSubtype) {
        offeredSubtypes.add(actualSubtype);
      }
    }
    
    // PHASE 2: Extra categories (for larger boards - second gain, etc.)
    // These come AFTER all essentials have been filled
    for (const category of genre.extraCategories) {
      if (steps.length >= recommendedEssentials) break;
      
      // Skip amp/cab sim category - not recommended for most setups
      if (category === 'amp') continue;
      
      const currentCategoryCount = categoryStepCount.get(category) || 0;
      
      // Skip second gain if user opted out
      if (category === 'gain' && currentCategoryCount >= 1 && skipSecondGain) {
        continue;
      }
      
      const categoryInfo = CATEGORY_INFO[category];
      
      // Get pedals not yet offered
      const categoryPedals = allPedals.filter(p => 
        p.category === category && 
        p.fits &&
        !offeredSubtypes.has(p.subtype || '')
      );
      
      if (categoryPedals.length === 0) continue;
      
      // Group by subtype
      const subtypeGroups = new Map<string, typeof categoryPedals>();
      categoryPedals.forEach(p => {
        const subtype = p.subtype || categoryInfo.displayName;
        if (!subtypeGroups.has(subtype)) {
          subtypeGroups.set(subtype, []);
        }
        subtypeGroups.get(subtype)!.push(p);
      });
      
      // Find best subtype to offer (prefer genre's preferred subtypes)
      let bestSubtype: string | null = null;
      let bestPedals: typeof categoryPedals = [];
      
      // First try preferred subtypes
      for (const subtype of genre.preferredSubtypes) {
        if (subtypeGroups.has(subtype) && !offeredSubtypes.has(subtype)) {
          bestSubtype = subtype;
          bestPedals = subtypeGroups.get(subtype)!;
          break;
        }
      }
      
      // Fall back to any available subtype
      if (!bestSubtype) {
        for (const [subtype, pedals] of subtypeGroups) {
          if (!offeredSubtypes.has(subtype)) {
            bestSubtype = subtype;
            bestPedals = pedals;
            break;
          }
        }
      }
      
      if (!bestSubtype || bestPedals.length === 0) continue;
      
      // Genre-aware sorting for extras
      const categoryTarget = genre.sectionTargets[category];
      const idealRating = categoryTarget ? Math.min(categoryTarget.ideal, 10) : 5;
      const targetIdeal = categoryTarget?.ideal || 5;
      const importanceScore = targetIdeal / 10;
      // Lower budget for extras - they're add-ons, not essentials
      const budgetMultiplier = Math.min(importanceScore + 0.5, 1.3);
      const maxForCategory = avgBudgetPerPedal * budgetMultiplier;
      
      // Apply price range filter
      const priceRangeConfig = PRICE_RANGES[priceRange];
      let pedalsInRange = bestPedals;
      if (priceRange !== 'all') {
        pedalsInRange = bestPedals.filter(p => 
          p.reverbPrice >= priceRangeConfig.min && p.reverbPrice < priceRangeConfig.max
        );
        if (pedalsInRange.length === 0) {
          pedalsInRange = bestPedals;
        }
      }
      
      // Score each pedal for genre fit, then shuffle within tiers for variety
      // Exploration level makes scoring more lenient
      const explorationExtras = EXPLORATION_LEVELS[explorationLevel] || EXPLORATION_LEVELS[0];
      const scoredPedals = pedalsInRange.map(pedal => {
        const ratingDiff = Math.abs(pedal.categoryRating - idealRating);
        const ratingScore = 10 - Math.max(0, ratingDiff - explorationExtras.ratingTolerance);
        const subtypeBonus = genre.preferredSubtypes.includes(pedal.subtype || '') 
          ? (2 - explorationLevel * 0.5)
          : (explorationLevel > 1 ? 1 : 0);
        const affordableBonus = pedal.reverbPrice <= maxForCategory ? 1 : 0;
        const explorationBonus = explorationLevel >= 2 ? Math.random() * 3 : 0;
        return {
          pedal,
          score: ratingScore + subtypeBonus + affordableBonus + explorationBonus,
        };
      });
      
      // Shuffle within score tiers for variety
      const sortedPedals = shuffleByTier(scoredPedals).map(s => s.pedal);
      
      const topPedal = sortedPedals[0];
      const actualSubtype = topPedal?.subtype || bestSubtype;
      const education = getPedalEducation(actualSubtype);
      const isFirstOfCategory = currentCategoryCount === 0;
      
      // Naming for extras (typically second of category)
      let stepName: string;
      let stepDescription: string;
      if (category === 'gain') {
        const subtypeDisplay = getDisplayName(actualSubtype, category);
        stepName = `Gain 2 (${subtypeDisplay})`;
        stepDescription = 'Stack with your main drive for more options and tonal variety.';
      } else {
        const displayName = getDisplayName(actualSubtype, category);
        stepName = isFirstOfCategory ? displayName : `Second ${displayName}`;
        stepDescription = getCategoryDescription(category, !isFirstOfCategory);
      }
      
      steps.push({
        id: `${category}-${actualSubtype}-${currentCategoryCount}`,
        name: stepName,
        description: stepDescription,
        category: category,
        subtype: actualSubtype,
        pedals: sortedPedals.slice(0, 40),
        education: education ? { whatItDoes: education.whatItDoes, beginnerTip: education.beginnerTip } : undefined,
      });
      
      categoryStepCount.set(category, currentCategoryCount + 1);
      if (actualSubtype) {
        offeredSubtypes.add(actualSubtype);
      }
    }
    
    return steps;
  };
  
  // Memoize steps with exploration level and refresh cycle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const steps = useMemo(() => generateSteps(), [
    genre, allPedals, onBoardIds, skipTuner, skipSecondGain, priceRange, explorationLevel, refreshCycle
  ]);
  
  // Get bonus additions and limit based on board size
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allBonusAdditions = useMemo(() => 
    getGenreBonusAdditions(genre, allPedals, onBoardIds, onBoardSubtypes, board.constraints.maxBudget, priceRange, explorationLevel),
    [genre, allPedals, onBoardIds, onBoardSubtypes, board.constraints.maxBudget, priceRange, explorationLevel, refreshCycle]
  );
  const bonusAdditions = allBonusAdditions.slice(0, recommendedBonus);
  
  // Refresh handler - progressively widens exploration, then cycles with new pedals
  const handleRefresh = () => {
    if (explorationLevel < EXPLORATION_LEVELS.length - 1) {
      // Widen the exploration
      setExplorationLevel(l => l + 1);
    } else {
      // At max exploration, restart cycle with new random pedals
      setExplorationLevel(0);
      setRefreshCycle(c => c + 1);
    }
  };
  
  // Clamp currentStepIndex to valid range (steps can shrink as pedals are added)
  // Use steps.length - 1 as max to avoid out-of-bounds access, but allow steps.length for essentialsComplete check
  const safeStepIndex = Math.min(currentStepIndex, Math.max(0, steps.length - 1));
  const currentStep = steps.length > 0 ? steps[safeStepIndex] : undefined;
  const currentAddition = bonusAdditions[currentAdditionIndex];
  const essentialsComplete = currentStepIndex >= steps.length;
  const additionsComplete = currentAdditionIndex >= bonusAdditions.length;
  
  // Check if current step is already satisfied (only by exact subtype match)
  const isStepSatisfied = (step: StarterKitStep) => {
    // Only check subtype, not category - this prevents all gain steps 
    // from lighting up when one gain pedal is added
    if (step.subtype && onBoardSubtypes.has(step.subtype)) return true;
    return false;
  };
  
  const handleAddPedal = (pedal: PedalWithStatus) => {
    dispatch({ type: 'ADD_PEDAL', pedal });
    // Auto-advance and scroll to top
    setTimeout(() => {
      if (phase === 'essentials') {
        // Always advance to next step - transition screen shows when essentialsComplete
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        if (currentAdditionIndex < bonusAdditions.length - 1) {
          setCurrentAdditionIndex(currentAdditionIndex + 1);
        } else {
          setCurrentAdditionIndex(bonusAdditions.length); // Mark complete
        }
      }
      // Scroll to top after advancing
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };
  
  const handleSkip = () => {
    if (phase === 'essentials') {
      if (currentStep) {
        setSkippedSteps(prev => new Set(prev).add(currentStep.id));
      }
      // Always advance to next step - transition screen shows when essentialsComplete
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      if (currentAdditionIndex < bonusAdditions.length - 1) {
        setCurrentAdditionIndex(currentAdditionIndex + 1);
      } else {
        setCurrentAdditionIndex(bonusAdditions.length); // Mark complete
      }
    }
  };
  
  const handleBack = () => {
    if (phase === 'additions') {
      if (currentAdditionIndex > 0) {
        setCurrentAdditionIndex(currentAdditionIndex - 1);
      } else {
        setPhase('essentials');
        setCurrentStepIndex(steps.length - 1);
      }
    } else {
      if (currentStepIndex > 0) {
        setCurrentStepIndex(currentStepIndex - 1);
      }
    }
  };
  
  const handleRestart = () => {
    setCurrentStepIndex(0);
    setSkippedSteps(new Set());
    setPhase('essentials');
    setCurrentAdditionIndex(0);
  };
  
  const handleSkipToAdditions = () => {
    if (bonusAdditions.length > 0) {
      setPhase('additions');
      setCurrentAdditionIndex(0);
    }
  };
  
  // Final completion screen
  if (phase === 'additions' && additionsComplete) {
    const addedCount = board.slots.length;
    const totalCost = board.slots.reduce((sum, s) => sum + s.pedal.reverbPrice, 0);
    
    return (
      <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
        <div 
          className="p-6 text-center"
          style={{ backgroundColor: `${genre.color}10` }}
        >
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${genre.color}20` }}
          >
            <PartyPopper className="w-8 h-8" style={{ color: genre.color }} />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            Your {genre.name} Board is Complete!
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            {addedCount} pedals • ${totalCost} total
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {board.slots.map(slot => (
              <span 
                key={slot.pedal.id}
                className="px-2 py-1 text-xs rounded-full bg-board-elevated text-white"
              >
                {slot.pedal.model}
              </span>
            ))}
          </div>
          
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleRestart}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-board-border text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
            >
              Start Over
            </button>
            {onFinishUp && (
              <button
                onClick={onFinishUp}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-board-accent text-white hover:bg-board-accent-dim transition-colors flex items-center gap-2"
              >
                Finish Up
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => { setPhase('essentials'); setCurrentStepIndex(0); }}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ backgroundColor: `${genre.color}20`, color: genre.color }}
            >
              Review Steps
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Transition screen between essentials and additions
  if (phase === 'essentials' && essentialsComplete && bonusAdditions.length > 0) {
    const addedCount = board.slots.length;
    const totalCost = board.slots.reduce((sum, s) => sum + s.pedal.reverbPrice, 0);
    const remainingBudget = board.constraints.maxBudget ? board.constraints.maxBudget - totalCost : 0;
    const usedArea = board.slots.reduce((sum, s) => sum + (s.pedal.widthMm * s.pedal.depthMm), 0);
    const totalArea = (board.constraints.maxWidthMm || 1) * (board.constraints.maxDepthMm || 1);
    const remainingArea = totalArea - usedArea;
    const remainingPercent = totalArea > 0 ? Math.round((remainingArea / totalArea) * 100) : 0;
    
    return (
      <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
        <div 
          className="p-6 text-center"
          style={{ backgroundColor: `${genre.color}10` }}
        >
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${genre.color}20` }}
          >
            <Check className="w-8 h-8" style={{ color: genre.color }} />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            Essentials Complete! 🎸
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            Your {genre.name} board has all the core pedals
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6 max-w-xs mx-auto">
            <div className="p-3 rounded-lg bg-board-elevated/50">
              <div className="text-lg font-bold text-white">{addedCount}</div>
              <div className="text-xs text-zinc-500">Pedals Added</div>
            </div>
            <div className="p-3 rounded-lg bg-board-elevated/50">
              <div className="text-lg font-bold text-white">${totalCost}</div>
              <div className="text-xs text-zinc-500">Total Cost</div>
            </div>
            {board.constraints.maxBudget && remainingBudget > 0 && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="text-lg font-bold text-green-400">${remainingBudget}</div>
                <div className="text-xs text-green-400/70">Budget Left</div>
              </div>
            )}
            {remainingPercent > 10 && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="text-lg font-bold text-blue-400">{remainingPercent}%</div>
                <div className="text-xs text-blue-400/70">Space Left</div>
              </div>
            )}
          </div>
          
          {/* Options */}
          <div className="space-y-3">
            {/* Finish Board Option */}
            <button
              onClick={() => { setPhase('additions'); setCurrentAdditionIndex(bonusAdditions.length); }}
              className="w-full px-4 py-3 text-sm font-medium rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Finish Board
              <span className="text-green-400/60 text-xs ml-1">— I'm happy with my essentials</span>
            </button>
            
            {/* Add More Option */}
            <button
              onClick={() => { setPhase('additions'); setCurrentAdditionIndex(0); }}
              className="w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: genre.color, color: 'white' }}
            >
              <Plus className="w-4 h-4" />
              Add More Pedals
              <span className="text-white/70 text-xs ml-1">— {bonusAdditions.length} suggestions within budget & space</span>
            </button>
          </div>
          
          {/* Preview of additions */}
          <div className="mt-4 pt-4 border-t border-board-border">
            <p className="text-xs text-zinc-500 mb-2">Available additions:</p>
            <div className="flex flex-wrap justify-center gap-1">
              {bonusAdditions.map(addition => (
                <span 
                  key={addition.id}
                  className="px-2 py-0.5 text-xs rounded-full bg-board-elevated text-zinc-400"
                >
                  {addition.name}
                </span>
              ))}
            </div>
          </div>
          
          {/* Secondary actions */}
          <div className="mt-4 pt-4 border-t border-board-border flex justify-center gap-3">
            <button
              onClick={handleRestart}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-board-border text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
            >
              Start Over
            </button>
            {onFinishUp && (
              <button
                onClick={onFinishUp}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-board-accent text-white hover:bg-board-accent-dim transition-colors flex items-center gap-2"
              >
                Finish Up
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // No additions available, show simple complete
  if (phase === 'essentials' && essentialsComplete && bonusAdditions.length === 0) {
    const addedCount = board.slots.length;
    const totalCost = board.slots.reduce((sum, s) => sum + s.pedal.reverbPrice, 0);
    
    return (
      <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
        <div 
          className="p-6 text-center"
          style={{ backgroundColor: `${genre.color}10` }}
        >
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${genre.color}20` }}
          >
            <PartyPopper className="w-8 h-8" style={{ color: genre.color }} />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            Your {genre.name} Board is Ready!
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            {addedCount} pedals • ${totalCost} total
          </p>
          
          <div className="flex justify-center gap-3">
            <button
              onClick={handleRestart}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-board-border text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
            >
              Start Over
            </button>
            {onFinishUp && (
              <button
                onClick={onFinishUp}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-board-accent text-white hover:bg-board-accent-dim transition-colors flex items-center gap-2"
              >
                Finish Up
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Current item to display
  const isAdditionsPhase = phase === 'additions';
  const displayItem = isAdditionsPhase ? currentAddition : currentStep;
  const totalSteps = steps.length + (bonusAdditions.length > 0 ? 1 : 0); // +1 for additions section
  const currentProgress = isAdditionsPhase 
    ? steps.length + currentAdditionIndex + 1 
    : safeStepIndex + 1;
  
  const stepSatisfied = !isAdditionsPhase && currentStep ? isStepSatisfied(currentStep) : false;
  
  // Safety check: if no steps and no additions, show a fallback
  if (steps.length === 0 && bonusAdditions.length === 0) {
    return (
      <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
        <div className="p-6 text-center">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${genre.color}20` }}
          >
            <GraduationCap className="w-8 h-8" style={{ color: genre.color }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Build Your {genre.name} Board
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            Use the "All Pedals" tab to browse and add pedals to your board.
          </p>
          {onFinishUp && board.slots.length > 0 && (
            <button
              onClick={onFinishUp}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-board-accent text-white hover:bg-board-accent-dim transition-colors flex items-center gap-2 mx-auto"
            >
              Finish Up
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Safety check: if in essentials phase but no current step, show transition to additions
  if (!isAdditionsPhase && !currentStep) {
    // No more steps available - treat as essentials complete
    if (bonusAdditions.length > 0) {
      const addedCount = board.slots.length;
      const totalCost = board.slots.reduce((sum, s) => sum + s.pedal.reverbPrice, 0);
      return (
        <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
          <div className="p-6 text-center" style={{ backgroundColor: `${genre.color}10` }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${genre.color}20` }}>
              <Check className="w-8 h-8" style={{ color: genre.color }} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Essentials Complete! 🎸</h2>
            <p className="text-sm text-zinc-400 mb-4">{addedCount} pedals • ${totalCost} total</p>
            <div className="space-y-3">
              <button
                onClick={() => { setPhase('additions'); setCurrentAdditionIndex(bonusAdditions.length); }}
                className="w-full px-4 py-3 text-sm font-medium rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Finish Board
              </button>
              <button
                onClick={() => { setPhase('additions'); setCurrentAdditionIndex(0); }}
                className="w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: genre.color, color: 'white' }}
              >
                <Plus className="w-4 h-4" />
                Add More Pedals ({bonusAdditions.length} available)
              </button>
            </div>
          </div>
        </div>
      );
    }
    // No bonus additions either - show complete
    return (
      <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
        <div className="p-6 text-center" style={{ backgroundColor: `${genre.color}10` }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${genre.color}20` }}>
            <PartyPopper className="w-8 h-8" style={{ color: genre.color }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Your {genre.name} Board is Ready!</h2>
          <p className="text-sm text-zinc-400 mb-4">{board.slots.length} pedals added</p>
          <div className="flex justify-center gap-3">
            <button onClick={handleRestart} className="px-4 py-2 text-sm font-medium rounded-lg border border-board-border text-board-muted hover:text-white hover:bg-board-elevated transition-colors">
              Start Over
            </button>
            {onFinishUp && (
              <button onClick={onFinishUp} className="px-4 py-2 text-sm font-medium rounded-lg bg-board-accent text-white hover:bg-board-accent-dim transition-colors flex items-center gap-2">
                Finish Up
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div ref={containerRef} className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
      {/* Header with Progress */}
      <div 
        className="p-4 border-b border-board-border"
        style={{ backgroundColor: `${genre.color}10` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${genre.color}20` }}
            >
              {isAdditionsPhase ? (
                <Sparkles className="w-5 h-5" style={{ color: genre.color }} />
              ) : (
                <GraduationCap className="w-5 h-5" style={{ color: genre.color }} />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-white">
                {isAdditionsPhase ? 'Bonus Additions' : `${genre.name} Essentials`}
              </h2>
              <p className="text-xs text-board-muted">
                {isAdditionsPhase 
                  ? `Addition ${currentAdditionIndex + 1} of ${bonusAdditions.length}`
                  : `Step ${safeStepIndex + 1} of ${steps.length}`
                }
                {' · '}
                <span className="text-board-accent">~{boardCapacity} pedals fit your board</span>
              </p>
            </div>
          </div>
          
          {/* Skip to additions (during essentials) */}
          {!isAdditionsPhase && bonusAdditions.length > 0 && (
            <button
              onClick={handleSkipToAdditions}
              className="text-xs text-board-muted hover:text-white transition-colors"
            >
              Skip to extras →
            </button>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="flex gap-1">
          {/* Essential steps */}
          {steps.map((step, index) => {
            const isCurrent = !isAdditionsPhase && index === safeStepIndex;
            const isPast = index < safeStepIndex || isAdditionsPhase;
            const isSkipped = skippedSteps.has(step.id);
            
            return (
              <button
                key={step.id}
                onClick={() => { setPhase('essentials'); setCurrentStepIndex(index); }}
                className={`flex-1 h-2 rounded-full transition-all ${
                  isCurrent ? 'ring-2 ring-offset-1 ring-offset-board-surface' : ''
                }`}
                style={{
                  // Only show as complete if actually past - not based on satisfaction
                  // This prevents future steps from lighting up out of order
                  backgroundColor: isPast
                    ? genre.color
                    : isSkipped
                      ? '#52525b'
                      : `${genre.color}30`,
                }}
                title={step.name}
              />
            );
          })}
          
          {/* Divider for additions */}
          {bonusAdditions.length > 0 && (
            <>
              <div className="w-px bg-board-border mx-1" />
              {bonusAdditions.map((addition, index) => {
                const isCurrent = isAdditionsPhase && index === currentAdditionIndex;
                const isPast = isAdditionsPhase && index < currentAdditionIndex;
                
                return (
                  <button
                    key={addition.id}
                    onClick={() => { setPhase('additions'); setCurrentAdditionIndex(index); }}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      isCurrent ? 'ring-2 ring-offset-1 ring-offset-board-surface' : ''
                    }`}
                    style={{
                      backgroundColor: isPast
                        ? '#f59e0b'
                        : isCurrent
                          ? '#f59e0b'
                          : '#f59e0b30',
                    }}
                    title={addition.name}
                  />
                );
              })}
            </>
          )}
        </div>
        
        {/* Phase indicator */}
        <div className="flex gap-2 mt-3">
          <span className={`px-2 py-0.5 text-[10px] rounded-full ${
            !isAdditionsPhase ? 'bg-white/20 text-white' : 'text-board-muted'
          }`}>
            Essentials
          </span>
          {bonusAdditions.length > 0 && (
            <span className={`px-2 py-0.5 text-[10px] rounded-full ${
              isAdditionsPhase ? 'bg-amber-500/20 text-amber-400' : 'text-board-muted'
            }`}>
              + Additions
            </span>
          )}
        </div>
      </div>
      
      {/* Current Step/Addition */}
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {!isAdditionsPhase && currentStep?.category && (
              <span 
                className="px-2 py-0.5 text-xs font-medium rounded"
                style={{ 
                  backgroundColor: `${CATEGORY_INFO[currentStep.category].color}20`, 
                  color: CATEGORY_INFO[currentStep.category].color 
                }}
              >
                {CATEGORY_INFO[currentStep.category].displayName}
              </span>
            )}
            {isAdditionsPhase && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-500/20 text-amber-400">
                BONUS
              </span>
            )}
            {stepSatisfied && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Already added
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-bold text-white">
              {isAdditionsPhase 
                ? `Add a ${currentAddition?.name}?` 
                : `Choose a ${currentStep?.name || 'Pedal'} ${getShortPurpose(currentStep?.subtype, currentStep?.category)}`}
            </h3>
            {/* Skip Tuner option - only show on tuner step */}
            {!isAdditionsPhase && currentStep?.subtype === 'Tuner' && (
              <button
                onClick={() => {
                  setSkipTuner(true);
                  // Stay at index 0 - the steps will regenerate without tuner,
                  // so index 0 will now be the first genre pedal
                  setCurrentStepIndex(0);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all border border-amber-500/50 hover:border-amber-500 flex items-center gap-2 animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Skip tuner
              </button>
            )}
            {/* Skip Second Drive option - only show on Gain 2 step */}
            {!isAdditionsPhase && currentStep?.category === 'gain' && currentStep?.id?.includes('gain-') && !currentStep?.id?.includes('-0') && (
              <button
                onClick={() => {
                  setSkipSecondGain(true);
                  // Move to next step - the steps will regenerate without second gain
                  setCurrentStepIndex(currentStepIndex);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all border border-amber-500/50 hover:border-amber-500 flex items-center gap-2 animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Skip second drive
              </button>
            )}
          </div>
          <p className="text-sm text-zinc-400">
            {isAdditionsPhase ? currentAddition?.reason : currentStep?.description}
          </p>
        </div>
        
        {/* Education (essentials only) */}
        {!isAdditionsPhase && currentStep?.education && (
          <div className="mb-4 p-3 rounded-lg bg-board-elevated border border-board-border">
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-board-highlight flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-board-highlight mb-1">What does it do?</h4>
                <p className="text-xs text-zinc-400">{currentStep.education.whatItDoes}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-board-border">
              <p className="text-xs text-zinc-500">
                <span className="text-board-highlight font-medium">Tip:</span> {currentStep.education.beginnerTip}
              </p>
            </div>
          </div>
        )}
        
        {/* Sort & Filter Options */}
        <div className="mb-4 space-y-2">
          {/* Sort Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-board-muted">
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort:</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { value: 'default', label: 'Recommended' },
                { value: 'price-asc', label: 'Price ↑' },
                { value: 'price-desc', label: 'Price ↓' },
                { value: 'rating-asc', label: 'Rating ↑' },
                { value: 'rating-desc', label: 'Rating ↓' },
                { value: 'name-asc', label: 'Name ↑' },
                { value: 'name-desc', label: 'Name ↓' },
                { value: 'size-asc', label: 'Size ↑' },
                { value: 'size-desc', label: 'Size ↓' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as SortOption)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    sortBy === option.value
                      ? 'bg-board-accent text-white'
                      : 'bg-board-elevated text-board-muted hover:text-white hover:bg-board-surface border border-board-border'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Price Range Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-board-muted">
              <span className="text-green-400">$</span>
              <span>Price Range:</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {(Object.entries(PRICE_RANGES) as [PriceRange, { label: string; min: number; max: number }][]).map(([key, range]) => (
                <button
                  key={key}
                  onClick={() => setPriceRange(key)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    priceRange === key
                      ? 'bg-green-600 text-white'
                      : 'bg-board-elevated text-board-muted hover:text-white hover:bg-board-surface border border-board-border'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Pedal Options */}
        <div className="space-y-2" key={`pedals-${currentStep?.id || 'none'}-${sortBy}-${priceRange}`}>
          {(() => {
            const pedalsToShow = isAdditionsPhase ? currentAddition?.pedals : currentStep?.pedals;
            if (!pedalsToShow || pedalsToShow.length === 0) {
              return (
                <div className="p-4 rounded-lg bg-board-elevated border border-board-border text-center">
                  <p className="text-board-muted text-sm">No pedals available for this step.</p>
                </div>
              );
            }
            const filteredPedals = sortPedals(pedalsToShow);
            
            // Show message if no pedals match price range
            if (filteredPedals.length === 0 && priceRange !== 'all') {
              return (
                <div className="p-4 rounded-lg bg-board-elevated border border-board-border text-center">
                  <p className="text-board-muted text-sm">
                    No pedals found in the <span className="text-green-400 font-medium">{PRICE_RANGES[priceRange].label}</span> range for this category.
                  </p>
                  <button
                    onClick={() => setPriceRange('all')}
                    className="mt-2 px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-500 transition-colors"
                  >
                    Show All Prices
                  </button>
                </div>
              );
            }
            
            // Split pedals into tiers: first 16 = Highly Recommended, next 24 = Could Be Cool
            const usesTiers = sortBy === 'default' && priceRange === 'all';
            const recommendedPedals = usesTiers ? filteredPedals.slice(0, 16) : [];
            const coolPedals = usesTiers ? filteredPedals.slice(16) : filteredPedals;
            
            const renderPedalThumbnail = (pedal: PedalWithStatus, tier: 'recommended' | 'cool', index: number) => {
              const isOnBoard = onBoardIds.has(pedal.id);
              const tierColors = {
                recommended: { 
                  border: isAdditionsPhase ? 'border-amber-500/40' : 'border-blue-500/40', 
                  bg: isAdditionsPhase ? 'bg-amber-500/10' : 'bg-blue-500/10',
                  hover: isAdditionsPhase ? 'hover:border-amber-400' : 'hover:border-blue-400',
                },
                cool: { 
                  border: 'border-board-border', 
                  bg: 'bg-board-elevated/30',
                  hover: 'hover:border-zinc-500',
                },
              };
              
              // Determine tooltip position based on column (8 columns)
              const col = index % 8;
              const isLeftEdge = col <= 1;
              const isRightEdge = col >= 6;
              
              // Position classes for tooltip
              const tooltipPosition = isLeftEdge 
                ? 'left-0' 
                : isRightEdge 
                  ? 'right-0' 
                  : 'left-1/2 -translate-x-1/2';
              
              // Arrow position
              const arrowPosition = isLeftEdge
                ? 'left-4'
                : isRightEdge
                  ? 'right-4'
                  : 'left-1/2 -translate-x-1/2';
              
              return (
                <div 
                  key={pedal.id}
                  className="group relative"
                >
                  {/* Thumbnail Card - Compact */}
                  <button
                    onClick={() => !isOnBoard && handleAddPedal(pedal)}
                    disabled={isOnBoard}
                    className={`w-full p-1.5 rounded-lg border transition-all ${
                      isOnBoard
                        ? 'border-green-500/50 bg-green-500/10 cursor-default'
                        : `${tierColors[tier].border} ${tierColors[tier].bg} ${tierColors[tier].hover} cursor-pointer hover:scale-[1.03]`
                    }`}
                  >
                    {/* Pedal Image Placeholder - Smaller */}
                    <div className="relative aspect-square mb-1 rounded bg-board-dark/50 flex items-center justify-center overflow-hidden">
                      <PedalImage category={pedal.category} size="sm" />
                      {isOnBoard && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Name - Compact */}
                    <h4 className="font-medium text-white text-[9px] leading-tight line-clamp-2 text-center">
                      {pedal.model}
                    </h4>
                    
                    {/* Quick Price */}
                    <p className="text-[8px] text-board-muted text-center">
                      ${pedal.reverbPrice}
                    </p>
                  </button>
                  
                  {/* Hover Tooltip - Position-aware */}
                  <div className={`absolute ${tooltipPosition} bottom-full mb-1 w-56 p-2.5 rounded-lg bg-board-elevated border border-board-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none`}>
                    <div className="text-xs font-semibold text-white mb-1">{pedal.brand} {pedal.model}</div>
                    
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] mb-1.5">
                      <div className="flex justify-between">
                        <span className="text-board-muted">Price:</span>
                        <span className="text-white font-medium">${pedal.reverbPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-board-muted">Rating:</span>
                        <span className="text-white">{pedal.categoryRating}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-board-muted">Size:</span>
                        <span className="text-white">{formatInches(pedal.widthMm)}" × {formatInches(pedal.depthMm)}"</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-board-muted">Power:</span>
                        <span className="text-white">{pedal.currentMa}mA</span>
                      </div>
                    </div>
                    
                    {pedal.description && (
                      <p className="text-[9px] text-zinc-400 leading-relaxed border-t border-board-border pt-1.5">
                        {pedal.description}
                      </p>
                    )}
                    
                    {/* Watch Review Link */}
                    <a
                      href={getYouTubeReviewUrl(pedal.brand, pedal.model)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors pointer-events-auto"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Watch review
                    </a>
                    
                    {/* Tooltip arrow - Position-aware */}
                    <div className={`absolute ${arrowPosition} top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-board-elevated`} />
                  </div>
                </div>
              );
            };
            
            return (
              <>
                {/* Refresh Button with Exploration Level */}
                {usesTiers && (
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium ${
                        explorationLevel === 0 ? 'text-blue-400' :
                        explorationLevel === 1 ? 'text-green-400' :
                        explorationLevel === 2 ? 'text-amber-400' :
                        'text-purple-400'
                      }`}>
                        {currentExploration.name}
                      </span>
                      <span className="text-[9px] text-board-muted">
                        {currentExploration.description}
                      </span>
                    </div>
                    <button
                      onClick={handleRefresh}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all transform hover:scale-105 ${
                        explorationLevel === EXPLORATION_LEVELS.length - 1
                          ? 'text-purple-200 bg-purple-500/30 hover:bg-purple-500/40 animate-glow-pulse-purple border border-purple-400/30'
                          : 'text-cyan-200 bg-cyan-500/20 hover:bg-cyan-500/30 animate-glow-pulse border border-cyan-400/30'
                      }`}
                      title={explorationLevel === EXPLORATION_LEVELS.length - 1 
                        ? "Start fresh cycle with new pedals" 
                        : "Widen suggestions"}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${explorationLevel < EXPLORATION_LEVELS.length - 1 ? 'animate-spin-slow' : ''}`} />
                      <span>{explorationLevel === EXPLORATION_LEVELS.length - 1 ? 'New cycle' : 'Explore more'}</span>
                    </button>
                  </div>
                )}
                
                {/* Highly Recommended Section */}
                {usesTiers && recommendedPedals.length > 0 && (
                  <div className="mb-4">
                    <div className={`text-[10px] font-semibold mb-2 flex items-center gap-1.5 ${
                      isAdditionsPhase ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      <span>👍</span>
                      <span>Highly Recommended</span>
                      <span className="text-board-muted font-normal">({recommendedPedals.length})</span>
                    </div>
                    <div className="grid grid-cols-8 gap-1.5">
                      {recommendedPedals.map((pedal, idx) => renderPedalThumbnail(pedal, 'recommended', idx))}
                    </div>
                  </div>
                )}
                
                {/* Could Be Cool Section */}
                {coolPedals.length > 0 && (
                  <div>
                    {usesTiers && (
                      <div className="text-[10px] font-semibold mb-2 flex items-center gap-1.5 text-zinc-400">
                        <span>✨</span>
                        <span>Could Be Cool</span>
                        <span className="text-board-muted font-normal">({coolPedals.length})</span>
                      </div>
                    )}
                    <div className="grid grid-cols-8 gap-1.5">
                      {coolPedals.map((pedal, idx) => renderPedalThumbnail(pedal, 'cool', idx))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
      
    </div>
  );
}
