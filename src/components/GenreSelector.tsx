import { useState } from 'react';
import { Music2, ChevronDown, Check, Sparkles, Users, Target } from 'lucide-react';
import { GENRES, GenreProfile, calculateGenreFit } from '../data/genres';
import { useBoard } from '../context/BoardContext';
import { GenreIcon } from './GenreIcon';

interface GenreSelectorProps {
  selectedGenre: string | null;
  onSelectGenre: (genreId: string | null) => void;
}

export function GenreSelector({ selectedGenre, onSelectGenre }: GenreSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);
  const { state } = useBoard();
  
  const selected = selectedGenre ? GENRES.find(g => g.id === selectedGenre) : null;
  
  // Calculate fit scores for each genre based on current board
  const genreFitScores = GENRES.map(genre => ({
    genre,
    fit: calculateGenreFit(genre, state.sectionScores),
  })).sort((a, b) => b.fit - a.fit);
  
  const displayGenre = hoveredGenre 
    ? GENRES.find(g => g.id === hoveredGenre) 
    : selected;

  return (
    <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-board-elevated/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-white">Genre Guide</h2>
            <p className="text-xs text-board-muted">
              {selected ? selected.name : 'Select a style for suggestions'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-board-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 animate-fadeIn">
          {/* Genre Grid */}
          <div className="grid grid-cols-3 gap-2">
            {GENRES.map(genre => {
              const isSelected = selectedGenre === genre.id;
              const fitScore = genreFitScores.find(g => g.genre.id === genre.id)?.fit || 0;
              
              return (
                <button
                  key={genre.id}
                  onClick={() => onSelectGenre(isSelected ? null : genre.id)}
                  onMouseEnter={() => setHoveredGenre(genre.id)}
                  onMouseLeave={() => setHoveredGenre(null)}
                  className={`relative p-3 rounded-lg border text-left transition-all group ${
                    isSelected
                      ? 'border-2'
                      : 'border-board-border hover:border-opacity-50'
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
                  
                  <div className="mb-1"><GenreIcon genre={genre} size="md" /></div>
                  <div className="text-xs font-medium text-white truncate">{genre.name}</div>
                  
                  {/* Fit indicator */}
                  {state.board.slots.length > 0 && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-board-dark rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${fitScore}%`,
                            backgroundColor: fitScore > 70 ? '#4ecdc4' : fitScore > 40 ? '#ffd23f' : '#6b7280',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Genre Details Panel */}
          {displayGenre && (
            <div 
              className="p-4 rounded-lg border transition-all"
              style={{ 
                borderColor: `${displayGenre.color}40`,
                backgroundColor: `${displayGenre.color}10`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{displayGenre.icon}</span>
                    <h3 className="font-semibold text-white">{displayGenre.name}</h3>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{displayGenre.description}</p>
                </div>
              </div>

              {/* Characteristics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-board-elevated flex items-center justify-center">
                    <span className="text-xs">🔥</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-board-muted uppercase">Gain</div>
                    <div className="text-xs text-white capitalize">{displayGenre.characteristics.gainLevel}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-board-elevated flex items-center justify-center">
                    <span className="text-xs">🌊</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-board-muted uppercase">Modulation</div>
                    <div className="text-xs text-white capitalize">{displayGenre.characteristics.modulationAmount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-board-elevated flex items-center justify-center">
                    <span className="text-xs">✨</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-board-muted uppercase">Ambience</div>
                    <div className="text-xs text-white capitalize">{displayGenre.characteristics.ambience}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-board-elevated flex items-center justify-center">
                    <span className="text-xs">🎛️</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-board-muted uppercase">Complexity</div>
                    <div className="text-xs text-white capitalize">{displayGenre.characteristics.complexity}</div>
                  </div>
                </div>
              </div>

              {/* Artists */}
              <div className="mb-3">
                <div className="flex items-center gap-1.5 text-xs text-board-muted mb-1.5">
                  <Users className="w-3 h-3" />
                  Notable Artists
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {displayGenre.artists.map(artist => (
                    <span 
                      key={artist}
                      className="px-2 py-0.5 text-xs rounded-full bg-board-elevated text-zinc-300"
                    >
                      {artist}
                    </span>
                  ))}
                </div>
              </div>

              {/* Section Targets */}
              <div>
                <div className="flex items-center gap-1.5 text-xs text-board-muted mb-1.5">
                  <Target className="w-3 h-3" />
                  Target Section Levels
                </div>
                <div className="space-y-1.5">
                  {Object.entries(displayGenre.sectionTargets).map(([category, target]) => {
                    if (!target) return null;
                    const currentScore = state.sectionScores.find(s => s.category === category)?.totalScore || 0;
                    const isInRange = currentScore >= target.min && currentScore <= target.max;
                    
                    return (
                      <div key={category} className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 w-20 capitalize">{category}</span>
                        <div className="flex-1 h-2 bg-board-dark rounded-full relative">
                          {/* Target range indicator */}
                          <div 
                            className="absolute h-full rounded-full opacity-30"
                            style={{
                              left: `${(target.min / 30) * 100}%`,
                              width: `${((target.max - target.min) / 30) * 100}%`,
                              backgroundColor: displayGenre.color,
                            }}
                          />
                          {/* Ideal marker */}
                          <div 
                            className="absolute w-1 h-full rounded-full"
                            style={{
                              left: `${(target.ideal / 30) * 100}%`,
                              backgroundColor: displayGenre.color,
                            }}
                          />
                          {/* Current score */}
                          {state.board.slots.length > 0 && (
                            <div 
                              className={`absolute w-2 h-2 rounded-full top-0 -translate-y-0 border border-white`}
                              style={{
                                left: `${Math.min((currentScore / 30) * 100, 100)}%`,
                                backgroundColor: isInRange ? '#4ecdc4' : '#ff6b6b',
                              }}
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-board-muted w-8">{target.min}-{target.max}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preferred pedal types */}
              <div className="mt-3 pt-3 border-t border-board-border/50">
                <div className="text-xs text-board-muted mb-1.5">Key Pedal Types</div>
                <div className="flex flex-wrap gap-1">
                  {displayGenre.preferredSubtypes.slice(0, 6).map(subtype => (
                    <span 
                      key={subtype}
                      className="px-2 py-0.5 text-xs rounded border"
                      style={{ 
                        borderColor: `${displayGenre.color}50`,
                        color: displayGenre.color,
                      }}
                    >
                      {subtype}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Current fit message */}
          {selectedGenre && state.board.slots.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-board-elevated">
              <Sparkles className="w-4 h-4 text-board-highlight" />
              <div className="text-sm">
                <span className="text-zinc-400">Your board is </span>
                <span className="font-medium text-white">
                  {genreFitScores.find(g => g.genre.id === selectedGenre)?.fit.toFixed(0)}%
                </span>
                <span className="text-zinc-400"> aligned with {selected?.name}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

