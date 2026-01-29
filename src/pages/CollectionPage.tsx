import { useState, useMemo } from 'react';
import { Search, X, Trash2, Package, DollarSign, Zap, ArrowLeft, Plus } from 'lucide-react';
import { Pedal } from '../types';
import { PedalImage } from '../components/PedalImage';
import { CATEGORY_INFO, getRatingLabel } from '../data/categories';

interface CollectionPageProps {
  collection: string[];
  allPedals: Pedal[];
  onRemoveFromCollection: (pedalId: string) => void;
  onAddToCollection: (pedalId: string) => void;
  onBack: () => void;
  onBuildFromCollection?: () => void;
}

export function CollectionPage({ 
  collection, 
  allPedals, 
  onRemoveFromCollection,
  onAddToCollection,
  onBack,
  onBuildFromCollection
}: CollectionPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<'name' | 'brand' | 'price'>('name');

  // Get full pedal objects for collection
  const collectionPedals = useMemo(() => {
    return collection
      .map(id => allPedals.find(p => p.id === id))
      .filter((p): p is Pedal => p !== undefined);
  }, [collection, allPedals]);

  // Filter collection by search
  const filteredCollection = useMemo(() => {
    if (!searchQuery) return collectionPedals;
    const query = searchQuery.toLowerCase();
    return collectionPedals.filter(p => 
      p.brand.toLowerCase().includes(query) ||
      p.model.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.subtype && p.subtype.toLowerCase().includes(query))
    );
  }, [collectionPedals, searchQuery]);

  // Stats
  const totalValue = collectionPedals.reduce((sum, p) => sum + p.reverbPrice, 0);
  const totalPower = collectionPedals.reduce((sum, p) => sum + p.currentMa, 0);
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    collectionPedals.forEach(p => {
      breakdown[p.category] = (breakdown[p.category] || 0) + 1;
    });
    return breakdown;
  }, [collectionPedals]);

  // Pedals available to add (not in collection)
  const availablePedals = useMemo(() => {
    const collectionSet = new Set(collection);
    let filtered = allPedals.filter(p => !collectionSet.has(p.id));
    
    if (addSearchQuery) {
      const query = addSearchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.brand.toLowerCase().includes(query) ||
        p.model.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Sort pedals
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.model.localeCompare(b.model);
        case 'brand':
          return a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model);
        case 'price':
          return a.reverbPrice - b.reverbPrice;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [allPedals, collection, addSearchQuery, selectedCategory, sortOption]);

  const categories = ['all', 'gain', 'modulation', 'delay', 'reverb', 'dynamics', 'filter', 'pitch', 'eq', 'volume', 'utility'];

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: '#FFFEF0' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="w-12 h-12 bg-white flex items-center justify-center hover:-translate-y-0.5 transition-transform"
              style={{ border: '3px solid black', boxShadow: '3px 3px 0px black' }}
            >
              <ArrowLeft className="w-6 h-6 text-black" />
            </button>
            <div>
              <h1 
                className="text-2xl sm:text-4xl font-black text-black uppercase"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                My Collection
              </h1>
              <p className="text-sm text-black/60 font-bold">
                {collectionPedals.length} pedals in your collection
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-board-accent text-black font-black uppercase hover:-translate-y-0.5 transition-transform"
            style={{ border: '3px solid black', boxShadow: '4px 4px 0px black' }}
          >
            <Plus className="w-5 h-5" />
            <span>Add Pedals</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div 
            className="p-4 bg-green-100"
            style={{ border: '3px solid black', boxShadow: '4px 4px 0px black' }}
          >
            <div className="flex items-center gap-2 text-black mb-1">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Total Value</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-black">${totalValue.toLocaleString()}</div>
          </div>
          
          <div 
            className="p-4 bg-blue-100"
            style={{ border: '3px solid black', boxShadow: '4px 4px 0px black' }}
          >
            <div className="flex items-center gap-2 text-black mb-1">
              <Package className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Pedals</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-black">{collectionPedals.length}</div>
          </div>
          
          <div 
            className="p-4 bg-yellow-100"
            style={{ border: '3px solid black', boxShadow: '4px 4px 0px black' }}
          >
            <div className="flex items-center gap-2 text-black mb-1">
              <Zap className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Power</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-black">{totalPower}mA</div>
          </div>
          
          <div 
            className="p-4 bg-purple-100"
            style={{ border: '3px solid black', boxShadow: '4px 4px 0px black' }}
          >
            <div className="flex items-center gap-2 text-black mb-1">
              <span className="text-xs font-bold uppercase">Categories</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-black">{Object.keys(categoryBreakdown).length}</div>
          </div>
        </div>

        {/* Category Breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <div 
            className="p-4 bg-white mb-6"
            style={{ border: '3px solid black', boxShadow: '4px 4px 0px black' }}
          >
            <h3 className="text-sm font-black uppercase mb-3">Category Breakdown</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryBreakdown).map(([cat, count]) => {
                const info = CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO];
                return (
                  <div 
                    key={cat}
                    className="px-3 py-1.5 font-bold text-sm text-black"
                    style={{ 
                      backgroundColor: info?.color ? `${info.color}40` : '#E0E0E0',
                      border: '2px solid black'
                    }}
                  >
                    {cat}: {count}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search */}
        {collectionPedals.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/50" />
            <input
              type="text"
              placeholder="Search your collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-white text-black placeholder-black/40 font-bold"
              style={{ border: '3px solid black', boxShadow: '4px 4px 0px black' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Collection Grid */}
        {filteredCollection.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredCollection.map(pedal => {
              const categoryInfo = CATEGORY_INFO[pedal.category];
              return (
                <div
                  key={pedal.id}
                  className="group relative"
                >
                  {/* Card Frame */}
                  <div 
                    className="relative p-1.5 sm:p-2"
                    style={{
                      backgroundColor: categoryInfo?.color ? `${categoryInfo.color}40` : '#FFF9C4',
                      border: '4px solid black',
                      boxShadow: '4px 4px 0px black',
                    }}
                  >
                    {/* Category Badge */}
                    <div 
                      className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wide"
                      style={{
                        backgroundColor: '#FFFEF0',
                        border: '2px solid black',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {pedal.subtype || pedal.category}
                    </div>
                    
                    {/* Inner Card (white area) */}
                    <div 
                      className="bg-white p-1.5 sm:p-2"
                      style={{ border: '3px solid black' }}
                    >
                      {/* Image Container */}
                      <div 
                        className="aspect-square mb-2 overflow-hidden bg-gray-100"
                        style={{ border: '2px solid black' }}
                      >
                        <PedalImage pedalId={pedal.id} category={pedal.category} size="lg" className="w-full h-full" />
                      </div>
                      
                      {/* Name Section */}
                      <div className="text-center mb-2">
                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wide truncate">{pedal.brand}</p>
                        <p className="text-[11px] sm:text-xs font-black text-black truncate leading-tight">{pedal.model}</p>
                      </div>
                      
                      {/* Stats Bar */}
                      <div 
                        className="flex items-center justify-between px-1.5 py-1"
                        style={{ 
                          backgroundColor: `${categoryInfo?.color}15`,
                          border: '2px solid black',
                        }}
                      >
                        <span className="text-[10px] sm:text-xs font-black text-green-600">
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
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveFromCollection(pedal.id)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      style={{ border: '2px solid black' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div 
            className="p-12 bg-white text-center"
            style={{ border: '3px solid black', boxShadow: '4px 4px 0px black' }}
          >
            <div 
              className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center"
              style={{ border: '3px solid black' }}
            >
              <Package className="w-8 h-8 text-black/40" />
            </div>
            <h3 className="text-xl font-black text-black mb-2">No Pedals Yet</h3>
            <p className="text-black/60 font-bold mb-4">
              {searchQuery ? 'No pedals match your search' : 'Start adding pedals to your collection'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-board-accent text-black font-black uppercase hover:-translate-y-0.5 transition-transform"
                style={{ border: '3px solid black', boxShadow: '4px 4px 0px black' }}
              >
                Add Your First Pedal
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Pedals Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowAddModal(false)}
          />
          
          <div 
            className="relative bg-[#FFFEF0] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
            style={{ border: '4px solid black', boxShadow: '8px 8px 0px black' }}
          >
            {/* Modal Header */}
            <div 
              className="p-4 bg-board-accent flex items-center justify-between"
              style={{ borderBottom: '4px solid black' }}
            >
              <h2 className="text-xl font-black text-black uppercase">Add Pedals</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 bg-white flex items-center justify-center hover:-translate-y-0.5 transition-transform"
                style={{ border: '3px solid black' }}
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
            
            {/* Search & Filter */}
            <div className="p-4 space-y-3" style={{ borderBottom: '3px solid black' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50" />
                <input
                  type="text"
                  placeholder="Search pedals..."
                  value={addSearchQuery}
                  onChange={(e) => setAddSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white text-black placeholder-black/40 font-bold text-sm"
                  style={{ border: '3px solid black' }}
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-1 text-xs font-bold uppercase transition-colors ${
                        selectedCategory === cat
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                      style={{ border: '2px solid black' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                
                {/* Sort Options */}
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-xs font-bold text-black/60 uppercase mr-1">Sort:</span>
                  {[
                    { value: 'name', label: 'Name' },
                    { value: 'brand', label: 'Brand' },
                    { value: 'price', label: 'Price' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortOption(option.value as 'name' | 'brand' | 'price')}
                      className={`px-2 py-1 text-xs font-bold uppercase transition-colors ${
                        sortOption === option.value
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                      style={{ border: '2px solid black' }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Pedal Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {availablePedals.map(pedal => {
                  const categoryInfo = CATEGORY_INFO[pedal.category];
                  return (
                    <button
                      key={pedal.id}
                      onClick={() => onAddToCollection(pedal.id)}
                      className="text-left hover:-translate-y-1 hover:rotate-1 transition-all active:scale-[0.98]"
                    >
                      {/* Card Frame */}
                      <div 
                        className="relative p-1.5 sm:p-2"
                        style={{
                          backgroundColor: categoryInfo?.color ? `${categoryInfo.color}40` : '#FFF9C4',
                          border: '4px solid black',
                          boxShadow: '4px 4px 0px black',
                        }}
                      >
                        {/* Category Badge */}
                        <div 
                          className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wide"
                          style={{
                            backgroundColor: '#FFFEF0',
                            border: '2px solid black',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {pedal.subtype || pedal.category}
                        </div>
                        
                        {/* Inner Card (white area) */}
                        <div 
                          className="bg-white p-1.5 sm:p-2"
                          style={{ border: '3px solid black' }}
                        >
                          {/* Image Container */}
                          <div 
                            className="aspect-square mb-2 overflow-hidden bg-gray-100"
                            style={{ border: '2px solid black' }}
                          >
                            <PedalImage pedalId={pedal.id} category={pedal.category} size="lg" className="w-full h-full" />
                          </div>
                          
                          {/* Name Section */}
                          <div className="text-center mb-2">
                            <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wide truncate">{pedal.brand}</p>
                            <p className="text-[11px] sm:text-xs font-black text-black truncate leading-tight">{pedal.model}</p>
                          </div>
                          
                          {/* Stats Bar */}
                          <div 
                            className="flex items-center justify-between px-1.5 py-1"
                            style={{ 
                              backgroundColor: `${categoryInfo?.color}15`,
                              border: '2px solid black',
                            }}
                          >
                            <span className="text-[10px] sm:text-xs font-black text-green-600">
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
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {availablePedals.length === 0 && (
                <div className="text-center py-12 text-black/60 font-bold">
                  No pedals found matching your search
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div 
              className="p-4 bg-white flex justify-between items-center"
              style={{ borderTop: '4px solid black' }}
            >
              <span className="text-sm font-bold text-black/60">
                {collection.length} pedals in collection
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 bg-black text-white font-black uppercase hover:-translate-y-0.5 transition-transform"
                style={{ border: '3px solid black' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
