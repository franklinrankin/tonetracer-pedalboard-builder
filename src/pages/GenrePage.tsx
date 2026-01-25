import { useState, useEffect } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { GENRES, GENRE_CATEGORIES, GenreProfile, GenreCategoryId, getGenreById } from '../data/genres';
import { GenreIcon } from '../components/GenreIcon';

interface GenrePageProps {
  onContinue: () => void;
  onCreateOwn?: () => void;
}

// Background images for each category
const CATEGORY_IMAGES: Record<GenreCategoryId, { url: string; position?: string }> = {
  'rock-roots': { url: '/images/genres/classic-rock.jpg' },
  'heavy': { url: '/images/genres/metal.jpg' },
  'atmospheric': { url: '/images/genres/ambient.jpg' },
  'groove': { url: '/images/genres/funk.jpg' },
  'contemporary': { url: '/images/genres/pop.jpg', position: 'center bottom' },
};

// Hook to detect touch/mobile device
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      // Check for touch capability OR small viewport (mobile breakpoint)
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 640; // sm breakpoint
      setIsMobile(hasTouch || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

export function GenrePage({ onContinue, onCreateOwn }: GenrePageProps) {
  const { state, dispatch } = useBoard();
  const { selectedGenres } = state;
  const [hoveredCategory, setHoveredCategory] = useState<GenreCategoryId | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<GenreCategoryId | null>(null);
  const isMobile = useIsMobile();
  
  const handleToggleGenre = (genreId: string) => {
    dispatch({ type: 'TOGGLE_GENRE', genreId });
  };
  
  const handleClearGenres = () => {
    dispatch({ type: 'CLEAR_GENRES' });
  };
  
  const handleCategoryClick = (categoryId: GenreCategoryId) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };
  
  const selectedGenreObjects = selectedGenres.map(id => getGenreById(id)).filter(Boolean) as GenreProfile[];
  const isAtMax = selectedGenres.length >= 3;
  
  // Group genres by category
  const genresByCategory = GENRE_CATEGORIES.map(category => ({
    category,
    genres: GENRES.filter(g => g.category === category.id),
  }));
  
  // Determine if a category is "open" (showing genres)
  const isCategoryOpen = (categoryId: GenreCategoryId) => {
    if (isMobile) return expandedCategory === categoryId;
    return hoveredCategory === categoryId || expandedCategory === categoryId;
  };
  
  return (
    <div className="h-full p-3 lg:p-4 overflow-auto">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          What style are you going for?
        </h1>
        <p className="text-sm sm:text-lg text-zinc-400 max-w-2xl mx-auto">
          Select up to <span className="text-board-accent font-semibold">3 genres</span> OR{' '}
          <button onClick={onCreateOwn} className="text-board-accent font-semibold hover:underline">
            create your own pedalboard
          </button>
        </p>
      </div>
      
      {/* Selected Genres Display */}
      {selectedGenres.length > 0 && (
        <div className="max-w-4xl mx-auto mb-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-board-muted">Selected:</span>
            {selectedGenreObjects.map(genre => (
              <button
                key={genre.id}
                onClick={() => handleToggleGenre(genre.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: `${genre.color}30`, color: genre.color }}
              >
                <GenreIcon genre={genre} size="sm" />
                <span>{genre.name}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ))}
            {selectedGenres.length > 1 && (
              <button
                onClick={handleClearGenres}
                className="px-3 py-1.5 rounded-full text-xs text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <p className="text-center text-xs text-board-muted mt-2">
            {3 - selectedGenres.length} more {3 - selectedGenres.length === 1 ? 'slot' : 'slots'} available
          </p>
        </div>
      )}
      
      {/* Category Grid - Uniform Size Cards with Background Images */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Create Your Own Card */}
          <button
            onClick={onCreateOwn}
            className="relative h-64 p-4 rounded-xl border-2 border-dashed border-board-accent/50 text-left transition-all hover:scale-[1.02] hover:border-transparent overflow-hidden group"
          >
            {/* Background image */}
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundImage: 'url(/images/genres/create-your-own.jpg)',
                backgroundPosition: '50% 25%',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
              }}
            />
            {/* Default dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 transition-opacity duration-300 group-hover:opacity-0" />
            
            {/* Hover: Sliding glass overlay - slides from left */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-board-accent via-cyan-600 to-purple-700 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"
              style={{ opacity: 0.4 }}
            />
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end">
              <h3 
                className="font-semibold text-white text-lg mb-1"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              >
                Create Your Own
              </h3>
              <p 
                className="text-sm text-white/90 mb-3"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              >
                No limits — build freely
              </p>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-white">
                  <Check className="w-3 h-3 text-board-accent group-hover:text-white transition-colors" />
                  <span>Skip to building</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white">
                  <Check className="w-3 h-3 text-board-accent group-hover:text-white transition-colors" />
                  <span>Top 3 genre matches</span>
                </div>
              </div>
            </div>
          </button>
          
          {/* Genre Category Cards */}
          {genresByCategory.map(({ category, genres }) => {
            const isOpen = isCategoryOpen(category.id);
            const selectedInCategory = genres.filter(g => selectedGenres.includes(g.id)).length;
            const bgImage = CATEGORY_IMAGES[category.id];
            
            return (
              <div
                key={category.id}
                className={`relative h-auto min-h-[200px] sm:h-64 rounded-xl border-2 text-left transition-all overflow-hidden ${
                  selectedInCategory > 0 ? 'border-opacity-100' : 'border-board-border/50'
                }`}
                style={{
                  borderColor: selectedInCategory > 0 ? category.color : undefined,
                }}
                onMouseEnter={() => !isMobile && setHoveredCategory(category.id)}
                onMouseLeave={() => !isMobile && setHoveredCategory(null)}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0"
                  style={{ 
                    backgroundImage: `url(${bgImage.url})`,
                    backgroundPosition: bgImage.position || 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40" />
                
                {selectedInCategory > 0 && (
                  <div 
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-20"
                    style={{ backgroundColor: category.color }}
                  >
                    {selectedInCategory}
                  </div>
                )}
                
                {/* Category Header - Always Visible, Clickable on mobile */}
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`absolute inset-x-0 top-0 p-4 sm:p-5 flex flex-col justify-end transition-all z-10 text-left ${
                    isOpen ? 'bottom-auto' : 'bottom-0'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 
                        className="font-semibold text-white text-base sm:text-lg leading-tight"
                        style={{ textShadow: '0 2px 8px rgba(0,0,0,1)' }}
                      >
                        {category.name}
                      </h3>
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                  {!isOpen && (
                    <>
                      <p 
                        className="text-xs sm:text-sm text-white/80 mt-2 line-clamp-2"
                        style={{ textShadow: '0 2px 6px rgba(0,0,0,1)' }}
                      >
                        {category.description}
                      </p>
                      <p className="text-xs text-white/60 mt-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,1)' }}>
                        {genres.length} genres • {isMobile ? 'Tap' : 'Hover'} to explore
                      </p>
                    </>
                  )}
                </button>
                
                {/* Expanded State - Genre List */}
                <div className={`relative mt-16 p-3 flex flex-col transition-all ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pointer-events-none'}`}>
                  <div className="flex flex-col gap-1">
                    {genres.map(genre => {
                      const isSelected = selectedGenres.includes(genre.id);
                      const isDisabled = !isSelected && isAtMax;
                      
                      return (
                        <button
                          key={genre.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isDisabled) handleToggleGenre(genre.id);
                          }}
                          disabled={isDisabled}
                          className={`w-full px-3 py-2.5 sm:px-2 sm:py-1.5 rounded-lg text-left transition-all ${
                            isDisabled 
                              ? 'opacity-40 cursor-not-allowed'
                              : 'active:bg-white/20 hover:bg-white/10'
                          } ${
                            isSelected ? 'bg-white/20 ring-1' : ''
                          }`}
                          style={isSelected ? {
                            boxShadow: `inset 0 0 0 1px ${genre.color}`,
                          } : undefined}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span 
                                  className="text-sm font-medium text-white truncate"
                                  style={{ textShadow: '0 1px 4px rgba(0,0,0,1)' }}
                                >
                                  {genre.name}
                                </span>
                                {isSelected && (
                                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: genre.color }} />
                                )}
                              </div>
                              {/* Ratings Row - x/10 format */}
                              <div className="flex items-center gap-2 mt-0.5 text-[9px] sm:text-[8px] text-white/70" style={{ textShadow: '0 1px 3px rgba(0,0,0,1)' }}>
                                <span>Gain:{genre.gainRating}/10</span>
                                <span>Amb:{genre.ambienceRating}/10</span>
                                <span>Mod:{genre.modulationRating}/10</span>
                                <span>Dyn:{genre.dynamicsRating}/10</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Floating Continue Button */}
    </div>
  );
}
