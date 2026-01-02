import { useState } from 'react';
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
      .slice(0, 3);
  };

  // Genre-specific additions
  switch (genre.id) {
    case 'rock':
    case 'metal':
      // Second drive for stacking
      if (onBoardSubtypes.has('Overdrive') || onBoardSubtypes.has('Distortion')) {
        const drives = findPedals('gain', ['Overdrive', 'Distortion']);
        if (drives.length > 0) {
          additions.push({
            id: 'second-drive',
            name: 'Second Drive',
            reason: 'Stack drives for more gain options and tonal variety',
            category: 'gain',
            pedals: drives,
          });
        }
      }
      // Boost for leads
      if (!onBoardSubtypes.has('Boost')) {
        const boosts = findPedals('gain', ['Boost']);
        if (boosts.length > 0) {
          additions.push({
            id: 'boost',
            name: 'Boost Pedal',
            reason: 'Push your amp or stack with drives for solos',
            category: 'gain',
            subtype: 'Boost',
            pedals: boosts,
          });
        }
      }
      // Wah for rock
      if (!onBoardSubtypes.has('Wah')) {
        const wahs = findPedals('filter', ['Wah']);
        if (wahs.length > 0) {
          additions.push({
            id: 'wah',
            name: 'Wah Pedal',
            reason: 'Essential for expressive leads and funk rhythms',
            category: 'filter',
            subtype: 'Wah',
            pedals: wahs,
          });
        }
      }
      break;
      
    case 'blues':
      // Boost for dynamics
      if (!onBoardSubtypes.has('Boost')) {
        const boosts = findPedals('gain', ['Boost']);
        if (boosts.length > 0) {
          additions.push({
            id: 'boost',
            name: 'Clean Boost',
            reason: 'Add volume for solos without changing your tone',
            category: 'gain',
            subtype: 'Boost',
            pedals: boosts,
          });
        }
      }
      // Wah for expression
      if (!onBoardSubtypes.has('Wah')) {
        const wahs = findPedals('filter', ['Wah']);
        if (wahs.length > 0) {
          additions.push({
            id: 'wah',
            name: 'Wah Pedal',
            reason: 'The voice of blues - Hendrix, SRV, Clapton all used one',
            category: 'filter',
            subtype: 'Wah',
            pedals: wahs,
          });
        }
      }
      // Tremolo for vintage vibes
      if (!onBoardSubtypes.has('Tremolo')) {
        const trems = findPedals('modulation', ['Tremolo']);
        if (trems.length > 0) {
          additions.push({
            id: 'tremolo',
            name: 'Tremolo',
            reason: 'Classic vintage effect - think B.B. King ballads',
            category: 'modulation',
            subtype: 'Tremolo',
            pedals: trems,
          });
        }
      }
      break;
      
    case 'ambient':
    case 'shoegaze':
    case 'worship':
      // Volume pedal for swells
      if (!onBoardSubtypes.has('Volume')) {
        const volumes = findPedals('volume', ['Volume']);
        if (volumes.length > 0) {
          additions.push({
            id: 'volume',
            name: 'Volume Pedal',
            reason: 'Essential for swells and ambient pad sounds',
            category: 'volume',
            subtype: 'Volume',
            pedals: volumes,
          });
        }
      }
      // Second delay
      const delaySubtypes = ['Tape', 'Analog', 'Digital', 'Multi'];
      const existingDelayType = Array.from(onBoardSubtypes).find(s => delaySubtypes.includes(s || ''));
      if (existingDelayType) {
        const otherDelays = findPedals('delay', delaySubtypes.filter(t => t !== existingDelayType));
        if (otherDelays.length > 0) {
          additions.push({
            id: 'second-delay',
            name: 'Second Delay',
            reason: 'Stack delays for complex rhythms and ambient textures',
            category: 'delay',
            pedals: otherDelays,
          });
        }
      }
      // Second reverb
      if (onBoardSubtypes.has('Ambient') || onBoardSubtypes.has('Multi')) {
        const reverbs = findPedals('reverb', undefined, ['Ambient']);
        if (reverbs.length > 0) {
          additions.push({
            id: 'second-reverb',
            name: 'Second Reverb',
            reason: 'Layer reverbs for massive ambient soundscapes',
            category: 'reverb',
            pedals: reverbs,
          });
        }
      }
      // Looper
      if (!onBoardSubtypes.has('Looper')) {
        const loopers = allPedals.filter(p => p.subtype === 'Looper' && p.fits && !onBoardIds.has(p.id)).slice(0, 3);
        if (loopers.length > 0) {
          additions.push({
            id: 'looper',
            name: 'Looper',
            reason: 'Build layers and create ambient soundscapes live',
            subtype: 'Looper',
            pedals: loopers,
          });
        }
      }
      break;
      
    case 'indie':
      // Tremolo for texture
      if (!onBoardSubtypes.has('Tremolo')) {
        const trems = findPedals('modulation', ['Tremolo']);
        if (trems.length > 0) {
          additions.push({
            id: 'tremolo',
            name: 'Tremolo',
            reason: 'Classic indie texture - think Radiohead, Tame Impala',
            category: 'modulation',
            subtype: 'Tremolo',
            pedals: trems,
          });
        }
      }
      // Fuzz for contrast
      if (!onBoardSubtypes.has('Fuzz')) {
        const fuzzes = findPedals('gain', ['Fuzz']);
        if (fuzzes.length > 0) {
          additions.push({
            id: 'fuzz',
            name: 'Fuzz',
            reason: 'Add gritty contrast to your clean tones',
            category: 'gain',
            subtype: 'Fuzz',
            pedals: fuzzes,
          });
        }
      }
      break;
      
    case 'funk':
      // Auto-wah / Envelope filter
      if (!onBoardSubtypes.has('Envelope') && !onBoardSubtypes.has('Auto-Wah')) {
        const envelopes = findPedals('filter', ['Envelope', 'Auto-Wah']);
        if (envelopes.length > 0) {
          additions.push({
            id: 'envelope',
            name: 'Envelope Filter',
            reason: 'Get that funky quack without a wah pedal',
            category: 'filter',
            pedals: envelopes,
          });
        }
      }
      // Octave for bass lines
      const octaves = allPedals.filter(p => p.subtype === 'Octave' && p.fits && !onBoardIds.has(p.id)).slice(0, 3);
      if (octaves.length > 0 && !onBoardSubtypes.has('Octave')) {
        additions.push({
          id: 'octave',
          name: 'Octave Pedal',
          reason: 'Fatten your sound or play bass lines on guitar',
          subtype: 'Octave',
          pedals: octaves,
        });
      }
      break;
      
    case 'prog':
      // Pitch shifter
      if (!onBoardSubtypes.has('Shifter') && !onBoardSubtypes.has('Harmonizer')) {
        const pitches = findPedals('pitch', ['Shifter', 'Harmonizer', 'Whammy']);
        if (pitches.length > 0) {
          additions.push({
            id: 'pitch',
            name: 'Pitch Shifter',
            reason: 'Create harmonies and wild pitch effects',
            category: 'pitch',
            pedals: pitches,
          });
        }
      }
      // Looper for practice and composition
      if (!onBoardSubtypes.has('Looper')) {
        const loopers = allPedals.filter(p => p.subtype === 'Looper' && p.fits && !onBoardIds.has(p.id)).slice(0, 3);
        if (loopers.length > 0) {
          additions.push({
            id: 'looper',
            name: 'Looper',
            reason: 'Essential for practicing and composing complex parts',
            subtype: 'Looper',
            pedals: loopers,
          });
        }
      }
      // Second drive
      if (onBoardSubtypes.has('Overdrive') || onBoardSubtypes.has('Distortion')) {
        const drives = findPedals('gain', ['Overdrive', 'Distortion']);
        if (drives.length > 0) {
          additions.push({
            id: 'second-drive',
            name: 'Second Drive',
            reason: 'More gain options for dynamic prog arrangements',
            category: 'gain',
            pedals: drives,
          });
        }
      }
      break;
      
    case 'jazz':
      // Chorus for warmth
      if (!onBoardSubtypes.has('Chorus')) {
        const choruses = findPedals('modulation', ['Chorus']);
        if (choruses.length > 0) {
          additions.push({
            id: 'chorus',
            name: 'Chorus',
            reason: 'Add warmth and dimension to clean tones',
            category: 'modulation',
            subtype: 'Chorus',
            pedals: choruses,
          });
        }
      }
      // EQ for tone shaping
      if (!onBoardSubtypes.has('Parametric') && !onBoardSubtypes.has('Graphic')) {
        const eqs = findPedals('eq', ['Parametric', 'Graphic']);
        if (eqs.length > 0) {
          additions.push({
            id: 'eq',
            name: 'EQ Pedal',
            reason: 'Fine-tune your tone for different rooms and guitars',
            category: 'eq',
            pedals: eqs,
          });
        }
      }
      break;
      
    case 'country':
      // Compressor if not already
      if (!onBoardSubtypes.has('Compressor')) {
        const comps = findPedals('dynamics', ['Compressor']);
        if (comps.length > 0) {
          additions.push({
            id: 'compressor',
            name: 'Compressor',
            reason: 'Essential for chicken pickin\' and clean country tones',
            category: 'dynamics',
            subtype: 'Compressor',
            pedals: comps,
          });
        }
      }
      // Volume pedal for swells
      if (!onBoardSubtypes.has('Volume')) {
        const volumes = findPedals('volume', ['Volume']);
        if (volumes.length > 0) {
          additions.push({
            id: 'volume',
            name: 'Volume Pedal',
            reason: 'Pedal steel-style swells are a country staple',
            category: 'volume',
            subtype: 'Volume',
            pedals: volumes,
          });
        }
      }
      break;
      
    case 'experimental':
      // Synth/Fuzz-synth
      const synths = allPedals.filter(p => (p.category === 'synth' || p.subtype === 'Fuzz/Synth') && p.fits && !onBoardIds.has(p.id)).slice(0, 3);
      if (synths.length > 0) {
        additions.push({
          id: 'synth',
          name: 'Synth Pedal',
          reason: 'Transform your guitar into a synthesizer',
          category: 'synth',
          pedals: synths,
        });
      }
      // Ring mod or bitcrusher
      const weird = allPedals.filter(p => 
        (p.subtype === 'Ring Mod' || p.subtype === 'Bitcrusher' || p.subtype === 'Glitch') && 
        p.fits && !onBoardIds.has(p.id)
      ).slice(0, 3);
      if (weird.length > 0) {
        additions.push({
          id: 'weird',
          name: 'Weird Effects',
          reason: 'Go beyond traditional sounds with glitch and destruction',
          pedals: weird,
        });
      }
      break;
  }
  
  // Universal additions (for all genres if not already suggested)
  
  // Buffer/Signal enhancer for long cable runs
  if (additions.length < 3) {
    const buffers = allPedals.filter(p => 
      (p.subtype === 'Buffer' || p.subtype === 'Signal Enhancer') && 
      p.fits && !onBoardIds.has(p.id)
    ).slice(0, 3);
    if (buffers.length > 0 && !onBoardSubtypes.has('Buffer')) {
      additions.push({
        id: 'buffer',
        name: 'Buffer',
        reason: 'Preserve your tone with long cable runs or many pedals',
        subtype: 'Buffer',
        pedals: buffers,
      });
    }
  }
  
  return additions.slice(0, 4); // Max 4 bonus additions
}

export function GenreStarterKit() {
  const { state, dispatch } = useBoard();
  const { selectedGenre, allPedals, board } = state;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [expandedPedal, setExpandedPedal] = useState<string | null>(null);
  const [skippedSteps, setSkippedSteps] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<'essentials' | 'additions'>('essentials');
  const [currentAdditionIndex, setCurrentAdditionIndex] = useState(0);
  
  const genre = selectedGenre ? getGenreById(selectedGenre) : null;
  
  if (!genre) {
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
      steps.push({
        id: 'tuner',
        name: 'Tuner',
        description: 'Every guitarist needs a tuner! It keeps you in tune and can mute your signal.',
        subtype: 'Tuner',
        pedals: tunerPedals.slice(0, 3),
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
          name: primarySubtype,
          description: getCategoryDescription(category),
          category: category,
          subtype: primarySubtype,
          pedals: sortedPedals.slice(0, 3),
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
    // Auto-advance
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
    <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
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
      <div className="p-4">
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
        <div className="space-y-3">
          {(isAdditionsPhase ? currentAddition.pedals : currentStep.pedals).map((pedal, index) => {
            const isOnBoard = onBoardIds.has(pedal.id);
            const isExpanded = expandedPedal === pedal.id;
            
            return (
              <div 
                key={pedal.id}
                className={`p-4 rounded-xl border transition-all ${
                  isOnBoard
                    ? 'border-green-500/50 bg-green-500/10'
                    : index === 0
                      ? isAdditionsPhase 
                        ? 'border-amber-500/50 bg-amber-500/5'
                        : 'border-board-accent/50 bg-board-accent/5'
                      : 'border-board-border bg-board-elevated/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isOnBoard
                      ? 'bg-green-500/20 text-green-400'
                      : index === 0
                        ? isAdditionsPhase 
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-board-accent/20 text-board-accent'
                        : 'bg-board-elevated text-board-muted'
                  }`}>
                    {isOnBoard ? <Check className="w-4 h-4" /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-medium text-white">{pedal.model}</h4>
                      {index === 0 && !isOnBoard && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                          isAdditionsPhase 
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-board-accent/20 text-board-accent'
                        }`}>
                          TOP PICK
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-board-muted mb-2">{pedal.brand}</p>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-white font-medium">${pedal.reverbPrice}</span>
                      <span className="text-board-muted">{formatInches(pedal.widthMm)}" × {formatInches(pedal.depthMm)}"</span>
                      <span className="text-board-muted">{pedal.currentMa}mA</span>
                    </div>
                  </div>
                  
                  {/* Action */}
                  {isOnBoard ? (
                    <span className="px-3 py-1.5 text-xs font-medium text-green-400 bg-green-500/20 rounded-lg">
                      Added
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddPedal(pedal)}
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      style={{ 
                        backgroundColor: index === 0 
                          ? (isAdditionsPhase ? '#f59e0b' : genre.color)
                          : (isAdditionsPhase ? '#f59e0b20' : `${genre.color}20`),
                        color: index === 0 ? 'white' : (isAdditionsPhase ? '#f59e0b' : genre.color),
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  )}
                </div>
                
                {/* Expandable Details */}
                {pedal.description && (
                  <button
                    onClick={() => setExpandedPedal(isExpanded ? null : pedal.id)}
                    className="mt-2 text-xs text-board-muted hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Info className="w-3 h-3" />
                    {isExpanded ? 'Less info' : 'More info'}
                  </button>
                )}
                
                {isExpanded && pedal.description && (
                  <p className="mt-2 text-xs text-zinc-400 animate-fadeIn">
                    {pedal.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="p-4 border-t border-board-border flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={!isAdditionsPhase && currentStepIndex === 0}
          className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
            !isAdditionsPhase && currentStepIndex === 0
              ? 'text-board-muted/50 cursor-not-allowed'
              : 'text-board-muted hover:text-white hover:bg-board-elevated'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        
        <button
          onClick={handleSkip}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-board-border text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
        >
          {isAdditionsPhase ? 'No Thanks' : 'Skip'}
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
