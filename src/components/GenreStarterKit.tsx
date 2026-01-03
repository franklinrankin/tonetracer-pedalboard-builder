import { useState, useRef } from 'react';
import { GraduationCap, Plus, ChevronLeft, ChevronRight, Lightbulb, Info, Check, SkipForward, PartyPopper, Sparkles, Star } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { getGenreById, GenreProfile } from '../data/genres';
import { getPedalEducation } from '../data/pedalEducation';
import { CATEGORY_INFO } from '../data/categories';
import { PedalWithStatus, Category } from '../types';
import { formatInches } from '../utils/measurements';

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

// Genre-specific bonus additions logic
function getGenreBonusAdditions(
  genre: GenreProfile,
  allPedals: PedalWithStatus[],
  onBoardIds: Set<string>,
  onBoardSubtypes: Set<string | undefined>
): BonusAddition[] {
  const additions: BonusAddition[] = [];
  
  const findPedals = (category: Category, subtypes?: string[], excludeSubtypes?: string[]) => {
    return allPedals
      .filter(p => 
        p.category === category && 
        p.fits && 
        !onBoardIds.has(p.id) &&
        (!subtypes || subtypes.includes(p.subtype || '')) &&
        (!excludeSubtypes || !excludeSubtypes.includes(p.subtype || ''))
      )
      .sort((a, b) => Math.abs(a.reverbPrice - 120) - Math.abs(b.reverbPrice - 120))
      .slice(0, 11); // 1 top pick + 5 highly recommended + 5 could be cool
  };
  
  const findBySubtype = (subtypes: string[]) => {
    return allPedals
      .filter(p => 
        p.fits && 
        !onBoardIds.has(p.id) &&
        subtypes.includes(p.subtype || '')
      )
      .sort((a, b) => Math.abs(a.reverbPrice - 120) - Math.abs(b.reverbPrice - 120))
      .slice(0, 11); // 1 top pick + 5 highly recommended + 5 could be cool
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

export function GenreStarterKit() {
  const { state, dispatch } = useBoard();
  const { selectedGenres, allPedals, board } = state;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [expandedPedal, setExpandedPedal] = useState<string | null>(null);
  const [skippedSteps, setSkippedSteps] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<'essentials' | 'additions'>('essentials');
  const [currentAdditionIndex, setCurrentAdditionIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
  
  // Merge recommended categories from all genres (prioritize by frequency)
  const mergedCategories = (() => {
    const categoryCount = new Map<Category, number>();
    genres.forEach(g => {
      g.recommendedCategories.forEach(cat => {
        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
      });
    });
    // Sort by frequency (most common first), then by first genre's order
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
    recommendedCategories: mergedCategories,
    preferredSubtypes: mergedSubtypes,
  };
  
  const onBoardIds = new Set(board.slots.map(s => s.pedal.id));
  const onBoardCategories = new Set(board.slots.map(s => s.pedal.category));
  const onBoardSubtypes = new Set(board.slots.map(s => s.pedal.subtype));
  
  // Generate essential steps based on genre's recommended categories
  const generateSteps = (): StarterKitStep[] => {
    const steps: StarterKitStep[] = [];
    
    // Step 1: Tuner (always first)
    const tunerPedals = allPedals.filter(p => p.subtype === 'Tuner' && p.fits);
    if (tunerPedals.length > 0) {
      const education = getPedalEducation('Tuner');
      // Sort tuners by price (mid-range first)
      const sortedTuners = [...tunerPedals].sort((a, b) => {
        const aMidRange = Math.abs(a.reverbPrice - 80);
        const bMidRange = Math.abs(b.reverbPrice - 80);
        return aMidRange - bMidRange;
      });
      steps.push({
        id: 'tuner',
        name: 'Tuner',
        description: 'Every guitarist needs a tuner! It keeps you in tune and can mute your signal.',
        subtype: 'Tuner',
        pedals: sortedTuners.slice(0, 11), // 1 top pick + 5 highly recommended + 5 could be cool
        education: education ? {
          whatItDoes: education.whatItDoes,
          beginnerTip: education.beginnerTip,
        } : undefined,
      });
    }
    
    // Add steps based on genre's recommended categories (in order)
    for (const category of genre.recommendedCategories) {
      const categoryInfo = CATEGORY_INFO[category];
      
      // Get pedals for this category, prioritizing preferred subtypes
      const categoryPedals = allPedals.filter(p => 
        p.category === category && p.fits
      );
      
      // First try preferred subtypes for this genre
      const preferredPedals = categoryPedals.filter(p => 
        genre.preferredSubtypes.includes(p.subtype || '')
      );
      
      // Fall back to all category pedals if no preferred matches
      const pedalsToUse = preferredPedals.length > 0 ? preferredPedals : categoryPedals;
      
      // Sort by price (mid-range first for beginners)
      const sortedPedals = [...pedalsToUse].sort((a, b) => {
        const aMidRange = Math.abs(a.reverbPrice - 100);
        const bMidRange = Math.abs(b.reverbPrice - 100);
        return aMidRange - bMidRange;
      });
      
      if (sortedPedals.length > 0) {
        const primarySubtype = sortedPedals[0].subtype || categoryInfo.displayName;
        const education = getPedalEducation(primarySubtype);
        
        // Format display name - combine subtype with category for clarity
        const getDisplayName = (subtype: string, cat: Category): string => {
          // Subtypes that need category suffix for clarity
          const needsCategorySuffix: Record<string, string[]> = {
            delay: ['Analog', 'Digital', 'Tape', 'Multi'],
            reverb: ['Spring', 'Hall', 'Plate', 'Room', 'Shimmer', 'Ambient'],
            modulation: ['Multi'],
            gain: ['Multi'],
          };
          
          if (needsCategorySuffix[cat]?.includes(subtype)) {
            return `${subtype} ${categoryInfo.displayName}`;
          }
          return subtype;
        };
        
        const displayName = getDisplayName(primarySubtype, category);
        
        // Get description based on category
        const getCategoryDescription = (cat: Category): string => {
          const descriptions: Record<Category, string> = {
            gain: 'Drive and distortion for your tone',
            dynamics: 'Control your dynamics and sustain',
            filter: 'Shape your tone with filtering effects',
            eq: 'Fine-tune your frequencies',
            modulation: 'Add movement and texture to your sound',
            delay: 'Create echoes and rhythmic repeats',
            reverb: 'Add space and ambience',
            pitch: 'Shift and harmonize your pitch',
            volume: 'Control your volume and expression',
            utility: 'Essential tools for your signal chain',
            amp: 'Amp and cab simulation',
            synth: 'Synth and special effects',
          };
          return descriptions[cat] || `${categoryInfo.displayName} pedal`;
        };
        
        steps.push({
          id: `${category}-${primarySubtype}`,
          name: displayName,
          description: getCategoryDescription(category),
          category: category,
          subtype: primarySubtype,
          pedals: sortedPedals.slice(0, 11), // 1 top pick + 5 highly recommended + 5 could be cool
          education: education ? {
            whatItDoes: education.whatItDoes,
            beginnerTip: education.beginnerTip,
          } : undefined,
        });
      }
    }
    
    return steps;
  };
  
  const steps = generateSteps();
  const bonusAdditions = getGenreBonusAdditions(genre, allPedals, onBoardIds, onBoardSubtypes);
  
  const currentStep = steps[currentStepIndex];
  const currentAddition = bonusAdditions[currentAdditionIndex];
  const essentialsComplete = currentStepIndex >= steps.length;
  const additionsComplete = currentAdditionIndex >= bonusAdditions.length;
  
  // Check if current step is already satisfied
  const isStepSatisfied = (step: StarterKitStep) => {
    if (step.subtype && onBoardSubtypes.has(step.subtype)) return true;
    if (step.category && onBoardCategories.has(step.category)) return true;
    return false;
  };
  
  const handleAddPedal = (pedal: PedalWithStatus) => {
    dispatch({ type: 'ADD_PEDAL', pedal });
    // Auto-advance and scroll to top
    setTimeout(() => {
      if (phase === 'essentials') {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        } else {
          // Move to additions phase
          if (bonusAdditions.length > 0) {
            setPhase('additions');
            setCurrentAdditionIndex(0);
          }
        }
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
      setSkippedSteps(prev => new Set(prev).add(currentStep.id));
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        if (bonusAdditions.length > 0) {
          setPhase('additions');
          setCurrentAdditionIndex(0);
        }
      }
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
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRestart}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-board-border text-white hover:bg-board-elevated transition-colors"
            >
              Start Over
            </button>
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
            Essentials Complete!
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            {addedCount} pedals • ${totalCost} total
          </p>
          
          <div className="p-4 rounded-xl border border-board-accent/30 bg-board-accent/5 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-board-accent" />
              <h3 className="font-semibold text-white">Recommended Additions</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-3">
              We have {bonusAdditions.length} extra pedals to suggest for your {genre.name} sound
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {bonusAdditions.map(addition => (
                <span 
                  key={addition.id}
                  className="px-2 py-1 text-xs rounded-full border border-board-accent/30 text-board-accent"
                >
                  {addition.name}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setCurrentAdditionIndex(bonusAdditions.length)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-board-border text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
            >
              I'm Done
            </button>
            <button
              onClick={() => { setPhase('additions'); setCurrentAdditionIndex(0); }}
              className="px-6 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              style={{ backgroundColor: genre.color, color: 'white' }}
            >
              Show Me More
              <ChevronRight className="w-4 h-4" />
            </button>
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
          
          <button
            onClick={handleRestart}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-board-border text-white hover:bg-board-elevated transition-colors"
          >
            Start Over
          </button>
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
    : currentStepIndex + 1;
  
  const stepSatisfied = !isAdditionsPhase && currentStep ? isStepSatisfied(currentStep) : false;
  
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
                <Star className="w-5 h-5" style={{ color: genre.color }} />
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
                  : `Step ${currentStepIndex + 1} of ${steps.length}`
                }
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
            const isCurrent = !isAdditionsPhase && index === currentStepIndex;
            const isPast = index < currentStepIndex || isAdditionsPhase;
            const isSkipped = skippedSteps.has(step.id);
            const isSatisfied = isStepSatisfied(step);
            
            return (
              <button
                key={step.id}
                onClick={() => { setPhase('essentials'); setCurrentStepIndex(index); }}
                className={`flex-1 h-2 rounded-full transition-all ${
                  isCurrent ? 'ring-2 ring-offset-1 ring-offset-board-surface' : ''
                }`}
                style={{
                  backgroundColor: isPast || isSatisfied
                    ? genre.color
                    : isSkipped
                      ? '#52525b'
                      : `${genre.color}30`,
                  ringColor: isCurrent ? genre.color : undefined,
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
                      ringColor: isCurrent ? '#f59e0b' : undefined,
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
          
          <h3 className="text-xl font-bold text-white mb-1">
            {isAdditionsPhase ? `Add a ${currentAddition.name}?` : `Choose a ${currentStep.name}`}
          </h3>
          <p className="text-sm text-zinc-400">
            {isAdditionsPhase ? currentAddition.reason : currentStep.description}
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
        
        {/* Pedal Options */}
        <div className="space-y-2">
          {(isAdditionsPhase ? currentAddition.pedals : currentStep.pedals).map((pedal, index) => {
            const isOnBoard = onBoardIds.has(pedal.id);
            const isExpanded = expandedPedal === pedal.id;
            
            // Determine tier: 0 = Top Pick, 1-5 = Highly Recommended, 6+ = Could Be Cool
            const tier = index === 0 ? 'top' : index <= 5 ? 'recommended' : 'cool';
            const tierLabel = tier === 'top' ? 'TOP PICK' : tier === 'recommended' ? 'HIGHLY RECOMMENDED' : 'COULD BE COOL';
            const tierColors = {
              top: { border: isAdditionsPhase ? 'border-amber-500/50' : 'border-board-accent/50', bg: isAdditionsPhase ? 'bg-amber-500/5' : 'bg-board-accent/5', badge: isAdditionsPhase ? 'bg-amber-500/20 text-amber-400' : 'bg-board-accent/20 text-board-accent' },
              recommended: { border: 'border-blue-500/30', bg: 'bg-blue-500/5', badge: 'bg-blue-500/20 text-blue-400' },
              cool: { border: 'border-board-border', bg: 'bg-board-elevated/30', badge: 'bg-zinc-500/20 text-zinc-400' },
            };
            
            // Show tier headers
            const showTierHeader = index === 0 || index === 1 || index === 6;
            const tierHeaderText = index === 0 ? '⭐ Top Pick' : index === 1 ? '👍 Highly Recommended' : index === 6 ? '✨ Could Be Cool' : null;
            
            return (
              <div key={pedal.id}>
                {/* Tier Header */}
                {showTierHeader && tierHeaderText && (
                  <div className={`text-xs font-medium mb-2 mt-4 first:mt-0 ${
                    index === 0 ? (isAdditionsPhase ? 'text-amber-400' : 'text-board-accent') :
                    index === 1 ? 'text-blue-400' : 'text-zinc-500'
                  }`}>
                    {tierHeaderText}
                  </div>
                )}
                
                <div 
                  className={`p-3 rounded-xl border transition-all ${
                    isOnBoard
                      ? 'border-green-500/50 bg-green-500/10'
                      : `${tierColors[tier].border} ${tierColors[tier].bg}`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Rank */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isOnBoard
                        ? 'bg-green-500/20 text-green-400'
                        : tier === 'top'
                          ? (isAdditionsPhase ? 'bg-amber-500/20 text-amber-400' : 'bg-board-accent/20 text-board-accent')
                          : tier === 'recommended'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-board-elevated text-board-muted'
                    }`}>
                      {isOnBoard ? <Check className="w-4 h-4" /> : 
                       tier === 'top' ? <Star className="w-4 h-4" /> : 
                       <span className="text-xs font-bold">{index}</span>}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-medium text-white text-sm">{pedal.model}</h4>
                        {tier === 'top' && !isOnBoard && (
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${tierColors[tier].badge}`}>
                            {tierLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-board-muted mb-1">{pedal.brand}</p>
                      
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-white font-medium">${pedal.reverbPrice}</span>
                        <span className="text-board-muted">{formatInches(pedal.widthMm)}" × {formatInches(pedal.depthMm)}"</span>
                        <span className="text-board-muted">{pedal.currentMa}mA</span>
                      </div>
                    </div>
                    
                    {/* Action */}
                    {isOnBoard ? (
                      <span className="px-2 py-1 text-xs font-medium text-green-400 bg-green-500/20 rounded-lg">
                        Added
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddPedal(pedal)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                        style={{ 
                          backgroundColor: tier === 'top' 
                            ? (isAdditionsPhase ? '#f59e0b' : genre.color)
                            : tier === 'recommended'
                              ? '#3b82f620'
                              : '#52525b20',
                          color: tier === 'top' ? 'white' : tier === 'recommended' ? '#3b82f6' : '#a1a1aa',
                        }}
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    )}
                  </div>
                  
                  {/* Expandable Details */}
                  {pedal.description && (
                    <>
                      <button
                        onClick={() => setExpandedPedal(isExpanded ? null : pedal.id)}
                        className="mt-2 text-xs text-board-muted hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Info className="w-3 h-3" />
                        {isExpanded ? 'Less info' : 'More info'}
                      </button>
                      
                      {isExpanded && (
                        <p className="mt-2 text-xs text-zinc-400 animate-fadeIn">
                          {pedal.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
