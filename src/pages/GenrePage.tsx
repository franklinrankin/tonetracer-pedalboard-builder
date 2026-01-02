import { Music2, Users, ChevronRight, Check } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { GENRES, GenreProfile } from '../data/genres';

interface GenrePageProps {
  onContinue: () => void;
}

export function GenrePage({ onContinue }: GenrePageProps) {
  const { state, dispatch } = useBoard();
  const { selectedGenre } = state;
  
  const handleSelectGenre = (genreId: string) => {
    if (selectedGenre === genreId) {
      dispatch({ type: 'SET_GENRE', genreId: null });
    } else {
      dispatch({ type: 'SET_GENRE', genreId });
    }
  };
  
  const selected = selectedGenre ? GENRES.find(g => g.id === selectedGenre) : null;
  
  return (
    <div className="min-h-full p-8 lg:p-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6">
          <Music2 className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          What style are you going for?
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Select a genre and we'll suggest pedals tailored to that sound. 
          This is optional — you can skip and browse all pedals freely.
        </p>
      </div>
      
      {/* Genre Grid */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {GENRES.map(genre => {
            const isSelected = selectedGenre === genre.id;
            
            return (
              <button
                key={genre.id}
                onClick={() => handleSelectGenre(genre.id)}
                className={`relative p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                  isSelected
                    ? 'border-opacity-100 bg-opacity-20'
                    : 'border-board-border hover:border-opacity-50 bg-board-surface'
                }`}
                style={{
                  borderColor: isSelected ? genre.color : undefined,
                  backgroundColor: isSelected ? `${genre.color}15` : undefined,
                }}
              >
                {isSelected && (
                  <div 
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: genre.color }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="text-4xl mb-3">{genre.icon}</div>
                <h3 className="font-semibold text-white text-lg mb-1">{genre.name}</h3>
                <p className="text-sm text-zinc-400 line-clamp-2">{genre.description}</p>
                
                {/* Characteristics */}
                <div className="mt-4 pt-4 border-t border-board-border/50 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-board-muted uppercase">Gain</span>
                    <div className="text-xs text-white capitalize">{genre.characteristics.gainLevel}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-board-muted uppercase">Ambience</span>
                    <div className="text-xs text-white capitalize">{genre.characteristics.ambience}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Selected Genre Details */}
      {selected && (
        <div className="max-w-4xl mx-auto mt-12 animate-fadeIn">
          <div 
            className="p-6 rounded-xl border"
            style={{ 
              borderColor: `${selected.color}40`,
              backgroundColor: `${selected.color}10`,
            }}
          >
            <div className="flex items-start gap-6">
              <div className="text-6xl">{selected.icon}</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selected.name}</h2>
                <p className="text-zinc-400 mb-4">{selected.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-board-muted" />
                  <span className="text-sm text-board-muted">Artists:</span>
                  <div className="flex flex-wrap gap-2">
                    {selected.artists.map(artist => (
                      <span 
                        key={artist}
                        className="px-2 py-0.5 text-xs rounded-full bg-board-elevated text-zinc-300"
                      >
                        {artist}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-board-muted">Key pedals:</span>
                  {selected.preferredSubtypes.slice(0, 5).map(type => (
                    <span 
                      key={type}
                      className="px-2 py-0.5 text-xs rounded border"
                      style={{ borderColor: selected.color, color: selected.color }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Continue Button (for mobile/touch) */}
      <div className="max-w-4xl mx-auto mt-8 lg:hidden">
        <button
          onClick={onContinue}
          className="w-full py-4 bg-board-accent text-white font-medium rounded-xl flex items-center justify-center gap-2"
        >
          {selectedGenre ? 'Continue' : 'Skip & Browse All'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

