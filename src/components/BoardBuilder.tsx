import { useState } from 'react';
import { Trash2, Share2, Download, GripVertical, X, ArrowLeft, Info, DollarSign, Zap, Box } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { CATEGORY_INFO } from '../data/categories';
import { formatInches } from '../utils/measurements';
import { Pedal } from '../types';

// Pedal colors based on category
const PEDAL_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  gain: { bg: '#f97316', accent: '#ea580c', text: '#000' },
  dynamics: { bg: '#3b82f6', accent: '#2563eb', text: '#fff' },
  filter: { bg: '#a1a1aa', accent: '#71717a', text: '#000' },
  eq: { bg: '#86efac', accent: '#4ade80', text: '#000' },
  modulation: { bg: '#a855f7', accent: '#9333ea', text: '#fff' },
  delay: { bg: '#06b6d4', accent: '#0891b2', text: '#fff' },
  reverb: { bg: '#92400e', accent: '#78350f', text: '#fff' },
  pitch: { bg: '#ec4899', accent: '#db2777', text: '#fff' },
  volume: { bg: '#6b7280', accent: '#4b5563', text: '#fff' },
  utility: { bg: '#f5f5f4', accent: '#e7e5e4', text: '#000' },
  amp: { bg: '#fbbf24', accent: '#f59e0b', text: '#000' },
  synth: { bg: '#8b5cf6', accent: '#7c3aed', text: '#fff' },
};

interface DragState {
  isDragging: boolean;
  dragIndex: number | null;
  dragOverIndex: number | null;
}

export function BoardBuilder() {
  const { state, dispatch } = useBoard();
  const { board } = state;
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragIndex: null,
    dragOverIndex: null,
  });
  const [selectedPedal, setSelectedPedal] = useState<Pedal | null>(null);
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDragState({ isDragging: true, dragIndex: index, dragOverIndex: null });
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragState.dragIndex !== index) {
      setDragState(prev => ({ ...prev, dragOverIndex: index }));
    }
  };
  
  const handleDragEnd = () => {
    if (dragState.dragIndex !== null && dragState.dragOverIndex !== null && dragState.dragIndex !== dragState.dragOverIndex) {
      const newSlots = [...board.slots];
      const [draggedItem] = newSlots.splice(dragState.dragIndex, 1);
      newSlots.splice(dragState.dragOverIndex, 0, draggedItem);
      dispatch({ type: 'LOAD_BOARD', board: { ...board, slots: newSlots } });
    }
    setDragState({ isDragging: false, dragIndex: null, dragOverIndex: null });
  };
  
  const handleRemovePedal = (pedalId: string) => {
    dispatch({ type: 'REMOVE_PEDAL', pedalId });
  };
  
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
  
  // Calculate pedal size based on count
  const getPedalSize = () => {
    const count = board.slots.length;
    if (count <= 5) return { width: 72, height: 100, fontSize: 9, brandSize: 6 };
    if (count <= 10) return { width: 64, height: 88, fontSize: 8, brandSize: 5 };
    if (count <= 15) return { width: 56, height: 76, fontSize: 7, brandSize: 5 };
    if (count <= 20) return { width: 48, height: 66, fontSize: 6, brandSize: 4 };
    return { width: 40, height: 56, fontSize: 5, brandSize: 4 };
  };
  
  // Split pedals into rows of 5, right to left, first row at bottom
  const getRows = () => {
    const pedalsPerRow = 5;
    const rows: typeof board.slots[] = [];
    
    for (let i = 0; i < board.slots.length; i += pedalsPerRow) {
      // Each row goes right to left, so reverse the slice
      const row = board.slots.slice(i, i + pedalsPerRow);
      rows.push([...row].reverse());
    }
    
    // Return rows in order - we'll use flex-col-reverse to put first row at bottom
    return rows;
  };
  
  // Get original index from visual position
  const getOriginalIndex = (rowIndex: number, indexInRow: number, _totalRows: number, rowLength: number) => {
    const pedalsPerRow = 5;
    // rowIndex is the actual row number (0 = first row with pedals 1-5)
    // Items in row are reversed for right-to-left display
    const actualIndexInRow = rowLength - 1 - indexInRow;
    return rowIndex * pedalsPerRow + actualIndexInRow;
  };
  
  if (board.slots.length === 0) {
    return (
      <div className="bg-board-surface border border-board-border rounded-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-board-accent/20 to-board-highlight/20 flex items-center justify-center">
          <span className="text-4xl">🎛️</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Your Board is Empty</h2>
        <p className="text-board-muted max-w-md mx-auto mb-6">
          Add pedals from the catalog - they'll automatically be placed in the correct signal chain order!
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-board-muted">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4" />
            <span>Drag to reorder</span>
          </div>
        </div>
      </div>
    );
  }
  
  const rows = getRows();
  const pedalSize = getPedalSize();
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-board-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={board.name}
            onChange={(e) => dispatch({ type: 'SET_BOARD_NAME', name: e.target.value })}
            className="text-base font-semibold text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-board-accent/50 rounded px-1 -ml-1"
          />
          <span className="text-xs text-board-muted">
            {board.slots.length} pedal{board.slots.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleExport}
            className="p-1.5 rounded-lg bg-board-elevated text-board-muted hover:text-white transition-colors"
            title="Export Board"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => {}}
            className="p-1.5 rounded-lg bg-board-elevated text-board-muted hover:text-white transition-colors"
            title="Share Board"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearBoard}
            className="p-1.5 rounded-lg bg-board-danger/20 text-board-danger hover:bg-board-danger/30 transition-colors"
            title="Clear Board"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Visual Pedalboard */}
      <div className="p-4 bg-[#b8b8b8] relative">
        {/* Board surface */}
        <div className="bg-[#1a1a1a] rounded-lg p-3 relative">
          {/* Output arrow (left side) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 flex items-center z-10">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
            <span className="text-[8px] text-zinc-500 ml-0.5">AMP</span>
          </div>
          
          {/* Guitar input (right side) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 flex items-center z-10">
            <span className="text-[8px] text-zinc-500 mr-0.5">IN</span>
            <span className="text-base">🎸</span>
          </div>
          
          {/* Rows of pedals - stacked bottom to top */}
          <div className="flex flex-col-reverse gap-2">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="relative">
                {/* Routing line for this row */}
                <svg 
                  className="absolute inset-0 pointer-events-none overflow-visible"
                  style={{ zIndex: 0 }}
                >
                  {/* Horizontal line through pedals */}
                  <line 
                    x1="0" 
                    y1="50%" 
                    x2="100%" 
                    y2="50%" 
                    stroke="#404040" 
                    strokeWidth="3"
                  />
                  
                  {/* Vertical connector to row above (drawn from this row going up) */}
                  {rowIndex < rows.length - 1 && (
                    <line 
                      x1="5%"
                      y1="0" 
                      x2="5%"
                      y2="50%" 
                      stroke="#404040" 
                      strokeWidth="3"
                    />
                  )}
                </svg>
                
                {/* Pedals - right to left */}
                <div className="flex justify-end gap-2 relative z-10">
                  {row.map((slot, indexInRow) => {
                    const originalIndex = getOriginalIndex(rowIndex, indexInRow, rows.length, row.length);
                    const colors = PEDAL_COLORS[slot.pedal.category] || { bg: '#6b7280', accent: '#4b5563', text: '#fff' };
                    const isDragging = dragState.dragIndex === originalIndex;
                    const isDragOver = dragState.dragOverIndex === originalIndex;
                    const displayName = slot.pedal.subtype || slot.pedal.model.split(' ')[0];
                    
                    const isSelected = selectedPedal?.id === slot.pedal.id;
                    
                    return (
                      <div
                        key={slot.pedal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, originalIndex)}
                        onDragOver={(e) => handleDragOver(e, originalIndex)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedPedal(isSelected ? null : slot.pedal)}
                        className={`relative group cursor-grab active:cursor-grabbing transition-all flex-shrink-0 ${
                          isDragging ? 'opacity-50 scale-95' : ''
                        } ${isDragOver ? 'scale-110 ring-2 ring-white' : ''} ${
                          isSelected ? 'ring-2 ring-board-accent ring-offset-1 ring-offset-black' : ''
                        }`}
                        style={{ width: pedalSize.width, height: pedalSize.height }}
                      >
                        {/* Pedal body */}
                        <div 
                          className="w-full h-full rounded shadow-lg flex flex-col overflow-hidden"
                          style={{ backgroundColor: colors.bg }}
                        >
                          {/* Name label */}
                          <div 
                            className="flex-[0_0_38%] flex items-center justify-center px-0.5"
                            style={{ 
                              backgroundColor: slot.pedal.category === 'utility' ? '#1a1a1a' : 'white',
                            }}
                          >
                            <span 
                              className="font-bold text-center leading-tight line-clamp-2"
                              style={{ 
                                fontSize: pedalSize.fontSize,
                                color: slot.pedal.category === 'utility' ? 'white' : '#1a1a1a' 
                              }}
                            >
                              {displayName}
                            </span>
                          </div>
                          
                          {/* Knobs area */}
                          <div className="flex-1 flex items-center justify-center">
                            <div 
                              className="rounded bg-black/30 flex items-center justify-center"
                              style={{ 
                                width: pedalSize.width * 0.7, 
                                height: pedalSize.height * 0.18 
                              }}
                            >
                              <span 
                                className="text-white/50 font-mono"
                                style={{ fontSize: pedalSize.brandSize }}
                              >
                                {slot.pedal.brand.slice(0, 5).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          {/* Footswitch */}
                          <div className="flex justify-center pb-1">
                            <div 
                              className="rounded-full bg-black/40"
                              style={{ width: pedalSize.width * 0.35, height: pedalSize.height * 0.06 }}
                            />
                          </div>
                        </div>
                        
                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePedal(slot.pedal.id);
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow z-20"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                        
                        {/* Order number */}
                        <div 
                          className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-zinc-700 rounded-full flex items-center justify-center"
                          style={{ width: 14, height: 14, fontSize: 8 }}
                        >
                          <span className="text-white font-bold">{originalIndex + 1}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Dimensions label */}
          <div className="absolute bottom-1 right-1 text-[8px] text-zinc-600 font-mono">
            {formatInches(board.constraints.maxWidthMm)}" × {formatInches(board.constraints.maxDepthMm)}"
          </div>
        </div>
        
        {/* Signal flow label */}
        <div className="mt-2 text-center">
          <span className="text-[10px] text-zinc-600 bg-zinc-300/50 px-2 py-0.5 rounded-full">
            Signal: Guitar (right) → Pedals → Amp (left)
          </span>
        </div>
      </div>
      
      {/* Selected Pedal Info Panel */}
      {selectedPedal && (
        <div className="p-4 border-t border-board-border bg-board-elevated">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs text-board-muted">{selectedPedal.brand}</div>
              <h3 className="text-lg font-semibold text-white">{selectedPedal.model}</h3>
            </div>
            <button 
              onClick={() => setSelectedPedal(null)}
              className="p-1 rounded hover:bg-board-surface transition-colors"
            >
              <X className="w-4 h-4 text-board-muted" />
            </button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <div className="p-2 rounded-lg bg-board-surface">
              <div className="flex items-center gap-1 text-board-muted text-xs mb-1">
                <DollarSign className="w-3 h-3" />
                <span>Price</span>
              </div>
              <div className="text-white font-medium">${selectedPedal.reverbPrice}</div>
            </div>
            <div className="p-2 rounded-lg bg-board-surface">
              <div className="flex items-center gap-1 text-board-muted text-xs mb-1">
                <Zap className="w-3 h-3" />
                <span>Power</span>
              </div>
              <div className="text-white font-medium">{selectedPedal.currentMa}mA</div>
            </div>
            <div className="p-2 rounded-lg bg-board-surface">
              <div className="flex items-center gap-1 text-board-muted text-xs mb-1">
                <Box className="w-3 h-3" />
                <span>Size</span>
              </div>
              <div className="text-white font-medium text-xs">
                {formatInches(selectedPedal.widthMm)}" × {formatInches(selectedPedal.depthMm)}"
              </div>
            </div>
            <div className="p-2 rounded-lg bg-board-surface">
              <div className="flex items-center gap-1 text-board-muted text-xs mb-1">
                <Info className="w-3 h-3" />
                <span>Rating</span>
              </div>
              <div className="text-white font-medium">{selectedPedal.categoryRating}/10</div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span 
              className="px-2 py-1 text-xs rounded-full"
              style={{ 
                backgroundColor: `${CATEGORY_INFO[selectedPedal.category]?.color || '#666'}20`,
                color: CATEGORY_INFO[selectedPedal.category]?.color || '#666'
              }}
            >
              {CATEGORY_INFO[selectedPedal.category]?.displayName || selectedPedal.category}
            </span>
            {selectedPedal.subtype && (
              <span className="px-2 py-1 text-xs rounded-full bg-board-surface text-board-muted">
                {selectedPedal.subtype}
              </span>
            )}
            <span className="px-2 py-1 text-xs rounded-full bg-board-surface text-board-muted">
              {selectedPedal.bypassType === 'true' ? 'True Bypass' : selectedPedal.bypassType === 'buffered' ? 'Buffered' : 'Selectable Bypass'}
            </span>
            <span className="px-2 py-1 text-xs rounded-full bg-board-surface text-board-muted">
              {selectedPedal.signal === 'mono' ? 'Mono' : 'Stereo'}
            </span>
            {selectedPedal.circuitType && (
              <span className="px-2 py-1 text-xs rounded-full bg-board-surface text-board-muted capitalize">
                {selectedPedal.circuitType}
              </span>
            )}
            {selectedPedal.topJacks && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                Top Jacks
              </span>
            )}
          </div>
          
          {/* Description if available */}
          {selectedPedal.description && (
            <p className="mt-3 text-sm text-board-muted">
              {selectedPedal.description}
            </p>
          )}
        </div>
      )}
      
      {/* Compact Signal Chain List */}
      <div className="p-3 border-t border-board-border">
        <div className="flex flex-wrap items-center gap-1 text-[10px]">
          <span className="text-board-muted">Chain:</span>
          {board.slots.map((slot, index) => {
            const colors = PEDAL_COLORS[slot.pedal.category];
            return (
              <span key={slot.pedal.id} className="flex items-center gap-0.5">
                <span 
                  className="px-1.5 py-0.5 rounded font-medium"
                  style={{ backgroundColor: `${colors?.bg || '#666'}30`, color: colors?.bg || '#666' }}
                >
                  {slot.pedal.model}
                </span>
                {index < board.slots.length - 1 && <span className="text-board-muted">→</span>}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
