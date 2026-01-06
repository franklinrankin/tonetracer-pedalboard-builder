import { useState } from 'react';
import { ChevronRight, Check, X } from 'lucide-react';
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

export function GenrePage({ onContinue, onCreateOwn }: GenrePageProps) {
  const { state, dispatch } = useBoard();
  const { selectedGenres } = state;
  const [hoveredCategory, setHoveredCategory] = useState<GenreCategoryId | null>(null);
  
  const handleToggleGenre = (genreId: string) => {
    dispatch({ type: 'TOGGLE_GENRE', genreId });
  };
  
  const handleClearGenres = () => {
    dispatch({ type: 'CLEAR_GENRES' });
  };
  
  const selectedGenreObjects = selectedGenres.map(id => getGenreById(id)).filter(Boolean) as GenreProfile[];
  const isAtMax = selectedGenres.length >= 3;
  
  // Group genres by category
  const genresByCategory = GENRE_CATEGORIES.map(category => ({
    category,
    genres: GENRES.filter(g => g.category === category.id),
  }));
  
  return (
    <div className="min-h-full p-8 lg:p-12">
      {/* Header - No music note */}
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          What style are you going for?
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Select up to <span className="text-board-accent font-semibold">3 genres</span> OR{' '}
          <button onClick={onCreateOwn} className="text-board-accent font-semibold hover:underline">
            create your own pedalboard
          </button>
        </p>
      </div>
      
      {/* Selected Genres Display */}
      {selectedGenres.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8">
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
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create Your Own Card */}
          <button
            onClick={onCreateOwn}
            className="relative h-72 p-5 rounded-xl border-2 border-dashed border-board-accent/50 text-left transition-all hover:scale-[1.02] hover:border-board-accent overflow-hidden group"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end">
              <h3 
                className="font-semibold text-white text-lg mb-1"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 4px 20px rgba(0,0,0,1)' }}
              >
                Create Your Own
              </h3>
              <p 
                className="text-sm text-white mb-3"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,1)' }}
              >
                No limits — build freely
              </p>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,1)' }}>
                  <Check className="w-3 h-3 text-board-accent" />
                  <span>Skip to building</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,1)' }}>
                  <Check className="w-3 h-3 text-board-accent" />
                  <span>Top 3 genre matches</span>
                </div>
              </div>
            </div>
          </button>
          
          {/* Genre Category Cards */}
          {genresByCategory.map(({ category, genres }) => {
            const isHovered = hoveredCategory === category.id;
            const selectedInCategory = genres.filter(g => selectedGenres.includes(g.id)).length;
            const bgImage = CATEGORY_IMAGES[category.id];
            
            return (
              <div
                key={category.id}
                className={`relative h-72 rounded-xl border-2 text-left transition-all overflow-hidden ${
                  selectedInCategory > 0 ? 'border-opacity-100' : 'border-board-border/50'
                }`}
                style={{
                  borderColor: selectedInCategory > 0 ? category.color : undefined,
                }}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
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
                
                {/* Default State - Category Info */}
                <div className={`absolute inset-0 p-5 flex flex-col justify-end transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 
                      className="font-semibold text-white text-lg leading-tight"
                      style={{ textShadow: '0 2px 8px rgba(0,0,0,1)' }}
                    >
                      {category.name}
                    </h3>
                  </div>
                  <p 
                    className="text-sm text-white/80 mb-3"
                    style={{ textShadow: '0 2px 6px rgba(0,0,0,1)' }}
                  >
                    {category.description}
                  </p>
                  <p className="text-xs text-white/60" style={{ textShadow: '0 2px 4px rgba(0,0,0,1)' }}>
                    {genres.length} genres • Hover to explore
                  </p>
                </div>
                
                {/* Hovered State - Genre List (No Scroll) */}
                <div className={`absolute inset-0 p-3 flex flex-col transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <div 
                    className="text-[10px] uppercase text-white/70 mb-1.5 px-1"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,1)' }}
                  >
                    {category.name}
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-1">
                    {genres.map(genre => {
                      const isSelected = selectedGenres.includes(genre.id);
                      const isDisabled = !isSelected && isAtMax;
                      
                      return (
                        <button
                          key={genre.id}
                          onClick={() => !isDisabled && handleToggleGenre(genre.id)}
                          disabled={isDisabled}
                          className={`w-full px-2 py-1.5 rounded-lg text-left transition-all ${
                            isDisabled 
                              ? 'opacity-40 cursor-not-allowed'
                              : 'hover:bg-white/10'
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
                                  <Check className="w-3 h-3 flex-shrink-0" style={{ color: genre.color }} />
                                )}
                              </div>
                              {/* Ratings Row - x/10 format */}
                              <div className="flex items-center gap-2 mt-0.5 text-[8px] text-white/70" style={{ textShadow: '0 1px 3px rgba(0,0,0,1)' }}>
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
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={onContinue}
          className="px-6 py-3 bg-board-accent text-white font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-board-accent/30 hover:bg-board-accent-dim transition-colors"
        >
          {selectedGenres.length > 0 ? 'Continue' : 'Skip & Browse All'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
