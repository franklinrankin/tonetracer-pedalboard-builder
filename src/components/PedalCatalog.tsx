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
    <div 
      className="bg-white overflow-hidden" 
      style={{ border: '4px solid black', boxShadow: '6px 6px 0px black' }}
    >
      {/* Header */}
      <div 
        className="p-4" 
        style={{ borderBottom: '4px solid black', backgroundColor: '#FFF9C4' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-tight">Pedal Index</h2>
            <p className="text-xs text-black/60 font-bold uppercase">
              {filteredPedals.length} pedals in collection
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors font-bold ${
                viewMode === 'grid' 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
              style={{ border: '3px solid black' }}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors font-bold ${
                viewMode === 'list' 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
              style={{ border: '3px solid black' }}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4 z-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Search pedals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white text-black placeholder:text-black/40 font-bold focus:outline-none"
            style={{ border: '3px solid black' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black z-10"
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
              className="flex items-center gap-2 px-3 py-2 bg-white text-sm font-bold text-black hover:bg-gray-50 transition-colors"
              style={{ border: '3px solid black' }}
            >
              <Filter className="w-4 h-4" />
              <span>
                {selectedCategory === 'all' ? 'All Categories' : CATEGORY_INFO[selectedCategory].displayName}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {isFilterOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-56 bg-white z-20 py-2"
                style={{ border: '3px solid black', boxShadow: '4px 4px 0px black' }}
              >
                <button
                  onClick={() => { setSelectedCategory('all'); setIsFilterOpen(false); }}
                  className={`w-full px-3 py-2 text-left text-sm font-bold hover:bg-yellow-100 transition-colors ${
                    selectedCategory === 'all' ? 'bg-yellow-200' : ''
                  }`}
                >
                  All Categories
                </button>
                <div className="h-1 bg-black my-1" />
                <div className="px-3 py-1 text-[10px] text-black/50 font-bold uppercase">
                  Signal Chain Order
                </div>
                {CATEGORY_ORDER.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                    className={`w-full px-3 py-2 text-left text-sm font-bold hover:bg-yellow-100 transition-colors flex items-center gap-2 ${
                      selectedCategory === cat ? 'bg-yellow-200' : ''
                    }`}
                  >
                    <span 
                      className="w-3 h-3"
                      style={{ backgroundColor: CATEGORY_INFO[cat].color, border: '2px solid black' }}
                    />
                    {CATEGORY_INFO[cat].displayName}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Sort Buttons */}
          <div 
            className="flex items-center gap-1 bg-white p-1"
            style={{ border: '3px solid black' }}
          >
            <span className="text-xs text-black font-black px-1 uppercase">Sort:</span>
            {[
              { value: 'name-asc', label: 'A-Z' },
              { value: 'name-desc', label: 'Z-A' },
              { value: 'price-asc', label: '$↑' },
              { value: 'price-desc', label: '$↓' },
              { value: 'rating-desc', label: '★↓' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as SortOption)}
                className={`px-2 py-1 text-xs font-bold transition-colors ${
                  sortBy === option.value
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-gray-100'
                }`}
                style={{ border: '2px solid black' }}
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
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' 
            : 'space-y-3'
        } max-h-[600px] overflow-y-auto`}
        style={{ backgroundColor: '#FFFEF0' }}
      >
        {filteredPedals.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div 
              className="inline-block px-4 py-2 mb-3 font-black text-2xl"
              style={{ backgroundColor: '#FFF9C4', border: '3px solid black' }}
            >
              ?
            </div>
            <h3 className="font-black text-black uppercase mb-1">No Pedals Found</h3>
            <p className="text-sm text-black/60 font-bold">
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

