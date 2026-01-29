import { useState, useEffect } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { GENRES, GENRE_CATEGORIES, GenreProfile, GenreCategoryId, getGenreById } from '../data/genres';
import { GenreIcon } from '../components/GenreIcon';

interface GenrePageProps {
  onContinue: () => void;
  onCreateOwn?: () => void;
}

const CATEGORY_COLORS: Record<GenreCategoryId, string> = {
  'rock-roots': '#FFCCBC',
  'heavy': '#FFCDD2',
  'atmospheric': '#BBDEFB',
  'groove': '#C8E6C9',
  'contemporary': '#E1BEE7',
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
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-black transition-all hover:-translate-y-0.5"
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
              backgroundColor: '#FFF9C4',
              border: '4px solid black',
              boxShadow: '6px 6px 0px black',
            }}
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div 
                  className="w-12 h-12 bg-white flex items-center justify-center text-xl font-black"
                  style={{ border: '3px solid black' }}
                >
                  +
                </div>
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
            const bgColor = CATEGORY_COLORS[category.id];
            
            return (
              <div
                key={category.id}
                className={`relative h-64 text-left transition-all overflow-visible ${
                  isOpen ? '' : 'hover:-translate-y-1'
                }`}
                style={{
                  backgroundColor: bgColor,
                  border: '4px solid black',
                  boxShadow: selectedInCategory > 0 ? `6px 6px 0px #FFF9C4` : '6px 6px 0px black',
                }}
                onMouseEnter={() => !isMobile && setHoveredCategory(category.id)}
                onMouseLeave={() => !isMobile && setHoveredCategory(null)}
              >
                {selectedInCategory > 0 && (
                  <div 
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-sm font-black text-black z-20"
                    style={{ 
                      backgroundColor: '#FFF9C4',
                      border: '3px solid black',
                    }}
                  >
                    {selectedInCategory}
                  </div>
                )}
                
                {/* Category Header */}
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className="absolute inset-0 p-4 flex flex-col justify-between z-10 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-sm font-black w-12 h-12 flex items-center justify-center bg-white text-black"
                        style={{ border: '3px solid black' }}
                      >
                        {category.name.substring(0, 2).toUpperCase()}
                      </span>
                      <h3 
                        className="font-black text-black text-lg uppercase"
                        style={{ 
                          fontFamily: '"Space Grotesk", sans-serif',
                        }}
                      >
                        {category.name}
                      </h3>
                    </div>
                    <div 
                      className="w-10 h-10 bg-white flex items-center justify-center"
                      style={{ border: '3px solid black' }}
                    >
                      <ChevronDown 
                        className={`w-6 h-6 text-black transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                  <div>
                    <p 
                      className="text-sm text-black font-bold"
                    >
                      {category.description}
                    </p>
                    <p 
                      className="text-xs text-black/70 mt-2 font-bold uppercase"
                    >
                      {genres.length} genres • {isMobile ? 'Tap' : 'Click'} to explore
                    </p>
                  </div>
                </button>
                
                {/* Genre List - Overlay */}
                <div 
                  className={`absolute inset-0 p-2 flex flex-col transition-all z-30 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  style={{
                    backgroundColor: bgColor,
                  }}
                >
                  {/* Header in overlay */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="text-[10px] font-black w-7 h-7 flex items-center justify-center bg-white text-black"
                        style={{ border: '2px solid black' }}
                      >
                        {category.name.substring(0, 2).toUpperCase()}
                      </span>
                      <h3 
                        className="font-black text-black text-sm uppercase"
                        style={{ 
                          fontFamily: '"Space Grotesk", sans-serif',
                        }}
                      >
                        {category.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCategoryClick(category.id)}
                      className="w-7 h-7 bg-white flex items-center justify-center"
                      style={{ border: '2px solid black' }}
                    >
                      <X className="w-4 h-4 text-black" />
                    </button>
                  </div>
                  
                  {/* Genre list - compact */}
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
                          className={`w-full px-2 py-1.5 text-left transition-all font-bold text-xs ${
                            isDisabled 
                              ? 'opacity-40 cursor-not-allowed bg-white/50 text-black/50'
                              : isSelected
                                ? 'bg-white text-black'
                                : 'bg-white/70 text-black hover:bg-white'
                          }`}
                          style={{ 
                            border: '2px solid black',
                            boxShadow: isSelected ? '2px 2px 0px black' : 'none',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{genre.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] opacity-70">Gain:{genre.gainRating} Amb:{genre.ambienceRating} Mod:{genre.modulationRating}</span>
                              {isSelected && <Check className="w-4 h-4" />}
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
    </div>
  );
}
