import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronRight, Plus, X, Check, ArrowUpDown, Youtube, RotateCcw, Search, ChevronDown, Zap, Volume2 } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { useTheme } from '../context/ThemeContext';
import { getGenreById } from '../data/genres';
import { Category, PedalWithStatus } from '../types';
import { PedalImage } from '../components/PedalImage';
import { CATEGORY_INFO, getRatingLabel } from '../data/categories';
import { getYouTubeReviewUrl } from '../utils/youtube';
import { generateUUID } from '../utils/uuid';


interface BuildPageProps {
  onContinue: () => void;
  collection?: string[];
}

// Type slot represents a pedal TYPE with optional selected pedal
interface TypeSlot {
  id: string;
  type: string;
  category: Category;
  signalOrder: number;
  selectedPedalId?: string;
}

// All available types organized by category with signal chain order
const TYPE_OPTIONS: { type: string; category: Category; signalOrder: number }[] = [
  { type: 'Tuner', category: 'utility', signalOrder: 1 },
  { type: 'Wah', category: 'filter', signalOrder: 10 },
  { type: 'Envelope Filter', category: 'filter', signalOrder: 11 },
  { type: 'Compressor', category: 'dynamics', signalOrder: 20 },
  { type: 'Noise Gate', category: 'dynamics', signalOrder: 22 },
  { type: 'Octave', category: 'pitch', signalOrder: 30 },
  { type: 'Pitch Shifter', category: 'pitch', signalOrder: 31 },
  { type: 'Harmonizer', category: 'pitch', signalOrder: 33 },
  { type: 'Boost', category: 'gain', signalOrder: 40 },
  { type: 'Overdrive', category: 'gain', signalOrder: 45 },
  { type: 'Distortion', category: 'gain', signalOrder: 50 },
  { type: 'Fuzz', category: 'gain', signalOrder: 55 },
  { type: 'EQ', category: 'eq', signalOrder: 60 },
  { type: 'Chorus', category: 'modulation', signalOrder: 72 },
  { type: 'Phaser', category: 'modulation', signalOrder: 70 },
  { type: 'Flanger', category: 'modulation', signalOrder: 71 },
  { type: 'Tremolo', category: 'modulation', signalOrder: 74 },
  { type: 'Vibrato', category: 'modulation', signalOrder: 73 },
  { type: 'Rotary', category: 'modulation', signalOrder: 75 },
  { type: 'Uni-Vibe', category: 'modulation', signalOrder: 77 },
  { type: 'Synth', category: 'synth', signalOrder: 78 },
  { type: 'Analog Delay', category: 'delay', signalOrder: 90 },
  { type: 'Digital Delay', category: 'delay', signalOrder: 92 },
  { type: 'Tape Delay', category: 'delay', signalOrder: 91 },
  { type: 'Spring Reverb', category: 'reverb', signalOrder: 95 },
  { type: 'Hall Reverb', category: 'reverb', signalOrder: 96 },
  { type: 'Plate Reverb', category: 'reverb', signalOrder: 97 },
  { type: 'Ambient Reverb', category: 'reverb', signalOrder: 99 },
  { type: 'Volume', category: 'volume', signalOrder: 80 },
  { type: 'Looper', category: 'utility', signalOrder: 110 },
  { type: 'Amp Sim', category: 'amp', signalOrder: 200 },
];

// Map generic type names to actual pedal subtypes in database
const TYPE_TO_SUBTYPES: Record<string, string[]> = {
  'Tuner': ['Tuner'],
  'Wah': ['Wah'],
  'Envelope Filter': ['Envelope Filter', 'Fixed Filter'],
  'Compressor': ['Compressor'],
  'Noise Gate': ['Noise Gate'],
  'Octave': ['Octave'],
  'Pitch Shifter': ['Pitch Shift / Whammy', 'Harmony'],
  'Harmonizer': ['Harmony'],
  'Boost': ['Clean Boost', 'Mid Boost', 'Treble Boost'],
  'Overdrive': ['Tube Screamer-style', 'Klon-style', 'Bluesbreaker-style', 'Transparent OD', 'Amp-like OD'],
  'Distortion': ['RAT-style', 'Marshall-style', 'Hard-Clipping Distortion', 'High-Gain / Metal Distortion'],
  'Fuzz': ['Fuzz Face-style', 'Tone Bender-style', 'Muff-style', 'Gated Fuzz', 'Octave Fuzz'],
  'EQ': ['EQ'],
  'Chorus': ['Chorus'],
  'Phaser': ['Phaser'],
  'Flanger': ['Flanger'],
  'Tremolo': ['Tremolo'],
  'Vibrato': ['Vibrato'],
  'Rotary': ['Univibe / Rotary'],
  'Uni-Vibe': ['Univibe / Rotary'],
  'Synth': ['Synth', 'Ring Mod', 'Bitcrusher', 'Freeze / Sustain', 'Glitch / Granular'],
  'Analog Delay': ['Analog-style Delay'],
  'Digital Delay': ['Digital Delay', 'Multi / Experimental Delay'],
  'Tape Delay': ['Tape-style Delay'],
  'Spring Reverb': ['Spring'],
  'Hall Reverb': ['Hall', 'Room'],
  'Plate Reverb': ['Plate'],
  'Ambient Reverb': ['Ambient / Shimmer'],
  'Volume': ['Volume', 'Expression'],
  'Looper': ['Loop Switcher'],
  'Amp Sim': ['Amp-in-a-Box', 'Multi-FX / Modeler', 'Cab Sim / IR Loader'],
};

// Flavor options for each type (subcategory filtering)
// Only types with multiple flavors get a dropdown
const TYPE_FLAVORS: Record<string, string[]> = {
  'Boost': ['Clean Boost', 'Mid Boost', 'Treble Boost'],
  'Overdrive': ['Tube Screamer-style', 'Klon-style', 'Bluesbreaker-style', 'Transparent OD', 'Amp-like OD'],
  'Distortion': ['RAT-style', 'Marshall-style', 'Hard-Clipping Distortion', 'High-Gain / Metal Distortion'],
  'Fuzz': ['Fuzz Face-style', 'Tone Bender-style', 'Muff-style', 'Gated Fuzz', 'Octave Fuzz'],
  'Synth': ['Synth', 'Ring Mod', 'Bitcrusher', 'Freeze / Sustain', 'Glitch / Granular'],
  'Digital Delay': ['Digital Delay', 'Multi / Experimental Delay'],
  'Hall Reverb': ['Hall', 'Room'],
  'Volume': ['Volume', 'Expression'],
  'Envelope Filter': ['Envelope Filter', 'Fixed Filter'],
  'Pitch Shifter': ['Pitch Shift / Whammy', 'Harmony'],
};

type SortOption = 'recommended' | 'rating' | 'price-low' | 'price-high' | 'name' | 'collection';


function getTypeInfo(type: string) {
  return TYPE_OPTIONS.find(t => t.type === type);
}

export function BuildPage({ onContinue, collection = [] }: BuildPageProps) {
  const { state, dispatch } = useBoard();
  const { theme } = useTheme();
  const { selectedGenres, allPedals, board } = state;
  const maxSlots = board.constraints.maxPedalCount || 8;
  
  const genre = selectedGenres.length > 0 ? getGenreById(selectedGenres[0]) : null;
  
  // Multi-FX inline prompt state
  const [multiFxPrompt, setMultiFxPrompt] = useState<{
    pedal: PedalWithStatus;
    slotId: string | null; // null when adding via "Add Multi" button (no specific slot)
    selectedSlotIds: string[]; // Track selected slots by ID
    addAmpSim: boolean; // Whether to add an Amp Sim slot
  } | null>(null);
  
  // Type slots state - persist in board context
  const [typeSlots, setTypeSlots] = useState<TypeSlot[]>(() => {
    // Restore from board.buildSlots if available
    if (board.buildSlots && board.buildSlots.length > 0) {
      return board.buildSlots;
    }
    return [];
  });
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [randomSeed, setRandomSeed] = useState(0); // Forces pedal list to re-randomize
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMultiMenu, setShowMultiMenu] = useState(false);
  const [showSimMenu, setShowSimMenu] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [hoveredPedal, setHoveredPedal] = useState<PedalWithStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  
  // Calculate current cost from BUILD PAGE selections (not board state)
  // Only count each unique pedal once (multi-FX covering multiple slots is one pedal)
  const currentBuildCost = useMemo(() => {
    const uniquePedalIds = new Set(typeSlots.map(s => s.selectedPedalId).filter(Boolean));
    return Array.from(uniquePedalIds).reduce((sum, pedalId) => {
      const pedal = allPedals.find(p => p.id === pedalId);
      return sum + (pedal?.reverbPrice || 0);
    }, 0);
  }, [typeSlots, allPedals]);
  
  const budgetRemaining = board.constraints.maxBudget - currentBuildCost;
  
  // Persist typeSlots to board context whenever they change
  useEffect(() => {
    dispatch({ type: 'SET_BUILD_SLOTS', buildSlots: typeSlots });
  }, [typeSlots, dispatch]);
  
  // Sync from board.buildSlots when navigating back (e.g., from Review page)
  // This handles the case where the component remounts but context already has data
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    // Only run once on mount, and only if we have saved buildSlots but local state is empty
    if (!hasInitializedRef.current && board.buildSlots && board.buildSlots.length > 0 && typeSlots.length === 0) {
      setTypeSlots(board.buildSlots);
      hasInitializedRef.current = true;
    } else if (typeSlots.length > 0) {
      hasInitializedRef.current = true;
    }
  }, [board.buildSlots, typeSlots.length]);
  
  // Track previous maxSlots to detect changes
  const prevMaxSlotsRef = useRef(maxSlots);
  
  // Handle maxSlots changes - truncate if reduced, regenerate if empty
  useEffect(() => {
    const prevMaxSlots = prevMaxSlotsRef.current;
    prevMaxSlotsRef.current = maxSlots;
    
    // If maxSlots decreased and we have more slots than allowed, truncate
    if (typeSlots.length > maxSlots) {
      const sortedSlots = [...typeSlots].sort((a, b) => a.signalOrder - b.signalOrder);
      setTypeSlots(sortedSlots.slice(0, maxSlots));
      setSelectedSlotId(null);
    }
  }, [maxSlots]);
  
  // Generate initial type slots based on genre and slot count
  // Rules: 4/6/8 pedals = recommend exactly that many
  //        10/12 pedals = recommend 8 with option to add more
  useEffect(() => {
    if (typeSlots.length > 0) return;
    
    // Target slots: exact match for 4/6/8, cap at 8 for 10/12
    const targetSlots = maxSlots <= 8 ? maxSlots : 8;
    
    const slots: TypeSlot[] = [];
    const usedTypes = new Set<string>();
    
    const categoryToType: Record<Category, string[]> = {
      gain: ['Overdrive', 'Distortion', 'Fuzz', 'Boost'],
      modulation: ['Chorus', 'Phaser', 'Tremolo', 'Flanger', 'Vibrato'],
      delay: ['Analog Delay', 'Digital Delay', 'Tape Delay'],
      reverb: ['Hall Reverb', 'Spring Reverb', 'Plate Reverb', 'Ambient Reverb'],
      dynamics: ['Compressor', 'Noise Gate'],
      filter: ['Wah', 'Envelope Filter'],
      pitch: ['Octave', 'Pitch Shifter', 'Harmonizer'],
      eq: ['EQ'],
      volume: ['Volume'],
      utility: ['Tuner', 'Looper'],
      amp: [],
      synth: [],
    };
    
    // Helper to add a type slot
    const addSlot = (typeName: string) => {
      if (usedTypes.has(typeName)) return false;
      const info = getTypeInfo(typeName);
      if (info) {
        slots.push({
          id: generateUUID(),
          type: typeName,
          category: info.category,
          signalOrder: info.signalOrder,
        });
        usedTypes.add(typeName);
        return true;
      }
      return false;
    };
    
    // Always start with tuner
    addSlot('Tuner');
    
    if (genre) {
      // Build preferred types from genre's preferredSubtypes
      const preferredTypes = new Set<string>();
      genre.preferredSubtypes.forEach(subtype => {
        for (const [typeName, subtypes] of Object.entries(TYPE_TO_SUBTYPES)) {
          if (subtypes.includes(subtype)) {
            preferredTypes.add(typeName);
            break;
          }
        }
      });
      
      // Phase 1: Add essential categories (genre requirements)
      for (const category of genre.essentialCategories) {
        if (slots.length >= targetSlots) break;
        if (category === 'amp') continue;
        
        const typesForCategory = categoryToType[category] || [];
        // Prefer genre-preferred types first
        let typeToAdd = typesForCategory.find(t => preferredTypes.has(t) && !usedTypes.has(t));
        if (!typeToAdd) {
          typeToAdd = typesForCategory.find(t => !usedTypes.has(t));
        }
        if (typeToAdd) addSlot(typeToAdd);
      }
      
      // Phase 2: Add extra categories (genre requirements)
      for (const category of genre.extraCategories) {
        if (slots.length >= targetSlots) break;
        if (category === 'amp') continue;
        
        const typesForCategory = categoryToType[category] || [];
        
        // For gain, try to add another gain type if one exists
        if (category === 'gain') {
          const gainTypes = ['Overdrive', 'Distortion', 'Fuzz', 'Boost'];
          const unusedGain = gainTypes.find(t => !usedTypes.has(t));
          if (unusedGain) addSlot(unusedGain);
          continue;
        }
        
        let typeToAdd = typesForCategory.find(t => preferredTypes.has(t) && !usedTypes.has(t));
        if (!typeToAdd) {
          typeToAdd = typesForCategory.find(t => !usedTypes.has(t));
        }
        if (typeToAdd) addSlot(typeToAdd);
      }
      
      // Phase 3: Fill remaining slots with genre-appropriate types
      // Build a comprehensive list of all types sorted by genre relevance
      const allTypesRanked: { type: string; category: Category }[] = [];
      
      // Sort categories by genre rating (highest first)
      const categoryRatings: [Category, number][] = [
        ['gain', genre.gainRating],
        ['modulation', genre.modulationRating],
        ['delay', genre.ambienceRating],
        ['reverb', genre.ambienceRating],
        ['dynamics', genre.dynamicsRating],
        ['filter', genre.modulationRating],
        ['pitch', genre.modulationRating],
        ['eq', genre.dynamicsRating],
        ['volume', 3], // Default priority for volume
        ['utility', 2], // Default priority for utility (looper)
      ];
      categoryRatings.sort((a, b) => b[1] - a[1]);
      
      // Build ranked list of all available types with their categories
      for (const [category] of categoryRatings) {
        const typesForCategory = categoryToType[category] || [];
        for (const typeName of typesForCategory) {
          if (!allTypesRanked.some(t => t.type === typeName)) {
            allTypesRanked.push({ type: typeName, category });
          }
        }
      }
      
      // Keep filling until we reach target
      for (const { type: typeName } of allTypesRanked) {
        if (slots.length >= targetSlots) break;
        addSlot(typeName);
      }
    } else {
      // No genre selected - use sensible defaults
      const defaultTypes = [
        'Compressor', 'Overdrive', 'Chorus', 'Analog Delay', 'Hall Reverb',
        'Distortion', 'Tremolo', 'EQ', 'Wah', 'Fuzz', 'Phaser', 'Digital Delay',
      ];
      for (const typeName of defaultTypes) {
        if (slots.length >= targetSlots) break;
        addSlot(typeName);
      }
    }
    
    slots.sort((a, b) => a.signalOrder - b.signalOrder);
    setTypeSlots(slots);
  }, [genre, maxSlots, typeSlots.length]);
  
  // Sorted slots by signal order
  const sortedSlots = useMemo(() => 
    [...typeSlots].sort((a, b) => a.signalOrder - b.signalOrder),
    [typeSlots]
  );
  
  // Get the currently selected slot
  const selectedSlot = selectedSlotId ? typeSlots.find(s => s.id === selectedSlotId) : null;
  
  // Get pedals for the selected type with sorting
  // Show ALL matching pedals, mark which are over budget or used by other slots
  const pedalsForSelectedType = useMemo(() => {
    if (!selectedSlot) return [];
    
    const subtypes = TYPE_TO_SUBTYPES[selectedSlot.type] || [selectedSlot.type];
    
    // Get IDs selected for OTHER slots (not the current one)
    const selectedByOtherSlots = new Set(
      typeSlots
        .filter(s => s.selectedPedalId && s.id !== selectedSlot.id)
        .map(s => s.selectedPedalId!)
    );
    
    // Calculate budget available for THIS slot
    // If this slot already has a pedal selected, add its price back to available budget
    const currentSlotPedal = selectedSlot.selectedPedalId 
      ? allPedals.find(p => p.id === selectedSlot.selectedPedalId)
      : null;
    const budgetForThisSlot = budgetRemaining + (currentSlotPedal?.reverbPrice || 0);
    
    // Filter ALL pedals (not just fitting) to match type
    // For Tuner slot, ONLY show tuners (not loopers, buffers, etc.)
    const isTunerSlot = selectedSlot?.type === 'Tuner';
    const searchLower = searchQuery.toLowerCase().trim();
    
    const filtered = allPedals
      .filter(p => {
        // Apply search filter first
        if (searchLower) {
          const matchesSearch = 
            p.brand.toLowerCase().includes(searchLower) ||
            p.model.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower));
          if (!matchesSearch) return false;
        }
        
        if (isTunerSlot) {
          // Strict matching for tuners - only show actual tuners
          return p.subtype === 'Tuner' || p.subtype === 'Chromatic Tuner' || 
                 (p.model && p.model.toLowerCase().includes('tuner'));
        }
        
        // If a flavor is selected, only show pedals with that exact subtype
        if (selectedFlavor) {
          return p.subtype === selectedFlavor;
        }
        
        // Don't show Multi-FX in regular categories - they have their own "Add Multi" button
        if (p.subtype === 'Multi-FX / Modeler' && selectedSlot.type !== 'Amp Sim') {
          return false;
        }
        
        const matchesSubtype = subtypes.includes(p.subtype || '') || p.category === selectedSlot.category;
        return matchesSubtype;
      });
    
    // Helper to calculate recommendation score for a pedal
    const getRecommendationScore = (pedal: PedalWithStatus): number => {
      let score = 0;
      
      // Base score from category rating (0-10 points)
      score += pedal.categoryRating;
      
      if (genre) {
        // Bonus for matching preferred subtypes (big bonus - 20 points)
        if (pedal.subtype && genre.preferredSubtypes.includes(pedal.subtype)) {
          score += 20;
        }
        
        // Bonus for keyword matches in description (5 points per match, max 15)
        if (pedal.description) {
          const descLower = pedal.description.toLowerCase();
          const keywordMatches = genre.keywords.filter(kw => descLower.includes(kw)).length;
          score += Math.min(keywordMatches * 5, 15);
        }
      }
      
      return score;
    };
    
    // Sort based on option
    let sorted: PedalWithStatus[];
    switch (sortOption) {
      case 'recommended':
        // Pin top tuners: Polytune 3, TU-3, Strobostomp HD
        const TOP_TUNERS = ['tc-polytune-3', 'boss-tu-3', 'peterson-strobostomp-hd'];
        
        if (isTunerSlot) {
          // For tuners, pin top 3 then sort rest by score
          const pinned: PedalWithStatus[] = [];
          const rest: PedalWithStatus[] = [];
          
          for (const pedal of filtered) {
            const isPinned = TOP_TUNERS.some(id => pedal.id.includes(id) || 
              pedal.model.toLowerCase().includes('polytune 3') ||
              pedal.model.toLowerCase() === 'tu-3' ||
              pedal.model.toLowerCase().includes('strobostomp hd'));
            if (isPinned) {
              pinned.push(pedal);
            } else {
              rest.push(pedal);
            }
          }
          
          // Sort pinned by the TOP_TUNERS order
          pinned.sort((a, b) => {
            const aIndex = TOP_TUNERS.findIndex(id => 
              a.id.includes(id) || a.model.toLowerCase().includes('polytune 3') ||
              a.model.toLowerCase() === 'tu-3' || a.model.toLowerCase().includes('strobostomp hd'));
            const bIndex = TOP_TUNERS.findIndex(id => 
              b.id.includes(id) || b.model.toLowerCase().includes('polytune 3') ||
              b.model.toLowerCase() === 'tu-3' || b.model.toLowerCase().includes('strobostomp hd'));
            return aIndex - bIndex;
          });
          
          // Sort rest by score
          rest.sort((a, b) => {
            const scoreA = getRecommendationScore(a);
            const scoreB = getRecommendationScore(b);
            if (scoreB !== scoreA) return scoreB - scoreA;
            return b.categoryRating - a.categoryRating;
          });
          
          sorted = [...pinned, ...rest];
        } else {
          // Add significant variety by adding random jitter to scores
          // This ensures different pedals surface each time
          const withScores = filtered.map(p => ({
            pedal: p,
            baseScore: getRecommendationScore(p),
            // Add random jitter of ±15 points to mix things up significantly
            score: getRecommendationScore(p) + (Math.random() * 30 - 15),
          }));
          
          // Sort by jittered score descending
          withScores.sort((a, b) => b.score - a.score);
          
          // Additional shuffle within wider score bands (10 points) for more variety
          const shuffled: typeof withScores = [];
          let band: typeof withScores = [];
          let bandMinScore = withScores[0]?.score ?? 0;
          
          for (const item of withScores) {
            if (item.score >= bandMinScore - 10) {
              band.push(item);
            } else {
              // Shuffle current band and add to result
              for (let i = band.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [band[i], band[j]] = [band[j], band[i]];
              }
              shuffled.push(...band);
              // Start new band
              band = [item];
              bandMinScore = item.score;
            }
          }
          // Don't forget the last band
          for (let i = band.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [band[i], band[j]] = [band[j], band[i]];
          }
          shuffled.push(...band);
          
          sorted = shuffled.map(s => s.pedal);
        }
        break;
      case 'rating':
        sorted = [...filtered].sort((a, b) => b.categoryRating - a.categoryRating);
        break;
      case 'price-low':
        sorted = [...filtered].sort((a, b) => a.reverbPrice - b.reverbPrice);
        break;
      case 'price-high':
        sorted = [...filtered].sort((a, b) => b.reverbPrice - a.reverbPrice);
        break;
      case 'name':
        sorted = [...filtered].sort((a, b) => a.model.localeCompare(b.model));
        break;
      case 'collection':
        // Sort collection pedals first, then by recommendation score
        const collectionSet = new Set(collection);
        sorted = [...filtered].sort((a, b) => {
          const aInCollection = collectionSet.has(a.id);
          const bInCollection = collectionSet.has(b.id);
          if (aInCollection && !bInCollection) return -1;
          if (!aInCollection && bInCollection) return 1;
          // Within same group, sort by recommendation score
          return getRecommendationScore(b) - getRecommendationScore(a);
        });
        break;
      default:
        sorted = [...filtered];
    }
    
    // Add metadata about availability
    const withMetadata = sorted.map(p => ({
      ...p,
      usedByOtherSlot: selectedByOtherSlots.has(p.id),
      overBudget: !board.constraints.applyAfterBudget && p.reverbPrice > budgetForThisSlot,
    }));
    
    // Pin currently selected pedal to the top for easy deselection
    if (selectedSlot?.selectedPedalId) {
      const selectedIndex = withMetadata.findIndex(p => p.id === selectedSlot.selectedPedalId);
      if (selectedIndex > 0) {
        const [selected] = withMetadata.splice(selectedIndex, 1);
        withMetadata.unshift(selected);
      }
    }
    
    return withMetadata;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlot, allPedals, typeSlots, sortOption, budgetRemaining, board.constraints.applyAfterBudget, searchQuery, collection, selectedFlavor, genre, randomSeed]);
  
  // Get selected pedal object from ID
  const getSelectedPedal = (pedalId?: string) => {
    if (!pedalId) return null;
    return allPedals.find(p => p.id === pedalId) || null;
  };
  
  const handleSelectSlot = (slotId: string) => {
    setSelectedSlotId(slotId === selectedSlotId ? null : slotId);
    setRandomSeed(prev => prev + 1); // Re-randomize pedal suggestions
    setShowAddMenu(false);
    setHoveredPedal(null);
    setSelectedFlavor(null); // Reset flavor when changing slots
  };
  
  const handleSelectPedal = (pedal: PedalWithStatus, isUsedByOther: boolean) => {
    if (!selectedSlotId) return;
    
    // Don't allow selecting a pedal that's used by another slot
    if (isUsedByOther) return;
    
    const currentSlot = typeSlots.find(s => s.id === selectedSlotId);
    
    // Check if this is a multi-FX pedal being selected (not deselected)
    const isMultiFx = pedal.subtype === 'Multi-FX / Modeler';
    const isNewSelection = currentSlot?.selectedPedalId !== pedal.id;
    
    if (isMultiFx && isNewSelection) {
      // Find slots already filled by this multi-FX
      const alreadyFilledSlotIds = typeSlots
        .filter(slot => slot.selectedPedalId === pedal.id && slot.id !== selectedSlotId)
        .map(slot => slot.id);
      
      // Check if there's already an amp sim slot with this multi-FX
      const hasAmpSimWithMulti = typeSlots.some(slot => 
        slot.type === 'Amp Sim' && slot.selectedPedalId === pedal.id
      );
      
      // Show the multi-FX prompt with pre-selected slots
      setMultiFxPrompt({
        pedal,
        slotId: selectedSlotId,
        selectedSlotIds: alreadyFilledSlotIds,
        addAmpSim: hasAmpSimWithMulti,
      });
      return;
    }
    
    setTypeSlots(prev => prev.map(slot => {
      if (slot.id !== selectedSlotId) return slot;
      
      // Toggle: if clicking the same pedal, deselect it
      const newPedalId = slot.selectedPedalId === pedal.id ? undefined : pedal.id;
      return { ...slot, selectedPedalId: newPedalId };
    }));
  };
  
  // Handle multi-FX prompt confirmation
  const handleMultiFxConfirm = () => {
    if (!multiFxPrompt) return;
    
    const { pedal, slotId, selectedSlotIds, addAmpSim } = multiFxPrompt;
    
    setTypeSlots(prev => {
      // First, remove Tuner slot since multi-FX units have built-in tuners
      let newSlots = prev.filter(slot => slot.type !== 'Tuner');
      
      newSlots = newSlots.map(slot => {
        // If this is the original slot (when selecting from pedal list)
        if (slotId && slot.id === slotId) {
          return { ...slot, selectedPedalId: pedal.id };
        }
        
        const isSelectedSlot = selectedSlotIds.includes(slot.id);
        const hasThisMultiFx = slot.selectedPedalId === pedal.id;
        
        if (isSelectedSlot && !hasThisMultiFx) {
          // Fill selected slots with multi-FX
          return { ...slot, selectedPedalId: pedal.id };
        } else if (!isSelectedSlot && hasThisMultiFx && slot.id !== slotId) {
          // Clear slots that had this multi-FX but are no longer selected
          // But don't clear Amp Sim slots if addAmpSim is still checked
          if (slot.type === 'Amp Sim' && addAmpSim) {
            return slot;
          }
          return { ...slot, selectedPedalId: undefined };
        }
        
        return slot;
      });
      
      // Handle Amp Sim slot
      const existingAmpSimSlot = newSlots.find(s => s.type === 'Amp Sim');
      
      if (addAmpSim) {
        if (existingAmpSimSlot) {
          // Update existing Amp Sim slot with this multi-FX
          newSlots = newSlots.map(slot => 
            slot.type === 'Amp Sim' ? { ...slot, selectedPedalId: pedal.id } : slot
          );
        } else {
          // Add new Amp Sim slot
          const ampSimInfo = getTypeInfo('Amp Sim');
          if (ampSimInfo) {
            newSlots.push({
              id: generateUUID(),
              type: 'Amp Sim',
              category: ampSimInfo.category,
              signalOrder: ampSimInfo.signalOrder,
              selectedPedalId: pedal.id,
            });
            newSlots = newSlots.sort((a, b) => a.signalOrder - b.signalOrder);
          }
        }
      } else {
        // If addAmpSim is unchecked but there's an Amp Sim with this multi-FX, clear it
        if (existingAmpSimSlot && existingAmpSimSlot.selectedPedalId === pedal.id) {
          newSlots = newSlots.map(slot => 
            slot.type === 'Amp Sim' && slot.selectedPedalId === pedal.id
              ? { ...slot, selectedPedalId: undefined }
              : slot
          );
        }
      }
      
      return newSlots;
    });
    
    // Get the categories being covered for the context
    const coveringCategories = typeSlots
      .filter(s => selectedSlotIds.includes(s.id) || s.id === slotId)
      .map(s => s.category);
    
    if (addAmpSim) {
      coveringCategories.push('amp');
    }
    
    // Update multi-FX state in context for Review page badges
    dispatch({
      type: 'SET_MULTI_EFFECTS',
      multiEffects: {
        pedalId: pedal.id,
        coveringCategories,
        isAmpSimOnly: false,
      },
    });
    
    setMultiFxPrompt(null);
  };
  
  // Toggle slot in multi-FX prompt
  const toggleMultiFxSlot = (slotId: string) => {
    if (!multiFxPrompt) return;
    setMultiFxPrompt(prev => {
      if (!prev) return null;
      const isSelected = prev.selectedSlotIds.includes(slotId);
      return {
        ...prev,
        selectedSlotIds: isSelected
          ? prev.selectedSlotIds.filter(id => id !== slotId)
          : [...prev.selectedSlotIds, slotId],
      };
    });
  };
  
  const handleClearBoard = () => {
    // Clear all pedal selections but keep the type slots
    setTypeSlots(prev => prev.map(slot => ({ ...slot, selectedPedalId: undefined })));
  };
  
  const handleChangeType = (slotId: string, newType: string) => {
    const info = getTypeInfo(newType);
    if (!info) return;
    
    setTypeSlots(prev => {
      const newSlots = prev.map(slot => 
        slot.id === slotId 
          ? { 
              ...slot, 
              type: newType, 
              category: info.category, 
              signalOrder: info.signalOrder,
              selectedPedalId: undefined, // Reset selected pedal when changing type
            }
          : slot
      );
      return newSlots.sort((a, b) => a.signalOrder - b.signalOrder);
    });
  };
  
  const handleRemoveSlot = (id: string) => {
    setTypeSlots(prev => prev.filter(s => s.id !== id));
    if (selectedSlotId === id) {
      setSelectedSlotId(null);
    }
  };
  
  const handleAddType = (typeName: string) => {
    const info = getTypeInfo(typeName);
    if (!info) return;
    
    const newSlot: TypeSlot = {
      id: generateUUID(),
      type: typeName,
      category: info.category,
      signalOrder: info.signalOrder,
    };
    
    setTypeSlots(prev => {
      const newSlots = [...prev, newSlot];
      return newSlots.sort((a, b) => a.signalOrder - b.signalOrder);
    });
    setShowAddMenu(false);
    setSelectedSlotId(newSlot.id);
  };
  
  // Types already in use
  const usedTypes = new Set(typeSlots.map(s => s.type));
  
  // Available types for adding
  const availableToAdd = TYPE_OPTIONS.filter(t => {
    if (t.category === 'gain') return true;
    return !usedTypes.has(t.type);
  });
  
  // Get type change alternatives for selected slot
  const typeAlternatives = selectedSlot 
    ? TYPE_OPTIONS.filter(t => t.category === selectedSlot.category && t.type !== selectedSlot.type)
    : [];
  
  // Count unique selected pedals (multi-FX only counted once)
  const uniqueSelectedPedalIds = new Set(typeSlots.map(s => s.selectedPedalId).filter(Boolean));
  const selectedCount = uniqueSelectedPedalIds.size;
  const totalCost = Array.from(uniqueSelectedPedalIds).reduce((sum, pedalId) => {
    const pedal = getSelectedPedal(pedalId);
    return sum + (pedal?.reverbPrice || 0);
  }, 0);
  
  // Continue handler - add selected pedals to board
  const handleContinue = () => {
    // Clear board first
    dispatch({ type: 'CLEAR_BOARD' });
    
    // Add each selected pedal
    typeSlots.forEach(slot => {
      const pedal = getSelectedPedal(slot.selectedPedalId);
      if (pedal) {
        dispatch({ type: 'ADD_PEDAL', pedal });
      }
    });
    
    onContinue();
  };
  
  const canContinue = selectedCount > 0;
  
  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--color-board-dark)' }}>
      {/* Budget Bar - Sticky below fixed header */}
      <div 
        className="sticky top-20 sm:top-24 z-20"
        style={{ borderBottom: '4px solid var(--color-board-border)', backgroundColor: theme === 'dark' ? '#1A3A5C' : '#B8D4E3' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black text-theme flex items-center gap-2 uppercase">
                  💰 Budget
                </span>
                <span className={`text-sm font-black ${
                  budgetRemaining < 0 ? 'text-red-600' : budgetRemaining < 100 ? 'text-orange-600' : 'text-green-700'
                }`}>
                  ${currentBuildCost} / ${board.constraints.maxBudget}
                </span>
              </div>
              <div 
                className="h-4 bg-theme-surface overflow-hidden"
                style={{ border: '3px solid var(--color-board-border)' }}
              >
                <div 
                  className={`h-full transition-all duration-300 ${
                    budgetRemaining < 0 
                      ? 'bg-red-500' 
                      : budgetRemaining < 100 
                        ? 'bg-orange-300'
                        : 'bg-green-300'
                  }`}
                  style={{ width: `${Math.min((currentBuildCost / board.constraints.maxBudget) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-theme-muted font-bold">
                  {selectedCount} pedals selected
                </span>
                <span className={`text-xs font-bold ${budgetRemaining < 0 ? 'text-red-600' : 'text-theme-muted'}`}>
                  {budgetRemaining >= 0 ? `$${budgetRemaining} remaining` : `$${Math.abs(budgetRemaining)} over budget`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* LEFT COLUMN - Type Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-theme uppercase">
                Pedal Types ({typeSlots.length}/{maxSlots})
              </h2>
              
              <div className="flex gap-2 relative">
                  {/* Add Pedal Button */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowAddMenu(!showAddMenu);
                        setShowMultiMenu(false);
                        setShowSimMenu(false);
                        setSelectedSlotId(null);
                      }}
                      className="px-3 py-1.5 bg-theme-surface text-theme font-bold text-xs uppercase flex items-center gap-1 hover:-translate-y-0.5 transition-all"
                      style={{ border: '2px solid var(--color-board-border)', boxShadow: '2px 2px 0px var(--color-board-shadow)' }}
                    >
                      <Plus className="w-3 h-3" />
                      Add Pedal
                    </button>
                    
                    {/* Add Pedal Menu */}
                    {showAddMenu && (
                      <div 
                        className="absolute left-0 top-full mt-2 bg-theme-surface z-30 w-48 max-h-64 overflow-y-auto"
                        style={{ border: '3px solid var(--color-board-border)', boxShadow: '4px 4px 0px var(--color-board-shadow)' }}
                      >
                        {(['gain', 'dynamics', 'modulation', 'delay', 'reverb', 'filter', 'pitch', 'eq', 'volume', 'utility'] as Category[]).map(category => {
                          const typesInCategory = availableToAdd.filter(t => t.category === category);
                          if (typesInCategory.length === 0) return null;
                          
                          return (
                            <div key={category} className="p-2" style={{ borderBottom: '2px solid black' }}>
                              <p className="text-[10px] text-theme-muted uppercase tracking-wider px-2 mb-1 font-bold">{category}</p>
                              {typesInCategory.map(t => (
                                <button
                                  key={t.type}
                                  onClick={() => handleAddType(t.type)}
                                  className="w-full px-2 py-1.5 text-left text-sm text-theme hover:bg-board-highlight font-bold"
                                >
                                  {t.type}
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Add Multi Button */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowMultiMenu(!showMultiMenu);
                        setShowAddMenu(false);
                        setShowSimMenu(false);
                        setSelectedSlotId(null);
                      }}
                      className="px-3 py-1.5 bg-cyan-400 text-theme font-bold text-xs uppercase flex items-center gap-1 hover:-translate-y-0.5 transition-all"
                      style={{ border: '2px solid var(--color-board-border)', boxShadow: '2px 2px 0px var(--color-board-shadow)' }}
                    >
                      <Zap className="w-3 h-3" />
                      Add Multi
                    </button>
                    
                    {/* Add Multi Menu */}
                    {showMultiMenu && (
                      <div 
                        className="absolute right-0 top-full mt-2 bg-theme-surface z-30 w-56 max-h-80 overflow-y-auto"
                        style={{ border: '3px solid var(--color-board-border)', boxShadow: '4px 4px 0px var(--color-board-shadow)' }}
                      >
                        <div className="p-2 bg-cyan-100" style={{ borderBottom: '2px solid black' }}>
                          <p className="text-[10px] text-theme-muted font-bold uppercase">Multi-FX / Modelers</p>
                        </div>
                        {allPedals
                          .filter(p => p.subtype === 'Multi-FX / Modeler')
                          .sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model))
                          .map(pedal => (
                            <button
                              key={pedal.id}
                              onClick={() => {
                                // Find slots already filled by this multi-FX
                                const alreadyFilledSlotIds = typeSlots
                                  .filter(slot => slot.selectedPedalId === pedal.id)
                                  .map(slot => slot.id);
                                
                                // Check if there's already an amp sim slot with this multi-FX
                                const hasAmpSimWithMulti = typeSlots.some(slot => 
                                  slot.type === 'Amp Sim' && slot.selectedPedalId === pedal.id
                                );
                                
                                // Show the multi-FX prompt
                                setMultiFxPrompt({
                                  pedal,
                                  slotId: null, // No specific slot, just filling existing slots
                                  selectedSlotIds: alreadyFilledSlotIds,
                                  addAmpSim: hasAmpSimWithMulti,
                                });
                                setShowMultiMenu(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-cyan-50 flex items-center gap-2"
                              style={{ borderBottom: '1px solid #e5e7eb' }}
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center flex-shrink-0" style={{ border: '2px solid var(--color-board-border)' }}>
                                <Zap className="w-4 h-4 text-cyan-600" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-black text-theme truncate">{pedal.model}</div>
                                <div className="text-[10px] text-theme-muted font-bold truncate">{pedal.brand}</div>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Add Sim Button */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSimMenu(!showSimMenu);
                        setShowAddMenu(false);
                        setShowMultiMenu(false);
                        setSelectedSlotId(null);
                      }}
                      className="px-3 py-1.5 bg-orange-400 text-theme font-bold text-xs uppercase flex items-center gap-1 hover:-translate-y-0.5 transition-all"
                      style={{ border: '2px solid var(--color-board-border)', boxShadow: '2px 2px 0px var(--color-board-shadow)' }}
                    >
                      <Volume2 className="w-3 h-3" />
                      Add Sim
                    </button>
                    
                    {/* Add Sim Menu */}
                    {showSimMenu && (
                      <div 
                        className="absolute right-0 top-full mt-2 bg-theme-surface z-30 w-56 max-h-80 overflow-y-auto"
                        style={{ border: '3px solid var(--color-board-border)', boxShadow: '4px 4px 0px var(--color-board-shadow)' }}
                      >
                        <div className="p-2 bg-orange-100" style={{ borderBottom: '2px solid black' }}>
                          <p className="text-[10px] text-theme-muted font-bold uppercase">Amp Sims & Cab IRs</p>
                        </div>
                        {allPedals
                          .filter(p => p.subtype === 'Amp-in-a-Box' || p.subtype === 'Cab Sim / IR Loader')
                          .sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model))
                          .map(pedal => (
                            <button
                              key={pedal.id}
                              onClick={() => {
                                // Add an Amp Sim slot with this pedal selected
                                const newSlotId = generateUUID();
                                const ampSimInfo = getTypeInfo('Amp Sim');
                                if (ampSimInfo) {
                                  setTypeSlots(prev => {
                                    const newSlots = [...prev, {
                                      id: newSlotId,
                                      type: 'Amp Sim',
                                      category: ampSimInfo.category,
                                      signalOrder: ampSimInfo.signalOrder,
                                      selectedPedalId: pedal.id,
                                    }];
                                    return newSlots.sort((a, b) => a.signalOrder - b.signalOrder);
                                  });
                                }
                                setShowSimMenu(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center gap-2"
                              style={{ borderBottom: '1px solid #e5e7eb' }}
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0" style={{ border: '2px solid var(--color-board-border)' }}>
                                <Volume2 className="w-4 h-4 text-orange-600" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-black text-theme truncate">{pedal.model}</div>
                                <div className="text-[10px] text-theme-muted font-bold truncate">{pedal.brand}</div>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Reset Board Button */}
                  <button
                    onClick={() => {
                      // Reset everything - clear all slots and start fresh
                      setTypeSlots([]);
                      setSelectedSlotId(null);
                      setShowAddMenu(false);
                      setShowMultiMenu(false);
                      setShowSimMenu(false);
                      setMultiFxPrompt(null);
                      // Clear multi-FX from context
                      dispatch({ type: 'CLEAR_MULTI_EFFECTS' });
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white font-bold text-xs uppercase flex items-center gap-1 hover:-translate-y-0.5 transition-all"
                    style={{ border: '2px solid var(--color-board-border)', boxShadow: '2px 2px 0px var(--color-board-shadow)' }}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
            </div>
            
            {sortedSlots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              const selectedPedal = getSelectedPedal(slot.selectedPedalId);
              const hasPedal = !!selectedPedal;
              
              return (
                <div
                  key={slot.id}
                  className={`transition-all ${
                    isSelected 
                      ? 'bg-board-accent' 
                      : hasPedal
                        ? 'bg-board-success'
                        : 'bg-theme-surface hover:-translate-y-0.5'
                  }`}
                  style={{
                    border: '3px solid var(--color-board-border)',
                    boxShadow: isSelected ? '4px 4px 0px black' : '3px 3px 0px black',
                  }}
                >
                  {/* Type Header - Always clickable */}
                  <button
                    onClick={() => handleSelectSlot(slot.id)}
                    className="w-full p-4 flex items-center gap-4 text-left"
                  >
                    {/* Type Initial */}
                    <div 
                      className={`w-12 h-12 flex items-center justify-center text-base font-black ${
                        isSelected ? 'bg-theme-surface text-theme' : hasPedal ? 'bg-theme-surface text-theme' : 'bg-black/10 dark:bg-white/10 text-theme'
                      }`}
                      style={{ border: '2px solid var(--color-board-border)' }}
                    >
                      {slot.type.substring(0, 2).toUpperCase()}
                    </div>
                    
                    {/* Type Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-lg font-bold flex items-center gap-1 ${isSelected || hasPedal ? 'text-white' : 'text-theme'}`}>
                        {slot.type}
                        {/* Show indicator if there are alternative types in this category */}
                        {(() => {
                          const altCount = TYPE_OPTIONS.filter(t => t.category === slot.category && t.type !== slot.type).length;
                          return altCount > 0 && (
                            <span className={`text-xs font-bold flex items-center ${isSelected || hasPedal ? 'text-white/60' : 'text-theme-muted'}`}>
                              <ChevronDown className="w-4 h-4" />
                              <span className="hidden sm:inline">+{altCount}</span>
                            </span>
                          );
                        })()}
                        {slot.type === 'Tuner' && (
                          <span className="text-xs font-bold ml-1 text-theme">
                            (not necessary but generally a good idea)
                          </span>
                        )}
                      </div>
                      {hasPedal ? (
                        <div className="text-sm text-white/80 truncate font-bold">
                          {selectedPedal.brand} {selectedPedal.model} · ${selectedPedal.reverbPrice}
                        </div>
                      ) : (
                        <div className={`text-sm ${isSelected ? 'text-white/70' : 'text-theme-muted'} font-bold`}>Tap to select a pedal</div>
                      )}
                    </div>
                    
                    {/* Status indicator */}
                    {hasPedal && (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {/* Expanded actions when selected */}
                  {isSelected && (
                    <div className="px-3 pb-3 pt-2 relative">
                      {/* Type selector boxes */}
                      {(() => {
                        const allTypesInCategory = TYPE_OPTIONS.filter(t => t.category === slot.category);
                        return allTypesInCategory.length > 1 && (
                          <div className="flex flex-wrap gap-1.5 pr-16">
                            {allTypesInCategory.map(typeOpt => {
                              const isCurrentType = typeOpt.type === slot.type;
                              return (
                                <button
                                  key={typeOpt.type}
                                  onClick={() => !isCurrentType && handleChangeType(slot.id, typeOpt.type)}
                                  className={`px-2.5 py-1.5 text-xs font-black uppercase transition-all ${
                                    isCurrentType
                                      ? 'bg-green-500 text-white'
                                      : 'bg-theme-surface text-theme hover:bg-gray-100'
                                  }`}
                                  style={{ border: '2px solid var(--color-board-border)' }}
                                >
                                  {typeOpt.type}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                      
                      {/* Remove button - bottom right */}
                      {typeSlots.length > 1 && (
                        <button
                          onClick={() => handleRemoveSlot(slot.id)}
                          className="absolute bottom-3 right-3 px-2 py-1 text-[10px] font-black text-black bg-board-highlight uppercase hover:bg-yellow-500"
                          style={{ border: '2px solid var(--color-board-border)' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            
            </div>
          
          {/* RIGHT COLUMN - Pedal Selection */}
          <div 
            className="bg-theme-surface p-4 flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)]"
            style={{ border: '4px solid var(--color-board-border)', boxShadow: '6px 6px 0px black' }}
          >
            {selectedSlot ? (
              <>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="text-lg font-black text-theme uppercase">
                    Choose a {selectedSlot.type}
                  </h2>
                  
                  <div className="flex items-center gap-3">
                    {/* Flavor Dropdown - only show if this type has flavors */}
                    {TYPE_FLAVORS[selectedSlot.type] && TYPE_FLAVORS[selectedSlot.type].length > 1 && (
                      <select
                        value={selectedFlavor || ''}
                        onChange={(e) => setSelectedFlavor(e.target.value || null)}
                        className="text-xs bg-theme-surface text-theme font-bold px-2 py-1 focus:outline-none"
                        style={{ border: '2px solid var(--color-board-border)' }}
                      >
                        <option value="">All Flavors</option>
                        {TYPE_FLAVORS[selectedSlot.type].map(flavor => (
                          <option key={flavor} value={flavor}>{flavor}</option>
                        ))}
                      </select>
                    )}
                    
                    {/* Sorting Options */}
                    <div className="flex items-center gap-1">
                      <ArrowUpDown className="w-3 h-3 text-theme-muted" />
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        className="text-xs bg-theme-surface text-theme font-bold px-2 py-1 focus:outline-none"
                        style={{ border: '2px solid var(--color-board-border)' }}
                      >
                        <option value="recommended">Recommended</option>
                        <option value="collection">My Collection</option>
                        <option value="rating">Rating</option>
                        <option value="price-low">Price: Low</option>
                        <option value="price-high">Price: High</option>
                        <option value="name">Name</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Search Bar */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                  <input
                    type="text"
                    placeholder="Search pedals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-theme-surface text-sm text-theme placeholder-gray-400 focus:outline-none font-bold"
                    style={{ border: '3px solid var(--color-board-border)' }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {pedalsForSelectedType.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 flex-1 overflow-y-auto pb-4 content-start">
                    {pedalsForSelectedType.slice(0, 50).map(pedal => {
                      const isSelected = selectedSlot.selectedPedalId === pedal.id;
                      const isUsedByOther = pedal.usedByOtherSlot;
                      const isOverBudget = pedal.overBudget && !isSelected;
                      const isDisabled = isUsedByOther; // Only disable if used by another slot, not for over budget
                      const categoryInfo = CATEGORY_INFO[pedal.category];
                      const ratingLabel = getRatingLabel(pedal.category, pedal.categoryRating);
                      const isInCollection = collection.includes(pedal.id);
                      
                      return (
                        <div
                          key={pedal.id}
                          className="relative"
                          onMouseEnter={() => setHoveredPedal(pedal)}
                          onMouseLeave={() => setHoveredPedal(null)}
                        >
                          {/* Trading Card Style */}
                          <button
                            onClick={() => handleSelectPedal(pedal, isDisabled)}
                            disabled={isDisabled}
                            className={`w-full group text-left transition-all active:scale-[0.98] ${
                              isSelected
                                ? '-translate-y-1'
                                : isDisabled
                                  ? 'opacity-60 cursor-not-allowed'
                                  : 'hover:-translate-y-1 hover:rotate-1'
                            } ${isOverBudget && !isDisabled ? 'opacity-80' : ''}`}
                          >
                            {/* Card Frame */}
                            <div 
                              className="relative p-1.5 sm:p-2"
                              style={{
                                backgroundColor: isSelected ? '#A5D6A7' : isDisabled ? '#E0E0E0' : isOverBudget ? '#FEE2E2' : categoryInfo?.color ? `${categoryInfo.color}40` : '#FFF9C4',
                                border: isOverBudget && !isDisabled ? '4px solid #DC2626' : '4px solid black',
                                boxShadow: isSelected ? '5px 5px 0px black' : '4px 4px 0px black',
                              }}
                            >
                              {/* Category Badge */}
                              <div 
                                className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wide"
                                style={{
                                  backgroundColor: '#FFFEF0',
                                  border: '2px solid var(--color-board-border)',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {pedal.subtype || pedal.category}
                              </div>
                              
                              {/* Collection Badge */}
                              {isInCollection && (
                                <div 
                                  className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[7px] sm:text-[8px] font-black uppercase bg-blue-400 text-white z-10"
                                  style={{ border: '2px solid var(--color-board-border)' }}
                                  title="In your collection"
                                >
                                  OWNED
                                </div>
                              )}
                              
                              {/* Inner Card (white area) */}
                              <div 
                                className="bg-theme-surface p-1.5 sm:p-2"
                                style={{ border: '3px solid var(--color-board-border)' }}
                              >
                                {/* Image Container */}
                                <div 
                                  className={`aspect-square mb-2 overflow-hidden bg-gray-100 ${isDisabled && !isOverBudget ? 'grayscale' : ''}`}
                                  style={{ border: '2px solid var(--color-board-border)' }}
                                >
                                  {pedal.subtype === 'Multi-FX / Modeler' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100">
                                      <Zap className="w-8 h-8 text-cyan-600 mb-1" />
                                      <span className="text-[9px] font-black text-cyan-700 uppercase">Multi-FX</span>
                                    </div>
                                  ) : (
                                    <PedalImage pedalId={pedal.id} category={pedal.category} size="lg" className="w-full h-full" />
                                  )}
                                </div>
                                
                                {/* Name Section */}
                                <div className="text-center mb-2">
                                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wide truncate">{pedal.brand}</p>
                                  <p className="text-[11px] sm:text-xs font-black text-theme truncate leading-tight">{pedal.model}</p>
                                </div>
                                
                                {/* Stats Bar */}
                                <div 
                                  className="flex items-center justify-between px-1.5 py-1"
                                  style={{ 
                                    backgroundColor: isDisabled ? '#e5e7eb' : isOverBudget ? '#FEE2E2' : `${categoryInfo?.color}15`,
                                    border: '2px solid var(--color-board-border)',
                                  }}
                                >
                                  <span className={`text-[10px] sm:text-xs font-black ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                    ${pedal.reverbPrice}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <span 
                                          key={i} 
                                          className="text-[8px] sm:text-[10px]"
                                          style={{ color: i < Math.round(pedal.categoryRating / 2) ? categoryInfo?.color : '#d1d5db' }}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Selected Overlay */}
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div 
                                    className="bg-green-200 px-2 py-1 rotate-[-8deg]"
                                    style={{ border: '3px solid var(--color-board-border)', boxShadow: '2px 2px 0px var(--color-board-shadow)' }}
                                  >
                                    <div className="flex items-center gap-1 text-white">
                                      <Check className="w-4 h-4" strokeWidth={3} />
                                      <span className="text-xs font-black uppercase">Selected</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Status Badges */}
                              {isUsedByOther && (
                                <div 
                                  className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-gray-700 text-white text-[8px] font-bold"
                                  style={{ border: '2px solid var(--color-board-border)' }}
                                >
                                  IN USE
                                </div>
                              )}
                              {isOverBudget && !isUsedByOther && (
                                <div 
                                  className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-bold"
                                  style={{ border: '2px solid var(--color-board-border)' }}
                                >
                                  OVER $
                                </div>
                              )}
                            </div>
                          </button>
                          
                          {/* Hover Card - Desktop only (hidden on touch devices via CSS) */}
                          {hoveredPedal?.id === pedal.id && (
                            <div 
                              className="hover-only absolute inset-0 z-30 flex flex-col justify-between pointer-events-none p-1.5 sm:p-2"
                              style={{
                                backgroundColor: categoryInfo?.color || '#FFB800',
                                border: '4px solid var(--color-board-border)',
                                boxShadow: '6px 6px 0px black',
                              }}
                            >
                              <div 
                                className="bg-theme-surface p-2 h-full flex flex-col"
                                style={{ border: '3px solid var(--color-board-border)' }}
                              >
                                {/* Header */}
                                <div className="mb-2">
                                  <p className="text-[9px] text-gray-500 font-bold uppercase truncate">{pedal.brand}</p>
                                  <p className="text-xs font-black text-theme truncate">{pedal.model}</p>
                                </div>
                                
                                {/* Rating Display */}
                                <div 
                                  className="p-2 mb-2"
                                  style={{ backgroundColor: `${categoryInfo?.color}15`, border: '2px solid var(--color-board-border)' }}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-black" style={{ color: categoryInfo?.color }}>
                                      {pedal.categoryRating}/10
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-600 uppercase">{ratingLabel}</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200" style={{ border: '1px solid black' }}>
                                    <div 
                                      className="h-full"
                                      style={{ 
                                        width: `${(pedal.categoryRating / 10) * 100}%`,
                                        backgroundColor: categoryInfo?.color
                                      }}
                                    />
                                  </div>
                                </div>
                              
                                {/* Quick Stats */}
                                <div className="flex gap-1 text-[10px] mb-2">
                                  <div 
                                    className="flex-1 px-1.5 py-1 text-center"
                                    style={{ backgroundColor: '#e5e7eb', border: '2px solid var(--color-board-border)' }}
                                  >
                                    <span className="text-green-600 font-black">${pedal.reverbPrice}</span>
                                  </div>
                                  <div 
                                    className="flex-1 px-1.5 py-1 text-center"
                                    style={{ backgroundColor: '#e5e7eb', border: '2px solid var(--color-board-border)' }}
                                  >
                                    <span className="text-theme font-black">{pedal.currentMa}mA</span>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-1 justify-center">
                                  <a
                                    href={getYouTubeReviewUrl(pedal.brand, pedal.model)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase pointer-events-auto hover:bg-red-600 transition-colors"
                                    style={{ border: '2px solid var(--color-board-border)' }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Youtube className="w-2.5 h-2.5 mr-1" />
                                    Review
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-zinc-500">
                    No pedals found for this type
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-theme-muted py-8">
                <div className="text-2xl font-black mb-3" style={{ border: '3px solid var(--color-board-border)', padding: '8px 16px', backgroundColor: '#FFF9C4' }}>←</div>
                <p className="text-center text-sm font-bold">
                  <span className="lg:hidden">Select a type above<br />to see available pedals</span>
                  <span className="hidden lg:inline">Select a type on the left<br />to see available pedals</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Continue Button */}
      {canContinue && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-board-dark/95 backdrop-blur border-t border-board-border">
          <button
            onClick={handleContinue}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-xl flex items-center justify-center gap-2"
          >
            Continue ({selectedCount} pedals)
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Multi-FX Prompt Modal */}
      {multiFxPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70"
            onClick={handleMultiFxConfirm}
          />
          <div 
            className="relative bg-theme-surface w-full max-w-md"
            style={{ border: '4px solid var(--color-board-border)', boxShadow: '8px 8px 0px black' }}
          >
            {/* Header */}
            <div 
              className="p-4 bg-cyan-400"
              style={{ borderBottom: '4px solid black' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 bg-theme-surface flex items-center justify-center"
                  style={{ border: '3px solid var(--color-board-border)' }}
                >
                  <Zap className="w-6 h-6 text-theme" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-theme uppercase">
                    Multi-FX Detected
                  </h2>
                  <p className="text-sm font-bold text-theme-muted">
                    {multiFxPrompt.pedal.brand} {multiFxPrompt.pedal.model}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4" style={{ backgroundColor: '#FFFEF0' }}>
              <p className="text-sm font-bold text-theme mb-4">
                This unit can cover multiple effects. What else is it handling on your board?
              </p>
              
              {/* Show actual slots on the board */}
              {(() => {
                const thisMultiFxId = multiFxPrompt.pedal.id;
                
                // Get all coverable slots (excluding the current one if any)
                // Only include slots with categories that multi-FX can cover
                const coverableCategories = ['gain', 'modulation', 'delay', 'reverb', 'dynamics', 'pitch', 'filter', 'eq'];
                const slotsOnBoard = typeSlots.filter(slot => 
                  slot.id !== multiFxPrompt.slotId &&
                  coverableCategories.includes(slot.category)
                );
                
                if (slotsOnBoard.length === 0) {
                  return (
                    <p className="text-xs text-theme-muted font-bold text-center py-4">
                      No other slots on your board to fill with this multi-FX.
                    </p>
                  );
                }
                
                // Get category colors
                const categoryColors: Record<string, string> = {
                  gain: '#EF4444',
                  modulation: '#8B5CF6',
                  delay: '#3B82F6',
                  reverb: '#06B6D4',
                  dynamics: '#F59E0B',
                  pitch: '#EC4899',
                  filter: '#10B981',
                  eq: '#6366F1',
                };
                
                return (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {slotsOnBoard.map(slot => {
                      const isSelected = multiFxPrompt.selectedSlotIds.includes(slot.id);
                      const hasOtherPedal = slot.selectedPedalId && slot.selectedPedalId !== thisMultiFxId;
                      const isAvailable = !hasOtherPedal;
                      
                      // Find what pedal is in this slot (if any)
                      const occupyingPedal = hasOtherPedal
                        ? allPedals.find(p => p.id === slot.selectedPedalId)
                        : null;
                      
                      const color = categoryColors[slot.category] || '#666';
                      
                      return (
                        <button
                          key={slot.id}
                          onClick={() => isAvailable && toggleMultiFxSlot(slot.id)}
                          disabled={!isAvailable}
                          className={`p-3 text-center transition-all ${
                            !isAvailable 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : isSelected 
                                ? 'text-white' 
                                : 'bg-theme-surface text-theme hover:bg-gray-100'
                          }`}
                          style={{
                            border: '3px solid var(--color-board-border)',
                            backgroundColor: isSelected ? color : undefined,
                            boxShadow: isSelected ? '3px 3px 0px black' : 'none',
                            opacity: !isAvailable ? 0.6 : 1,
                          }}
                        >
                          <div className="text-sm font-black uppercase">{slot.type}</div>
                          {isSelected && <Check className="w-4 h-4 mx-auto mt-1" />}
                          {!isAvailable && occupyingPedal && (
                            <div className="text-[10px] mt-1 truncate">
                              ({occupyingPedal.model})
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
              
              {/* Amp Sim Checkbox */}
              <label 
                className="flex items-center gap-3 p-3 mb-4 cursor-pointer transition-all hover:bg-orange-50"
                style={{ border: '3px solid var(--color-board-border)', backgroundColor: multiFxPrompt.addAmpSim ? '#FB923C' : 'white' }}
              >
                <input
                  type="checkbox"
                  checked={multiFxPrompt.addAmpSim}
                  onChange={(e) => setMultiFxPrompt(prev => prev ? { ...prev, addAmpSim: e.target.checked } : null)}
                  className="w-5 h-5 accent-black"
                />
                <div>
                  <span className={`text-sm font-black uppercase ${multiFxPrompt.addAmpSim ? 'text-white' : 'text-theme'}`}>
                    Also use as Amp Sim
                  </span>
                  <p className={`text-[10px] ${multiFxPrompt.addAmpSim ? 'text-white/70' : 'text-theme-muted'}`}>
                    Add an Amp Sim slot with this multi-FX
                  </p>
                </div>
              </label>
              
              {/* Summary */}
              {(multiFxPrompt.selectedSlotIds.length > 0 || multiFxPrompt.addAmpSim) && (
                <div 
                  className="p-3 mb-4 bg-black text-white"
                  style={{ border: '3px solid var(--color-board-border)' }}
                >
                  <p className="text-xs font-bold">
                    {multiFxPrompt.pedal.model} will fill your{' '}
                    {[
                      ...multiFxPrompt.selectedSlotIds.map(id => typeSlots.find(s => s.id === id)?.type),
                      ...(multiFxPrompt.addAmpSim ? ['Amp Sim'] : [])
                    ].filter(Boolean).join(', ')}{' '}
                    {(multiFxPrompt.selectedSlotIds.length + (multiFxPrompt.addAmpSim ? 1 : 0)) === 1 ? 'slot' : 'slots'}.
                  </p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleMultiFxConfirm}
                  className="flex-1 py-3 bg-green-500 text-white font-black uppercase text-sm transition-all hover:-translate-y-0.5"
                  style={{ border: '3px solid var(--color-board-border)', boxShadow: '3px 3px 0px var(--color-board-shadow)' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
