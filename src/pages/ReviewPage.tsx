import { useState, useMemo, useRef } from 'react';
import { ListChecks, Download, Share2, DollarSign, Square, Zap, Music, Sparkles, ArrowRight, Settings2, Battery, Check, ChevronDown, ChevronUp, Target, LayoutGrid, GripVertical, ArrowUp, ArrowDown, Save, ShoppingBag, Youtube } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getGenreById, getTopGenreMatches, GenreMatch } from '../data/genres';
import { CATEGORY_INFO } from '../data/categories';
import { getPlayersForSubtype } from '../data/pedalPlayers';
import { selectBoardForPedals, BoardSize } from '../data/boardSizes';
import { formatInches, formatArea } from '../utils/measurements';
import { BoardRecommendations } from '../components/BoardRecommendations';
import { recommendPowerSupply, PowerSupply, getBestPowerSupply } from '../data/powerSupplies';
import { BoardVisualizer } from '../components/BoardVisualizer';
import { GenreIcon } from '../components/GenreIcon';
import { SavedBoard } from '../types';
import { generateUUID } from '../utils/uuid';
import { getReverbSearchUrl } from '../utils/reverb';
import { generateShareUrl } from '../utils/shareBoard';
import jsPDF from 'jspdf';

// Genre Matches Component - shown when user didn't pre-select genres
function GenreMatchesSection({ matches }: { matches: GenreMatch[] }) {
  const [expanded, setExpanded] = useState(false);
  
  if (matches.length === 0) {
    return (
      <div className="brutal-card p-5">
        <h2 className="text-lg font-extrabold text-theme uppercase mb-2 flex items-center gap-2">
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
    <div className="brutal-card p-5">
      <h2 className="text-lg font-extrabold text-theme uppercase mb-3 flex items-center gap-2">
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
              <h3 className="font-extrabold text-theme text-lg">{topMatch.genre.name}</h3>
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
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-theme font-medium transition-colors"
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
                      <span className="font-bold text-theme">{match.genre.name}</span>
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
      <div className="brutal-card p-5">
        <h2 className="text-lg font-extrabold text-theme uppercase mb-2 flex items-center gap-2">
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
    <div className="brutal-card p-5">
      <h2 className="text-lg font-extrabold text-theme uppercase mb-3 flex items-center gap-2">
        <Battery className="w-5 h-5 text-yellow-600" />
        Recommended Power Supply
      </h2>
      
      {/* Requirements */}
      <div className="flex gap-4 mb-4 text-xs text-gray-600">
        <div>
          <span className="text-theme font-bold">{pedalCount}</span> pedals
        </div>
        <div>
          <span className="text-theme font-bold">{totalCurrentMa}mA</span> draw
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
            <h3 className="font-bold text-theme">{topPick.brand} {topPick.model}</h3>
          </div>
          <div className="text-right">
            <div className="text-lg font-extrabold text-theme">${topPick.reverbPrice}</div>
            <div className="text-xs text-gray-600">used avg</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-gray-600 text-xs font-medium">Outputs</div>
            <div className="text-theme font-bold">{topPick.totalOutputs}</div>
          </div>
          <div>
            <div className="text-gray-600 text-xs font-medium">Total Power</div>
            <div className="text-theme font-bold">{topPick.totalMa}mA</div>
          </div>
          <div>
            <div className="text-gray-600 text-xs font-medium">Size</div>
            <div className="text-theme font-bold">{topPick.widthIn}" × {topPick.depthIn}"</div>
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
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-theme font-medium transition-colors"
          >
            {expanded ? 'Hide alternatives' : `Show ${recommendations.length - 1} more options`}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded && (
            <div className="space-y-2 mt-2">
              {recommendations.slice(1).map((ps, index) => (
                <div key={ps.id} className="p-3 bg-gray-50 border-2 brutal-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 font-medium mr-2">#{index + 2}</span>
                      <span className="font-bold text-theme">{ps.brand} {ps.model}</span>
                      {ps.isolated && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-300 text-black border border-black font-medium">
                          Isolated
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-theme">${ps.reverbPrice}</span>
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
  readOnly?: boolean;
  communityUsername?: string;
}

export function ReviewPage({ onSaveBoard, savedBoards = [], currentSavedBoardId, onSignInClick, readOnly = false, communityUsername }: ReviewPageProps) {
  const { state, dispatch } = useBoard();
  const { user } = useAuth();
  const { board, totalCost, totalArea, totalCurrent, sectionScores, genres, selectedGenres, multiEffects } = state;
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState(board.name || 'My Pedalboard');
  const [selectedBoardOverride, setSelectedBoardOverride] = useState<{
    widthMm: number;
    depthMm: number;
    widthIn: number;
    depthIn: number;
    name: string;
    brand: string;
  } | null>(null);
  const [selectedPowerSupplyOverride, setSelectedPowerSupplyOverride] = useState<PowerSupply | null>(null);
  
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
  
  // Calculate recommended board size based on total pedal area
  const recommendedBoard = useMemo((): BoardSize | null => {
    if (board.slots.length === 0) return null;
    return selectBoardForPedals(totalArea);
  }, [board.slots.length, totalArea]);

  // Calculate recommended power supply based on pedal count and current draw
  const recommendedPowerSupply = useMemo((): PowerSupply | null => {
    if (board.slots.length === 0) return null;
    return getBestPowerSupply(board.slots.length, totalCurrent);
  }, [board.slots.length, totalCurrent]);
  
  // Calculate "Shades of" - top 3 players that represent this board's overall sound
  const shadesOfPlayers = useMemo(() => {
    if (board.slots.length === 0) return [];
    
    // Get genre name - either from selected genres or top match
    let genreName = 'Rock'; // default
    if (selectedGenres.length > 0) {
      const genre = getGenreById(selectedGenres[0]);
      if (genre) genreName = genre.name;
    } else if (genreMatches.length > 0) {
      genreName = genreMatches[0].genre.name;
    }
    
    // Collect all players from all subtypes on the board, counting frequency
    const playerCounts = new Map<string, number>();
    
    for (const slot of board.slots) {
      const subtype = slot.pedal.subtype;
      if (!subtype) continue;
      
      const players = getPlayersForSubtype(subtype, genreName, 5);
      for (const player of players) {
        playerCounts.set(player, (playerCounts.get(player) || 0) + 1);
      }
    }
    
    // Sort by frequency (players who match multiple pedal types rank higher)
    const sorted = Array.from(playerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
    
    return sorted.slice(0, 3);
  }, [board.slots, selectedGenres, genreMatches]);
  
  const handleExport = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;
    
    // Helper to add new page if needed
    const checkNewPage = (neededSpace: number) => {
      if (y + neededSpace > pageHeight - margin) {
        pdf.addPage();
        y = margin;
        return true;
      }
      return false;
    };
    
    // Helper to convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };
    
    // Title Section
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, 35, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(board.name || 'My Pedalboard', margin, 18);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Created with Boardsie • ${new Date().toLocaleDateString()}`, margin, 28);
    y = 45;
    
    // Genre info
    const genreText = selectedGenreObjects.length > 0 
      ? selectedGenreObjects.map(g => g!.name).join(' / ')
      : genreMatches.length > 0 
        ? genreMatches.slice(0, 3).map(m => `${m.genre.name} (${Math.round(m.fitPercent)}%)`).join(' / ')
        : 'Mixed Style';
    
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(11);
    pdf.text(`Style: ${genreText}`, margin, y);
    y += 12;
    
    // Stats Section
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BOARD STATS', margin, y);
    y += 8;
    
    const statsBoxWidth = (pageWidth - margin * 2 - 15) / 4;
    const statsBoxHeight = 25;
    
    // Stats boxes
    const stats = [
      { label: 'TOTAL COST', value: `$${totalCost}`, color: '#86efac', subtext: `${budgetPercent.toFixed(0)}% of budget` },
      { label: 'SPACE USED', value: formatArea(totalArea), color: '#93c5fd', subtext: `${areaPercent.toFixed(0)}% of board` },
      { label: 'POWER DRAW', value: `${totalCurrent}mA`, color: '#fde047', subtext: `${powerPercent.toFixed(0)}% capacity` },
      { label: 'PEDALS', value: `${board.slots.length}`, color: '#c4b5fd', subtext: 'total pedals' },
    ];
    
    stats.forEach((stat, i) => {
      const x = margin + i * (statsBoxWidth + 5);
      const rgb = hexToRgb(stat.color);
      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      pdf.rect(x, y, statsBoxWidth, statsBoxHeight, 'F');
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(x, y, statsBoxWidth, statsBoxHeight, 'S');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 3, y + 6);
      
      pdf.setFontSize(14);
      pdf.text(stat.value, x + 3, y + 15);
      
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.text(stat.subtext, x + 3, y + 21);
    });
    y += statsBoxHeight + 12;
    
    // Achievements Section
    if (sectionScores.length > 0) {
      checkNewPage(40);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ACHIEVEMENTS', margin, y);
      y += 8;
      
      const achievementWidth = (pageWidth - margin * 2 - 10) / 3;
      const achievementHeight = 18;
      
      sectionScores.forEach((score, i) => {
        const catInfo = CATEGORY_INFO[score.category];
        const x = margin + (i % 3) * (achievementWidth + 5);
        const rowY = y + Math.floor(i / 3) * (achievementHeight + 4);
        
        const percentage = (score.totalScore / score.maxScore) * 100;
        const isHighScore = percentage >= 100;
        const rgb = hexToRgb(catInfo.color);
        
        pdf.setFillColor(isHighScore ? rgb.r : Math.min(255, rgb.r + 180), 
                         isHighScore ? rgb.g : Math.min(255, rgb.g + 180), 
                         isHighScore ? rgb.b : Math.min(255, rgb.b + 180));
        pdf.rect(x, rowY, achievementWidth, achievementHeight, 'F');
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(x, rowY, achievementWidth, achievementHeight, 'S');
        
        pdf.setTextColor(isHighScore ? 255 : 0, isHighScore ? 255 : 0, isHighScore ? 255 : 0);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text(catInfo.displayName.toUpperCase(), x + 3, rowY + 6);
        
        pdf.setFontSize(9);
        pdf.text(score.tag, x + 3, rowY + 12);
        
        pdf.setFontSize(10);
        pdf.text(`${score.totalScore}/${score.maxScore}${isHighScore ? ' ★' : ''}`, x + achievementWidth - 18, rowY + 12);
      });
      
      y += Math.ceil(sectionScores.length / 3) * (achievementHeight + 4) + 10;
    }
    
    // Shades Of Section
    if (shadesOfPlayers.length > 0) {
      checkNewPage(30);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SHADES OF', margin, y);
      y += 8;
      
      pdf.setFillColor(245, 240, 230);
      pdf.rect(margin, y, 60, 25, 'F');
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(margin, y, 60, 25, 'S');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      shadesOfPlayers.forEach((player, i) => {
        pdf.text(player, margin + 5, y + 8 + i * 7);
      });
      y += 35;
    }
    
    // Pedal List Section
    checkNewPage(50);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('YOUR PEDALS', margin, y);
    y += 8;
    
    // Table header
    pdf.setFillColor(0, 0, 0);
    pdf.rect(margin, y, pageWidth - margin * 2, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('#', margin + 3, y + 5.5);
    pdf.text('PEDAL', margin + 12, y + 5.5);
    pdf.text('CATEGORY', margin + 85, y + 5.5);
    pdf.text('SIZE', margin + 125, y + 5.5);
    pdf.text('PRICE', margin + 155, y + 5.5);
    y += 10;
    
    // Pedal rows
    board.slots.forEach((slot, index) => {
      if (checkNewPage(12)) {
        // Re-draw header on new page
        pdf.setFillColor(0, 0, 0);
        pdf.rect(margin, y, pageWidth - margin * 2, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('#', margin + 3, y + 5.5);
        pdf.text('PEDAL', margin + 12, y + 5.5);
        pdf.text('CATEGORY', margin + 85, y + 5.5);
        pdf.text('SIZE', margin + 125, y + 5.5);
        pdf.text('PRICE', margin + 155, y + 5.5);
        y += 10;
      }
      
      const catInfo = CATEGORY_INFO[slot.pedal.category];
      const rgb = hexToRgb(catInfo.color);
      
      // Row background
      pdf.setFillColor(Math.min(255, rgb.r + 200), Math.min(255, rgb.g + 200), Math.min(255, rgb.b + 200));
      pdf.rect(margin, y, pageWidth - margin * 2, 10, 'F');
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.rect(margin, y, pageWidth - margin * 2, 10, 'S');
      
      // Number badge
      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      pdf.rect(margin + 2, y + 1.5, 7, 7, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}`, margin + 4, y + 6.5);
      
      // Pedal info
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(slot.pedal.model, margin + 12, y + 5);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(slot.pedal.brand, margin + 12, y + 9);
      
      // Category badge
      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      pdf.roundedRect(margin + 85, y + 2, 28, 6, 1, 1, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      const catText = catInfo.displayName.length > 10 ? catInfo.displayName.slice(0, 10) : catInfo.displayName;
      pdf.text(catText.toUpperCase(), margin + 87, y + 6);
      
      // Size
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.text(`${formatInches(slot.pedal.widthMm)}" × ${formatInches(slot.pedal.depthMm)}"`, margin + 125, y + 6);
      
      // Price
      pdf.setFont('helvetica', 'bold');
      pdf.text(`$${slot.pedal.reverbPrice}`, margin + 155, y + 6);
      
      y += 11;
    });
    
    y += 8;
    
    // Signal Chain Section
    checkNewPage(60);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SIGNAL CHAIN', margin, y);
    y += 8;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Guitar Input', margin + 5, y + 4);
    y += 6;
    
    board.slots.forEach((slot, index) => {
      const catInfo = CATEGORY_INFO[slot.pedal.category];
      const rgb = hexToRgb(catInfo.color);
      
      // Arrow
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(margin + 10, y, margin + 10, y + 4);
      pdf.line(margin + 8, y + 2, margin + 10, y + 4);
      pdf.line(margin + 12, y + 2, margin + 10, y + 4);
      y += 5;
      
      // Pedal box
      pdf.setFillColor(Math.min(255, rgb.r + 180), Math.min(255, rgb.g + 180), Math.min(255, rgb.b + 180));
      pdf.rect(margin, y, 80, 8, 'F');
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(margin, y, 80, 8, 'S');
      
      // Number
      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      pdf.rect(margin + 1, y + 1, 6, 6, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}`, margin + 3, y + 5.5);
      
      // Name
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(slot.pedal.model, margin + 10, y + 5.5);
      
      y += 9;
    });
    
    // Arrow to amp
    pdf.setDrawColor(0, 0, 0);
    pdf.line(margin + 10, y, margin + 10, y + 4);
    pdf.line(margin + 8, y + 2, margin + 10, y + 4);
    pdf.line(margin + 12, y + 2, margin + 10, y + 4);
    y += 6;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Amp Output', margin + 5, y + 4);
    
    // Footer
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text('Generated by Boardsie - boardsie.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Save PDF
    pdf.save(`${(board.name || 'my-pedalboard').replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };
  
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const handleShare = async () => {
    // Generate shareable URL with board data
    const url = generateShareUrl(board, selectedGenres);
    setShareUrl(url);
    
    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: board.name || 'My Pedalboard',
          text: `Check out my pedalboard! ${board.slots.length} pedals, $${totalCost} total.`,
          url: url,
        });
        return;
      } catch (e) {
        // User cancelled or share failed, fall back to modal
      }
    }
    
    // Show share modal with copyable link
    setShowShareModal(true);
  };
  
  const copyShareLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };
  
  // For "Create Your Own" mode, show top genre match in header
  const topGenreMatch = genreMatches.length > 0 ? genreMatches[0] : null;
  
  return (
    <div className="min-h-full p-6 lg:p-12 bg-theme-dark">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <div 
          className="inline-flex items-center justify-center w-16 h-16 bg-board-success mb-6"
          style={{ border: '4px solid black' }}
        >
          <ListChecks className="w-8 h-8 text-white" />
        </div>
        <h1 
          className="text-4xl font-black text-theme mb-4 uppercase"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          {communityUsername ? `Look at ${communityUsername}'s board!` : 'Your Board is Ready!'}
        </h1>
        <p className="text-lg text-theme max-w-2xl mx-auto font-bold">
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
                className="flex items-center gap-2 px-4 py-2 border-2 brutal-border brutal-shadow-sm"
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
                className="flex items-center gap-3 px-5 py-3 border-2 brutal-border brutal-shadow"
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
                    <span className="font-bold text-theme">{match.genre.name}</span>
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
      
      <div className="max-w-7xl mx-auto">
        {/* Adjust Setup Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className={`px-6 py-3 font-bold uppercase transition-all flex items-center gap-2 border-3 brutal-border brutal-shadow hover:brutal-shadow-lg hover:-translate-x-0.5 hover:-translate-y-0.5 ${
              showRecommendations
                ? 'bg-teal-400 text-black'
                : 'bg-theme-surface text-theme'
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
            className="mb-8 bg-theme-surface overflow-hidden"
            style={{ border: '4px solid black', boxShadow: '8px 8px 0px black' }}
          >
            <div 
              className="p-3 flex items-center gap-2 bg-black text-white"
            >
              <LayoutGrid className="w-4 h-4" />
              <h3 className="text-sm font-black uppercase">Board Layout</h3>
              <span className="text-xs opacity-60">Drag to arrange • Click for details</span>
            </div>
            <BoardVisualizer 
              overrideWidth={selectedBoardOverride?.widthMm ?? recommendedBoard?.widthMm}
              overrideDepth={selectedBoardOverride?.depthMm ?? recommendedBoard?.depthMm}
              boardName={selectedBoardOverride 
                ? `${selectedBoardOverride.brand} ${selectedBoardOverride.name}` 
                : recommendedBoard 
                  ? `${recommendedBoard.brand} ${recommendedBoard.name}` 
                  : undefined}
              boardDimensions={selectedBoardOverride 
                ? `${selectedBoardOverride.widthIn}" × ${selectedBoardOverride.depthIn}"` 
                : recommendedBoard 
                  ? `${recommendedBoard.widthIn}" × ${recommendedBoard.depthIn}"` 
                  : undefined}
              suggestedBoard={recommendedBoard}
              onBoardChange={(newBoard) => {
                if ('id' in newBoard) {
                  // It's a BoardSize from POPULAR_BOARDS
                  setSelectedBoardOverride({
                    widthMm: newBoard.widthMm,
                    depthMm: newBoard.depthMm,
                    widthIn: newBoard.widthIn,
                    depthIn: newBoard.depthIn,
                    name: newBoard.name,
                    brand: newBoard.brand,
                  });
                } else {
                  // It's a custom size
                  setSelectedBoardOverride({
                    widthMm: newBoard.widthMm,
                    depthMm: newBoard.depthMm,
                    widthIn: Math.round(newBoard.widthMm / 25.4 * 10) / 10,
                    depthIn: Math.round(newBoard.depthMm / 25.4 * 10) / 10,
                    name: newBoard.name,
                    brand: newBoard.brand,
                  });
                }
              }}
              suggestedPowerSupply={selectedPowerSupplyOverride || recommendedPowerSupply}
              pedalCount={board.slots.length}
              onPowerSupplyChange={(ps) => setSelectedPowerSupplyOverride(ps)}
            />
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div 
            className="bg-green-100 p-5"
            style={{ border: '4px solid black', boxShadow: '6px 6px 0px black' }}
          >
            <div className="flex items-center gap-2 text-theme mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">Total Cost</span>
            </div>
            <div className="text-3xl font-black text-theme">${totalCost}</div>
            <div className="mt-2 h-3 bg-theme-surface overflow-hidden" style={{ border: '2px solid black' }}>
              <div 
                className={`h-full transition-all ${budgetPercent > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-theme-muted mt-1 font-bold">
              {budgetPercent.toFixed(0)}% of ${board.constraints.maxBudget}
            </div>
          </div>
          
          <div 
            className="bg-blue-100 p-5"
            style={{ border: '4px solid black', boxShadow: '6px 6px 0px black' }}
          >
            <div className="flex items-center gap-2 text-theme mb-2">
              <Square className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">Space Used</span>
            </div>
            <div className="text-3xl font-black text-theme">{formatArea(totalArea)}</div>
            <div className="mt-2 h-3 bg-theme-surface overflow-hidden" style={{ border: '2px solid black' }}>
              <div 
                className={`h-full transition-all ${areaPercent > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(areaPercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-theme-muted mt-1 font-bold">
              {areaPercent.toFixed(0)}% of {formatArea(maxArea)} sq in
            </div>
          </div>
          
          <div 
            className="bg-yellow-100 p-5"
            style={{ border: '4px solid black', boxShadow: '6px 6px 0px black' }}
          >
            <div className="flex items-center gap-2 text-theme mb-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">Power Draw</span>
            </div>
            <div className="text-3xl font-black text-theme">{totalCurrent}mA</div>
            {board.constraints.maxCurrentMa && (
              <>
                <div className="mt-2 h-3 bg-theme-surface overflow-hidden" style={{ border: '2px solid black' }}>
                  <div 
                    className={`h-full transition-all ${powerPercent > 100 ? 'bg-red-500' : 'bg-yellow-500'}`}
                    style={{ width: `${Math.min(powerPercent, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-theme-muted mt-1 font-bold">
                  {powerPercent.toFixed(0)}% of {board.constraints.maxCurrentMa}mA
                </div>
              </>
            )}
          </div>
          
          <div 
            className="bg-purple-100 p-5"
            style={{ border: '4px solid black', boxShadow: '6px 6px 0px black' }}
          >
            <div className="flex items-center gap-2 text-theme mb-2">
              <Music className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">Pedals</span>
            </div>
            <div className="text-3xl font-black text-theme">{board.slots.length}</div>
            <div className="text-xs text-theme-muted mt-3 font-bold">
              {selectedGenreObjects.length > 0 
                ? selectedGenreObjects.map(g => g!.name).join(' + ')
                : genreMatches.length > 0 
                  ? genreMatches.slice(0, 2).map(m => m.genre.name).join(' + ')
                  : genres.length > 0 ? genres.join(', ') : 'Mixed style'}
            </div>
          </div>
        </div>
        
        {/* Achievement Badges & Shades Of - Side by side */}
        <div className="grid lg:grid-cols-[1fr_200px] gap-6 mb-8">
          {/* Achievement Badges - Compact */}
          {sectionScores.length > 0 && (
            <div className="brutal-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 bg-board-highlight flex items-center justify-center font-black text-theme text-sm"
                    style={{ border: '2px solid black' }}
                  >
                    A+
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-theme uppercase">Achievements</h3>
                  </div>
                </div>
                
                {/* Cyborg / Old School Badge */}
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 transition-all hover:-translate-y-0.5"
                  style={{
                    backgroundColor: multiEffects.pedalId ? '#06B6D4' : '#F59E0B',
                    border: '2px solid black',
                    boxShadow: '3px 3px 0px black',
                  }}
                >
                  <span className="font-black text-white text-xs uppercase" style={{ textShadow: '1px 1px 0px black' }}>
                    {multiEffects.pedalId ? 'Cyborg' : 'Old School'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sectionScores.map(score => {
                  const catInfo = CATEGORY_INFO[score.category];
                  const percentage = (score.totalScore / score.maxScore) * 100;
                  const isHighScore = percentage >= 100;
                  return (
                    <div 
                      key={score.category} 
                      className="relative p-2 text-center transition-all hover:-translate-y-0.5"
                      style={{
                        backgroundColor: isHighScore ? catInfo.color : `${catInfo.color}25`,
                        border: '2px solid black',
                        boxShadow: isHighScore ? '3px 3px 0px black' : '2px 2px 0px black',
                      }}
                    >
                      {isHighScore && (
                        <div 
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-400 flex items-center justify-center text-[8px] font-black text-theme"
                          style={{ border: '1.5px solid black' }}
                        >
                          MAX
                        </div>
                      )}
                      
                      {/* Category Name */}
                      <div 
                        className="px-2 py-1 mx-auto mb-1 text-xs font-black text-theme bg-theme-surface uppercase truncate"
                        style={{ border: '1.5px solid black' }}
                      >
                        {catInfo.displayName}
                      </div>
                      
                      {/* Tag/Title */}
                      <div 
                        className="font-black text-sm mb-1 capitalize truncate"
                        style={{ color: isHighScore ? 'white' : 'black', textShadow: isHighScore ? '1px 1px 0px black' : 'none' }}
                      >
                        "{score.tag}"
                      </div>
                      
                      {/* Score */}
                      <div className="flex items-center justify-center gap-0.5">
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
                      <div className="h-1.5 bg-theme-surface overflow-hidden mt-1" style={{ border: '1.5px solid black' }}>
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
          
          {/* Shades Of - Top 3 players this board sounds like */}
          {shadesOfPlayers.length > 0 && (
            <div className="brutal-card p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-8 h-8 bg-purple-400 flex items-center justify-center font-black text-theme text-sm"
                  style={{ border: '2px solid black' }}
                >
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-theme uppercase">Shades Of</h3>
                </div>
              </div>
              <div 
                className="p-4 h-full flex-1"
                style={{ 
                  backgroundColor: '#f5f0e6',
                  border: '3px solid black',
                }}
              >
                <div className="flex flex-col justify-evenly h-full min-h-[120px]">
                  {shadesOfPlayers.map((player, i) => (
                    <div 
                      key={player}
                      className="text-center text-lg font-black text-theme"
                    >
                      {player}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pedal List */}
          <div className="lg:col-span-2 brutal-card overflow-hidden">
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
                    className="p-3 md:p-4 transition-colors"
                    style={{ 
                      backgroundColor: `${catInfo.color}15`,
                      borderBottom: index < board.slots.length - 1 ? '3px solid black' : 'none',
                    }}
                  >
                    {/* Mobile: stacked layout, Desktop: row layout */}
                    <div className="flex items-start gap-2 md:gap-3">
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => dispatch({ type: 'MOVE_PEDAL', fromIndex: index, toIndex: index - 1 })}
                          disabled={index === 0}
                          className={`p-1 transition-colors ${
                            index === 0 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-theme hover:bg-theme-surface'
                          }`}
                          style={{ border: index === 0 ? 'none' : '2px solid black' }}
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </button>
                        <button
                          onClick={() => dispatch({ type: 'MOVE_PEDAL', fromIndex: index, toIndex: index + 1 })}
                          disabled={index === board.slots.length - 1}
                          className={`p-1 transition-colors ${
                            index === board.slots.length - 1 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-theme hover:bg-theme-surface'
                          }`}
                          style={{ border: index === board.slots.length - 1 ? 'none' : '2px solid black' }}
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </button>
                      </div>
                      
                      {/* Number badge */}
                      <div 
                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-xs md:text-sm font-black text-white flex-shrink-0"
                        style={{ backgroundColor: catInfo.color, border: '2px solid black' }}
                      >
                        {index + 1}
                      </div>
                      
                      {/* Content area - flexible layout */}
                      <div className="flex-1 min-w-0">
                        {/* Pedal name and brand */}
                        <div className="font-black text-theme text-sm md:text-base truncate">{slot.pedal.model}</div>
                        <div className="text-xs md:text-sm font-bold text-theme">{slot.pedal.brand}</div>
                        
                        {/* Mobile: category, price, buy in a row below */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <div 
                            className="px-2 py-1 text-[10px] md:text-xs font-black uppercase whitespace-nowrap"
                            style={{ backgroundColor: catInfo.color, color: 'white', border: '2px solid black' }}
                          >
                            {catInfo.displayName}
                          </div>
                          <div className="text-xs md:text-sm font-black text-theme">
                            ${slot.pedal.reverbPrice}
                          </div>
                          <div className="text-[10px] md:text-xs font-bold text-theme">
                            {formatInches(slot.pedal.widthMm)}" × {formatInches(slot.pedal.depthMm)}"
                          </div>
                          <div className="flex items-center gap-1 ml-auto">
                            <a
                              href={getReverbSearchUrl(slot.pedal.brand, slot.pedal.model)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center px-2 py-1 bg-orange-500 text-white text-[10px] md:text-xs font-black uppercase hover:bg-orange-600 transition-colors"
                              style={{ border: '2px solid black' }}
                            >
                              BUY
                            </a>
                            <a
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${slot.pedal.brand} ${slot.pedal.model} review`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center px-1.5 py-1 bg-red-600 text-white hover:bg-red-700 transition-colors"
                              style={{ border: '2px solid black' }}
                              title="Watch reviews on YouTube"
                            >
                              <Youtube className="w-3 h-3 md:w-4 md:h-4" />
                            </a>
                          </div>
                        </div>
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
            <div className="brutal-card p-5">
              <h2 className="text-lg font-extrabold text-theme uppercase mb-4">Signal Chain</h2>
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
                        className="flex-1 px-3 py-2 text-sm font-bold text-theme"
                        style={{ backgroundColor: `${catInfo.color}20`, border: '2px solid black' }}
                      >
                        {slot.pedal.model}
                      </div>
                      {index < board.slots.length - 1 && (
                        <ArrowDown className="w-4 h-4 text-theme flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-theme mt-4 font-bold uppercase">
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
            
            {/* Actions - hide in read-only mode */}
            {!readOnly && (
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
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-400 text-black font-bold uppercase border-3 brutal-border brutal-shadow hover:brutal-shadow-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    <Save className="w-5 h-5" />
                    {currentSavedBoardId ? 'Update Saved Board' : 'Save Board'}
                  </button>
                ) : (
                  <button
                    onClick={onSignInClick}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-200 text-black font-bold uppercase border-3 brutal-border brutal-shadow hover:brutal-shadow-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    <Save className="w-5 h-5" />
                    Sign in to Save
                  </button>
                )}
                
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-400 text-black font-bold uppercase border-3 brutal-border brutal-shadow hover:brutal-shadow-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Export Board
                </button>
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-theme-surface text-theme font-bold uppercase border-3 brutal-border brutal-shadow hover:brutal-shadow-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Save Board Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="brutal-card max-w-md w-full brutal-shadow-lg">
            <div className="p-4 bg-green-400 border-b-4 border-black">
              <h2 className="text-xl font-extrabold text-theme uppercase">
                {currentSavedBoardId ? 'Update Board' : 'Save Board'}
              </h2>
            </div>
            
            <div className="p-6">
              {currentSavedBoardId && (
                <div className="mb-4 p-3 bg-yellow-200 border-2 brutal-border">
                  <p className="text-sm text-theme font-medium">
                    This will overwrite your existing saved board.
                  </p>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-theme uppercase mb-2">Board Name</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="My Pedalboard"
                  className="w-full px-4 py-3 bg-theme-surface border-2 brutal-border text-theme placeholder-gray-400 focus:outline-none focus:bg-yellow-50 dark:focus:bg-yellow-900/20 transition-colors"
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
                  className="flex-1 py-3 bg-theme-surface text-theme font-bold uppercase border-2 brutal-border brutal-shadow-sm hover:brutal-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
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
                  className="flex-1 py-3 bg-green-400 text-black font-bold uppercase border-2 brutal-border brutal-shadow-sm hover:brutal-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentSavedBoardId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Share Board Modal */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="brutal-card max-w-lg w-full brutal-shadow-lg">
            <div className="p-4 bg-blue-400 border-b-4 border-black flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-theme uppercase flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Your Board
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 bg-theme-surface border-2 brutal-border flex items-center justify-center font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-black font-medium mb-4">
                Share this link with anyone to show them your exact board configuration with all pedal positions preserved!
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-theme uppercase mb-2">Shareable Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-2 brutal-border text-theme text-sm font-mono truncate"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-4 py-3 bg-blue-400 text-black font-bold uppercase border-2 brutal-border brutal-shadow-sm hover:brutal-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-100 border-2 brutal-border mb-4">
                <p className="text-xs text-theme font-medium">
                  <strong>What's included:</strong> Board name, all {board.slots.length} pedals, their positions & rotations, budget (${board.constraints.maxBudget}), and genre selections.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 py-3 bg-theme-surface text-theme font-bold uppercase border-2 brutal-border brutal-shadow-sm hover:brutal-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my pedalboard! ${board.slots.length} pedals, $${totalCost} total. Built with @Boardsie`)}&url=${encodeURIComponent(shareUrl)}`;
                    window.open(twitterUrl, '_blank');
                  }}
                  className="flex-1 py-3 bg-black text-white font-bold uppercase border-2 brutal-border shadow-[3px_3px_0_0_#333] hover:shadow-[4px_4px_0_0_#333] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  Share on X
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

