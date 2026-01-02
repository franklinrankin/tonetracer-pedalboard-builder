import { useState } from 'react';
import { ListChecks, Download, Share2, DollarSign, Square, Zap, Music, Sparkles, Settings2 } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { getGenreById } from '../data/genres';
import { CATEGORY_INFO } from '../data/categories';
import { formatInches, formatArea } from '../utils/measurements';
import { BoardRecommendations } from '../components/BoardRecommendations';

export function ReviewPage() {
  const { state } = useBoard();
  const { board, totalCost, totalArea, totalCurrent, sectionScores, genres, selectedGenre } = state;
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const genre = selectedGenre ? getGenreById(selectedGenre) : null;
  const maxArea = board.constraints.maxWidthMm * board.constraints.maxDepthMm * 0.85;
  const budgetPercent = (totalCost / board.constraints.maxBudget) * 100;
  const areaPercent = (totalArea / maxArea) * 100;
  const powerPercent = board.constraints.maxCurrentMa 
    ? (totalCurrent / board.constraints.maxCurrentMa) * 100 
    : 0;
  
  const handleExport = () => {
    const boardData = {
      name: board.name,
      constraints: board.constraints,
      pedals: board.slots.map(s => ({
        brand: s.pedal.brand,
        model: s.pedal.model,
        category: s.pedal.category,
        price: s.pedal.reverbPrice,
      })),
      totals: { cost: totalCost, pedals: board.slots.length },
      sectionScores: sectionScores.map(s => ({ category: s.category, score: s.totalScore, tag: s.tag })),
    };
    
    const blob = new Blob([JSON.stringify(boardData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${board.name || 'my-pedalboard'}.json`;
    a.click();
  };
  
  const handleShare = async () => {
    const shareText = `Check out my pedalboard! ${board.slots.length} pedals, $${totalCost} total. Built with ToneTracer.`;
    if (navigator.share) {
      await navigator.share({ title: board.name || 'My Pedalboard', text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    }
  };
  
  return (
    <div className="h-screen flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-3 flex-shrink-0">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/20 mb-2">
          <ListChecks className="w-5 h-5 text-green-400" />
        </div>
        <h1 className="text-xl font-bold text-white">Your Pedalboard</h1>
        <p className="text-xs text-zinc-400">
          {board.slots.length} pedals • ${totalCost} total
          {genre && ` • ${genre.icon} ${genre.name}`}
        </p>
      </div>
      
      {/* Adjust Button */}
      <div className="flex justify-center mb-3 flex-shrink-0">
        <button
          onClick={() => setShowRecommendations(!showRecommendations)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            showRecommendations
              ? 'bg-board-accent text-white'
              : 'border border-board-border text-board-muted hover:text-white hover:bg-board-elevated'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          {showRecommendations ? 'Hide Recommendations' : 'Adjust Setup'}
        </button>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {showRecommendations ? (
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <BoardRecommendations />
            </div>
          </div>
        ) : (
          <div className="h-full max-w-5xl mx-auto grid lg:grid-cols-3 gap-4">
            {/* Stats & Pedal List */}
            <div className="lg:col-span-2 flex flex-col gap-3 overflow-hidden">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-2 flex-shrink-0">
                <div className="bg-board-surface border border-board-border rounded-lg p-2">
                  <div className="flex items-center gap-1.5 text-green-400 mb-1">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-[10px] text-board-muted">Cost</span>
                  </div>
                  <div className="text-lg font-bold text-white">${totalCost}</div>
                  <div className="h-1 bg-board-dark rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full ${budgetPercent > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-board-surface border border-board-border rounded-lg p-2">
                  <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                    <Square className="w-3 h-3" />
                    <span className="text-[10px] text-board-muted">Space</span>
                  </div>
                  <div className="text-lg font-bold text-white">{formatArea(totalArea)}</div>
                  <div className="h-1 bg-board-dark rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full ${areaPercent > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(areaPercent, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-board-surface border border-board-border rounded-lg p-2">
                  <div className="flex items-center gap-1.5 text-yellow-400 mb-1">
                    <Zap className="w-3 h-3" />
                    <span className="text-[10px] text-board-muted">Power</span>
                  </div>
                  <div className="text-lg font-bold text-white">{totalCurrent}</div>
                  <div className="h-1 bg-board-dark rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full ${powerPercent > 100 ? 'bg-red-500' : 'bg-yellow-500'}`}
                      style={{ width: `${Math.min(powerPercent, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-board-surface border border-board-border rounded-lg p-2">
                  <div className="flex items-center gap-1.5 text-purple-400 mb-1">
                    <Music className="w-3 h-3" />
                    <span className="text-[10px] text-board-muted">Pedals</span>
                  </div>
                  <div className="text-lg font-bold text-white">{board.slots.length}</div>
                  <div className="text-[10px] text-board-muted mt-1 truncate">
                    {genre?.name || genres[0] || 'Mixed'}
                  </div>
                </div>
              </div>
              
              {/* Pedal List */}
              <div className="flex-1 bg-board-surface border border-board-border rounded-xl overflow-hidden flex flex-col">
                <div className="px-3 py-2 border-b border-board-border flex-shrink-0">
                  <h2 className="text-sm font-semibold text-white">Your Pedals</h2>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-board-border">
                  {board.slots.map((slot, index) => {
                    const catInfo = CATEGORY_INFO[slot.pedal.category];
                    return (
                      <div key={slot.pedal.id} className="px-3 py-2 flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-board-elevated flex items-center justify-center text-xs font-bold text-board-muted">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{slot.pedal.model}</div>
                          <div className="text-[10px] text-board-muted">{slot.pedal.brand}</div>
                        </div>
                        <span 
                          className="px-1.5 py-0.5 text-[10px] rounded"
                          style={{ backgroundColor: `${catInfo.color}20`, color: catInfo.color }}
                        >
                          {catInfo.displayName}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">${slot.pedal.reverbPrice}</div>
                          <div className="text-[10px] text-board-muted">
                            {formatInches(slot.pedal.widthMm)}"×{formatInches(slot.pedal.depthMm)}"
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Tone Tags & Actions */}
            <div className="flex flex-col gap-3 overflow-hidden">
              {/* Tone Tags */}
              <div className="bg-board-surface border border-board-border rounded-xl p-3 flex-shrink-0">
                <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-board-accent" />
                  Tone Tags
                </h2>
                <div className="space-y-1.5">
                  {sectionScores.slice(0, 5).map(score => {
                    const catInfo = CATEGORY_INFO[score.category];
                    return (
                      <div key={score.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: catInfo.color }}
                          />
                          <span className="text-xs text-board-muted">{catInfo.displayName}</span>
                        </div>
                        <span 
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${catInfo.color}20`, color: catInfo.color }}
                        >
                          {score.tag}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Signal Chain */}
              <div className="bg-board-surface border border-board-border rounded-xl p-3 flex-1 overflow-hidden flex flex-col">
                <h2 className="text-sm font-semibold text-white mb-2 flex-shrink-0">Signal Chain</h2>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {board.slots.map((slot, index) => (
                    <div key={slot.pedal.id} className="flex items-center gap-2 text-xs">
                      <span className="text-board-muted w-4">{index + 1}.</span>
                      <span className="text-white truncate">{slot.pedal.model}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-board-accent text-white text-sm font-medium rounded-lg hover:bg-board-accent-dim transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-board-border text-white text-sm font-medium rounded-lg hover:bg-board-elevated transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
