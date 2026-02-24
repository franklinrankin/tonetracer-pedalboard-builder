import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronRight, Plus, X, Check, ArrowUpDown, Youtube, RotateCcw, Search, ChevronDown, Zap, Volume2, Music } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { useTheme } from '../context/ThemeContext';
import { getGenreById, GENRES, GENRE_CATEGORIES, GenreCategoryId } from '../data/genres';
import { Category, PedalWithStatus } from '../types';
import { PedalImage } from '../components/PedalImage';
import { CATEGORY_INFO, getRatingLabel } from '../data/categories';
import { getYouTubeReviewUrl } from '../utils/youtube';
import { generateUUID } from '../utils/uuid';
import { GenreIcon } from '../components/GenreIcon';


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
  const [showSimMenu, setShowSimMenu] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [hoveredPedal, setHoveredPedal] = useState<PedalWithStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  
  const budgetEnabled = !board.constraints.applyAfterBudget;
  
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
  
  // Category to type mapping for slot generation
  const categoryToType: Record<Category, string[]> = useMemo(() => ({
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
  }), []);

  // Helper function to generate slots based on genre
  const generateSlotsForGenre = (existingSlots: TypeSlot[], targetCount: number, overrideGenre?: typeof genre): TypeSlot[] => {
    const slots = [...existingSlots];
    const usedTypes = new Set(slots.map(s => s.type));
    const targetGenre = overrideGenre !== undefined ? overrideGenre : genre;
    
    const addSlot = (typeName: string): boolean => {
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
    
    // Always start with tuner if not present
    if (!usedTypes.has('Tuner')) {
      addSlot('Tuner');
    }
    
    if (targetGenre) {
      // Build preferred types from genre's preferredSubtypes
      const preferredTypes = new Set<string>();
      targetGenre.preferredSubtypes.forEach(subtype => {
        for (const [typeName, subtypes] of Object.entries(TYPE_TO_SUBTYPES)) {
          if (subtypes.includes(subtype)) {
            preferredTypes.add(typeName);
            break;
          }
        }
      });
      
      // Phase 1: Add essential categories
      for (const category of targetGenre.essentialCategories) {
        if (slots.length >= targetCount) break;
        if (category === 'amp') continue;
        
        const typesForCategory = categoryToType[category] || [];
        let typeToAdd = typesForCategory.find(t => preferredTypes.has(t) && !usedTypes.has(t));
        if (!typeToAdd) {
          typeToAdd = typesForCategory.find(t => !usedTypes.has(t));
        }
        if (typeToAdd) addSlot(typeToAdd);
      }
      
      // Phase 2: Add extra categories
      for (const category of targetGenre.extraCategories) {
        if (slots.length >= targetCount) break;
        if (category === 'amp') continue;
        
        const typesForCategory = categoryToType[category] || [];
        
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
      
      // Phase 3: Fill remaining with genre-ranked types
      const categoryRatings: [Category, number][] = [
        ['gain', targetGenre.gainRating],
        ['modulation', targetGenre.modulationRating],
        ['delay', targetGenre.ambienceRating],
        ['reverb', targetGenre.ambienceRating],
        ['dynamics', targetGenre.dynamicsRating],
        ['filter', targetGenre.modulationRating],
        ['pitch', targetGenre.modulationRating],
        ['eq', targetGenre.dynamicsRating],
        ['volume', 3],
        ['utility', 2],
      ];
      categoryRatings.sort((a, b) => b[1] - a[1]);
      
      const allTypesRanked: string[] = [];
      for (const [category] of categoryRatings) {
        const typesForCategory = categoryToType[category] || [];
        for (const typeName of typesForCategory) {
          if (!allTypesRanked.includes(typeName)) {
            allTypesRanked.push(typeName);
          }
        }
      }
      
      for (const typeName of allTypesRanked) {
        if (slots.length >= targetCount) break;
        addSlot(typeName);
      }
    } else {
      // No genre - use sensible defaults
      const defaultTypes = [
        'Compressor', 'Overdrive', 'Chorus', 'Analog Delay', 'Hall Reverb',
        'Distortion', 'Tremolo', 'EQ', 'Wah', 'Fuzz', 'Phaser', 'Digital Delay',
      ];
      for (const typeName of defaultTypes) {
        if (slots.length >= targetCount) break;
        addSlot(typeName);
      }
    }
    
    return slots.sort((a, b) => a.signalOrder - b.signalOrder);
  };

  // Track previous maxSlots to detect changes
  const prevMaxSlotsRef = useRef(maxSlots);

  // Handle maxSlots changes - REGENERATE optimal slots for the new size
  // Preserve pedal selections where the type still exists in the new config
  useEffect(() => {
    const prevMaxSlots = prevMaxSlotsRef.current;
    prevMaxSlotsRef.current = maxSlots;
    
    // Only run when maxSlots actually changes (not on initial render)
    if (prevMaxSlots === maxSlots) return;
    
    setTypeSlots(currentSlots => {
      if (currentSlots.length === 0) return currentSlots; // Let initial generation handle it
      
      // Save current pedal selections by type
      const selectedPedalsByType: Record<string, string> = {};
      currentSlots.forEach(slot => {
        if (slot.selectedPedalId) {
          selectedPedalsByType[slot.type] = slot.selectedPedalId;
        }
      });
      
      // Generate fresh optimal slots for the new size
      const newSlots = generateSlotsForGenre([], maxSlots);
      
      // Restore pedal selections for types that still exist
      newSlots.forEach(slot => {
        if (selectedPedalsByType[slot.type]) {
          slot.selectedPedalId = selectedPedalsByType[slot.type];
        }
      });
      
      setSelectedSlotId(null);
      return newSlots;
    });
  }, [maxSlots, genre, categoryToType]);
  
  // Don't auto-generate slots - let user add manually or select a genre
  
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
    
    setTypeSlots(prev => prev.map(slot => {
      if (slot.id !== selectedSlotId) return slot;
      
      // Toggle: if clicking the same pedal, deselect it
      const newPedalId = slot.selectedPedalId === pedal.id ? undefined : pedal.id;
      return { ...slot, selectedPedalId: newPedalId };
    }));
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
  
  // Genre selector state
  const [showGenreSelector, setShowGenreSelector] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<GenreCategoryId | null>(null);
  
  const handleToggleGenre = (genreId: string) => {
    const isAdding = !selectedGenres.includes(genreId);
    dispatch({ type: 'TOGGLE_GENRE', genreId });
    
    // When adding first genre, generate recommended slots immediately
    if (isAdding && selectedGenres.length === 0) {
      const newGenre = getGenreById(genreId);
      if (newGenre) {
        const newSlots = generateSlotsForGenre([], maxSlots, newGenre);
        setTypeSlots(newSlots);
      }
    }
  };
  
  const selectedGenreObjects = selectedGenres.map(id => getGenreById(id)).filter(Boolean);
  const isAtMax = selectedGenres.length >= 3;
  
  const genresByCategory = GENRE_CATEGORIES.map(category => ({
    category,
    genres: GENRES.filter(g => g.category === category.id),
  }));
  
  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--color-board-dark)' }}>
      {/* Genre Selector - Collapsible */}
      <div 
        className="border-b-4"
        style={{ borderColor: 'var(--color-board-border)', backgroundColor: 'var(--color-board-surface)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGenreSelector(!showGenreSelector)}
              className="flex items-center gap-2 px-3 py-1.5 font-bold text-xs uppercase"
              style={{ 
                backgroundColor: 'var(--color-board-dark)',
                border: '2px solid var(--color-board-border)',
                boxShadow: '2px 2px 0px var(--color-board-shadow)',
                color: 'var(--color-board-text)',
              }}
            >
              <Music className="w-3 h-3" />
              Style
              <ChevronDown className={`w-3 h-3 transition-transform ${showGenreSelector ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Selected genres chips */}
            {selectedGenreObjects.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                {selectedGenreObjects.map(genre => genre && (
                  <button
                    key={genre.id}
                    onClick={() => handleToggleGenre(genre.id)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold transition-all hover:-translate-y-0.5"
                    style={{ 
                      backgroundColor: genre.color,
                      color: 'var(--color-board-text)',
                      border: '2px solid var(--color-board-border)',
                      boxShadow: '2px 2px 0px var(--color-board-shadow)',
                    }}
                  >
                    <GenreIcon genre={genre} size="sm" />
                    <span>{genre.name}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <span className="text-[10px] font-bold text-theme-muted uppercase">
                  {3 - selectedGenres.length} left
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-theme-muted">
                Select a style to get pedal recommendations
              </span>
            )}
          </div>
          
          {/* Expanded genre selector */}
          {showGenreSelector && (
            <div className="mt-3 pb-2">
              <div className="flex flex-wrap gap-2">
                {genresByCategory.map(({ category, genres }) => (
                  <div key={category.id} className="relative">
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                      className="px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-1"
                      style={{ 
                        backgroundColor: expandedCategory === category.id ? 'var(--color-board-accent)' : 'var(--color-board-dark)',
                        color: expandedCategory === category.id ? 'white' : 'var(--color-board-text)',
                        border: '2px solid var(--color-board-border)',
                        boxShadow: '2px 2px 0px var(--color-board-shadow)',
                      }}
                    >
                      {category.name}
                      <ChevronDown className={`w-3 h-3 transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Genre dropdown */}
                    {expandedCategory === category.id && (
                      <div 
                        className="absolute top-full left-0 mt-1 z-50 min-w-48"
                        style={{ 
                          backgroundColor: 'var(--color-board-surface)',
                          border: '3px solid var(--color-board-border)',
                          boxShadow: '4px 4px 0px var(--color-board-shadow)',
                        }}
                      >
                        {genres.map(g => {
                          const isSelected = selectedGenres.includes(g.id);
                          const isDisabled = !isSelected && isAtMax;
                          return (
                            <button
                              key={g.id}
                              onClick={() => {
                                if (!isDisabled) {
                                  handleToggleGenre(g.id);
                                  if (!isSelected) setExpandedCategory(null);
                                }
                              }}
                              disabled={isDisabled}
                              className={`w-full px-3 py-2 text-left text-sm font-bold flex items-center justify-between ${
                                isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-yellow-200 dark:hover:bg-yellow-900'
                              }`}
                              style={{ 
                                borderBottom: '1px solid var(--color-board-border)',
                                color: 'var(--color-board-text)',
                              }}
                            >
                              <span>{g.name}</span>
                              {isSelected && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* LEFT COLUMN - Type Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-theme uppercase whitespace-nowrap flex-shrink-0">
                Pedal Types ({typeSlots.length}/{maxSlots})
              </h2>
              
              <div className="flex gap-2 flex-shrink-0">
                  {/* Add Pedal Button */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowAddMenu(!showAddMenu);
                        setShowSimMenu(false);
                        setSelectedSlotId(null);
                      }}
                      className="px-3 py-1.5 bg-theme-surface text-theme font-bold text-xs uppercase flex items-center gap-1 hover:-translate-y-0.5 transition-all whitespace-nowrap flex-shrink-0"
                      style={{ border: '2px solid var(--color-board-border)', boxShadow: '2px 2px 0px var(--color-board-shadow)' }}
                    >
                      <Plus className="w-3 h-3" />
                      Add Pedal
                    </button>
                    
                    {/* Add Pedal Menu - sorted by signal chain order */}
                    {showAddMenu && (
                      <div 
                        className="absolute left-0 top-full mt-2 bg-theme-surface z-30 w-48 max-h-64 overflow-y-auto"
                        style={{ border: '3px solid var(--color-board-border)', boxShadow: '4px 4px 0px var(--color-board-shadow)' }}
                      >
                        <div className="p-1">
                          {[...availableToAdd]
                            .sort((a, b) => a.signalOrder - b.signalOrder)
                            .map(t => (
                              <button
                                key={t.type}
                                onClick={() => handleAddType(t.type)}
                                className="w-full px-2 py-1.5 text-left text-sm text-theme hover:bg-yellow-200 dark:hover:bg-yellow-900 font-bold flex items-center justify-between"
                              >
                                <span>{t.type}</span>
                                <span className="text-[9px] text-theme-muted uppercase">{t.category}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Add Sim Button */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSimMenu(!showSimMenu);
                        setShowAddMenu(false);
                        setSelectedSlotId(null);
                      }}
                      className="px-3 py-1.5 bg-orange-400 text-theme font-bold text-xs uppercase flex items-center gap-1 hover:-translate-y-0.5 transition-all whitespace-nowrap flex-shrink-0"
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
                      setShowSimMenu(false);
                      // Clear multi-FX from context
                      dispatch({ type: 'CLEAR_MULTI_EFFECTS' });
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white font-bold text-xs uppercase flex items-center gap-1 hover:-translate-y-0.5 transition-all whitespace-nowrap flex-shrink-0"
                    style={{ border: '2px solid var(--color-board-border)', boxShadow: '2px 2px 0px var(--color-board-shadow)' }}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
            </div>
            
            {/* Snake Grid Layout - 4 boxes per row with arrows between */}
            {/* Sized to fit 12 boxes (3 rows) without scrolling */}
            {sortedSlots.length === 0 ? (
              /* Empty state - Add A Pedal card */
              <button
                onClick={() => {
                  setShowAddMenu(true);
                  setShowSimMenu(false);
                }}
                className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-1 hover:rotate-1"
                style={{
                  backgroundColor: 'var(--color-board-surface)',
                  border: '4px dashed var(--color-board-border)',
                  boxShadow: '6px 6px 0px var(--color-board-shadow)',
                }}
              >
                <div 
                  className="w-16 h-16 flex items-center justify-center text-3xl font-black"
                  style={{ 
                    backgroundColor: 'var(--color-board-accent)',
                    color: 'white',
                    border: '3px solid var(--color-board-border)',
                  }}
                >
                  +
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-theme uppercase mb-1">Add A Pedal!</h3>
                  <p className="text-sm font-bold text-theme-muted">
                    Or select a style above for recommendations
                  </p>
                </div>
              </button>
            ) : (
            <div>
              {(() => {
                // Group slots into rows of 4 with original indices
                type SlotWithIndex = { slot: typeof sortedSlots[0]; originalIndex: number };
                const rows: SlotWithIndex[][] = [];
                for (let i = 0; i < sortedSlots.length; i += 4) {
                  const rowSlots = sortedSlots.slice(i, i + 4).map((slot, idx) => ({
                    slot,
                    originalIndex: i + idx
                  }));
                  const rowIndex = Math.floor(i / 4);
                  // First row right-to-left (like real pedalboard), alternating after
                  rows.push(rowIndex % 2 === 0 ? [...rowSlots].reverse() : rowSlots);
                }
                
                // Helper to render a mini card box (4:5 aspect ratio like real cards)
                const renderBox = (item: SlotWithIndex | undefined) => {
                  if (!item) return <div className="flex-1 aspect-[4/5]" />;
                  const isSelected = selectedSlotId === item.slot.id;
                  const selectedPedal = getSelectedPedal(item.slot.selectedPedalId);
                  const hasPedal = !!selectedPedal;
                  const categoryInfo = CATEGORY_INFO[item.slot.category as keyof typeof CATEGORY_INFO];
                  const categoryColor = categoryInfo?.color || '#9e9e9e';
                  
                  return (
                    <div
                      className={`flex-1 aspect-[4/5] relative p-1 transition-all ${
                        isSelected ? 'scale-105' : hasPedal ? '' : 'hover:-translate-y-1 hover:rotate-1'
                      }`}
                      style={{
                        backgroundColor: hasPedal ? '#A5D6A7' : isSelected ? categoryColor : `${categoryColor}40`,
                        border: '3px solid black',
                        boxShadow: isSelected ? '4px 4px 0px black' : '3px 3px 0px black',
                      }}
                    >
                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSlot(item.slot.id);
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-red-500 text-white z-20 hover:bg-red-600 transition-colors"
                        style={{ border: '2px solid black' }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      
                      {/* Category Badge */}
                      <div 
                        className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wide z-10 bg-theme-surface text-theme whitespace-nowrap"
                        style={{ border: '2px solid black' }}
                      >
                        {item.slot.type}
                      </div>
                      
                      {/* Inner Card - clickable to select */}
                      <button 
                        onClick={() => handleSelectSlot(item.slot.id)}
                        className="w-full h-full bg-theme-surface flex flex-col items-center justify-center p-1 overflow-hidden"
                        style={{ border: '2px solid black' }}
                      >
                        {hasPedal ? (
                          <>
                            {/* Pedal Image */}
                            <div 
                              className="flex-1 w-full overflow-hidden flex items-center justify-center"
                              style={{ border: '1px solid black' }}
                            >
                              <PedalImage 
                                pedalId={selectedPedal.id} 
                                category={selectedPedal.category} 
                                size="sm" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            {/* Pedal Name */}
                            <div className="text-[7px] font-black text-black truncate w-full text-center mt-0.5 leading-tight">
                              {selectedPedal.model}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Slot Number */}
                            <div className="text-[9px] font-black text-theme-muted">
                              #{item.originalIndex + 1}
                            </div>
                            
                            {/* Type Icon Box */}
                            <div 
                              className="w-8 h-8 flex items-center justify-center text-[11px] font-black my-1"
                              style={{ 
                                backgroundColor: `${categoryColor}30`,
                                border: '2px solid black',
                                color: categoryColor,
                              }}
                            >
                              {item.slot.type.substring(0, 2).toUpperCase()}
                            </div>
                            
                            {/* Empty State */}
                            <div className="text-[8px] font-bold text-theme-muted">
                              Tap to select
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  );
                };

                return rows.map((row, rowIndex) => {
                  const isRightToLeft = rowIndex % 2 === 0;
                  const isLastRow = rowIndex === rows.length - 1;
                  
                  // For right-to-left rows, pad the start with empty slots so items appear on the right
                  const paddedRow = isRightToLeft 
                    ? [...Array(4 - row.length).fill(undefined), ...row]
                    : [...row, ...Array(4 - row.length).fill(undefined)];
                  
                  return (
                    <div key={rowIndex}>
                      {/* Row with 4 boxes and 3 arrows */}
                      <div className="flex items-center justify-center">
                        {renderBox(paddedRow[0])}
                        
                        <div className="w-8 flex items-center justify-center flex-shrink-0">
                          {paddedRow[0] && paddedRow[1] && (
                            <ChevronRight 
                              className={`w-5 h-5 text-board-accent ${isRightToLeft ? 'rotate-180' : ''}`} 
                              strokeWidth={3} 
                            />
                          )}
                        </div>
                        
                        {renderBox(paddedRow[1])}
                        
                        <div className="w-8 flex items-center justify-center flex-shrink-0">
                          {paddedRow[1] && paddedRow[2] && (
                            <ChevronRight 
                              className={`w-5 h-5 text-board-accent ${isRightToLeft ? 'rotate-180' : ''}`} 
                              strokeWidth={3} 
                            />
                          )}
                        </div>
                        
                        {renderBox(paddedRow[2])}
                        
                        <div className="w-8 flex items-center justify-center flex-shrink-0">
                          {paddedRow[2] && paddedRow[3] && (
                            <ChevronRight 
                              className={`w-5 h-5 text-board-accent ${isRightToLeft ? 'rotate-180' : ''}`} 
                              strokeWidth={3} 
                            />
                          )}
                        </div>
                        
                        {renderBox(paddedRow[3])}
                      </div>
                      
                      {/* Down arrow row */}
                      {!isLastRow && (
                        <div className="flex items-center justify-center h-8">
                          <div className={`flex-1 flex justify-center ${isRightToLeft ? '' : 'invisible'}`}>
                            <ChevronRight className="w-5 h-5 rotate-90 text-board-accent" strokeWidth={3} />
                          </div>
                          <div className="w-8 flex-shrink-0" />
                          <div className="flex-1" />
                          <div className="w-8 flex-shrink-0" />
                          <div className="flex-1" />
                          <div className="w-8 flex-shrink-0" />
                          <div className={`flex-1 flex justify-center ${!isRightToLeft ? '' : 'invisible'}`}>
                            <ChevronRight className="w-5 h-5 rotate-90 text-board-accent" strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
            )}
            
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
                                className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wide bg-theme-surface text-theme"
                                style={{
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
      
    </div>
  );
}
