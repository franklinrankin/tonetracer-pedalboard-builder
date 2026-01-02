import { DollarSign, Square, Zap, Cable, Music } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { formatArea } from '../utils/measurements';

export function BoardStats() {
  const { state } = useBoard();
  const { board, totalCost, totalArea, totalCurrent, genres } = state;
  
  const maxArea = board.constraints.maxWidthMm * board.constraints.maxDepthMm * 0.85;
  const areaPercent = Math.min((totalArea / maxArea) * 100, 100);
  const budgetPercent = Math.min((totalCost / board.constraints.maxBudget) * 100, 100);
  const powerPercent = board.constraints.maxCurrentMa 
    ? Math.min((totalCurrent / board.constraints.maxCurrentMa) * 100, 100)
    : 0;
  
  const pedalCount = board.slots.length;
  
  const getStatusColor = (percent: number) => {
    if (percent > 100) return 'bg-board-danger';
    if (percent > 85) return 'bg-board-warning';
    return 'bg-board-success';
  };
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Board Summary</h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-board-elevated">
          <Cable className="w-4 h-4 text-board-accent" />
          <span className="text-sm font-mono text-white">{pedalCount} pedal{pedalCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Budget */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <DollarSign className="w-4 h-4" />
              Budget
            </div>
            <div className="text-sm font-mono">
              <span className={budgetPercent > 100 ? 'text-board-danger' : 'text-white'}>
                ${totalCost}
              </span>
              <span className="text-board-muted"> / ${board.constraints.maxBudget}</span>
            </div>
          </div>
          <div className="h-2 bg-board-dark rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${getStatusColor(budgetPercent)}`}
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Area */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Square className="w-4 h-4" />
              Space Used
            </div>
            <div className="text-sm font-mono">
              <span className={areaPercent > 100 ? 'text-board-danger' : 'text-white'}>
                {formatArea(totalArea)}
              </span>
              <span className="text-board-muted"> / {formatArea(maxArea)} in²</span>
            </div>
          </div>
          <div className="h-2 bg-board-dark rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${getStatusColor(areaPercent)}`}
              style={{ width: `${Math.min(areaPercent, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Power */}
        {board.constraints.maxCurrentMa && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Zap className="w-4 h-4" />
                Power Draw
              </div>
              <div className="text-sm font-mono">
                <span className={powerPercent > 100 ? 'text-board-danger' : 'text-white'}>
                  {totalCurrent}
                </span>
                <span className="text-board-muted"> / {board.constraints.maxCurrentMa} mA</span>
              </div>
            </div>
            <div className="h-2 bg-board-dark rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${getStatusColor(powerPercent)}`}
                style={{ width: `${Math.min(powerPercent, 100)}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Genres */}
        {genres.length > 0 && (
          <div className="pt-2 border-t border-board-border">
            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
              <Music className="w-4 h-4" />
              Suggested Genres
            </div>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <span 
                  key={genre}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-board-accent/20 text-board-accent border border-board-accent/30"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
