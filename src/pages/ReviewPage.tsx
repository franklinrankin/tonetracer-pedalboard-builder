import { useState, useMemo } from 'react';
import { ListChecks, Download, Share2, DollarSign, Square, Zap, Music, Sparkles, ArrowRight, Settings2, Battery, Check, ChevronDown, ChevronUp, Target, LayoutGrid } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { getGenreById, getTopGenreMatches, GenreMatch } from '../data/genres';
import { CATEGORY_INFO } from '../data/categories';
import { formatInches, formatArea } from '../utils/measurements';
import { BoardRecommendations } from '../components/BoardRecommendations';
import { recommendPowerSupply, PowerSupply } from '../data/powerSupplies';
import { BoardVisualizer } from '../components/BoardVisualizer';

// Genre Matches Component - shown when user didn't pre-select genres
function GenreMatchesSection({ matches }: { matches: GenreMatch[] }) {
  const [expanded, setExpanded] = useState(false);
  
  if (matches.length === 0) {
    return (
      <div className="bg-board-surface border border-board-border rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Genre Match
        </h2>
        <p className="text-sm text-board-muted">
          Add more pedals to see genre matches!
        </p>
      </div>
    );
  }
  
  const topMatch = matches[0];
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl p-5">
      <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <Target className="w-5 h-5 text-purple-400" />
        Your Board's Genre DNA
      </h2>
      
      <p className="text-sm text-zinc-400 mb-4">
        Based on your pedal choices, here's what genres your board fits best:
      </p>
      
      {/* Top Match */}
      <div 
        className="p-4 rounded-lg border mb-3"
        style={{ 
          backgroundColor: `${topMatch.genre.color}10`,
          borderColor: `${topMatch.genre.color}40`,
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{topMatch.genre.icon}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${topMatch.genre.color}30`, color: topMatch.genre.color }}
                >
                  #1 MATCH
                </span>
              </div>
              <h3 className="font-semibold text-white text-lg">{topMatch.genre.name}</h3>
            </div>
          </div>
          <div className="text-right">
            <div 
              className="text-2xl font-bold"
              style={{ color: topMatch.genre.color }}
            >
              {Math.round(topMatch.fitPercent)}%
            </div>
            <div className="text-xs text-board-muted">fit</div>
          </div>
        </div>
        
        <p className="text-sm text-zinc-300 mb-3">{topMatch.summary}</p>
        
        {/* Match reasons */}
        <div className="space-y-1">
          {topMatch.reasons.slice(0, 3).map((reason, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ 
                  backgroundColor: reason.strength === 'strong' 
                    ? topMatch.genre.color 
                    : reason.strength === 'moderate' 
                      ? `${topMatch.genre.color}80` 
                      : `${topMatch.genre.color}50` 
                }}
              />
              <span className="text-zinc-400">{reason.reason}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Other Matches */}
      {matches.length > 1 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-board-muted hover:text-white transition-colors"
          >
            {expanded ? 'Hide other matches' : `Show ${matches.length - 1} more genre ${matches.length - 1 === 1 ? 'match' : 'matches'}`}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded && (
            <div className="space-y-2 mt-2">
              {matches.slice(1).map((match, index) => (
                <div 
                  key={match.genre.id}
                  className="p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: `${match.genre.color}08`,
                    borderColor: `${match.genre.color}30`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{match.genre.icon}</span>
                      <span className="font-medium text-white">{match.genre.name}</span>
                      <span className="text-xs text-board-muted">#{index + 2}</span>
                    </div>
                    <span 
                      className="text-sm font-medium"
                      style={{ color: match.genre.color }}
                    >
                      {Math.round(match.fitPercent)}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{match.summary}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Power Supply Recommendations Component
function PowerSupplyRecommendations({ 
  pedalCount, 
  totalCurrentMa 
}: { 
  pedalCount: number; 
  totalCurrentMa: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const recommendations = recommendPowerSupply(pedalCount, totalCurrentMa);
  
  if (recommendations.length === 0) {
    return (
      <div className="bg-board-surface border border-board-border rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Battery className="w-5 h-5 text-board-warning" />
          Power Supply
        </h2>
        <p className="text-sm text-board-muted">
          No matching power supplies found. You may need a high-capacity or multi-unit setup.
        </p>
      </div>
    );
  }
  
  const topPick = recommendations[0];
  const headroomMa = Math.ceil(totalCurrentMa * 1.2);
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl p-5">
      <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <Battery className="w-5 h-5 text-board-warning" />
        Recommended Power Supply
      </h2>
      
      {/* Requirements */}
      <div className="flex gap-4 mb-4 text-xs text-board-muted">
        <div>
          <span className="text-white font-medium">{pedalCount}</span> pedals
        </div>
        <div>
          <span className="text-white font-medium">{totalCurrentMa}mA</span> draw
        </div>
        <div>
          <span className="text-board-warning font-medium">{headroomMa}mA</span> w/ headroom
        </div>
      </div>
      
      {/* Top Pick */}
      <div className="p-4 rounded-lg bg-board-warning/10 border border-board-warning/30 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-board-warning/20 text-board-warning">
                TOP PICK
              </span>
              {topPick.isolated && (
                <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                  Isolated
                </span>
              )}
            </div>
            <h3 className="font-semibold text-white">{topPick.brand} {topPick.model}</h3>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">${topPick.reverbPrice}</div>
            <div className="text-xs text-board-muted">used avg</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-board-muted text-xs">Outputs</div>
            <div className="text-white font-medium">{topPick.totalOutputs}</div>
          </div>
          <div>
            <div className="text-board-muted text-xs">Total Power</div>
            <div className="text-white font-medium">{topPick.totalMa}mA</div>
          </div>
          <div>
            <div className="text-board-muted text-xs">Size</div>
            <div className="text-white font-medium">{topPick.widthIn}" × {topPick.depthIn}"</div>
          </div>
        </div>
        
        {topPick.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {topPick.features.slice(0, 3).map(feature => (
              <span key={feature} className="text-xs px-2 py-0.5 rounded bg-board-elevated text-board-muted">
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Show More */}
      {recommendations.length > 1 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-board-muted hover:text-white transition-colors"
          >
            {expanded ? 'Hide alternatives' : `Show ${recommendations.length - 1} more options`}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded && (
            <div className="space-y-2 mt-2">
              {recommendations.slice(1).map((ps, index) => (
                <div key={ps.id} className="p-3 rounded-lg bg-board-elevated border border-board-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-board-muted mr-2">#{index + 2}</span>
                      <span className="font-medium text-white">{ps.brand} {ps.model}</span>
                      {ps.isolated && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                          Isolated
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-white">${ps.reverbPrice}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-board-muted">
                    <span>{ps.totalOutputs} outputs</span>
                    <span>{ps.totalMa}mA</span>
                    <span>{ps.widthIn}" × {ps.depthIn}"</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ReviewPage() {
  const { state } = useBoard();
  const { board, totalCost, totalArea, totalCurrent, sectionScores, genres, selectedGenres } = state;
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const selectedGenreObjects = selectedGenres.map(id => getGenreById(id)).filter(Boolean);
  const maxArea = board.constraints.maxWidthMm * board.constraints.maxDepthMm * 0.85;
  const budgetPercent = (totalCost / board.constraints.maxBudget) * 100;
  const areaPercent = (totalArea / maxArea) * 100;
  const powerPercent = board.constraints.maxCurrentMa 
    ? (totalCurrent / board.constraints.maxCurrentMa) * 100 
    : 0;
    
  // Calculate genre matches when user didn't pre-select genres ("Create Your Own" mode)
  const isCreateYourOwnMode = selectedGenres.length === 0;
  const genreMatches = useMemo(() => {
    if (!isCreateYourOwnMode || board.slots.length === 0) return [];
    return getTopGenreMatches(sectionScores, 3);
  }, [isCreateYourOwnMode, sectionScores, board.slots.length]);
  
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
  
  // For "Create Your Own" mode, show top genre match in header
  const topGenreMatch = genreMatches.length > 0 ? genreMatches[0] : null;
  
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
          {isCreateYourOwnMode && topGenreMatch ? (
            <>
              Based on your choices, your board is <span className="font-semibold" style={{ color: topGenreMatch.genre.color }}>{Math.round(topGenreMatch.fitPercent)}% {topGenreMatch.genre.name}</span>! See the breakdown below.
            </>
          ) : (
            <>Here's a summary of your build. Export it, share it, or go back to make changes.</>
          )}
        </p>
        
        {/* Show Initially Selected Genre(s) */}
        {!isCreateYourOwnMode && selectedGenreObjects.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="text-sm text-zinc-500 self-center">Built for:</span>
            {selectedGenreObjects.map((genre) => (
              <div 
                key={genre!.id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border"
                style={{ 
                  backgroundColor: `${genre!.color}15`,
                  borderColor: `${genre!.color}50`,
                }}
              >
                <span className="text-xl">{genre!.icon}</span>
                <span 
                  className="font-semibold text-lg"
                  style={{ color: genre!.color }}
                >
                  {genre!.name}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Genre Matches Banner - shown in "Create Your Own" mode */}
        {isCreateYourOwnMode && genreMatches.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {genreMatches.map((match, index) => (
              <div 
                key={match.genre.id}
                className="flex items-center gap-3 px-5 py-3 rounded-xl border"
                style={{ 
                  backgroundColor: `${match.genre.color}15`,
                  borderColor: `${match.genre.color}40`,
                }}
              >
                <span className="text-2xl">{match.genre.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${match.genre.color}30`, color: match.genre.color }}
                    >
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-white">{match.genre.name}</span>
                  </div>
                  <div 
                    className="text-lg font-bold"
                    style={{ color: match.genre.color }}
                  >
                    {Math.round(match.fitPercent)}% match
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
        
        {/* Board Layout Preview */}
        {board.slots.length > 0 && (
          <div className="mb-8 bg-board-surface border border-board-border rounded-xl overflow-hidden">
            <div className="p-3 border-b border-board-border flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-board-accent" />
              <h3 className="text-sm font-semibold text-white">Board Layout</h3>
              <span className="text-xs text-board-muted ml-auto">
                {formatInches(board.constraints.maxWidthMm)}" × {formatInches(board.constraints.maxDepthMm)}"
              </span>
            </div>
            <div className="pointer-events-none">
              <BoardVisualizer />
            </div>
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
              {selectedGenreObjects.length > 0 
                ? selectedGenreObjects.map(g => `${g.icon} ${g.name}`).join(' + ')
                : genreMatches.length > 0 
                  ? genreMatches.slice(0, 2).map(m => `${m.genre.icon} ${m.genre.name}`).join(' + ')
                  : genres.length > 0 ? genres.join(', ') : 'Mixed style'}
            </div>
          </div>
        </div>
        
        {/* Section Scores & Tags - Full width section */}
        {sectionScores.length > 0 && (
          <div className="mb-8 bg-board-surface border border-board-border rounded-xl overflow-hidden">
            <div className="p-3 border-b border-board-border flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-board-accent" />
              <h3 className="text-sm font-semibold text-white">Section Scores & Tags</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-x divide-y divide-board-border">
              {sectionScores.map(score => {
                const catInfo = CATEGORY_INFO[score.category];
                const percentage = (score.totalScore / score.maxScore) * 100;
                return (
                  <div key={score.category} className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-white">{catInfo.displayName}</span>
                      <span className="font-mono text-sm text-white">
                        {score.totalScore}<span className="text-board-muted text-xs">/{score.maxScore}</span>
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="h-1.5 bg-board-dark rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: catInfo.color,
                        }}
                      />
                    </div>
                    
                    {/* Tag */}
                    <div 
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${catInfo.color}20`,
                        color: catInfo.color,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catInfo.color }} />
                      {score.tag}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
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
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Genre Matches - shown in "Create Your Own" mode */}
            {isCreateYourOwnMode && board.slots.length > 0 && (
              <GenreMatchesSection matches={genreMatches} />
            )}
            
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
            
            {/* Power Supply Recommendations */}
            {board.slots.length > 0 && (
              <PowerSupplyRecommendations 
                pedalCount={board.slots.length}
                totalCurrentMa={totalCurrent}
              />
            )}
            
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

