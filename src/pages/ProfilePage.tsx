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
const TYPE_OPTIONS: { type: string; category: Category; icon: string }[] = [
  // Gain types
  { type: 'Boost', category: 'gain', icon: '📈' },
  { type: 'Overdrive', category: 'gain', icon: '🔥' },
  { type: 'Distortion', category: 'gain', icon: '⚡' },
  { type: 'Fuzz', category: 'gain', icon: '🐝' },
  // Modulation types
  { type: 'Chorus', category: 'modulation', icon: '🌊' },
  { type: 'Phaser', category: 'modulation', icon: '🌀' },
  { type: 'Flanger', category: 'modulation', icon: '✈️' },
  { type: 'Tremolo', category: 'modulation', icon: '〰️' },
  { type: 'Vibrato', category: 'modulation', icon: '📳' },
  { type: 'Rotary', category: 'modulation', icon: '🎡' },
  { type: 'Uni-Vibe', category: 'modulation', icon: '☀️' },
  // Dynamics types
  { type: 'Compressor', category: 'dynamics', icon: '🗜️' },
  { type: 'Noise Gate', category: 'dynamics', icon: '🚪' },
  // Filter types
  { type: 'Wah', category: 'filter', icon: '👄' },
  { type: 'Envelope Filter', category: 'filter', icon: '🎺' },
  // Utility types
  { type: 'Tuner', category: 'utility', icon: '🎯' },
  { type: 'Looper', category: 'utility', icon: '🔄' },
];

// Single-selection categories (no subtypes - pick one from whole category)
const SINGLE_CATEGORIES: { category: Category; name: string; icon: string }[] = [
  { category: 'delay', name: 'Delay', icon: '📼' },
  { category: 'reverb', name: 'Reverb', icon: '🏛️' },
  { category: 'pitch', name: 'Pitch', icon: '🎹' },
  { category: 'eq', name: 'EQ', icon: '📊' },
  { category: 'volume', name: 'Volume', icon: '🎚️' },
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
const CATEGORIES_WITH_TYPES: { category: Category; name: string; icon: string; types: typeof TYPE_OPTIONS }[] = [
  { category: 'gain', name: 'Gain', icon: '🔥', types: TYPE_OPTIONS.filter(t => t.category === 'gain') },
  { category: 'modulation', name: 'Modulation', icon: '🌀', types: TYPE_OPTIONS.filter(t => t.category === 'modulation') },
  { category: 'dynamics', name: 'Dynamics', icon: '🗜️', types: TYPE_OPTIONS.filter(t => t.category === 'dynamics') },
  { category: 'filter', name: 'Filter', icon: '👄', types: TYPE_OPTIONS.filter(t => t.category === 'filter') },
  { category: 'utility', name: 'Utility', icon: '🔧', types: TYPE_OPTIONS.filter(t => t.category === 'utility') },
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
    <div className="min-h-screen bg-board-dark">
      <div className="noise-overlay" />
      <div className="fixed inset-0 bg-gradient-to-br from-board-accent/5 via-transparent to-board-highlight/5 pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="bg-board-surface/50 border-b border-board-border">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-board-elevated rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-bold text-white">
                    {username}'s Favorites
                  </h1>
                  <p className="text-xs text-zinc-500">
                    {favoritesCount} of {TOTAL_SELECTIONS} selected
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  showSaved 
                    ? 'bg-green-600 text-white' 
                    : 'bg-board-accent text-white hover:bg-board-accent-dim'
                }`}
              >
                <Check className="w-4 h-4" />
                {showSaved ? 'Saved!' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Two Column Layout */}
        <div className="max-w-6xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN - Category Slots */}
            <div className="space-y-2">
            <h2 className="text-sm font-medium text-zinc-400 mb-3">
              Choose Your Favorites ({favoritesCount}/{TOTAL_SELECTIONS})
            </h2>
            
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {CATEGORIES_WITH_TYPES.map((cat) => {
                const categoryInfo = CATEGORY_INFO[cat.category];
                const isExpanded = expandedCategories.has(cat.category);
                const typesWithFavorites = cat.types.filter(t => localFavorites[t.type]);
                
                return (
                  <div key={cat.category} className="rounded-xl border border-board-border bg-board-surface overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(cat.category)}
                      className="w-full p-3 flex items-center gap-3 text-left hover:bg-board-elevated/50 transition-colors"
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${categoryInfo?.color}20` }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-white">{cat.name}</span>
                        <span className="ml-2 text-xs text-zinc-500">
                          {typesWithFavorites.length}/{cat.types.length} selected
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      )}
                    </button>
                    
                    {/* Types List */}
                    {isExpanded && (
                      <div className="border-t border-board-border">
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
                                  ? 'bg-board-accent/20 border-l-2 border-board-accent' 
                                  : hasFavorite
                                    ? 'bg-green-600/10 border-l-2 border-green-600'
                                    : 'hover:bg-board-elevated/50 border-l-2 border-transparent'
                              }`}
                            >
                              <span className="text-lg">{typeOpt.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white">{typeOpt.type}</div>
                                {hasFavorite && (
                                  <div className="text-xs text-green-400 truncate">
                                    ⭐ {favoritePedal.brand} {favoritePedal.model}
                                  </div>
                                )}
                              </div>
                              {hasFavorite && (
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
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
              <div className="mt-4 pt-4 border-t border-board-border">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 px-1">Pick One From Each</p>
                {SINGLE_CATEGORIES.map((cat) => {
                  const categoryInfo = CATEGORY_INFO[cat.category];
                  const isSelected = selectedKey === cat.category && selectionMode === 'category';
                  const favoritePedal = getSelectedPedalForType(cat.category);
                  const hasFavorite = !!favoritePedal;
                  
                  return (
                    <button
                      key={cat.category}
                      onClick={() => handleSelectCategory(cat.category)}
                      className={`w-full rounded-xl border transition-all p-3 flex items-center gap-3 text-left mb-2 ${
                        isSelected 
                          ? 'border-board-accent bg-board-accent/10' 
                          : hasFavorite
                            ? 'border-green-600/50 bg-board-surface'
                            : 'border-board-border bg-board-surface hover:border-zinc-600'
                      }`}
                    >
                      <div 
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                          hasFavorite ? 'bg-green-600/20' : ''
                        }`}
                        style={hasFavorite ? {} : { backgroundColor: `${categoryInfo?.color}20` }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white">{cat.name}</div>
                        {hasFavorite ? (
                          <div className="text-xs text-green-400 truncate">
                            ⭐ {favoritePedal.brand} {favoritePedal.model}
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-500">Tap to select your favorite</div>
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
          <div className="bg-board-surface border border-board-border rounded-xl p-4 min-h-[400px] flex flex-col">
            {selectedKey && (selectedTypeInfo || selectedCategoryInfo) ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {selectedTypeInfo?.icon || selectedCategoryInfo?.icon}
                    </span>
                    <h2 className="text-lg font-medium text-white">
                      Favorite {selectionMode === 'type' ? selectedKey : selectedCategoryInfo?.name}
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
                
                {pedalsForSelection.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
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
                              className={`w-full group p-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'border-green-500 bg-green-500/10 ring-2 ring-green-500/30'
                                  : 'border-board-border bg-board-elevated hover:border-board-accent'
                              }`}
                            >
                              <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-black/20">
                                <PedalImage pedalId={pedal.id} category={pedal.category} size="lg" className="w-full h-full" />
                              </div>
                              <p className="text-xs text-zinc-400 truncate">{pedal.brand}</p>
                              <p className="text-sm font-medium text-white truncate">{pedal.model}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-green-400">${pedal.reverbPrice}</p>
                                <span 
                                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                                  style={{ 
                                    backgroundColor: `${categoryInfo?.color}20`, 
                                    color: categoryInfo?.color 
                                  }}
                                >
                                  {pedal.categoryRating}/10
                                </span>
                              </div>
                              {isSelected && (
                                <div className="mt-2 flex items-center gap-1 text-green-400 text-xs">
                                  <Check className="w-3 h-3" />
                                  ⭐ Your Favorite
                                </div>
                              )}
                            </button>
                            
                            {/* Hover Card */}
                            {hoveredPedal?.id === pedal.id && (
                              <div className="absolute inset-0 bg-board-dark/95 backdrop-blur-sm border border-board-accent rounded-xl p-2 shadow-2xl z-30 flex flex-col justify-between pointer-events-none">
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
                    No {selectionMode === 'type' ? selectedKey : selectedCategoryInfo?.name} pedals found
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <div className="text-4xl mb-3">👈</div>
                <p className="text-center">
                  Select a type or category<br />
                  to choose your favorite pedal
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
