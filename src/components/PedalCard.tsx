import { Plus, Minus, AlertCircle, Zap, ArrowUpDown, DollarSign } from 'lucide-react';
import { PedalWithStatus, Pedal } from '../types';
import { CATEGORY_INFO, getRatingLabel } from '../data/categories';
import { useBoard } from '../context/BoardContext';
import { formatInches } from '../utils/measurements';
import { PedalImage } from './PedalImage';
import { getYouTubeReviewUrl } from '../utils/youtube';

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
        <PedalImage pedalId={pedal.id} category={pedal.category} size="sm" />
        
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
        <div className="flex items-start gap-3 mb-3">
          <PedalImage 
            pedalId={pedal.id}
            category={pedal.category} 
            size="lg" 
            className={isDisabled ? 'opacity-50' : ''}
          />
          
          <div className="flex-1 min-w-0">
            <div className="text-xs text-board-muted mb-0.5">{pedal.brand}</div>
            <h3 className={`font-semibold ${isDisabled ? 'text-zinc-500' : 'text-white'}`}>
              {pedal.model}
            </h3>
            {/* Rating badge */}
            <div 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded mt-1"
              style={{ backgroundColor: `${categoryInfo.color}20` }}
            >
              <span 
                className="text-sm font-bold"
                style={{ color: isDisabled ? '#6b7280' : categoryInfo.color }}
              >
                {pedal.categoryRating}/10
              </span>
            </div>
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
        
        {/* Watch Review Link */}
        <a
          href={getYouTubeReviewUrl(pedal.brand, pedal.model)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors mb-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Watch review
        </a>
        
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

