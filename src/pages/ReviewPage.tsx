import { useState } from 'react';
import { ListChecks, Download, Share2, DollarSign, Square, Zap, Music, Sparkles, ArrowRight, Settings2 } from 'lucide-react';
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
      totals: {
        cost: totalCost,
        pedals: board.slots.length,
      },
      sectionScores: sectionScores.map(s => ({
        category: s.category,
        score: s.score,
        tag: s.tag,
      })),
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
      await navigator.share({
        title: board.name || 'My Pedalboard',
        text: shareText,
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    }
  };
  
  return (
    <div className="min-h-full p-8 lg:p-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-board-success/20 mb-6">
          <ListChecks className="w-8 h-8 text-board-success" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Your Pedalboard is Ready!
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Here's a summary of your build. Export it, share it, or go back to make changes.
        </p>
      </div>
      
      <div className="max-w-5xl mx-auto">
        {/* Adjust Setup Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              showRecommendations
                ? 'bg-board-accent text-white'
                : 'border border-board-accent text-board-accent hover:bg-board-accent/10'
            }`}
          >
            <Settings2 className="w-5 h-5" />
            {showRecommendations ? 'Hide Setup Recommendations' : 'Adjust Board, Budget & Power'}
          </button>
        </div>
        
        {/* Recommendations Panel */}
        {showRecommendations && (
          <div className="mb-8 animate-fadeIn">
            <BoardRecommendations />
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-board-surface border border-board-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-board-success mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm text-board-muted">Total Cost</span>
            </div>
            <div className="text-3xl font-bold text-white">${totalCost}</div>
            <div className="mt-2 h-1.5 bg-board-dark rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${budgetPercent > 100 ? 'bg-board-danger' : 'bg-board-success'}`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-board-muted mt-1">
              {budgetPercent.toFixed(0)}% of ${board.constraints.maxBudget}
            </div>
          </div>
          
          <div className="bg-board-surface border border-board-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Square className="w-5 h-5" />
              <span className="text-sm text-board-muted">Space Used</span>
            </div>
            <div className="text-3xl font-bold text-white">{formatArea(totalArea)}</div>
            <div className="mt-2 h-1.5 bg-board-dark rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${areaPercent > 100 ? 'bg-board-danger' : 'bg-blue-400'}`}
                style={{ width: `${Math.min(areaPercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-board-muted mt-1">
              {areaPercent.toFixed(0)}% of {formatArea(maxArea)} sq in
            </div>
          </div>
          
          <div className="bg-board-surface border border-board-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-board-warning mb-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm text-board-muted">Power Draw</span>
            </div>
            <div className="text-3xl font-bold text-white">{totalCurrent}mA</div>
            {board.constraints.maxCurrentMa && (
              <>
                <div className="mt-2 h-1.5 bg-board-dark rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${powerPercent > 100 ? 'bg-board-danger' : 'bg-board-warning'}`}
                    style={{ width: `${Math.min(powerPercent, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-board-muted mt-1">
                  {powerPercent.toFixed(0)}% of {board.constraints.maxCurrentMa}mA
                </div>
              </>
            )}
          </div>
          
          <div className="bg-board-surface border border-board-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Music className="w-5 h-5" />
              <span className="text-sm text-board-muted">Pedals</span>
            </div>
            <div className="text-3xl font-bold text-white">{board.slots.length}</div>
            <div className="text-xs text-board-muted mt-3">
              {genre ? `${genre.icon} ${genre.name}` : genres.length > 0 ? genres.join(', ') : 'Mixed style'}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pedal List */}
          <div className="lg:col-span-2 bg-board-surface border border-board-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-board-border">
              <h2 className="text-lg font-semibold text-white">Your Pedals</h2>
            </div>
            <div className="divide-y divide-board-border">
              {board.slots.map((slot, index) => {
                const catInfo = CATEGORY_INFO[slot.pedal.category];
                return (
                  <div key={slot.pedal.id} className="p-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-board-elevated flex items-center justify-center text-sm font-bold text-board-muted">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">{slot.pedal.model}</div>
                      <div className="text-sm text-board-muted">{slot.pedal.brand}</div>
                    </div>
                    <div 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{ backgroundColor: `${catInfo.color}20`, color: catInfo.color }}
                    >
                      {catInfo.displayName}
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">${slot.pedal.reverbPrice}</div>
                      <div className="text-xs text-board-muted">
                        {formatInches(slot.pedal.widthMm)}" × {formatInches(slot.pedal.depthMm)}"
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Tone Tags & Actions */}
          <div className="space-y-6">
            {/* Tone Tags */}
            <div className="bg-board-surface border border-board-border rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-board-accent" />
                Your Tone Tags
              </h2>
              <div className="space-y-3">
                {sectionScores.map(score => {
                  const catInfo = CATEGORY_INFO[score.category];
                  return (
                    <div key={score.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: catInfo.color }}
                        />
                        <span className="text-sm text-board-muted">{catInfo.displayName}</span>
                      </div>
                      <span 
                        className="text-sm font-medium px-2 py-0.5 rounded-full"
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
            <div className="bg-board-surface border border-board-border rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-4">Suggested Signal Chain</h2>
              <div className="space-y-2">
                {board.slots.map((slot, index) => (
                  <div key={slot.pedal.id} className="flex items-center gap-2 text-sm">
                    <span className="text-board-muted">{index + 1}.</span>
                    <span className="text-white">{slot.pedal.model}</span>
                    {index < board.slots.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-board-muted ml-auto" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-board-muted mt-3 italic">
                This is a suggested order. Feel free to experiment!
              </p>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-board-accent text-white font-medium rounded-xl hover:bg-board-accent-dim transition-colors"
              >
                <Download className="w-5 h-5" />
                Export Board
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-board-border text-white font-medium rounded-xl hover:bg-board-elevated transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

