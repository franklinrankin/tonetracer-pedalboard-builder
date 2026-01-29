import { useState, useMemo } from 'react';
import { ListChecks, Download, Share2, DollarSign, Square, Zap, Music, Sparkles, ArrowRight, Settings2, Battery, Check, ChevronDown, ChevronUp, Target, LayoutGrid, GripVertical, ArrowUp, ArrowDown, Save, ShoppingBag } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import { getGenreById, getTopGenreMatches, GenreMatch } from '../data/genres';
import { CATEGORY_INFO } from '../data/categories';
import { formatInches, formatArea } from '../utils/measurements';
import { BoardRecommendations } from '../components/BoardRecommendations';
import { recommendPowerSupply, PowerSupply } from '../data/powerSupplies';
import { BoardVisualizer } from '../components/BoardVisualizer';
import { GenreIcon } from '../components/GenreIcon';
import { SavedBoard } from '../types';
import { generateUUID } from '../utils/uuid';
import { getReverbSearchUrl } from '../utils/reverb';

// Genre Matches Component - shown when user didn't pre-select genres
function GenreMatchesSection({ matches }: { matches: GenreMatch[] }) {
  const [expanded, setExpanded] = useState(false);
  
  if (matches.length === 0) {
    return (
      <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_0_#000]">
        <h2 className="text-lg font-extrabold text-black uppercase mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Genre Match
        </h2>
        <p className="text-sm text-gray-600 font-medium">
          Add more pedals to see genre matches!
        </p>
      </div>
    );
  }
  
  const topMatch = matches[0];
  
  return (
    <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_0_#000]">
      <h2 className="text-lg font-extrabold text-black uppercase mb-3 flex items-center gap-2">
        <Target className="w-5 h-5 text-purple-600" />
        Your Board's Genre DNA
      </h2>
      
      <p className="text-sm text-gray-600 font-medium mb-4">
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
            <GenreIcon genre={topMatch.genre} size="lg" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${topMatch.genre.color}30`, color: topMatch.genre.color }}
                >
                  #1 MATCH
                </span>
              </div>
              <h3 className="font-extrabold text-black text-lg">{topMatch.genre.name}</h3>
            </div>
          </div>
          <div className="text-right">
            <div 
              className="text-2xl font-extrabold"
              style={{ color: topMatch.genre.color }}
            >
              {Math.round(topMatch.fitPercent)}%
            </div>
            <div className="text-xs text-gray-600 font-medium">fit</div>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 mb-3">{topMatch.summary}</p>
        
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
              <span className="text-gray-600">{reason.reason}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Other Matches */}
      {matches.length > 1 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-black font-medium transition-colors"
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
                      <GenreIcon genre={match.genre} size="md" />
                      <span className="font-bold text-black">{match.genre.name}</span>
                      <span className="text-xs text-gray-500 font-medium">#{index + 2}</span>
                    </div>
                    <span 
                      className="text-sm font-bold"
                      style={{ color: match.genre.color }}
                    >
                      {Math.round(match.fitPercent)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{match.summary}</p>
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
      <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_0_#000]">
        <h2 className="text-lg font-extrabold text-black uppercase mb-2 flex items-center gap-2">
          <Battery className="w-5 h-5 text-yellow-600" />
          Power Supply
        </h2>
        <p className="text-sm text-gray-600 font-medium">
          No matching power supplies found. You may need a high-capacity or multi-unit setup.
        </p>
      </div>
    );
  }
  
  const topPick = recommendations[0];
  const headroomMa = Math.ceil(totalCurrentMa * 1.2);
  
  return (
    <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_0_#000]">
      <h2 className="text-lg font-extrabold text-black uppercase mb-3 flex items-center gap-2">
        <Battery className="w-5 h-5 text-yellow-600" />
        Recommended Power Supply
      </h2>
      
      {/* Requirements */}
      <div className="flex gap-4 mb-4 text-xs text-gray-600">
        <div>
          <span className="text-black font-bold">{pedalCount}</span> pedals
        </div>
        <div>
          <span className="text-black font-bold">{totalCurrentMa}mA</span> draw
        </div>
        <div>
          <span className="text-yellow-600 font-bold">{headroomMa}mA</span> w/ headroom
        </div>
      </div>
      
      {/* Top Pick */}
      <div className="p-4 bg-yellow-100 border-2 border-yellow-500 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 bg-yellow-400 text-black border border-black">
                TOP PICK
              </span>
              {topPick.isolated && (
                <span className="text-xs px-2 py-0.5 bg-green-300 text-black border border-black font-medium">
                  Isolated
                </span>
              )}
            </div>
            <h3 className="font-bold text-black">{topPick.brand} {topPick.model}</h3>
          </div>
          <div className="text-right">
            <div className="text-lg font-extrabold text-black">${topPick.reverbPrice}</div>
            <div className="text-xs text-gray-600">used avg</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-gray-600 text-xs font-medium">Outputs</div>
            <div className="text-black font-bold">{topPick.totalOutputs}</div>
          </div>
          <div>
            <div className="text-gray-600 text-xs font-medium">Total Power</div>
            <div className="text-black font-bold">{topPick.totalMa}mA</div>
          </div>
          <div>
            <div className="text-gray-600 text-xs font-medium">Size</div>
            <div className="text-black font-bold">{topPick.widthIn}" × {topPick.depthIn}"</div>
          </div>
        </div>
        
        {topPick.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {topPick.features.slice(0, 3).map(feature => (
              <span key={feature} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border border-black font-medium">
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
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-black font-medium transition-colors"
          >
            {expanded ? 'Hide alternatives' : `Show ${recommendations.length - 1} more options`}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded && (
            <div className="space-y-2 mt-2">
              {recommendations.slice(1).map((ps, index) => (
                <div key={ps.id} className="p-3 bg-gray-50 border-2 border-black">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 font-medium mr-2">#{index + 2}</span>
                      <span className="font-bold text-black">{ps.brand} {ps.model}</span>
                      {ps.isolated && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-300 text-black border border-black font-medium">
                          Isolated
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-black">${ps.reverbPrice}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-600 font-medium">
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

interface ReviewPageProps {
  onSaveBoard?: (board: SavedBoard) => void;
  savedBoards?: SavedBoard[];
  currentSavedBoardId?: string | null;
  onSignInClick?: () => void;
}

export function ReviewPage({ onSaveBoard, savedBoards = [], currentSavedBoardId, onSignInClick }: ReviewPageProps) {
  const { state, dispatch } = useBoard();
  const { user } = useAuth();
  const { board, totalCost, totalArea, totalCurrent, sectionScores, genres, selectedGenres } = state;
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState(board.name || 'My Pedalboard');
  
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
        score: s.totalScore,
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
    const shareText = `Check out my pedalboard! ${board.slots.length} pedals, $${totalCost} total. Built with Boardsie.`;
    
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
    <div className="min-h-full p-6 lg:p-12" style={{ backgroundColor: '#FFFEF0' }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <div 
          className="inline-flex items-center justify-center w-16 h-16 bg-board-success mb-6"
          style={{ border: '4px solid black' }}
        >
          <ListChecks className="w-8 h-8 text-white" />
        </div>
        <h1 
          className="text-4xl font-black text-black mb-4 uppercase"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Your Board is Ready!
        </h1>
        <p className="text-lg text-black max-w-2xl mx-auto font-bold">
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
            <span className="text-sm text-gray-600 font-bold self-center">Built for:</span>
            {selectedGenreObjects.map((genre) => (
              <div 
                key={genre!.id}
                className="flex items-center gap-2 px-4 py-2 border-2 border-black shadow-[3px_3px_0_0_#000]"
                style={{ 
                  backgroundColor: `${genre!.color}20`,
                }}
              >
                <GenreIcon genre={genre!} size="md" />
                <span 
                  className="font-bold text-lg"
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
                className="flex items-center gap-3 px-5 py-3 border-2 border-black shadow-[4px_4px_0_0_#000]"
                style={{ 
                  backgroundColor: `${match.genre.color}20`,
                }}
              >
                <GenreIcon genre={match.genre} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-bold px-1.5 py-0.5 border border-black"
                      style={{ backgroundColor: `${match.genre.color}40`, color: '#000' }}
                    >
                      #{index + 1}
                    </span>
                    <span className="font-bold text-black">{match.genre.name}</span>
                  </div>
                  <div 
                    className="text-lg font-extrabold"
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
            className={`px-6 py-3 font-bold uppercase transition-all flex items-center gap-2 border-3 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 ${
              showRecommendations
                ? 'bg-teal-400 text-black'
                : 'bg-white text-black'
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
        
        {/* Board Layout - Interactive */}
        {board.slots.length > 0 && (
          <div 
            className="mb-8 bg-white overflow-hidden"
            style={{ border: '4px solid black', boxShadow: '8px 8px 0px black' }}
          >
            <div 
              className="p-3 flex items-center gap-2 bg-black text-white"
            >
              <LayoutGrid className="w-4 h-4" />
              <h3 className="text-sm font-black uppercase">Board Layout</h3>
              <span className="text-xs opacity-60">Drag to arrange • Click for details</span>
              <span className="text-xs opacity-60 ml-auto">
                {formatInches(board.constraints.maxWidthMm)}" × {formatInches(board.constraints.maxDepthMm)}"
              </span>
            </div>
            <BoardVisualizer />
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div 
            className="bg-green-100 p-5"
            style={{ border: '4px solid black', boxShadow: '6px 6px 0px black' }}
          >
            <div className="flex items-center gap-2 text-black mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">Total Cost</span>
            </div>
            <div className="text-3xl font-black text-black">${totalCost}</div>
            <div className="mt-2 h-3 bg-white overflow-hidden" style={{ border: '2px solid black' }}>
              <div 
                className={`h-full transition-all ${budgetPercent > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-black/70 mt-1 font-bold">
              {budgetPercent.toFixed(0)}% of ${board.constraints.maxBudget}
            </div>
          </div>
          
          <div 
            className="bg-blue-100 p-5"
            style={{ border: '4px solid black', boxShadow: '6px 6px 0px black' }}
          >
            <div className="flex items-center gap-2 text-black mb-2">
              <Square className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">Space Used</span>
            </div>
            <div className="text-3xl font-black text-black">{formatArea(totalArea)}</div>
            <div className="mt-2 h-3 bg-white overflow-hidden" style={{ border: '2px solid black' }}>
              <div 
                className={`h-full transition-all ${areaPercent > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(areaPercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-black/70 mt-1 font-bold">
              {areaPercent.toFixed(0)}% of {formatArea(maxArea)} sq in
            </div>
          </div>
          
          <div 
            className="bg-yellow-100 p-5"
            style={{ border: '4px solid black', boxShadow: '6px 6px 0px black' }}
          >
            <div className="flex items-center gap-2 text-black mb-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">Power Draw</span>
            </div>
            <div className="text-3xl font-black text-black">{totalCurrent}mA</div>
            {board.constraints.maxCurrentMa && (
              <>
                <div className="mt-2 h-3 bg-white overflow-hidden" style={{ border: '2px solid black' }}>
                  <div 
                    className={`h-full transition-all ${powerPercent > 100 ? 'bg-red-500' : 'bg-yellow-500'}`}
                    style={{ width: `${Math.min(powerPercent, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-black/70 mt-1 font-bold">
                  {powerPercent.toFixed(0)}% of {board.constraints.maxCurrentMa}mA
                </div>
              </>
            )}
          </div>
          
          <div 
            className="bg-purple-100 p-5"
            style={{ border: '4px solid black', boxShadow: '6px 6px 0px black' }}
          >
            <div className="flex items-center gap-2 text-black mb-2">
              <Music className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">Pedals</span>
            </div>
            <div className="text-3xl font-black text-black">{board.slots.length}</div>
            <div className="text-xs text-black/70 mt-3 font-bold">
              {selectedGenreObjects.length > 0 
                ? selectedGenreObjects.map(g => g!.name).join(' + ')
                : genreMatches.length > 0 
                  ? genreMatches.slice(0, 2).map(m => m.genre.name).join(' + ')
                  : genres.length > 0 ? genres.join(', ') : 'Mixed style'}
            </div>
          </div>
        </div>
        
        {/* Section Scores & Tags - Full width section */}
        {/* Achievement Badges */}
        {sectionScores.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-10 h-10 bg-board-highlight flex items-center justify-center font-black text-black"
                style={{ border: '3px solid black' }}
              >
                A+
              </div>
              <div>
                <h3 className="text-lg font-black text-black uppercase">Your Achievements</h3>
                <p className="text-xs text-black font-bold">Badges earned based on your pedal choices</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {sectionScores.map(score => {
                const catInfo = CATEGORY_INFO[score.category];
                const percentage = (score.totalScore / score.maxScore) * 100;
                const isHighScore = percentage >= 100;
                return (
                  <div 
                    key={score.category} 
                    className="relative p-4 text-center transition-all hover:-translate-y-1"
                    style={{
                      backgroundColor: isHighScore ? catInfo.color : `${catInfo.color}25`,
                      border: '3px solid black',
                      boxShadow: isHighScore ? '5px 5px 0px black' : '3px 3px 0px black',
                    }}
                  >
                    {isHighScore && (
                      <div 
                        className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 flex items-center justify-center text-xs font-black text-black"
                        style={{ border: '2px solid black' }}
                      >
                        MAX
                      </div>
                    )}
                    
                    {/* Category Name */}
                    <div 
                      className="px-3 py-2 mx-auto mb-2 flex items-center justify-center text-xs font-black text-black bg-white uppercase"
                      style={{ border: '2px solid black' }}
                    >
                      {catInfo.displayName}
                    </div>
                    
                    {/* Tag/Title */}
                    <div 
                      className="font-black text-sm mb-1 capitalize"
                      style={{ color: isHighScore ? 'white' : 'black', textShadow: isHighScore ? '1px 1px 0px black' : 'none' }}
                    >
                      "{score.tag}"
                    </div>
                    
                    {/* Score */}
                    <div className="flex items-center justify-center gap-1">
                      <div 
                        className="text-lg font-black"
                        style={{ color: isHighScore ? 'white' : 'black' }}
                      >
                        {score.totalScore}
                      </div>
                      <div 
                        className="text-xs font-bold"
                        style={{ color: isHighScore ? 'rgba(255,255,255,0.8)' : 'black' }}
                      >
                        /{score.maxScore}
                      </div>
                    </div>
                    
                    {/* Mini progress bar */}
                    <div className="h-2 bg-white overflow-hidden mt-2" style={{ border: '2px solid black' }}>
                      <div 
                        className="h-full transition-all"
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: isHighScore ? 'white' : catInfo.color,
                        }}
                      />
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
          <div className="lg:col-span-2 bg-white border-4 border-black overflow-hidden shadow-[6px_6px_0_0_#000]">
            <div className="p-4 border-b-4 border-black bg-black flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-white uppercase">Your Pedals</h2>
              <span className="text-xs text-white/70 font-medium">Reorder with arrows</span>
            </div>
            <div>
              {board.slots.map((slot, index) => {
                const catInfo = CATEGORY_INFO[slot.pedal.category];
                return (
                  <div 
                    key={slot.pedal.id} 
                    className="p-4 flex items-center gap-3 group transition-colors"
                    style={{ 
                      backgroundColor: `${catInfo.color}15`,
                      borderBottom: index < board.slots.length - 1 ? '3px solid black' : 'none',
                    }}
                  >
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => dispatch({ type: 'MOVE_PEDAL', fromIndex: index, toIndex: index - 1 })}
                        disabled={index === 0}
                        className={`p-1 transition-colors ${
                          index === 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-black hover:bg-white'
                        }`}
                        style={{ border: index === 0 ? 'none' : '2px solid black' }}
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'MOVE_PEDAL', fromIndex: index, toIndex: index + 1 })}
                        disabled={index === board.slots.length - 1}
                        className={`p-1 transition-colors ${
                          index === board.slots.length - 1 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-black hover:bg-white'
                        }`}
                        style={{ border: index === board.slots.length - 1 ? 'none' : '2px solid black' }}
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div 
                      className="w-10 h-10 flex items-center justify-center text-sm font-black text-white"
                      style={{ backgroundColor: catInfo.color, border: '2px solid black' }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-black">{slot.pedal.model}</div>
                      <div className="text-sm font-bold text-black">{slot.pedal.brand}</div>
                    </div>
                    <div 
                      className="px-3 py-1.5 text-xs font-black uppercase"
                      style={{ backgroundColor: catInfo.color, color: 'white', border: '2px solid black' }}
                    >
                      {catInfo.displayName}
                    </div>
                    <div className="text-right">
                      <div className="font-black text-black">${slot.pedal.reverbPrice}</div>
                      <div className="text-xs font-bold text-black">
                        {formatInches(slot.pedal.widthMm)}" × {formatInches(slot.pedal.depthMm)}"
                      </div>
                    </div>
                    <a
                      href={getReverbSearchUrl(slot.pedal.brand, slot.pedal.model)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-1.5 bg-orange-500 text-white text-xs font-black uppercase hover:bg-orange-600 transition-colors"
                      style={{ border: '2px solid black' }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                      Buy
                    </a>
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
            <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_0_#000]">
              <h2 className="text-lg font-extrabold text-black uppercase mb-4">Signal Chain</h2>
              <div className="space-y-2">
                {board.slots.map((slot, index) => {
                  const catInfo = CATEGORY_INFO[slot.pedal.category];
                  return (
                    <div key={slot.pedal.id} className="flex items-center gap-2">
                      <div 
                        className="w-7 h-7 flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                        style={{ backgroundColor: catInfo.color, border: '2px solid black' }}
                      >
                        {index + 1}
                      </div>
                      <div 
                        className="flex-1 px-3 py-2 text-sm font-bold text-black"
                        style={{ backgroundColor: `${catInfo.color}20`, border: '2px solid black' }}
                      >
                        {slot.pedal.model}
                      </div>
                      {index < board.slots.length - 1 && (
                        <ArrowDown className="w-4 h-4 text-black flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-black mt-4 font-bold uppercase">
                Suggested order — feel free to experiment!
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
              {/* Save Board Button */}
              {user ? (
                <button
                  onClick={() => {
                    if (currentSavedBoardId && onSaveBoard) {
                      // Direct update without modal
                      const existingBoard = savedBoards.find(b => b.id === currentSavedBoardId);
                      const savedBoard: SavedBoard = {
                        id: currentSavedBoardId,
                        name: existingBoard?.name || board.name || 'My Pedalboard',
                        board: { ...board },
                        genres: selectedGenres.length > 0 
                          ? selectedGenreObjects.map(g => g!.name)
                          : [],
                        createdAt: existingBoard?.createdAt || new Date(),
                        updatedAt: new Date(),
                      };
                      onSaveBoard(savedBoard);
                    } else {
                      setShowSaveModal(true);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-400 text-black font-bold uppercase border-3 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  <Save className="w-5 h-5" />
                  {currentSavedBoardId ? 'Update Saved Board' : 'Save Board'}
                </button>
              ) : (
                <button
                  onClick={onSignInClick}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-200 text-black font-bold uppercase border-3 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  <Save className="w-5 h-5" />
                  Sign in to Save
                </button>
              )}
              
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-400 text-black font-bold uppercase border-3 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              >
                <Download className="w-5 h-5" />
                Export Board
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black font-bold uppercase border-3 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Board Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-md w-full shadow-[8px_8px_0_0_#000]">
            <div className="p-4 bg-green-400 border-b-4 border-black">
              <h2 className="text-xl font-extrabold text-black uppercase">
                {currentSavedBoardId ? 'Update Board' : 'Save Board'}
              </h2>
            </div>
            
            <div className="p-6">
              {currentSavedBoardId && (
                <div className="mb-4 p-3 bg-yellow-200 border-2 border-black">
                  <p className="text-sm text-black font-medium">
                    This will overwrite your existing saved board.
                  </p>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-black uppercase mb-2">Board Name</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="My Pedalboard"
                  className="w-full px-4 py-3 bg-white border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:bg-yellow-50 transition-colors"
                />
              </div>
              
              <div className="mb-6 text-sm text-gray-600 font-medium">
                <div className="flex items-center gap-2 mb-1">
                  <Music className="w-4 h-4" />
                  {selectedGenres.length > 0 
                    ? selectedGenreObjects.map(g => g!.name).join(' / ')
                    : 'Created Board'}
                </div>
                <div>{board.slots.length} pedals • ${totalCost}</div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-3 bg-white text-black font-bold uppercase border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onSaveBoard && saveName.trim()) {
                      const savedBoard: SavedBoard = {
                        id: currentSavedBoardId || generateUUID(),
                        name: saveName.trim(),
                        board: { ...board },
                        genres: selectedGenres.length > 0 
                          ? selectedGenreObjects.map(g => g!.name)
                          : [],
                        createdAt: currentSavedBoardId 
                          ? (savedBoards.find(b => b.id === currentSavedBoardId)?.createdAt || new Date())
                          : new Date(),
                        updatedAt: new Date(),
                      };
                      onSaveBoard(savedBoard);
                      setShowSaveModal(false);
                    }
                  }}
                  disabled={!saveName.trim()}
                  className="flex-1 py-3 bg-green-400 text-black font-bold uppercase border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentSavedBoardId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

