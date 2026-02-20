import { useState, useEffect } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { useTheme } from '../context/ThemeContext';
import { GENRES, GENRE_CATEGORIES, GenreProfile, GenreCategoryId, getGenreById } from '../data/genres';
import { GenreIcon } from '../components/GenreIcon';

interface GenrePageProps {
  onContinue: () => void;
  onCreateOwn?: () => void;
}

const CATEGORY_COLORS_LIGHT: Record<GenreCategoryId, string> = {
  'rock-roots': '#FFCCBC',
  'heavy': '#FFCDD2',
  'atmospheric': '#BBDEFB',
  'groove': '#C8E6C9',
  'contemporary': '#E1BEE7',
};

const CATEGORY_COLORS_DARK: Record<GenreCategoryId, string> = {
  'rock-roots': '#5D3A2A',
  'heavy': '#5D2A2A',
  'atmospheric': '#1A3A5C',
  'groove': '#1A3D1A',
  'contemporary': '#3D2A4A',
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
  const { theme } = useTheme();
  const [hoveredCategory, setHoveredCategory] = useState<GenreCategoryId | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<GenreCategoryId | null>(null);
  const isMobile = useIsMobile();
  
  const CATEGORY_COLORS = theme === 'dark' ? CATEGORY_COLORS_DARK : CATEGORY_COLORS_LIGHT;
  
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
    <div className="h-full p-4 lg:p-6 overflow-auto" style={{ backgroundColor: 'var(--color-board-dark)' }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 text-center">
        <h1 
          className="text-2xl sm:text-4xl font-black mb-2 uppercase tracking-tight"
          style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-board-text)' }}
        >
          Pick Your Style
        </h1>
        <p className="text-sm sm:text-base max-w-2xl mx-auto font-bold" style={{ color: 'var(--color-board-text-muted)' }}>
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
            <span className="text-sm font-bold uppercase" style={{ color: 'var(--color-board-text-muted)' }}>Selected:</span>
            {selectedGenreObjects.map(genre => (
              <button
                key={genre.id}
                onClick={() => handleToggleGenre(genre.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold transition-all hover:-translate-y-0.5"
                style={{ 
                  backgroundColor: genre.color,
                  color: 'var(--color-board-text)',
                  border: '3px solid var(--color-board-border)',
                  boxShadow: '3px 3px 0px var(--color-board-shadow)',
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
                className="px-3 py-2 text-xs font-bold uppercase transition-all hover:-translate-y-0.5"
                style={{ 
                  backgroundColor: 'var(--color-board-surface)',
                  color: 'var(--color-board-text)',
                  border: '2px solid var(--color-board-border)', 
                  boxShadow: '2px 2px 0px var(--color-board-shadow)' 
                }}
              >
                Clear All
              </button>
            )}
          </div>
          <p className="text-center text-xs font-bold mt-2 uppercase" style={{ color: 'var(--color-board-text-muted)' }}>
            {3 - selectedGenres.length} {3 - selectedGenres.length === 1 ? 'slot' : 'slots'} remaining
          </p>
        </div>
      )}
      
      {/* Category Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Your Own Card */}
          <button
            onClick={onCreateOwn}
            className="relative h-72 p-5 text-left transition-all hover:-translate-y-1 overflow-hidden group"
            style={{
              backgroundColor: theme === 'dark' ? '#4A3D1A' : '#FFF9C4',
              border: '4px solid var(--color-board-border)',
              boxShadow: '6px 6px 0px var(--color-board-shadow)',
            }}
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div 
                  className="w-12 h-12 flex items-center justify-center text-xl font-black"
                  style={{ 
                    backgroundColor: 'var(--color-board-surface)',
                    color: 'var(--color-board-text)',
                    border: '3px solid var(--color-board-border)' 
                  }}
                >
                  +
                </div>
              </div>
              <div>
                <h3 
                  className="font-black text-2xl mb-1 uppercase"
                  style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-board-text)' }}
                >
                  Create Your Own
                </h3>
                <p className="text-base font-bold mb-3" style={{ color: 'var(--color-board-text-muted)' }}>
                  No limits — build freely
                </p>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--color-board-text)' }}>
                    <Check className="w-4 h-4" />
                    <span>Skip to building</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--color-board-text)' }}>
                    <Check className="w-4 h-4" />
                    <span>Top 3 genre matches</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Arrow */}
            <div 
              className="absolute bottom-4 right-4 w-10 h-10 flex items-center justify-center transition-transform group-hover:rotate-0"
              style={{ 
                backgroundColor: 'var(--color-board-border)',
                border: '3px solid var(--color-board-border)',
                transform: 'rotate(-45deg)',
              }}
            >
              <span style={{ color: 'var(--color-board-dark)' }} className="text-xl font-black">→</span>
            </div>
          </button>
          
          {/* Genre Category Cards */}
          {genresByCategory.map(({ category, genres }) => {
            const isOpen = isCategoryOpen(category.id);
            const selectedInCategory = genres.filter(g => selectedGenres.includes(g.id)).length;
            const bgColor = CATEGORY_COLORS[category.id];
            const highlightColor = theme === 'dark' ? '#4A3D1A' : '#FFF9C4';
            
            return (
              <div
                key={category.id}
                className={`relative h-72 text-left transition-all overflow-visible ${
                  isOpen ? '' : 'hover:-translate-y-1'
                }`}
                style={{
                  backgroundColor: bgColor,
                  border: '4px solid var(--color-board-border)',
                  boxShadow: selectedInCategory > 0 ? `6px 6px 0px ${highlightColor}` : '6px 6px 0px var(--color-board-shadow)',
                }}
                onMouseEnter={() => !isMobile && setHoveredCategory(category.id)}
                onMouseLeave={() => !isMobile && setHoveredCategory(null)}
              >
                {selectedInCategory > 0 && (
                  <div 
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-sm font-black z-20"
                    style={{ 
                      backgroundColor: highlightColor,
                      color: 'var(--color-board-text)',
                      border: '3px solid var(--color-board-border)',
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
                        className="text-sm font-black w-12 h-12 flex items-center justify-center"
                        style={{ 
                          backgroundColor: 'var(--color-board-surface)',
                          color: 'var(--color-board-text)',
                          border: '3px solid var(--color-board-border)' 
                        }}
                      >
                        {category.name.substring(0, 2).toUpperCase()}
                      </span>
                      <h3 
                        className="font-black text-lg uppercase"
                        style={{ 
                          fontFamily: '"Space Grotesk", sans-serif',
                          color: 'var(--color-board-text)',
                        }}
                      >
                        {category.name}
                      </h3>
                    </div>
                    <div 
                      className="w-10 h-10 flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'var(--color-board-surface)',
                        border: '3px solid var(--color-board-border)' 
                      }}
                    >
                      <ChevronDown 
                        className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--color-board-text)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <p 
                      className="text-sm font-bold"
                      style={{ color: 'var(--color-board-text)' }}
                    >
                      {category.description}
                    </p>
                    <p 
                      className="text-xs mt-2 font-bold uppercase"
                      style={{ color: 'var(--color-board-text-muted)' }}
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
                        className="text-[10px] font-black w-7 h-7 flex items-center justify-center"
                        style={{ 
                          backgroundColor: 'var(--color-board-surface)',
                          color: 'var(--color-board-text)',
                          border: '2px solid var(--color-board-border)' 
                        }}
                      >
                        {category.name.substring(0, 2).toUpperCase()}
                      </span>
                      <h3 
                        className="font-black text-sm uppercase"
                        style={{ 
                          fontFamily: '"Space Grotesk", sans-serif',
                          color: 'var(--color-board-text)',
                        }}
                      >
                        {category.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCategoryClick(category.id)}
                      className="w-7 h-7 flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'var(--color-board-surface)',
                        border: '2px solid var(--color-board-border)' 
                      }}
                    >
                      <X className="w-4 h-4" style={{ color: 'var(--color-board-text)' }} />
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
                              ? 'opacity-40 cursor-not-allowed'
                              : ''
                          }`}
                          style={{ 
                            backgroundColor: isDisabled 
                              ? 'rgba(var(--color-board-surface), 0.5)' 
                              : isSelected 
                                ? 'var(--color-board-surface)' 
                                : theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)',
                            color: 'var(--color-board-text)',
                            border: '2px solid var(--color-board-border)',
                            boxShadow: isSelected ? '2px 2px 0px var(--color-board-shadow)' : 'none',
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
