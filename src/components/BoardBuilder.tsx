import { useState, useRef } from 'react';
import { Trash2, Share2, Download, GripVertical, X, Guitar } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { CATEGORY_INFO } from '../data/categories';
import { BoardSlot } from '../types';
import { formatInches } from '../utils/measurements';

// Pedal colors based on category (matching the image style)
const PEDAL_COLORS: Record<string, { bg: string; accent: string }> = {
  gain: { bg: '#f97316', accent: '#ea580c' },      // Orange
  dynamics: { bg: '#3b82f6', accent: '#2563eb' },  // Blue
  filter: { bg: '#a1a1aa', accent: '#71717a' },    // Gray
  eq: { bg: '#86efac', accent: '#4ade80' },        // Light green
  modulation: { bg: '#a855f7', accent: '#9333ea' }, // Purple
  delay: { bg: '#06b6d4', accent: '#0891b2' },     // Cyan
  reverb: { bg: '#92400e', accent: '#78350f' },    // Brown
  pitch: { bg: '#ec4899', accent: '#db2777' },     // Pink
  volume: { bg: '#6b7280', accent: '#4b5563' },    // Dark gray
  utility: { bg: '#f5f5f4', accent: '#e7e5e4' },   // White/light
  amp: { bg: '#fbbf24', accent: '#f59e0b' },       // Amber
  synth: { bg: '#8b5cf6', accent: '#7c3aed' },     // Violet
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
      // Reorder the pedals
      const newSlots = [...board.slots];
      const [draggedItem] = newSlots.splice(dragState.dragIndex, 1);
      newSlots.splice(dragState.dragOverIndex, 0, draggedItem);
      
      // Update board with new order
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
  
  // Split pedals into rows for snake routing
  const getRowsOfPedals = () => {
    const pedalsPerRow = 4;
    const rows: BoardSlot[][] = [];
    
    for (let i = 0; i < board.slots.length; i += pedalsPerRow) {
      const row = board.slots.slice(i, i + pedalsPerRow);
      // Reverse every other row for snake pattern
      if (rows.length % 2 === 1) {
        rows.push([...row].reverse());
      } else {
        rows.push(row);
      }
    }
    
    return rows;
  };
  
  // Get the actual index in the original slots array
  const getOriginalIndex = (rowIndex: number, indexInRow: number, rowLength: number) => {
    const pedalsPerRow = 4;
    const baseIndex = rowIndex * pedalsPerRow;
    
    // If it's an odd row, the visual order is reversed
    if (rowIndex % 2 === 1) {
      return baseIndex + (rowLength - 1 - indexInRow);
    }
    return baseIndex + indexInRow;
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
          Drag pedals to reorder your signal chain!
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
  
  const rows = getRowsOfPedals();
  
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
      
      {/* Visual Pedalboard with Routing */}
      <div className="p-6 bg-[#d4d4d4] relative">
        {/* Board dimensions label */}
        <div className="absolute top-2 left-2 text-xs text-zinc-600 font-mono">
          {formatInches(board.constraints.maxWidthMm)}" × {formatInches(board.constraints.maxDepthMm)}"
        </div>
        
        <div className="relative">
          {/* Rows of pedals with routing */}
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative">
              {/* Routing line for this row */}
              <svg 
                className="absolute inset-0 pointer-events-none z-0"
                style={{ 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  height: rowIndex === rows.length - 1 ? '100%' : '200%',
                }}
              >
                {/* Horizontal line through pedals */}
                <line 
                  x1="0" 
                  y1="50%" 
                  x2="100%" 
                  y2="50%" 
                  stroke="#1a1a1a" 
                  strokeWidth="4"
                />
                
                {/* Vertical connector to next row (if not last row) */}
                {rowIndex < rows.length - 1 && (
                  <line 
                    x1={rowIndex % 2 === 0 ? '100%' : '0%'} 
                    y1="50%" 
                    x2={rowIndex % 2 === 0 ? '100%' : '0%'} 
                    y2="150%" 
                    stroke="#1a1a1a" 
                    strokeWidth="4"
                  />
                )}
              </svg>
              
              {/* Input arrow (first row only) */}
              {rowIndex === rows.length - 1 && (
                <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 flex items-center z-10">
                  <div className="w-12 h-1 bg-[#1a1a1a]" />
                  <Guitar className="w-12 h-12 text-[#8b4513] drop-shadow-lg" />
                </div>
              )}
              
              {/* Output arrow (first row only, left side) */}
              {rowIndex === 0 && (
                <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 flex items-center z-10">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[15px] border-r-[#1a1a1a]" />
                  <div className="w-6 h-1 bg-[#1a1a1a]" />
                </div>
              )}
              
              {/* Pedals in this row */}
              <div className={`flex gap-4 py-4 relative z-10 ${rowIndex % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                {row.map((slot, indexInRow) => {
                  const originalIndex = getOriginalIndex(rowIndex, indexInRow, row.length);
                  const colors = PEDAL_COLORS[slot.pedal.category] || { bg: '#6b7280', accent: '#4b5563' };
                  const isDragging = dragState.dragIndex === originalIndex;
                  const isDragOver = dragState.dragOverIndex === originalIndex;
                  
                  // Get display name - use subtype or short model name
                  const displayName = slot.pedal.subtype || slot.pedal.model.split(' ').slice(0, 2).join(' ');
                  
                  return (
                    <div
                      key={slot.pedal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, originalIndex)}
                      onDragOver={(e) => handleDragOver(e, originalIndex)}
                      onDragEnd={handleDragEnd}
                      className={`relative group cursor-grab active:cursor-grabbing transition-all ${
                        isDragging ? 'opacity-50 scale-95' : ''
                      } ${isDragOver ? 'scale-110' : ''}`}
                    >
                      {/* Pedal body */}
                      <div 
                        className="relative w-24 h-32 rounded-lg shadow-lg transition-transform hover:scale-105"
                        style={{ backgroundColor: colors.bg }}
                      >
                        {/* Top section with name */}
                        <div 
                          className="absolute top-0 left-0 right-0 h-12 rounded-t-lg flex items-center justify-center px-2"
                          style={{ backgroundColor: slot.pedal.category === 'utility' ? '#1a1a1a' : 'white' }}
                        >
                          <span 
                            className="text-xs font-bold text-center leading-tight"
                            style={{ color: slot.pedal.category === 'utility' ? 'white' : '#1a1a1a' }}
                          >
                            {displayName}
                          </span>
                        </div>
                        
                        {/* Middle section - knobs area */}
                        <div className="absolute top-14 left-2 right-2 h-8 rounded bg-black/30 flex items-center justify-center">
                          <span className="text-[8px] text-white/60 font-mono tracking-wider">
                            {slot.pedal.brand.toUpperCase().slice(0, 6)}
                          </span>
                        </div>
                        
                        {/* Footswitch */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full bg-black/40" />
                        
                        {/* Jack indicators */}
                        <div className="absolute bottom-0 left-2 w-2 h-4 rounded-t" style={{ backgroundColor: colors.accent }} />
                        <div className="absolute bottom-0 right-2 w-2 h-4 rounded-t" style={{ backgroundColor: colors.accent }} />
                        
                        {/* Remove button (on hover) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePedal(slot.pedal.id);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg z-20"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        
                        {/* Drag handle indicator */}
                        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-50 transition-opacity">
                          <GripVertical className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      
                      {/* Order number */}
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-600">
                        {originalIndex + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Signal flow label */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          <span className="px-3 py-1 bg-zinc-300 rounded-full">
            🎸 Guitar → Pedals → 🔊 Amp
          </span>
        </div>
      </div>
      
      {/* Pedal list (compact) */}
      <div className="p-4 border-t border-board-border">
        <h3 className="text-sm font-medium text-board-muted mb-2">Signal Chain Order</h3>
        <div className="flex flex-wrap gap-2">
          {board.slots.map((slot, index) => {
            const colors = PEDAL_COLORS[slot.pedal.category] || { bg: '#6b7280', accent: '#4b5563' };
            return (
              <div 
                key={slot.pedal.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                style={{ backgroundColor: `${colors.bg}30`, color: colors.bg }}
              >
                <span className="font-bold text-zinc-500">{index + 1}.</span>
                <span className="font-medium">{slot.pedal.model}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
