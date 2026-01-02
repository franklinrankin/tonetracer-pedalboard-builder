import { Music2, Check } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { GENRES } from '../data/genres';

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
    <div className="h-screen flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-4 flex-shrink-0">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-3">
          <Music2 className="w-6 h-6 text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          What style are you going for?
        </h1>
        <p className="text-sm text-zinc-400">
          Select a genre for tailored suggestions, or skip to browse freely
        </p>
      </div>
      
      {/* Genre Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {GENRES.map(genre => {
              const isSelected = selectedGenre === genre.id;
              
              return (
                <button
                  key={genre.id}
                  onClick={() => handleSelectGenre(genre.id)}
                  className={`relative p-3 rounded-lg border text-left transition-all hover:scale-[1.02] ${
                    isSelected
                      ? 'border-opacity-100'
                      : 'border-board-border hover:border-opacity-50 bg-board-surface'
                  }`}
                  style={{
                    borderColor: isSelected ? genre.color : undefined,
                    backgroundColor: isSelected ? `${genre.color}15` : undefined,
                  }}
                >
                  {isSelected && (
                    <div 
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: genre.color }}
                    >
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  
                  <div className="text-2xl mb-1">{genre.icon}</div>
                  <h3 className="font-medium text-white text-sm leading-tight">{genre.name}</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5 capitalize">{genre.characteristics.gainLevel} gain</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Selected Genre Details - Fixed at bottom */}
      {selected && (
        <div className="flex-shrink-0 mt-4 animate-fadeIn">
          <div 
            className="max-w-4xl mx-auto p-4 rounded-xl border"
            style={{ 
              borderColor: `${selected.color}40`,
              backgroundColor: `${selected.color}10`,
            }}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{selected.icon}</div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                <p className="text-xs text-zinc-400 line-clamp-1">{selected.description}</p>
              </div>
              <div className="flex flex-wrap gap-1 max-w-xs">
                {selected.preferredSubtypes.slice(0, 4).map(type => (
                  <span 
                    key={type}
                    className="px-2 py-0.5 text-[10px] rounded border"
                    style={{ borderColor: selected.color, color: selected.color }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
