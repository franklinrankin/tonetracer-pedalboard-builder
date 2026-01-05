import { Music2, Users, ChevronRight, Check, X, Wand2 } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { GENRES, GenreProfile, getGenreById } from '../data/genres';
import { GenreIcon } from '../components/GenreIcon';

interface GenrePageProps {
  onContinue: () => void;
  onCreateOwn?: () => void; // Skip to build page directly
}

export function GenrePage({ onContinue, onCreateOwn }: GenrePageProps) {
  const { state, dispatch } = useBoard();
  const { selectedGenres } = state;
  
  const handleToggleGenre = (genreId: string) => {
    dispatch({ type: 'TOGGLE_GENRE', genreId });
  };
  
  const handleClearGenres = () => {
    dispatch({ type: 'CLEAR_GENRES' });
  };
  
  const selectedGenreObjects = selectedGenres.map(id => getGenreById(id)).filter(Boolean) as GenreProfile[];
  const isAtMax = selectedGenres.length >= 3;
  
  return (
    <div className="min-h-full p-8 lg:p-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6">
          <Music2 className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          What style are you going for?
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Select up to <span className="text-board-accent font-semibold">3 genres</span> and we'll suggest versatile pedals that work across your styles.
          This is optional — you can skip and browse all pedals freely.
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
      
      {/* Genre Grid */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Create Your Own Card */}
          <button
            onClick={onCreateOwn}
            className="relative p-6 rounded-xl border-2 border-dashed border-board-accent/50 text-left transition-all hover:scale-[1.02] hover:border-board-accent overflow-hidden group"
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
            <div className="relative z-10">
              <div className="mb-8" /> {/* Spacer */}
              <h3 
                className="font-semibold text-white text-lg mb-1"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 4px 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.8)' }}
              >
                Create Your Own
              </h3>
              <p 
                className="text-sm text-white"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 4px 16px rgba(0,0,0,1)' }}
              >
                No limits — build freely and we'll show you what genres it fits
              </p>
              
              {/* Features */}
              <div className="mt-4 pt-4 border-t border-white/20 space-y-1">
                <div 
                  className="flex items-center gap-2 text-xs text-white"
                  style={{ textShadow: '0 2px 6px rgba(0,0,0,1)' }}
                >
                  <Check className="w-3 h-3 text-board-accent" />
                  <span>Skip to building</span>
                </div>
                <div 
                  className="flex items-center gap-2 text-xs text-white"
                  style={{ textShadow: '0 2px 6px rgba(0,0,0,1)' }}
                >
                  <Check className="w-3 h-3 text-board-accent" />
                  <span>Top 3 genre matches</span>
                </div>
              </div>
            </div>
          </button>
          
          {GENRES.map(genre => {
            const isSelected = selectedGenres.includes(genre.id);
            const selectionIndex = selectedGenres.indexOf(genre.id);
            const isDisabled = !isSelected && isAtMax;
            const hasImage = !!genre.iconImage;
            
            return (
              <button
                key={genre.id}
                onClick={() => !isDisabled && handleToggleGenre(genre.id)}
                disabled={isDisabled}
                className={`relative p-6 rounded-xl border-2 text-left transition-all overflow-hidden ${
                  isDisabled 
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:scale-[1.02]'
                } ${
                  isSelected
                    ? 'border-opacity-100 bg-opacity-20'
                    : 'border-board-border hover:border-opacity-50 bg-board-surface'
                }`}
                style={{
                  borderColor: isSelected ? genre.color : undefined,
                  backgroundColor: isSelected && !hasImage ? `${genre.color}15` : undefined,
                }}
              >
                {/* Background image for genres with iconImage */}
                {hasImage && (
                  <>
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        backgroundImage: `url(${genre.iconImage})`,
                        backgroundPosition: genre.iconImagePosition || 'center',
                        backgroundSize: genre.iconImageSize || 'cover',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
                  </>
                )}
                
                {isSelected && (
                  <div 
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10"
                    style={{ backgroundColor: genre.color }}
                  >
                    {selectionIndex + 1}
                  </div>
                )}
                
                {/* Content - positioned above the background */}
                <div className="relative z-10">
                  {!hasImage && (
                    <div className="mb-3"><GenreIcon genre={genre} size="xl" /></div>
                  )}
                  {hasImage && <div className="mb-8" />} {/* Spacer for image backgrounds */}
                  <h3 
                    className="font-semibold text-white text-lg mb-1"
                    style={hasImage ? { textShadow: '0 2px 8px rgba(0,0,0,1), 0 4px 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.8)' } : undefined}
                  >
                    {genre.name}
                  </h3>
                  <p 
                    className={`text-sm line-clamp-2 ${hasImage ? 'text-white' : 'text-zinc-400'}`}
                    style={hasImage ? { textShadow: '0 2px 8px rgba(0,0,0,1), 0 4px 16px rgba(0,0,0,1)' } : undefined}
                  >
                    {genre.description}
                  </p>
                  
                  {/* Characteristics */}
                  <div className={`mt-4 pt-4 border-t grid grid-cols-2 gap-2 ${hasImage ? 'border-white/20' : 'border-board-border/50'}`}>
                    <div>
                      <span 
                        className={`text-[10px] uppercase ${hasImage ? 'text-white' : 'text-board-muted'}`}
                        style={hasImage ? { textShadow: '0 2px 6px rgba(0,0,0,1)' } : undefined}
                      >
                        Gain
                      </span>
                      <div 
                        className="text-xs text-white capitalize"
                        style={hasImage ? { textShadow: '0 2px 6px rgba(0,0,0,1)' } : undefined}
                      >
                        {genre.characteristics.gainLevel}
                      </div>
                    </div>
                    <div>
                      <span 
                        className={`text-[10px] uppercase ${hasImage ? 'text-white' : 'text-board-muted'}`}
                        style={hasImage ? { textShadow: '0 2px 6px rgba(0,0,0,1)' } : undefined}
                      >
                        Ambience
                      </span>
                      <div 
                        className="text-xs text-white capitalize"
                        style={hasImage ? { textShadow: '0 2px 6px rgba(0,0,0,1)' } : undefined}
                      >
                        {genre.characteristics.ambience}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Selected Genres Details */}
      {selectedGenreObjects.length > 0 && (
        <div className="max-w-4xl mx-auto mt-8 space-y-4 animate-fadeIn">
          <h3 className="text-center text-sm text-board-muted mb-4">
            {selectedGenreObjects.length === 1 
              ? 'Your selected style' 
              : `Your ${selectedGenreObjects.length} styles — we'll suggest versatile pedals`}
          </h3>
          
          <div className={`grid gap-4 ${selectedGenreObjects.length === 1 ? 'grid-cols-1' : selectedGenreObjects.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {selectedGenreObjects.map((genre, index) => (
              <div 
                key={genre.id}
                className="p-4 rounded-xl border"
                style={{ 
                  borderColor: `${genre.color}40`,
                  backgroundColor: `${genre.color}10`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <GenreIcon genre={genre} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: genre.color }}
                      >
                        {index + 1}
                      </span>
                      <h3 className="font-semibold text-white">{genre.name}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-3 h-3 text-board-muted" />
                  <div className="flex flex-wrap gap-1">
                    {genre.artists.slice(0, 3).map(artist => (
                      <span 
                        key={artist}
                        className="text-xs text-zinc-400"
                      >
                        {artist}{genre.artists.indexOf(artist) < Math.min(2, genre.artists.length - 1) ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {genre.preferredSubtypes.slice(0, 4).map(type => (
                    <span 
                      key={type}
                      className="px-1.5 py-0.5 text-[10px] rounded"
                      style={{ backgroundColor: `${genre.color}20`, color: genre.color }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Floating Continue Button - Bottom Left */}
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

