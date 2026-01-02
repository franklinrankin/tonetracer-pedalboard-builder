import { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, ChevronDown, X } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { PedalCard } from './PedalCard';
import { CATEGORY_INFO, CATEGORY_ORDER } from '../data/categories';
import { Category } from '../types';

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'rating' | 'size';
type ViewMode = 'grid' | 'list';

export function PedalCatalog() {
  const { state } = useBoard();
  const { allPedals, board } = state;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showOnlyFitting, setShowOnlyFitting] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const onBoardIds = new Set(board.slots.map(s => s.pedal.id));
  
  const filteredPedals = useMemo(() => {
    let result = allPedals;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.brand.toLowerCase().includes(query) ||
        p.model.toLowerCase().includes(query) ||
        p.subtype?.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    // Fitting filter
    if (showOnlyFitting) {
      result = result.filter(p => p.fits || onBoardIds.has(p.id));
    }
    
    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.model.localeCompare(b.model);
        case 'price-asc':
          return a.reverbPrice - b.reverbPrice;
        case 'price-desc':
          return b.reverbPrice - a.reverbPrice;
        case 'rating':
          return b.categoryRating - a.categoryRating;
        case 'size':
          return (a.widthMm * a.depthMm) - (b.widthMm * b.depthMm);
        default:
          return 0;
      }
    });
    
    return result;
  }, [allPedals, searchQuery, selectedCategory, sortBy, showOnlyFitting, onBoardIds]);
  
  const fittingCount = allPedals.filter(p => p.fits || onBoardIds.has(p.id)).length;
  const categoryCount = selectedCategory === 'all' 
    ? allPedals.length 
    : allPedals.filter(p => p.category === selectedCategory).length;
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-board-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-white">Pedal Catalog</h2>
            <p className="text-xs text-board-muted">
              {filteredPedals.length} pedals • {fittingCount} fit your constraints
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-board-accent text-white' 
                  : 'bg-board-elevated text-board-muted hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-board-accent text-white' 
                  : 'bg-board-elevated text-board-muted hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-board-muted" />
          <input
            type="text"
            placeholder="Search pedals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-board-dark border border-board-border rounded-lg text-white placeholder:text-board-muted focus:outline-none focus:border-board-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-board-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Filters Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-board-elevated border border-board-border rounded-lg text-sm hover:border-board-accent/50 transition-colors"
            >
              <Filter className="w-4 h-4 text-board-muted" />
              <span className="text-white">
                {selectedCategory === 'all' ? 'All Categories' : CATEGORY_INFO[selectedCategory].displayName}
              </span>
              <ChevronDown className="w-4 h-4 text-board-muted" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-board-elevated border border-board-border rounded-lg shadow-xl z-20 py-2 animate-fadeIn">
                <button
                  onClick={() => { setSelectedCategory('all'); setIsFilterOpen(false); }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-board-surface transition-colors ${
                    selectedCategory === 'all' ? 'text-board-accent' : 'text-white'
                  }`}
                >
                  All Categories
                </button>
                <div className="h-px bg-board-border my-1" />
                {CATEGORY_ORDER.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-board-surface transition-colors flex items-center gap-2 ${
                      selectedCategory === cat ? 'text-board-accent' : 'text-white'
                    }`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_INFO[cat].color }}
                    />
                    {CATEGORY_INFO[cat].displayName}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 bg-board-elevated border border-board-border rounded-lg text-sm text-white focus:outline-none focus:border-board-accent cursor-pointer"
          >
            <option value="name">Sort: Name</option>
            <option value="price-asc">Sort: Price ↑</option>
            <option value="price-desc">Sort: Price ↓</option>
            <option value="rating">Sort: Rating</option>
            <option value="size">Sort: Size</option>
          </select>
          
          {/* Fitting Toggle */}
          <label className="flex items-center gap-2 px-3 py-2 bg-board-elevated border border-board-border rounded-lg cursor-pointer hover:border-board-accent/50 transition-colors">
            <input
              type="checkbox"
              checked={showOnlyFitting}
              onChange={(e) => setShowOnlyFitting(e.target.checked)}
              className="w-4 h-4 rounded border-board-border bg-board-dark text-board-accent focus:ring-board-accent"
            />
            <span className="text-sm text-white">Only show fitting</span>
          </label>
        </div>
      </div>
      
      {/* Pedal Grid/List */}
      <div className={`p-4 ${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-3'
      } max-h-[600px] overflow-y-auto`}>
        {filteredPedals.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-white mb-1">No pedals found</h3>
            <p className="text-sm text-board-muted">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          filteredPedals.map(pedal => (
            <PedalCard 
              key={pedal.id} 
              pedal={pedal}
              isOnBoard={onBoardIds.has(pedal.id)}
              compact={viewMode === 'list'}
            />
          ))
        )}
      </div>
    </div>
  );
}

