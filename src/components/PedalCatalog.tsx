import { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, ChevronDown, X } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { PedalCard } from './PedalCard';
import { CATEGORY_INFO, CATEGORY_ORDER } from '../data/categories';
import { Category } from '../types';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating-asc' | 'rating-desc' | 'size-asc' | 'size-desc';
type ViewMode = 'grid' | 'list';

export function PedalCatalog() {
  const { state } = useBoard();
  const { allPedals, board } = state;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Memoize the board slot IDs to prevent unnecessary recalculations
  const onBoardIds = useMemo(() => 
    new Set(board.slots.map(s => s.pedal.id)), 
    [board.slots]
  );
  
  // Compute filtered and sorted pedals
  const filteredPedals = (() => {
    let result = [...allPedals];
    
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
    
    // Sort based on selected option
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.model.localeCompare(b.model));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.model.localeCompare(a.model));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.reverbPrice - b.reverbPrice);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.reverbPrice - a.reverbPrice);
    } else if (sortBy === 'rating-asc') {
      result.sort((a, b) => a.categoryRating - b.categoryRating);
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.categoryRating - a.categoryRating);
    } else if (sortBy === 'size-asc') {
      result.sort((a, b) => (a.widthMm * a.depthMm) - (b.widthMm * b.depthMm));
    } else if (sortBy === 'size-desc') {
      result.sort((a, b) => (b.widthMm * b.depthMm) - (a.widthMm * a.depthMm));
    }
    
    return result;
  })();
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-board-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-white">Pedal Catalog</h2>
            <p className="text-xs text-board-muted">
              {filteredPedals.length} pedals
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
          
          {/* Sort Buttons */}
          <div className="flex items-center gap-1 bg-board-elevated border border-board-border rounded-lg p-1">
            <span className="text-xs text-board-muted px-1">Sort:</span>
            {[
              { value: 'name-asc', label: 'Name ↑' },
              { value: 'name-desc', label: 'Name ↓' },
              { value: 'price-asc', label: 'Price ↑' },
              { value: 'price-desc', label: 'Price ↓' },
              { value: 'rating-asc', label: 'Rating ↑' },
              { value: 'rating-desc', label: 'Rating ↓' },
              { value: 'size-asc', label: 'Size ↑' },
              { value: 'size-desc', label: 'Size ↓' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as SortOption)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  sortBy === option.value
                    ? 'bg-board-accent text-white'
                    : 'text-board-muted hover:text-white hover:bg-board-surface'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Pedal Grid/List */}
      <div 
        key={`pedal-grid-${sortBy}-${selectedCategory}`}
        className={`p-4 ${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-3'
        } max-h-[600px] overflow-y-auto`}
      >
        {filteredPedals.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-white mb-1">No pedals found</h3>
            <p className="text-sm text-board-muted">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          filteredPedals.map((pedal, index) => (
            <PedalCard 
              key={`${pedal.id}-${index}`} 
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

