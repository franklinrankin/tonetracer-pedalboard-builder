import { Plus, Minus, AlertCircle, Zap, ArrowUpDown, DollarSign } from 'lucide-react';
import { PedalWithStatus, Pedal } from '../types';
import { CATEGORY_INFO, getRatingLabel } from '../data/categories';
import { useBoard } from '../context/BoardContext';
import { formatInches } from '../utils/measurements';

interface PedalCardProps {
  pedal: PedalWithStatus;
  isOnBoard?: boolean;
  compact?: boolean;
}

export function PedalCard({ pedal, isOnBoard = false, compact = false }: PedalCardProps) {
  const { dispatch } = useBoard();
  const categoryInfo = CATEGORY_INFO[pedal.category];
  const ratingLabel = getRatingLabel(pedal.category, pedal.categoryRating);
  
  const handleAdd = () => {
    dispatch({ type: 'ADD_PEDAL', pedal: pedal as Pedal });
  };
  
  const handleRemove = () => {
    dispatch({ type: 'REMOVE_PEDAL', pedalId: pedal.id });
  };
  
  if (compact) {
    return (
      <div 
        className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all ${
          isOnBoard 
            ? 'bg-board-elevated border-board-accent/30' 
            : 'bg-board-surface border-board-border hover:border-board-accent/30'
        }`}
      >
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${categoryInfo.color}20` }}
        >
          <span className="text-sm font-bold" style={{ color: categoryInfo.color }}>
            {pedal.categoryRating}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{pedal.model}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-board-muted">
            <span>{pedal.brand}</span>
            <span>•</span>
            <span>${pedal.reverbPrice}</span>
          </div>
        </div>
        
        <button
          onClick={handleRemove}
          className="w-8 h-8 rounded-full bg-board-danger/20 text-board-danger flex items-center justify-center hover:bg-board-danger/30 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    );
  }
  
  const isDisabled = !pedal.fits && !isOnBoard;
  
  return (
    <div 
      className={`pedal-card group relative rounded-xl border overflow-hidden ${
        isDisabled 
          ? 'disabled border-board-border bg-board-surface/50' 
          : isOnBoard
            ? 'border-board-accent bg-board-elevated glow-accent'
            : 'border-board-border bg-board-surface hover:border-board-accent/50'
      }`}
    >
      {/* Category color bar */}
      <div 
        className="h-1"
        style={{ backgroundColor: categoryInfo.color }}
      />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-xs text-board-muted mb-0.5">{pedal.brand}</div>
            <h3 className={`font-semibold ${isDisabled ? 'text-zinc-500' : 'text-white'}`}>
              {pedal.model}
            </h3>
          </div>
          
          {/* Rating badge */}
          <div 
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ backgroundColor: `${categoryInfo.color}20` }}
          >
            <span 
              className="text-lg font-bold"
              style={{ color: isDisabled ? '#6b7280' : categoryInfo.color }}
            >
              {pedal.categoryRating}
            </span>
          </div>
        </div>
        
        {/* Category & Rating Label */}
        <div className="flex items-center gap-2 mb-3">
          <span 
            className="px-2 py-0.5 text-xs rounded-full"
            style={{ 
              backgroundColor: `${categoryInfo.color}20`,
              color: isDisabled ? '#6b7280' : categoryInfo.color,
            }}
          >
            {categoryInfo.displayName}
          </span>
          <span className="text-xs text-board-muted">{ratingLabel}</span>
        </div>
        
        {/* Specs */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div className="flex items-center gap-1 text-board-muted">
            <DollarSign className="w-3 h-3" />
            <span>${pedal.reverbPrice}</span>
          </div>
          <div className="flex items-center gap-1 text-board-muted">
            <ArrowUpDown className="w-3 h-3" />
            <span>{formatInches(pedal.widthMm)}"×{formatInches(pedal.depthMm)}"</span>
          </div>
          <div className="flex items-center gap-1 text-board-muted">
            <Zap className="w-3 h-3" />
            <span>{pedal.currentMa}mA</span>
          </div>
        </div>
        
        {/* Description */}
        {pedal.description && (
          <p className={`text-xs mb-3 line-clamp-2 ${isDisabled ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {pedal.description}
          </p>
        )}
        
        {/* Disqualification reasons */}
        {isDisabled && pedal.reasons.length > 0 && (
          <div className="mb-3 space-y-1">
            {pedal.reasons.map((reason, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-board-danger">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{reason.message}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Additional info tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {pedal.topJacks && (
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-board-elevated text-board-muted">
              Top Jacks
            </span>
          )}
          {pedal.signal === 'stereo' && (
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-board-elevated text-board-muted">
              Stereo
            </span>
          )}
          {pedal.buffered && (
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-board-elevated text-board-muted">
              Buffered
            </span>
          )}
        </div>
        
        {/* Action button */}
        {isOnBoard ? (
          <button
            onClick={handleRemove}
            className="w-full py-2 rounded-lg bg-board-danger/20 text-board-danger font-medium text-sm hover:bg-board-danger/30 transition-colors flex items-center justify-center gap-2"
          >
            <Minus className="w-4 h-4" />
            Remove from Board
          </button>
        ) : (
          <button
            onClick={handleAdd}
            disabled={isDisabled}
            className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
              isDisabled
                ? 'bg-board-border text-zinc-600 cursor-not-allowed'
                : 'bg-board-accent text-white hover:bg-board-accent-dim'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add to Board
          </button>
        )}
      </div>
    </div>
  );
}

