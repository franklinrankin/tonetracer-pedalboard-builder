import { useState } from 'react';
import { Trash2, Share2, Download, GripVertical, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { CATEGORY_INFO } from '../data/categories';
import { formatInches } from '../utils/measurements';
import { getSignalChainSection } from '../utils/signalChain';

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
            onClick={() => {}}
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
      
      {/* Visual Pedalboard - Horizontal Line */}
      <div className="p-6 bg-[#c4c4c4] relative overflow-x-auto">
        {/* Board frame */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 min-w-max">
          {/* Signal flow indicator */}
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-lg">🎸</span>
              <span>Guitar In</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ChevronRight className="w-4 h-4" />
              <span>To Amp</span>
              <span className="text-lg">🔊</span>
            </div>
          </div>
          
          {/* Pedals in one horizontal line */}
          <div className="flex items-center gap-1">
            {/* Input cable */}
            <div className="flex items-center">
              <div className="w-8 h-1 bg-zinc-600 rounded-full" />
              <div className="w-3 h-3 bg-zinc-500 rounded-full border-2 border-zinc-400" />
            </div>
            
            {/* Pedals */}
            {board.slots.map((slot, index) => {
              const colors = PEDAL_COLORS[slot.pedal.category] || { bg: '#6b7280', accent: '#4b5563', text: '#fff' };
              const isDragging = dragState.dragIndex === index;
              const isDragOver = dragState.dragOverIndex === index;
              const displayName = slot.pedal.subtype || slot.pedal.model.split(' ')[0];
              const section = getSignalChainSection(slot.pedal);
              
              return (
                <div key={slot.pedal.id} className="flex items-center">
                  {/* Cable between pedals */}
                  <div className="w-4 h-1 bg-zinc-600" />
                  
                  {/* Pedal */}
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group cursor-grab active:cursor-grabbing transition-all ${
                      isDragging ? 'opacity-50 scale-95' : ''
                    } ${isDragOver ? 'scale-105 ring-2 ring-white' : ''}`}
                  >
                    {/* Pedal body */}
                    <div 
                      className="relative w-20 h-28 rounded-lg shadow-lg flex flex-col overflow-hidden"
                      style={{ backgroundColor: colors.bg }}
                    >
                      {/* Name label */}
                      <div 
                        className="h-10 flex items-center justify-center px-1"
                        style={{ 
                          backgroundColor: slot.pedal.category === 'utility' ? '#1a1a1a' : 'white',
                        }}
                      >
                        <span 
                          className="text-[10px] font-bold text-center leading-tight line-clamp-2"
                          style={{ color: slot.pedal.category === 'utility' ? 'white' : '#1a1a1a' }}
                        >
                          {displayName}
                        </span>
                      </div>
                      
                      {/* Knobs area */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-12 h-6 rounded bg-black/30 flex items-center justify-center">
                          <span className="text-[6px] text-white/50 font-mono">
                            {slot.pedal.brand.slice(0, 5).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Footswitch */}
                      <div className="flex justify-center pb-2">
                        <div className="w-6 h-2 rounded-full bg-black/40" />
                      </div>
                      
                      {/* Jacks */}
                      <div className="absolute bottom-0 left-1 w-2 h-3 rounded-t" style={{ backgroundColor: colors.accent }} />
                      <div className="absolute bottom-0 right-1 w-2 h-3 rounded-t" style={{ backgroundColor: colors.accent }} />
                      
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePedal(slot.pedal.id);
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg z-20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      
                      {/* Drag handle */}
                      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-60 transition-opacity">
                        <GripVertical className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    {/* Order number & section */}
                    <div className="absolute -bottom-5 left-0 right-0 text-center">
                      <span className="text-[9px] font-bold text-zinc-500">{index + 1}</span>
                    </div>
                  </div>
                  
                  {/* Cable after pedal */}
                  <div className="w-4 h-1 bg-zinc-600" />
                </div>
              );
            })}
            
            {/* Output cable */}
            <div className="flex items-center">
              <div className="w-3 h-3 bg-zinc-500 rounded-full border-2 border-zinc-400" />
              <div className="w-8 h-1 bg-zinc-600 rounded-full" />
            </div>
          </div>
          
          {/* Section labels below */}
          <div className="flex items-center gap-1 mt-6 px-12">
            {board.slots.map((slot, index) => {
              const section = getSignalChainSection(slot.pedal);
              const prevSection = index > 0 ? getSignalChainSection(board.slots[index - 1].pedal) : null;
              const showLabel = section !== prevSection;
              
              return (
                <div key={slot.pedal.id} className="w-20 flex-shrink-0 mx-2">
                  {showLabel && (
                    <div className="text-[8px] text-zinc-500 text-center truncate">
                      {section}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Dimensions */}
        <div className="absolute top-2 right-2 text-xs text-zinc-600 font-mono bg-white/50 px-2 py-0.5 rounded">
          {formatInches(board.constraints.maxWidthMm)}" × {formatInches(board.constraints.maxDepthMm)}"
        </div>
      </div>
      
      {/* Signal Chain List */}
      <div className="p-4 border-t border-board-border">
        <h3 className="text-xs font-medium text-board-muted mb-2">Signal Chain</h3>
        <div className="flex flex-wrap gap-1">
          {board.slots.map((slot, index) => {
            const colors = PEDAL_COLORS[slot.pedal.category] || { bg: '#6b7280', accent: '#4b5563', text: '#fff' };
            return (
              <div 
                key={slot.pedal.id}
                className="flex items-center gap-1 text-xs"
              >
                <span 
                  className="px-2 py-0.5 rounded font-medium"
                  style={{ 
                    backgroundColor: `${colors.bg}30`, 
                    color: colors.bg,
                  }}
                >
                  {slot.pedal.model}
                </span>
                {index < board.slots.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-board-muted" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
