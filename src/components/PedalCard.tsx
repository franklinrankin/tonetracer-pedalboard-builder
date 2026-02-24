import { Plus, Minus, Check } from 'lucide-react';
import { PedalWithStatus, Pedal } from '../types';
import { CATEGORY_INFO } from '../data/categories';
import { useBoard } from '../context/BoardContext';
import { PedalImage } from './PedalImage';
import { getYouTubeReviewUrl } from '../utils/youtube';
import { getReverbSearchUrl } from '../utils/reverb';

interface PedalCardProps {
  pedal: PedalWithStatus;
  isOnBoard?: boolean;
  compact?: boolean;
  showAsEnabled?: boolean; // Force card to show as enabled (for Pedal Index)
  hideActions?: boolean; // Hide Add/Remove buttons (for Pedal Index)
}

export function PedalCard({ pedal, isOnBoard = false, compact = false, showAsEnabled = false, hideActions = false }: PedalCardProps) {
  const { dispatch } = useBoard();
  const categoryInfo = CATEGORY_INFO[pedal.category];
  
  const handleAdd = () => {
    dispatch({ type: 'ADD_PEDAL', pedal: pedal as Pedal });
  };
  
  const handleRemove = () => {
    dispatch({ type: 'REMOVE_PEDAL', pedalId: pedal.id });
  };
  
  // Compact list view
  if (compact) {
    return (
      <div 
        className={`group relative flex items-center gap-3 p-3 bg-theme-surface transition-all ${
          isOnBoard ? 'bg-green-100' : 'hover:bg-yellow-50'
        }`}
        style={{ border: '3px solid var(--color-board-border)' }}
      >
        <div 
          className="w-12 h-12 flex-shrink-0 overflow-hidden bg-gray-100"
          style={{ border: '2px solid var(--color-board-border)' }}
        >
          <PedalImage pedalId={pedal.id} category={pedal.category} size="sm" className="w-full h-full" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-theme truncate">{pedal.model}</span>
            {isOnBoard && (
              <span 
                className="px-1.5 py-0.5 text-[10px] font-black text-theme bg-green-200 dark:bg-green-900/50"
                style={{ border: '2px solid var(--color-board-border)' }}
              >
                ON BOARD
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-theme-muted font-bold">
            <span>{pedal.brand}</span>
            <span>•</span>
            <span className="text-green-600 font-black">${pedal.reverbPrice}</span>
          </div>
        </div>
        
        {!hideActions && (
          isOnBoard ? (
            <button
              onClick={handleRemove}
              className="px-3 py-1.5 bg-red-500 text-white font-black text-xs uppercase hover:bg-red-600 transition-colors"
              style={{ border: '2px solid var(--color-board-border)' }}
            >
              Remove
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 bg-black text-white font-black text-xs uppercase hover:bg-gray-800 transition-colors"
              style={{ border: '2px solid var(--color-board-border)' }}
            >
              Add
            </button>
          )
        )}
      </div>
    );
  }
  
  const isDisabled = !showAsEnabled && !pedal.fits && !isOnBoard;
  
  // Trading Card Style
  return (
    <div 
      className={`group text-left transition-all ${
        isOnBoard
          ? ''
          : isDisabled
            ? 'opacity-60'
            : 'hover:-translate-y-1 hover:rotate-1'
      }`}
    >
      {/* Card Frame */}
      <div 
        className="relative p-1.5 sm:p-2"
        style={{
          backgroundColor: isOnBoard ? '#A5D6A7' : isDisabled ? '#E0E0E0' : categoryInfo?.color ? `${categoryInfo.color}40` : '#FFF9C4',
          border: '4px solid black',
          boxShadow: isOnBoard ? '5px 5px 0px black' : '4px 4px 0px black',
        }}
      >
        {/* Category Badge */}
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wide z-10 bg-theme-surface text-theme"
          style={{
            border: '2px solid var(--color-board-border)',
            whiteSpace: 'nowrap',
          }}
        >
          {pedal.subtype || pedal.category}
        </div>
        
        {/* Inner Card (white area) */}
        <div 
          className="bg-theme-surface p-1.5 sm:p-2"
          style={{ border: '3px solid var(--color-board-border)' }}
        >
          {/* Image Container */}
          <div 
            className={`aspect-square mb-2 overflow-hidden bg-gray-100 ${isDisabled ? 'grayscale' : ''}`}
            style={{ border: '2px solid var(--color-board-border)' }}
          >
            <PedalImage pedalId={pedal.id} category={pedal.category} size="lg" className="w-full h-full" />
          </div>
          
          {/* Name Section */}
          <div className="text-center mb-2">
            <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wide truncate">{pedal.brand}</p>
            <p className="text-[11px] sm:text-xs font-black text-black truncate leading-tight">{pedal.model}</p>
          </div>
          
          {/* Stats Bar */}
          <div 
            className="flex items-center justify-between px-1.5 py-1 mb-2"
            style={{ 
              backgroundColor: isDisabled ? '#e5e7eb' : `${categoryInfo?.color}15`,
              border: '2px solid var(--color-board-border)',
            }}
          >
            <span className={`text-[10px] sm:text-xs font-black text-green-600`}>
              ${pedal.reverbPrice}
            </span>
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className="text-[8px] sm:text-[10px]"
                    style={{ color: i < Math.round(pedal.categoryRating / 2) ? categoryInfo?.color : '#d1d5db' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Action Links */}
          <div className="flex gap-1 mb-2">
            <a
              href={getYouTubeReviewUrl(pedal.brand, pedal.model)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1 py-1 text-[9px] font-bold text-red-500 hover:bg-red-50 transition-colors"
              style={{ border: '2px solid var(--color-board-border)' }}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Review
            </a>
            <a
              href={getReverbSearchUrl(pedal.brand, pedal.model)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1 py-1 text-[9px] font-bold text-orange-600 hover:bg-orange-50 transition-colors"
              style={{ border: '2px solid var(--color-board-border)' }}
            >
              Buy
            </a>
          </div>
          
          {/* Action button */}
          {!hideActions && (
            isOnBoard ? (
              <button
                onClick={handleRemove}
                className="w-full py-1.5 bg-red-500 text-white font-black text-[10px] sm:text-xs uppercase hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                style={{ border: '2px solid var(--color-board-border)' }}
              >
                <Minus className="w-3 h-3" />
                Remove
              </button>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isDisabled}
                className={`w-full py-1.5 font-black text-[10px] sm:text-xs uppercase flex items-center justify-center gap-1 transition-colors ${
                  isDisabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
                style={{ border: '2px solid var(--color-board-border)' }}
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            )
          )}
        </div>
        
        {/* Selected Overlay */}
        {isOnBoard && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="bg-green-200 px-2 py-1 rotate-[-8deg]"
              style={{ border: '3px solid var(--color-board-border)', boxShadow: '2px 2px 0px black' }}
            >
              <div className="flex items-center gap-1 text-white">
                <Check className="w-4 h-4" strokeWidth={3} />
                <span className="text-xs font-black uppercase">On Board</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

