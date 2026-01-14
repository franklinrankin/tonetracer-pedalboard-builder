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

// All pedal types organized by category
const TYPE_OPTIONS: { type: string; category: Category; icon: string }[] = [
  // Utility
  { type: 'Tuner', category: 'utility', icon: '🎯' },
  { type: 'Looper', category: 'utility', icon: '🔄' },
  // Filter
  { type: 'Wah', category: 'filter', icon: '👄' },
  { type: 'Envelope Filter', category: 'filter', icon: '🎺' },
  // Dynamics
  { type: 'Compressor', category: 'dynamics', icon: '🗜️' },
  { type: 'Noise Gate', category: 'dynamics', icon: '🚪' },
  // Pitch
  { type: 'Octave', category: 'pitch', icon: '🎹' },
  { type: 'Pitch Shifter', category: 'pitch', icon: '↕️' },
  { type: 'Harmonizer', category: 'pitch', icon: '🎶' },
  // Gain
  { type: 'Boost', category: 'gain', icon: '📈' },
  { type: 'Overdrive', category: 'gain', icon: '🔥' },
  { type: 'Distortion', category: 'gain', icon: '⚡' },
  { type: 'Fuzz', category: 'gain', icon: '🐝' },
  // EQ
  { type: 'EQ', category: 'eq', icon: '📊' },
  // Modulation
  { type: 'Chorus', category: 'modulation', icon: '🌊' },
  { type: 'Phaser', category: 'modulation', icon: '🌀' },
  { type: 'Flanger', category: 'modulation', icon: '✈️' },
  { type: 'Tremolo', category: 'modulation', icon: '〰️' },
  { type: 'Vibrato', category: 'modulation', icon: '📳' },
  { type: 'Rotary', category: 'modulation', icon: '🎡' },
  { type: 'Uni-Vibe', category: 'modulation', icon: '☀️' },
  // Volume
  { type: 'Volume', category: 'volume', icon: '🎚️' },
  // Delay
  { type: 'Analog Delay', category: 'delay', icon: '📼' },
  { type: 'Digital Delay', category: 'delay', icon: '💾' },
  { type: 'Tape Delay', category: 'delay', icon: '🎞️' },
  // Reverb
  { type: 'Spring Reverb', category: 'reverb', icon: '🌿' },
  { type: 'Hall Reverb', category: 'reverb', icon: '🏛️' },
  { type: 'Plate Reverb', category: 'reverb', icon: '🍽️' },
  { type: 'Ambient Reverb', category: 'reverb', icon: '🌌' },
];

// Map type names to actual pedal subtypes in database
const TYPE_TO_SUBTYPES: Record<string, string[]> = {
  'Tuner': ['Tuner', 'Chromatic Tuner'],
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
  'Uni-Vibe': ['Uni-Vibe', 'Vibe'],
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

// Group types by category for display
const CATEGORIES_WITH_TYPES: { category: Category; name: string; icon: string; types: typeof TYPE_OPTIONS }[] = [
  { category: 'gain', name: 'Gain', icon: '🔥', types: TYPE_OPTIONS.filter(t => t.category === 'gain') },
  { category: 'modulation', name: 'Modulation', icon: '🌀', types: TYPE_OPTIONS.filter(t => t.category === 'modulation') },
  { category: 'delay', name: 'Delay', icon: '📼', types: TYPE_OPTIONS.filter(t => t.category === 'delay') },
  { category: 'reverb', name: 'Reverb', icon: '🏛️', types: TYPE_OPTIONS.filter(t => t.category === 'reverb') },
  { category: 'dynamics', name: 'Dynamics', icon: '🗜️', types: TYPE_OPTIONS.filter(t => t.category === 'dynamics') },
  { category: 'filter', name: 'Filter', icon: '👄', types: TYPE_OPTIONS.filter(t => t.category === 'filter') },
  { category: 'pitch', name: 'Pitch', icon: '🎹', types: TYPE_OPTIONS.filter(t => t.category === 'pitch') },
  { category: 'eq', name: 'EQ', icon: '📊', types: TYPE_OPTIONS.filter(t => t.category === 'eq') },
  { category: 'volume', name: 'Volume', icon: '🎚️', types: TYPE_OPTIONS.filter(t => t.category === 'volume') },
  { category: 'utility', name: 'Utility', icon: '🔧', types: TYPE_OPTIONS.filter(t => t.category === 'utility') },
];

type SortOption = 'rating' | 'price-low' | 'price-high' | 'name';

export function ProfilePage({ onBack, favorites, onUpdateFavorites }: ProfilePageProps) {
  const { user } = useAuth();
  const { state } = useBoard();
  const { allPedals } = state;
  
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set(['gain', 'modulation']));
  const [sortOption, setSortOption] = useState<SortOption>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPedal, setHoveredPedal] = useState<PedalWithStatus | null>(null);
  const [localFavorites, setLocalFavorites] = useState<Record<string, string | null>>(favorites);
  
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  
  const selectedTypeInfo = TYPE_OPTIONS.find(t => t.type === selectedType);
  
  // Get pedals for selected type
  const pedalsForType = useMemo(() => {
    if (!selectedType || !selectedTypeInfo) return [];
    
    const subtypes = TYPE_TO_SUBTYPES[selectedType] || [selectedType];
    const searchLower = searchQuery.toLowerCase().trim();
    
    let filtered = allPedals.filter(p => {
      // Match by subtype or category
      const matchesType = subtypes.includes(p.subtype || '') || 
        (p.category === selectedTypeInfo.category && !TYPE_TO_SUBTYPES[selectedType]);
      
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
    const favoriteId = localFavorites[selectedType];
    if (favoriteId) {
      const favIndex = filtered.findIndex(p => p.id === favoriteId);
      if (favIndex > 0) {
        const [fav] = filtered.splice(favIndex, 1);
        filtered.unshift(fav);
      }
    }
    
    return filtered;
  }, [selectedType, selectedTypeInfo, allPedals, sortOption, searchQuery, localFavorites]);
  
  const handleSelectPedal = (pedal: PedalWithStatus) => {
    if (!selectedType) return;
    
    setLocalFavorites(prev => {
      const newFavs = { ...prev };
      // Toggle: if clicking same pedal, deselect
      if (newFavs[selectedType] === pedal.id) {
        newFavs[selectedType] = null;
      } else {
        newFavs[selectedType] = pedal.id;
      }
      return newFavs;
    });
  };
  
  const handleSave = () => {
    onUpdateFavorites(localFavorites);
    onBack();
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
                    {favoritesCount} of {TYPE_OPTIONS.length} types selected
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-board-accent text-white hover:bg-board-accent-dim transition-colors"
              >
                <Check className="w-4 h-4" />
                Save Profile
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
              Choose Your Favorite From Each Type ({favoritesCount}/{TYPE_OPTIONS.length})
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
                          const isSelected = selectedType === typeOpt.type;
                          const favoritePedal = getSelectedPedalForType(typeOpt.type);
                          const hasFavorite = !!favoritePedal;
                          
                          return (
                            <button
                              key={typeOpt.type}
                              onClick={() => {
                                setSelectedType(typeOpt.type === selectedType ? null : typeOpt.type);
                                setSearchQuery('');
                                setHoveredPedal(null);
                              }}
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
            </div>
          </div>
            
          {/* RIGHT COLUMN - Pedal Selection */}
          <div className="bg-board-surface border border-board-border rounded-xl p-4 min-h-[400px] flex flex-col">
            {selectedType && selectedTypeInfo ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedTypeInfo.icon}</span>
                    <h2 className="text-lg font-medium text-white">
                      Favorite {selectedType}
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
                
                {pedalsForType.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
                    {pedalsForType.slice(0, 50).map(pedal => {
                      const isSelected = localFavorites[selectedType] === pedal.id;
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
                    No {selectedType} pedals found
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <div className="text-4xl mb-3">👈</div>
                <p className="text-center">
                  Select a type on the left<br />
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
