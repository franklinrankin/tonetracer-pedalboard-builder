import { useState, useMemo } from 'react';
import { ArrowLeft, Check, Search, X, ArrowUpDown, Youtube, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBoard } from '../context/BoardContext';
import { Category, PedalWithStatus } from '../types';
import { PedalImage } from '../components/PedalImage';
import { CATEGORY_INFO, getRatingLabel } from '../data/categories';
import { getYouTubeReviewUrl } from '../utils/youtube';

interface ProfilePageProps {
  onBack: () => void;
  favorites: Record<string, string | null>;
  onUpdateFavorites: (favorites: Record<string, string | null>) => void;
}

// Types with expandable subtypes (Gain, Modulation, Dynamics, Filter, Utility)
const TYPE_OPTIONS: { type: string; category: Category }[] = [
  // Gain types
  { type: 'Boost', category: 'gain' },
  { type: 'Overdrive', category: 'gain' },
  { type: 'Distortion', category: 'gain' },
  { type: 'Fuzz', category: 'gain' },
  // Modulation types
  { type: 'Chorus', category: 'modulation' },
  { type: 'Phaser', category: 'modulation' },
  { type: 'Flanger', category: 'modulation' },
  { type: 'Tremolo', category: 'modulation' },
  { type: 'Vibrato', category: 'modulation' },
  { type: 'Rotary', category: 'modulation' },
  { type: 'Uni-Vibe', category: 'modulation' },
  // Dynamics types
  { type: 'Compressor', category: 'dynamics' },
  { type: 'Noise Gate', category: 'dynamics' },
  // Filter types
  { type: 'Wah', category: 'filter' },
  { type: 'Envelope Filter', category: 'filter' },
  // Utility types
  { type: 'Tuner', category: 'utility' },
  { type: 'Looper', category: 'utility' },
];

// Single-selection categories (no subtypes - pick one from whole category)
const SINGLE_CATEGORIES: { category: Category; name: string }[] = [
  { category: 'delay', name: 'Delay' },
  { category: 'reverb', name: 'Reverb' },
  { category: 'pitch', name: 'Pitch' },
  { category: 'eq', name: 'EQ' },
  { category: 'volume', name: 'Volume' },
];

// Map type names to actual pedal subtypes in database
const TYPE_TO_SUBTYPES: Record<string, string[]> = {
  'Tuner': ['Tuner', 'Chromatic Tuner'],
  'Wah': ['Wah'],
  'Envelope Filter': ['Envelope', 'Auto-Wah'],
  'Compressor': ['Compressor'],
  'Noise Gate': ['Gate', 'Noise Gate'],
  'Boost': ['Boost'],
  'Overdrive': ['Overdrive'],
  'Distortion': ['Distortion'],
  'Fuzz': ['Fuzz'],
  'Chorus': ['Chorus'],
  'Phaser': ['Phaser'],
  'Flanger': ['Flanger'],
  'Tremolo': ['Tremolo'],
  'Vibrato': ['Vibrato'],
  'Rotary': ['Rotary'],
  'Uni-Vibe': ['Uni-Vibe', 'Vibe'],
  'Looper': ['Looper'],
};

// Categories with expandable types
const CATEGORIES_WITH_TYPES: { category: Category; name: string; types: typeof TYPE_OPTIONS }[] = [
  { category: 'gain', name: 'Gain', types: TYPE_OPTIONS.filter(t => t.category === 'gain') },
  { category: 'modulation', name: 'Modulation', types: TYPE_OPTIONS.filter(t => t.category === 'modulation') },
  { category: 'dynamics', name: 'Dynamics', types: TYPE_OPTIONS.filter(t => t.category === 'dynamics') },
  { category: 'filter', name: 'Filter', types: TYPE_OPTIONS.filter(t => t.category === 'filter') },
  { category: 'utility', name: 'Utility', types: TYPE_OPTIONS.filter(t => t.category === 'utility') },
];

// Total number of selections possible
const TOTAL_SELECTIONS = TYPE_OPTIONS.length + SINGLE_CATEGORIES.length;

type SortOption = 'rating' | 'price-low' | 'price-high' | 'name';

export function ProfilePage({ onBack, favorites, onUpdateFavorites }: ProfilePageProps) {
  const { user } = useAuth();
  const { state } = useBoard();
  const { allPedals } = state;
  
  // Selection can be either a type (like "Overdrive") or a category (like "delay")
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'type' | 'category' | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set(['gain', 'modulation']));
  const [sortOption, setSortOption] = useState<SortOption>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPedal, setHoveredPedal] = useState<PedalWithStatus | null>(null);
  const [localFavorites, setLocalFavorites] = useState<Record<string, string | null>>(favorites);
  const [showSaved, setShowSaved] = useState(false);
  
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  
  const selectedTypeInfo = selectionMode === 'type' ? TYPE_OPTIONS.find(t => t.type === selectedKey) : null;
  const selectedCategoryInfo = selectionMode === 'category' ? SINGLE_CATEGORIES.find(c => c.category === selectedKey) : null;
  
  // Get pedals for selected type or category
  const pedalsForSelection = useMemo(() => {
    if (!selectedKey) return [];
    
    const searchLower = searchQuery.toLowerCase().trim();
    
    let filtered: PedalWithStatus[] = [];
    
    if (selectionMode === 'type' && selectedTypeInfo) {
      // Filter by type subtypes
      const subtypes = TYPE_TO_SUBTYPES[selectedKey] || [selectedKey];
      filtered = allPedals.filter(p => {
        const matchesType = subtypes.includes(p.subtype || '') || 
          (p.category === selectedTypeInfo.category && !TYPE_TO_SUBTYPES[selectedKey]);
        
        if (!matchesType) return false;
        
        if (searchLower) {
          const matchesSearch = 
            p.brand.toLowerCase().includes(searchLower) ||
            p.model.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower));
          if (!matchesSearch) return false;
        }
        
        return true;
      });
    } else if (selectionMode === 'category' && selectedCategoryInfo) {
      // Filter by entire category
      filtered = allPedals.filter(p => {
        if (p.category !== selectedCategoryInfo.category) return false;
        
        if (searchLower) {
          const matchesSearch = 
            p.brand.toLowerCase().includes(searchLower) ||
            p.model.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower));
          if (!matchesSearch) return false;
        }
        
        return true;
      });
    }
    
    // Sort
    switch (sortOption) {
      case 'rating':
        filtered.sort((a, b) => b.categoryRating - a.categoryRating);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.reverbPrice - b.reverbPrice);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.reverbPrice - a.reverbPrice);
        break;
      case 'name':
        filtered.sort((a, b) => a.model.localeCompare(b.model));
        break;
    }
    
    // Pin selected favorite to top
    const favoriteId = localFavorites[selectedKey];
    if (favoriteId) {
      const favIndex = filtered.findIndex(p => p.id === favoriteId);
      if (favIndex > 0) {
        const [fav] = filtered.splice(favIndex, 1);
        filtered.unshift(fav);
      }
    }
    
    return filtered;
  }, [selectedKey, selectionMode, selectedTypeInfo, selectedCategoryInfo, allPedals, sortOption, searchQuery, localFavorites]);
  
  const handleSelectPedal = (pedal: PedalWithStatus) => {
    if (!selectedKey) return;
    
    setLocalFavorites(prev => {
      const newFavs = { ...prev };
      // Toggle: if clicking same pedal, deselect
      if (newFavs[selectedKey] === pedal.id) {
        newFavs[selectedKey] = null;
      } else {
        newFavs[selectedKey] = pedal.id;
      }
      return newFavs;
    });
  };
  
  const handleSelectType = (type: string) => {
    if (selectedKey === type && selectionMode === 'type') {
      setSelectedKey(null);
      setSelectionMode(null);
    } else {
      setSelectedKey(type);
      setSelectionMode('type');
    }
    setSearchQuery('');
    setHoveredPedal(null);
  };
  
  const handleSelectCategory = (category: Category) => {
    if (selectedKey === category && selectionMode === 'category') {
      setSelectedKey(null);
      setSelectionMode(null);
    } else {
      setSelectedKey(category);
      setSelectionMode('category');
    }
    setSearchQuery('');
    setHoveredPedal(null);
  };
  
  const handleSave = () => {
    onUpdateFavorites(localFavorites);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };
  
  const getSelectedPedalForType = (type: string) => {
    const pedalId = localFavorites[type];
    if (!pedalId) return null;
    return allPedals.find(p => p.id === pedalId) || null;
  };
  
  const toggleCategory = (category: Category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };
  
  // Count how many favorites are set
  const favoritesCount = Object.values(localFavorites).filter(Boolean).length;
  
  return (
    <div className="min-h-screen bg-[#FFFEF0]">
      {/* Header - sticky with high z-index */}
      <div className="sticky top-0 bg-theme-surface border-b-4 brutal-border z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={onBack}
                className="p-2 text-theme hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors flex-shrink-0"
                style={{ border: '2px solid black' }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-extrabold text-theme uppercase tracking-tight truncate">
                  {username}'s Favorites
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-700 font-bold">
                  {favoritesCount}/{TOTAL_SELECTIONS} selected
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold uppercase transition-all flex-shrink-0 hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                showSaved 
                  ? 'bg-green-200 dark:bg-green-900/50 text-theme' 
                  : 'bg-orange-200 dark:bg-orange-900/50 text-theme'
              }`}
              style={{ 
                border: '3px solid var(--color-board-border)',
                boxShadow: '4px 4px 0px var(--color-board-shadow)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '6px 6px 0px var(--color-board-shadow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '4px 4px 0px black';
              }}
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">{showSaved ? 'Saved!' : 'Save Profile'}</span>
              <span className="sm:hidden">{showSaved ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative">
        
        {/* Two Column Layout */}
        <div className="max-w-6xl mx-auto p-3 sm:p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* LEFT COLUMN - Category Slots */}
            <div className="space-y-2">
            <h2 className="text-sm font-bold text-theme uppercase tracking-wide mb-3">
              Choose Your Favorites ({favoritesCount}/{TOTAL_SELECTIONS})
            </h2>
            
            <div className="space-y-2 max-h-[40vh] lg:max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {CATEGORIES_WITH_TYPES.map((cat) => {
                const categoryInfo = CATEGORY_INFO[cat.category];
                const isExpanded = expandedCategories.has(cat.category);
                const typesWithFavorites = cat.types.filter(t => localFavorites[t.type]);
                
                return (
                  <div key={cat.category} className="border-3 brutal-border bg-theme-surface overflow-hidden brutal-shadow">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(cat.category)}
                      className="w-full p-3 flex items-center gap-3 text-left hover:bg-yellow-100 transition-colors"
                    >
                      <div 
                        className="w-8 h-8 border-2 border-black flex items-center justify-center text-xs font-black"
                        style={{ backgroundColor: categoryInfo?.color || '#FFD93D' }}
                      >
                        {cat.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-theme uppercase">{cat.name}</span>
                        <span className="ml-2 text-xs text-gray-600 font-medium">
                          {typesWithFavorites.length}/{cat.types.length} selected
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-theme" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-theme" />
                      )}
                    </button>
                    
                    {/* Types List */}
                    {isExpanded && (
                      <div className="border-t-2 border-black">
                        {cat.types.map((typeOpt) => {
                          const isSelected = selectedKey === typeOpt.type && selectionMode === 'type';
                          const favoritePedal = getSelectedPedalForType(typeOpt.type);
                          const hasFavorite = !!favoritePedal;
                          
                          return (
                            <button
                              key={typeOpt.type}
                              onClick={() => handleSelectType(typeOpt.type)}
                              className={`w-full p-2.5 pl-6 flex items-center gap-3 text-left transition-colors ${
                                isSelected 
                                  ? 'bg-orange-200 border-l-4 border-orange-500' 
                                  : hasFavorite
                                    ? 'bg-green-100 border-l-4 border-green-600'
                                    : 'hover:bg-yellow-50 border-l-4 border-transparent'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-theme font-medium">{typeOpt.type}</div>
                                {hasFavorite && (
                                  <div className="text-xs text-green-700 font-medium truncate">
                                    {favoritePedal.brand} {favoritePedal.model}
                                  </div>
                                )}
                              </div>
                              {hasFavorite && (
                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Single Categories (no subtypes) */}
              <div className="mt-4 pt-4 border-t-2 border-black">
                <p className="text-xs text-theme font-bold uppercase tracking-wider mb-2 px-1">Pick One From Each</p>
                {SINGLE_CATEGORIES.map((cat) => {
                  const categoryInfo = CATEGORY_INFO[cat.category];
                  const isSelected = selectedKey === cat.category && selectionMode === 'category';
                  const favoritePedal = getSelectedPedalForType(cat.category);
                  const hasFavorite = !!favoritePedal;
                  
                  return (
                    <button
                      key={cat.category}
                      onClick={() => handleSelectCategory(cat.category)}
                      className={`w-full border-3 border-black transition-all p-3 flex items-center gap-3 text-left mb-2 shadow-[4px_4px_0_0_#000] hover:shadow-[5px_5px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                        isSelected 
                          ? 'bg-orange-200' 
                          : hasFavorite
                            ? 'bg-green-100'
                            : 'bg-theme-surface hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                      }`}
                    >
                      <div 
                        className={`w-10 h-10 border-2 border-black flex items-center justify-center text-xs font-black`}
                        style={{ backgroundColor: hasFavorite ? '#86efac' : (categoryInfo?.color || '#FFD93D') }}
                      >
                        {cat.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-theme uppercase">{cat.name}</div>
                        {hasFavorite ? (
                          <div className="text-xs text-green-700 font-medium truncate">
                            {favoritePedal.brand} {favoritePedal.model}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600">Tap to select your favorite</div>
                        )}
                      </div>
                      {hasFavorite && (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
            
          {/* RIGHT COLUMN - Pedal Selection */}
          <div className="bg-theme-surface border-4 brutal-border p-4 min-h-[400px] flex flex-col brutal-shadow-lg">
            {selectedKey && (selectedTypeInfo || selectedCategoryInfo) ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme uppercase">
                    Favorite {selectionMode === 'type' ? selectedKey : selectedCategoryInfo?.name}
                  </h2>
                  
                  {/* Sorting Options */}
                  <div className="flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-gray-600" />
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="text-xs bg-yellow-100 dark:bg-yellow-900/30 border-2 brutal-border px-2 py-1 text-theme font-medium focus:outline-none"
                    >
                      <option value="rating">Rating</option>
                      <option value="price-low">Price: Low</option>
                      <option value="price-high">Price: High</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                </div>
                
                {/* Search Bar */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Search pedals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-theme-surface border-2 brutal-border text-sm text-theme placeholder-gray-500 focus:outline-none focus:bg-yellow-50 dark:focus:bg-yellow-900/20 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-theme"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {pedalsForSelection.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 flex-1 overflow-y-auto max-h-[50vh] lg:max-h-[calc(100vh-300px)] pb-4">
                    {pedalsForSelection.slice(0, 50).map(pedal => {
                      const isSelected = localFavorites[selectedKey] === pedal.id;
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
                              onClick={() => handleSelectPedal(pedal)}
                              className={`w-full group p-3 border-2 border-black text-left transition-all shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                                isSelected
                                  ? 'bg-green-200 ring-2 ring-green-600'
                                  : 'bg-theme-surface hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                              }`}
                            >
                              <div className="aspect-square mb-2 overflow-hidden bg-gray-100 border border-black">
                                <PedalImage pedalId={pedal.id} category={pedal.category} size="lg" className="w-full h-full" />
                              </div>
                              <p className="text-xs text-gray-600 truncate font-medium">{pedal.brand}</p>
                              <p className="text-sm font-bold text-theme truncate">{pedal.model}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-green-700 font-bold">${pedal.reverbPrice}</p>
                                <span 
                                  className="text-xs font-bold px-1.5 py-0.5 border border-black"
                                  style={{ 
                                    backgroundColor: categoryInfo?.color || '#FFD93D',
                                    color: '#000'
                                  }}
                                >
                                  {pedal.categoryRating}/10
                                </span>
                              </div>
                              {isSelected && (
                                <div className="mt-2 flex items-center gap-1 text-green-700 text-xs font-bold">
                                  <Check className="w-3 h-3" />
                                  Your Favorite
                                </div>
                              )}
                            </button>
                            
                            {/* Hover Card - Desktop only */}
                            {hoveredPedal?.id === pedal.id && (
                              <div className="hover-only absolute inset-0 bg-black/95 border-2 border-black p-2 shadow-[4px_4px_0_0_#FFD93D] z-30 flex flex-col justify-between pointer-events-none">
                                <div>
                                  <p className="text-[10px] text-gray-400 truncate">{pedal.brand}</p>
                                  <p className="text-xs font-bold text-white truncate">{pedal.model}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <span 
                                      className="text-sm font-bold"
                                      style={{ color: categoryInfo?.color }}
                                    >
                                      {pedal.categoryRating}/10
                                    </span>
                                    <span className="text-[9px] text-gray-400">{ratingLabel}</span>
                                  </div>
                                  <div className="w-full h-1 bg-gray-700 overflow-hidden mt-1">
                                    <div 
                                      className="h-full"
                                      style={{ 
                                        width: `${(pedal.categoryRating / 10) * 100}%`,
                                        backgroundColor: categoryInfo?.color
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 text-[10px] my-1">
                                  <div className="flex-1 bg-gray-800 px-1.5 py-1">
                                    <span className="text-gray-500">$</span>
                                    <span className="text-green-400 font-medium">{pedal.reverbPrice}</span>
                                  </div>
                                  <div className="flex-1 bg-gray-800 px-1.5 py-1">
                                    <span className="text-white font-medium">{pedal.currentMa}mA</span>
                                  </div>
                                </div>
                                
                                <a
                                  href={getYouTubeReviewUrl(pedal.brand, pedal.model)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-1 w-full px-2 py-1.5 bg-red-500 text-white hover:bg-red-600 transition-colors text-[10px] font-bold pointer-events-auto border border-black"
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
                  <div className="flex items-center justify-center h-48 text-gray-600 font-medium">
                    No {selectionMode === 'type' ? selectedKey : selectedCategoryInfo?.name} pedals found
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-theme-muted py-8">
                <div className="text-2xl font-black mb-3" style={{ border: '3px solid var(--color-board-border)', padding: '8px 16px', backgroundColor: '#FFF9C4' }}>←</div>
                <p className="text-center text-sm font-bold">
                  <span className="lg:hidden">Select a type or category above<br />to choose your favorite pedal</span>
                  <span className="hidden lg:inline">Select a type or category on the left<br />to choose your favorite pedal</span>
                </p>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
