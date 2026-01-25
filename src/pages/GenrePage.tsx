import { useState, useEffect } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { GENRES, GENRE_CATEGORIES, GenreProfile, GenreCategoryId, getGenreById } from '../data/genres';
import { GenreIcon } from '../components/GenreIcon';

interface GenrePageProps {
  onContinue: () => void;
  onCreateOwn?: () => void;
}

const CATEGORY_IMAGES: Record<GenreCategoryId, { url: string; position?: string }> = {
  'rock-roots': { url: '/images/genres/classic-rock.jpg' },
  'heavy': { url: '/images/genres/metal.jpg' },
  'atmospheric': { url: '/images/genres/ambient.jpg' },
  'groove': { url: '/images/genres/funk.jpg' },
  'contemporary': { url: '/images/genres/pop.jpg', position: 'center bottom' },
};

const CATEGORY_COLORS: Record<GenreCategoryId, string> = {
  'rock-roots': '#FF5722',
  'heavy': '#F44336',
  'atmospheric': '#2196F3',
  'groove': '#4CAF50',
  'contemporary': '#9C27B0',
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 640;
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
  
  const genresByCategory = GENRE_CATEGORIES.map(category => ({
    category,
    genres: GENRES.filter(g => g.category === category.id),
  }));
  
  const isCategoryOpen = (categoryId: GenreCategoryId) => {
    if (isMobile) return expandedCategory === categoryId;
    return hoveredCategory === categoryId || expandedCategory === categoryId;
  };
  
  return (
    <div className="h-full p-4 lg:p-6 overflow-auto" style={{ backgroundColor: '#FFFEF0' }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 text-center">
        <h1 
          className="text-2xl sm:text-4xl font-black text-black mb-2 uppercase tracking-tight"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Pick Your Style
        </h1>
        <p className="text-sm sm:text-base text-black/70 max-w-2xl mx-auto font-bold">
          Select up to <span className="text-board-accent">3 genres</span> or{' '}
          <button 
            onClick={onCreateOwn} 
            className="text-board-accent underline hover:no-underline"
          >
            skip and build freely
          </button>
        </p>
      </div>
      
      {/* Selected Genres */}
      {selectedGenres.length > 0 && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-black/60 uppercase">Selected:</span>
            {selectedGenreObjects.map(genre => (
              <button
                key={genre.id}
                onClick={() => handleToggleGenre(genre.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ 
                  backgroundColor: genre.color,
                  border: '3px solid black',
                  boxShadow: '3px 3px 0px black',
                }}
              >
                <GenreIcon genre={genre} size="sm" />
                <span>{genre.name}</span>
                <X className="w-4 h-4" />
              </button>
            ))}
            {selectedGenres.length > 1 && (
              <button
                onClick={handleClearGenres}
                className="px-3 py-2 text-xs font-bold text-black bg-white uppercase transition-all hover:-translate-y-0.5"
                style={{ border: '2px solid black', boxShadow: '2px 2px 0px black' }}
              >
                Clear All
              </button>
            )}
          </div>
          <p className="text-center text-xs font-bold text-black/50 mt-2 uppercase">
            {3 - selectedGenres.length} {3 - selectedGenres.length === 1 ? 'slot' : 'slots'} remaining
          </p>
        </div>
      )}
      
      {/* Category Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create Your Own Card */}
          <button
            onClick={onCreateOwn}
            className="relative h-64 p-4 text-left transition-all hover:-translate-y-1 overflow-hidden group"
            style={{
              backgroundColor: '#FFEB3B',
              border: '4px solid black',
              boxShadow: '6px 6px 0px black',
            }}
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <span className="text-4xl">🎨</span>
              </div>
              <div>
                <h3 
                  className="font-black text-black text-xl mb-1 uppercase"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  Create Your Own
                </h3>
                <p className="text-sm text-black/70 font-bold mb-3">
                  No limits — build freely
                </p>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-black">
                    <Check className="w-4 h-4" />
                    <span>Skip to building</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-black">
                    <Check className="w-4 h-4" />
                    <span>Top 3 genre matches</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Arrow */}
            <div 
              className="absolute bottom-4 right-4 w-10 h-10 bg-black flex items-center justify-center transition-transform group-hover:rotate-0"
              style={{ 
                border: '3px solid black',
                transform: 'rotate(-45deg)',
              }}
            >
              <span className="text-white text-xl font-black">→</span>
            </div>
          </button>
          
          {/* Genre Category Cards */}
          {genresByCategory.map(({ category, genres }) => {
            const isOpen = isCategoryOpen(category.id);
            const selectedInCategory = genres.filter(g => selectedGenres.includes(g.id)).length;
            const bgImage = CATEGORY_IMAGES[category.id];
            const bgColor = CATEGORY_COLORS[category.id];
            
            return (
              <div
                key={category.id}
                className={`relative h-auto min-h-[256px] text-left transition-all overflow-hidden ${
                  isOpen ? '' : 'hover:-translate-y-1'
                }`}
                style={{
                  border: '4px solid black',
                  boxShadow: selectedInCategory > 0 ? `6px 6px 0px ${bgColor}` : '6px 6px 0px black',
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
                  }}
                />
                <div className="absolute inset-0 bg-black/60" />
                
                {selectedInCategory > 0 && (
                  <div 
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-sm font-black text-white z-20"
                    style={{ 
                      backgroundColor: bgColor,
                      border: '3px solid black',
                    }}
                  >
                    {selectedInCategory}
                  </div>
                )}
                
                {/* Category Header */}
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`absolute inset-x-0 top-0 p-4 flex flex-col justify-end z-10 text-left ${
                    isOpen ? 'bottom-auto' : 'bottom-0'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{category.icon}</span>
                      <h3 
                        className="font-black text-white text-lg uppercase"
                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                      >
                        {category.name}
                      </h3>
                    </div>
                    <ChevronDown 
                      className={`w-6 h-6 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                  {!isOpen && (
                    <>
                      <p className="text-sm text-white/80 mt-2 font-bold">
                        {category.description}
                      </p>
                      <p className="text-xs text-white/60 mt-2 font-bold uppercase">
                        {genres.length} genres • {isMobile ? 'Tap' : 'Hover'} to explore
                      </p>
                    </>
                  )}
                </button>
                
                {/* Genre List */}
                <div className={`relative mt-20 p-3 flex flex-col transition-all ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pointer-events-none'}`}>
                  <div className="flex flex-col gap-2">
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
                          className={`w-full px-3 py-2 text-left transition-all font-bold text-sm ${
                            isDisabled 
                              ? 'opacity-40 cursor-not-allowed bg-white/10'
                              : isSelected
                                ? 'bg-white text-black hover:-translate-x-0.5'
                                : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                          style={{ 
                            border: isSelected ? '3px solid black' : '2px solid rgba(255,255,255,0.3)',
                            boxShadow: isSelected ? '3px 3px 0px black' : 'none',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{genre.name}</span>
                            {isSelected && <Check className="w-5 h-5" />}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[10px] opacity-70 uppercase">
                            <span>Gain:{genre.gainRating}</span>
                            <span>Amb:{genre.ambienceRating}</span>
                            <span>Mod:{genre.modulationRating}</span>
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
    </div>
  );
}
