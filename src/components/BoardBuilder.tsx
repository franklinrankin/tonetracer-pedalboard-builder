import { Trash2, Share2, Download } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { PedalCard } from './PedalCard';
import { CATEGORY_INFO, CATEGORY_ORDER } from '../data/categories';
import { Category, PedalWithStatus } from '../types';

export function BoardBuilder() {
  const { state, dispatch } = useBoard();
  const { board, allPedals } = state;
  
  const onBoardIds = new Set(board.slots.map(s => s.pedal.id));
  
  // Group pedals by category
  const pedalsByCategory = CATEGORY_ORDER.reduce((acc, category) => {
    const pedals = board.slots
      .filter(s => s.pedal.category === category)
      .map(s => {
        const pedalWithStatus = allPedals.find(p => p.id === s.pedal.id);
        return pedalWithStatus || { ...s.pedal, fits: true, reasons: [] } as PedalWithStatus;
      });
    if (pedals.length > 0) {
      acc[category] = pedals;
    }
    return acc;
  }, {} as Record<Category, PedalWithStatus[]>);
  
  const handleClearBoard = () => {
    if (confirm('Are you sure you want to clear the entire board?')) {
      dispatch({ type: 'CLEAR_BOARD' });
    }
  };
  
  const handleExport = () => {
    const exportData = {
      name: board.name,
      constraints: board.constraints,
      pedals: board.slots.map(s => ({
        brand: s.pedal.brand,
        model: s.pedal.model,
        category: s.pedal.category,
      })),
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${board.name.replace(/\s+/g, '-').toLowerCase()}-board.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  if (board.slots.length === 0) {
    return (
      <div className="bg-board-surface border border-board-border rounded-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-board-accent/20 to-board-highlight/20 flex items-center justify-center">
          <span className="text-4xl">🎛️</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Your Board is Empty</h2>
        <p className="text-board-muted max-w-md mx-auto mb-6">
          Start building your dream pedalboard by adding pedals from the catalog below. 
          Set your constraints first to see which pedals fit your space and budget!
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-board-muted">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-board-success" />
            <span>Fits constraints</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-board-danger opacity-50" />
            <span>Doesn't fit</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-board-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={board.name}
            onChange={(e) => dispatch({ type: 'SET_BOARD_NAME', name: e.target.value })}
            className="text-lg font-semibold text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-board-accent/50 rounded px-2 -ml-2"
          />
          <span className="text-sm text-board-muted">
            {board.slots.length} pedal{board.slots.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="p-2 rounded-lg bg-board-elevated text-board-muted hover:text-white transition-colors"
            title="Export Board"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => {/* TODO: Share functionality */}}
            className="p-2 rounded-lg bg-board-elevated text-board-muted hover:text-white transition-colors"
            title="Share Board"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearBoard}
            className="p-2 rounded-lg bg-board-danger/20 text-board-danger hover:bg-board-danger/30 transition-colors"
            title="Clear Board"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Board visualization placeholder */}
      <div className="p-4 border-b border-board-border bg-board-dark/50">
        <div 
          className="relative mx-auto rounded-xl border-2 border-dashed border-board-border bg-gradient-to-br from-board-surface to-board-dark p-4"
          style={{
            maxWidth: `${Math.min(board.constraints.maxWidthMm / 2, 600)}px`,
            aspectRatio: `${board.constraints.maxWidthMm} / ${board.constraints.maxDepthMm}`,
          }}
        >
          <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] rounded-xl opacity-30" />
          
          <div className="relative flex flex-wrap gap-2 justify-center items-center h-full">
            {board.slots.map((slot, index) => (
              <div
                key={slot.pedal.id}
                className="relative group"
                style={{
                  width: `${Math.max(slot.pedal.widthMm / 8, 40)}px`,
                  height: `${Math.max(slot.pedal.depthMm / 8, 50)}px`,
                }}
              >
                <div 
                  className="w-full h-full rounded-lg border flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: `${CATEGORY_INFO[slot.pedal.category].color}30`,
                    borderColor: CATEGORY_INFO[slot.pedal.category].color,
                  }}
                  title={`${slot.pedal.brand} ${slot.pedal.model}`}
                >
                  <span className="text-[8px] font-bold text-white text-center px-1 leading-tight">
                    {slot.pedal.model.split(' ')[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="absolute bottom-2 right-2 text-[10px] text-board-muted font-mono">
            {board.constraints.maxWidthMm}×{board.constraints.maxDepthMm}mm
          </div>
        </div>
      </div>
      
      {/* Pedals by section */}
      <div className="divide-y divide-board-border">
        {Object.entries(pedalsByCategory).map(([category, pedals]) => {
          const info = CATEGORY_INFO[category as Category];
          
          return (
            <div key={category} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                <h3 className="font-medium text-white">{info.displayName}</h3>
                <span className="text-xs text-board-muted">
                  ({pedals.length} pedal{pedals.length !== 1 ? 's' : ''})
                </span>
              </div>
              
              <div className="space-y-2">
                {pedals.map(pedal => (
                  <PedalCard
                    key={pedal.id}
                    pedal={pedal}
                    isOnBoard={true}
                    compact={true}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

