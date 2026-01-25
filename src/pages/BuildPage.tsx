import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronRight, Plus, X, Check, ArrowUpDown, Youtube, RotateCcw, Search } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { getGenreById } from '../data/genres';
import { Category, PedalWithStatus } from '../types';
import { PedalImage } from '../components/PedalImage';
import { CATEGORY_INFO, getRatingLabel } from '../data/categories';
import { getYouTubeReviewUrl } from '../utils/youtube';
import { generateUUID } from '../utils/uuid';

interface BuildPageProps {
  onContinue: () => void;
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
const TYPE_OPTIONS: { type: string; category: Category; signalOrder: number; icon: string }[] = [
  { type: 'Tuner', category: 'utility', signalOrder: 1, icon: '🎯' },
  { type: 'Wah', category: 'filter', signalOrder: 10, icon: '👄' },
  { type: 'Envelope Filter', category: 'filter', signalOrder: 11, icon: '🎺' },
  { type: 'Compressor', category: 'dynamics', signalOrder: 20, icon: '🗜️' },
  { type: 'Noise Gate', category: 'dynamics', signalOrder: 22, icon: '🚪' },
  { type: 'Octave', category: 'pitch', signalOrder: 30, icon: '🎹' },
  { type: 'Pitch Shifter', category: 'pitch', signalOrder: 31, icon: '↕️' },
  { type: 'Harmonizer', category: 'pitch', signalOrder: 33, icon: '🎶' },
  { type: 'Boost', category: 'gain', signalOrder: 40, icon: '📈' },
  { type: 'Overdrive', category: 'gain', signalOrder: 45, icon: '🔥' },
  { type: 'Distortion', category: 'gain', signalOrder: 50, icon: '⚡' },
  { type: 'Fuzz', category: 'gain', signalOrder: 55, icon: '🐝' },
  { type: 'EQ', category: 'eq', signalOrder: 60, icon: '📊' },
  { type: 'Chorus', category: 'modulation', signalOrder: 72, icon: '🌊' },
  { type: 'Phaser', category: 'modulation', signalOrder: 70, icon: '🌀' },
  { type: 'Flanger', category: 'modulation', signalOrder: 71, icon: '✈️' },
  { type: 'Tremolo', category: 'modulation', signalOrder: 74, icon: '〰️' },
  { type: 'Vibrato', category: 'modulation', signalOrder: 73, icon: '📳' },
  { type: 'Rotary', category: 'modulation', signalOrder: 75, icon: '🎡' },
  { type: 'Uni-Vibe', category: 'modulation', signalOrder: 77, icon: '☀️' },
  { type: 'Analog Delay', category: 'delay', signalOrder: 90, icon: '📼' },
  { type: 'Digital Delay', category: 'delay', signalOrder: 92, icon: '💾' },
  { type: 'Tape Delay', category: 'delay', signalOrder: 91, icon: '🎞️' },
  { type: 'Spring Reverb', category: 'reverb', signalOrder: 95, icon: '🌿' },
  { type: 'Hall Reverb', category: 'reverb', signalOrder: 96, icon: '🏛️' },
  { type: 'Plate Reverb', category: 'reverb', signalOrder: 97, icon: '🍽️' },
  { type: 'Ambient Reverb', category: 'reverb', signalOrder: 99, icon: '🌌' },
  { type: 'Volume', category: 'volume', signalOrder: 80, icon: '🎚️' },
  { type: 'Looper', category: 'utility', signalOrder: 110, icon: '🔄' },
];

// Map generic type names to actual pedal subtypes in database
const TYPE_TO_SUBTYPES: Record<string, string[]> = {
  'Tuner': ['Tuner'],
  'Wah': ['Wah'],
  'Envelope Filter': ['Envelope', 'Auto-Wah'],
  'Compressor': ['Compressor'],
  'Noise Gate': ['Gate', 'Noise Gate'],
  'Octave': ['Octave'],
  'Pitch Shifter': ['Pitch', 'Shifter', 'Whammy'],
  'Harmonizer': ['Harmonizer'],
  'Boost': ['Boost'],
  'Overdrive': ['Overdrive'],
  'Distortion': ['Distortion'],
  'Fuzz': ['Fuzz'],
  'EQ': ['EQ', 'Graphic', 'Parametric'],
  'Chorus': ['Chorus'],
  'Phaser': ['Phaser'],
  'Flanger': ['Flanger'],
  'Tremolo': ['Tremolo'],
  'Vibrato': ['Vibrato'],
  'Rotary': ['Rotary'],
  'Uni-Vibe': ['Uni-Vibe'],
  'Analog Delay': ['Analog', 'Analog Delay'],
  'Digital Delay': ['Digital', 'Digital Delay', 'Multi'],
  'Tape Delay': ['Tape', 'Tape Delay'],
  'Spring Reverb': ['Spring'],
  'Hall Reverb': ['Hall'],
  'Plate Reverb': ['Plate'],
  'Ambient Reverb': ['Ambient', 'Shimmer'],
  'Volume': ['Volume', 'Expression'],
  'Looper': ['Looper'],
};

type SortOption = 'recommended' | 'rating' | 'price-low' | 'price-high' | 'name';

function getTypeIcon(type: string): string {
  return TYPE_OPTIONS.find(t => t.type === type)?.icon || '🎸';
}

function getTypeInfo(type: string) {
  return TYPE_OPTIONS.find(t => t.type === type);
}

export function BuildPage({ onContinue }: BuildPageProps) {
  const { state, dispatch } = useBoard();
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
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [hoveredPedal, setHoveredPedal] = useState<PedalWithStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Calculate current cost from BUILD PAGE selections (not board state)
  const currentBuildCost = useMemo(() => {
    return typeSlots.reduce((sum, slot) => {
      if (!slot.selectedPedalId) return sum;
      const pedal = allPedals.find(p => p.id === slot.selectedPedalId);
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
      const allTypesRanked: string[] = [];
      
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
      
      // Build ranked list of all available types
      for (const [category] of categoryRatings) {
        const typesForCategory = categoryToType[category] || [];
        for (const typeName of typesForCategory) {
          if (!allTypesRanked.includes(typeName)) {
            allTypesRanked.push(typeName);
          }
        }
      }
      
      // Keep filling until we reach target
      for (const typeName of allTypesRanked) {
        if (slots.length >= targetSlots) break;
        addSlot(typeName);
      }
    } else {
      // No genre selected - use sensible defaults
      const defaultTypes = [
        'Compressor', 'Overdrive', 'Chorus', 'Analog Delay', 'Hall Reverb', 
        'Distortion', 'Tremolo', 'EQ', 'Wah', 'Fuzz', 'Phaser', 'Digital Delay'
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
          // Add variety by shuffling within score bands
          // First, calculate scores and group into bands
          const withScores = filtered.map(p => ({
            pedal: p,
            score: getRecommendationScore(p),
          }));
          
          // Sort by score descending
          withScores.sort((a, b) => b.score - a.score);
          
          // Shuffle within score bands (pedals within 3 points of each other)
          const shuffled: typeof withScores = [];
          let band: typeof withScores = [];
          let bandMinScore = withScores[0]?.score ?? 0;
          
          for (const item of withScores) {
            if (item.score >= bandMinScore - 3) {
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
  }, [selectedSlot, allPedals, typeSlots, sortOption, budgetRemaining, board.constraints.applyAfterBudget, searchQuery]);
  
  // Get selected pedal object from ID
  const getSelectedPedal = (pedalId?: string) => {
    if (!pedalId) return null;
    return allPedals.find(p => p.id === pedalId) || null;
  };
  
  const handleSelectSlot = (slotId: string) => {
    setSelectedSlotId(slotId === selectedSlotId ? null : slotId);
    setShowAddMenu(false);
    setHoveredPedal(null);
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
  
  // Count selected pedals
  const selectedCount = typeSlots.filter(s => s.selectedPedalId).length;
  const totalCost = typeSlots.reduce((sum, s) => {
    const pedal = getSelectedPedal(s.selectedPedalId);
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
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="bg-board-surface/50 border-b border-board-border">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {genre && (
                <div 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0"
                  style={{ backgroundColor: `${genre.color}20` }}
                >
                  {genre.icon}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-white truncate">
                  Build Your {genre?.name || ''} Board
                </h1>
                <p className="text-[10px] sm:text-xs text-zinc-500">
                  {selectedCount}/{typeSlots.length} selected
                  {totalCost > 0 && ` · $${totalCost}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {selectedCount > 0 && (
                <button
                  onClick={handleClearBoard}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-400 hover:text-white border border-board-border rounded-lg hover:bg-board-elevated transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </button>
              )}
              {selectedCount > 0 && (
                <button
                  onClick={handleClearBoard}
                  className="sm:hidden p-2 text-zinc-400 hover:text-white border border-board-border rounded-lg hover:bg-board-elevated transition-colors"
                  title="Clear"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  canContinue
                    ? 'bg-green-600 text-white hover:bg-green-500'
                    : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Budget Bar */}
      <div className="bg-board-surface/80 border-b border-board-border">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  💰 Budget
                </span>
                <span className={`text-sm font-bold ${
                  budgetRemaining < 0 ? 'text-red-400' : budgetRemaining < 100 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  ${currentBuildCost} / ${board.constraints.maxBudget}
                </span>
              </div>
              <div className="h-3 bg-board-elevated rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    budgetRemaining < 0 
                      ? 'bg-gradient-to-r from-red-500 to-red-400' 
                      : budgetRemaining < 100 
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                        : 'bg-gradient-to-r from-green-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min((currentBuildCost / board.constraints.maxBudget) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-zinc-500">
                  {selectedCount} pedals selected
                </span>
                <span className={`text-xs ${budgetRemaining < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                  {budgetRemaining >= 0 ? `$${budgetRemaining} remaining` : `$${Math.abs(budgetRemaining)} over budget`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* LEFT COLUMN - Type Slots */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-zinc-400 mb-3">
              Pedal Types ({typeSlots.length}/{maxSlots})
            </h2>
            
            {sortedSlots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              const selectedPedal = getSelectedPedal(slot.selectedPedalId);
              const hasPedal = !!selectedPedal;
              
              return (
                <div
                  key={slot.id}
                  className={`rounded-xl border transition-all ${
                    isSelected 
                      ? 'border-board-accent bg-board-accent/10' 
                      : hasPedal
                        ? 'border-green-600/50 bg-board-surface'
                        : 'border-board-border bg-board-surface hover:border-zinc-600'
                  }`}
                >
                  {/* Type Header - Always clickable */}
                  <button
                    onClick={() => handleSelectSlot(slot.id)}
                    className="w-full p-3 flex items-center gap-3 text-left"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                      hasPedal ? 'bg-green-600/20' : 'bg-board-elevated'
                    }`}>
                      {getTypeIcon(slot.type)}
                    </div>
                    
                    {/* Type Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">{slot.type}</div>
                      {hasPedal ? (
                        <div className="text-xs text-green-400 truncate">
                          {selectedPedal.brand} {selectedPedal.model} · ${selectedPedal.reverbPrice}
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-500">Tap to select a pedal</div>
                      )}
                    </div>
                    
                    {/* Status indicator */}
                    {hasPedal && (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {/* Expanded actions when selected */}
                  {isSelected && (
                    <div className="px-3 pb-3 pt-1 border-t border-board-border/50">
                      <div className="flex items-center gap-2">
                        {/* Change type dropdown */}
                        {typeAlternatives.length > 0 && (
                          <div className="relative group">
                            <button
                              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white border border-board-border rounded-lg hover:bg-board-elevated transition-colors"
                            >
                              Type
                            </button>
                            <div className="absolute left-0 top-full mt-1 bg-board-elevated border border-board-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[140px]">
                              {typeAlternatives.map(alt => (
                                <button
                                  key={alt.type}
                                  onClick={() => handleChangeType(slot.id, alt.type)}
                                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-board-border flex items-center gap-2"
                                >
                                  <span>{alt.icon}</span>
                                  <span>{alt.type}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Remove */}
                        {typeSlots.length > 1 && (
                          <button
                            onClick={() => handleRemoveSlot(slot.id)}
                            className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-900/50 rounded-lg hover:bg-red-900/20 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Add Type Button */}
            {typeSlots.length < maxSlots && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowAddMenu(!showAddMenu);
                    setSelectedSlotId(null);
                  }}
                  className="w-full py-4 rounded-xl border-2 border-board-accent bg-gradient-to-r from-board-accent/20 via-board-accent/10 to-board-accent/20 text-board-accent hover:from-board-accent/30 hover:via-board-accent/20 hover:to-board-accent/30 transition-all flex items-center justify-center gap-2 font-semibold text-lg relative overflow-hidden group"
                  style={{
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2), inset 0 0 20px rgba(59, 130, 246, 0.1)',
                    animation: 'glow 2s ease-in-out infinite alternate',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Plus className="w-6 h-6" />
                  Add Pedal Type
                </button>
                
                {/* Add menu dropdown */}
                {showAddMenu && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-board-elevated border border-board-border rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto">
                    {(['gain', 'dynamics', 'modulation', 'delay', 'reverb', 'filter', 'pitch', 'eq', 'volume', 'utility'] as Category[]).map(category => {
                      const typesInCategory = availableToAdd.filter(t => t.category === category);
                      if (typesInCategory.length === 0) return null;
                      
                      return (
                        <div key={category} className="p-2 border-b border-board-border last:border-0">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider px-2 mb-1">{category}</p>
                          {typesInCategory.map(t => (
                            <button
                              key={t.type}
                              onClick={() => handleAddType(t.type)}
                              className="w-full px-2 py-1.5 text-left text-sm text-white hover:bg-board-border rounded flex items-center gap-2"
                            >
                              <span>{t.icon}</span>
                              <span>{t.type}</span>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* RIGHT COLUMN - Pedal Selection */}
          <div className="bg-board-surface border border-board-border rounded-xl p-4 min-h-[400px] flex flex-col">
            {selectedSlot ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTypeIcon(selectedSlot.type)}</span>
                    <h2 className="text-lg font-medium text-white">
                      Choose a {selectedSlot.type}
                    </h2>
                  </div>
                  
                  {/* Sorting Options */}
                  <div className="flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="text-xs bg-board-elevated border border-board-border rounded px-2 py-1 text-white focus:outline-none focus:border-board-accent"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="rating">Rating</option>
                      <option value="price-low">Price: Low</option>
                      <option value="price-high">Price: High</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                </div>
                
                {/* Search Bar */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search pedals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-board-elevated border border-board-border rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-board-accent transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {pedalsForSelectedType.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 flex-1 overflow-y-auto max-h-[50vh] lg:max-h-[calc(100vh-300px)] pb-4">
                    {pedalsForSelectedType.slice(0, 50).map(pedal => {
                      const isSelected = selectedSlot.selectedPedalId === pedal.id;
                      const isUsedByOther = pedal.usedByOtherSlot;
                      const isOverBudget = pedal.overBudget && !isSelected;
                      const isDisabled = isUsedByOther || isOverBudget;
                      const categoryInfo = CATEGORY_INFO[pedal.category];
                      const ratingLabel = getRatingLabel(pedal.category, pedal.categoryRating);
                      
                      return (
                        <div
                          key={pedal.id}
                          className="relative"
                          onMouseEnter={() => setHoveredPedal(pedal)}
                          onMouseLeave={() => setHoveredPedal(null)}
                        >
                          <button
                            onClick={() => handleSelectPedal(pedal, isDisabled)}
                            disabled={isDisabled}
                            className={`w-full group p-2 sm:p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                              isSelected
                                ? 'border-green-500 bg-green-500/10 ring-2 ring-green-500/30'
                                : isDisabled
                                  ? 'border-board-border bg-board-elevated/50 opacity-50 cursor-not-allowed'
                                  : 'border-board-border bg-board-elevated hover:border-board-accent'
                            }`}
                          >
                            <div className={`aspect-square mb-2 rounded-lg overflow-hidden bg-black/20 ${isDisabled ? 'grayscale' : ''}`}>
                              <PedalImage pedalId={pedal.id} category={pedal.category} size="lg" className="w-full h-full" />
                            </div>
                            <p className={`text-[10px] sm:text-xs truncate ${isDisabled ? 'text-zinc-600' : 'text-zinc-400'}`}>{pedal.brand}</p>
                            <p className={`text-xs sm:text-sm font-medium truncate ${isDisabled ? 'text-zinc-500' : 'text-white'}`}>{pedal.model}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className={`text-[10px] sm:text-xs ${isOverBudget ? 'text-red-400' : isDisabled ? 'text-zinc-600' : 'text-green-400'}`}>${pedal.reverbPrice}</p>
                              <span 
                                className="text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded"
                                style={{ 
                                  backgroundColor: isDisabled ? '#27272a' : `${categoryInfo?.color}20`, 
                                  color: isDisabled ? '#52525b' : categoryInfo?.color 
                                }}
                              >
                                {pedal.categoryRating}/10
                              </span>
                            </div>
                            {isSelected && (
                              <div className="mt-2 flex items-center gap-1 text-green-400 text-[10px] sm:text-xs">
                                <Check className="w-3 h-3" />
                                <span className="hidden sm:inline">Selected · tap to deselect</span>
                                <span className="sm:hidden">✓ Selected</span>
                              </div>
                            )}
                            {isUsedByOther && (
                              <div className="mt-2 text-[10px] sm:text-xs text-zinc-600">
                                Used in another slot
                              </div>
                            )}
                            {isOverBudget && !isUsedByOther && (
                              <div className="mt-2 text-[10px] sm:text-xs text-red-400">
                                Over budget
                              </div>
                            )}
                          </button>
                          
                          {/* Hover Card - Desktop only (hidden on touch devices via CSS) */}
                          {hoveredPedal?.id === pedal.id && (
                            <div className="hover-only absolute inset-0 bg-board-dark/95 backdrop-blur-sm border border-board-accent rounded-xl p-2 shadow-2xl z-30 flex flex-col justify-between pointer-events-none">
                              {/* Header with rating */}
                              <div>
                                <p className="text-[10px] text-zinc-500 truncate">{pedal.brand}</p>
                                <p className="text-xs font-semibold text-white truncate">{pedal.model}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <span 
                                    className="text-sm font-bold"
                                    style={{ color: categoryInfo?.color }}
                                  >
                                    {pedal.categoryRating}/10
                                  </span>
                                  <span className="text-[9px] text-zinc-500">{ratingLabel}</span>
                                </div>
                                <div className="w-full h-1 bg-board-elevated rounded-full overflow-hidden mt-1">
                                  <div 
                                    className="h-full rounded-full"
                                    style={{ 
                                      width: `${(pedal.categoryRating / 10) * 100}%`,
                                      backgroundColor: categoryInfo?.color
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {/* Quick Stats */}
                              <div className="flex gap-2 text-[10px] my-1">
                                <div className="flex-1 bg-board-elevated rounded px-1.5 py-1">
                                  <span className="text-zinc-500">$</span>
                                  <span className="text-green-400 font-medium">{pedal.reverbPrice}</span>
                                </div>
                                <div className="flex-1 bg-board-elevated rounded px-1.5 py-1">
                                  <span className="text-zinc-500">⚡</span>
                                  <span className="text-white font-medium">{pedal.currentMa}mA</span>
                                </div>
                              </div>
                              
                              {/* YouTube Review Link */}
                              <a
                                href={getYouTubeReviewUrl(pedal.brand, pedal.model)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 w-full px-2 py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-[10px] font-medium pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Youtube className="w-3 h-3" />
                                Reviews
                              </a>
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
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-8">
                <div className="text-4xl mb-3">👆</div>
                <p className="text-center text-sm">
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
