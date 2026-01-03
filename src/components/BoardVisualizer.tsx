import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { RotateCw, Move, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { BoardSlot } from '../types';
import { CATEGORY_INFO } from '../data/categories';

interface PedalPosition {
  id: string;
  x: number; // percentage of board width
  y: number; // percentage of board height
  rotation: 0 | 90 | 180 | 270;
}

// Signal flow colors - different color for each connection
const SIGNAL_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f43f5e', // rose
  '#14b8a6', // teal
];

export interface BoardVisualizerRef {
  captureSnapshot: () => Promise<string | null>;
}

export const BoardVisualizer = forwardRef<BoardVisualizerRef>(function BoardVisualizer(_, ref) {
  const { state } = useBoard();
  const { board } = state;
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [positions, setPositions] = useState<Map<string, PedalPosition>>(new Map());
  const [selectedPedal, setSelectedPedal] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [showPedalCard, setShowPedalCard] = useState<string | null>(null);

  // Board dimensions in mm
  const boardWidthMm = board.constraints.maxWidthMm;
  const boardDepthMm = board.constraints.maxDepthMm;
  
  // Calculate display scale (pixels per mm)
  const [displayScale, setDisplayScale] = useState(1);
  
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48; // padding
      const maxDisplayWidth = Math.min(containerWidth, 900);
      setDisplayScale(maxDisplayWidth / boardWidthMm);
    }
  }, [boardWidthMm]);

  // Expose capture function to parent
  useImperativeHandle(ref, () => ({
    captureSnapshot: async () => {
      if (!boardRef.current) return null;
      
      try {
        // Dynamically import html2canvas
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(boardRef.current, {
          backgroundColor: '#1a1a1a',
          scale: 2, // Higher quality
          logging: false,
        });
        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Failed to capture snapshot:', error);
        return null;
      }
    },
  }));

  // Initialize pedal positions in signal chain order (right to left, packed toward bottom)
  // Uses actual pedal dimensions to prevent overlaps
  useEffect(() => {
    const newPositions = new Map<string, PedalPosition>();
    const pedalCount = board.slots.length;
    
    if (pedalCount === 0) {
      setPositions(newPositions);
      return;
    }
    
    // Calculate pedal sizes as percentage of board
    const getPedalSizePercent = (slot: BoardSlot) => ({
      width: (slot.pedal.widthMm / boardWidthMm) * 100,
      height: (slot.pedal.depthMm / boardDepthMm) * 100,
    });
    
    // Gap between pedals (as percentage)
    const gapX = 2; // 2% horizontal gap
    const gapY = 3; // 3% vertical gap
    const marginX = 5; // 5% margin from edges
    const marginY = 8; // 8% margin from top/bottom
    
    // Calculate how many pedals fit per row
    const availableWidth = 100 - (2 * marginX);
    let currentRowPedals: { slot: BoardSlot; index: number; width: number; height: number }[] = [];
    const rows: typeof currentRowPedals[] = [];
    let currentRowWidth = 0;
    
    // Group pedals into rows based on actual widths
    board.slots.forEach((slot, index) => {
      const size = getPedalSizePercent(slot);
      const pedalWithGap = size.width + gapX;
      
      if (currentRowWidth + size.width > availableWidth && currentRowPedals.length > 0) {
        // Start new row
        rows.push([...currentRowPedals]);
        currentRowPedals = [];
        currentRowWidth = 0;
      }
      
      currentRowPedals.push({ slot, index, width: size.width, height: size.height });
      currentRowWidth += pedalWithGap;
    });
    
    // Don't forget the last row
    if (currentRowPedals.length > 0) {
      rows.push(currentRowPedals);
    }
    
    // Calculate max row height for each row
    const rowHeights = rows.map(row => 
      Math.max(...row.map(p => p.height)) + gapY
    );
    const totalHeight = rowHeights.reduce((sum, h) => sum + h, 0);
    
    // Position pedals row by row (first row at bottom)
    let currentY = 100 - marginY; // Start from bottom
    
    rows.forEach((row, rowIndex) => {
      const rowHeight = rowHeights[rowIndex];
      const rowWidth = row.reduce((sum, p) => sum + p.width + gapX, -gapX); // Total width minus last gap
      
      // Center row position, pedals go right to left
      let currentX = 100 - marginX - (availableWidth - rowWidth) / 2;
      
      // Position Y at bottom of row (pedal centers)
      const y = currentY - rowHeight / 2;
      
      row.forEach((pedal) => {
        const x = currentX - pedal.width / 2;
        
        if (!positions.has(pedal.slot.pedal.id)) {
          newPositions.set(pedal.slot.pedal.id, {
            id: pedal.slot.pedal.id,
            x: Math.max(marginX, Math.min(100 - marginX, x)),
            y: Math.max(marginY, Math.min(100 - marginY, y)),
            rotation: 0,
          });
        } else {
          newPositions.set(pedal.slot.pedal.id, positions.get(pedal.slot.pedal.id)!);
        }
        
        currentX -= pedal.width + gapX;
      });
      
      currentY -= rowHeight;
    });
    
    setPositions(newPositions);
  }, [board.slots.length, boardWidthMm, boardDepthMm]);

  // Get jack positions based on rotation (right-to-left flow: input on right, output on left)
  const getJackPositions = (
    slot: BoardSlot,
    pos: PedalPosition,
    scale: number
  ): { input: { x: number; y: number }; output: { x: number; y: number } } => {
    const pedalW = slot.pedal.widthMm * scale;
    const pedalH = slot.pedal.depthMm * scale;
    const boardW = boardWidthMm * scale;
    const boardH = boardDepthMm * scale;
    
    // Calculate pedal center position
    const centerX = (pos.x / 100) * boardW;
    const centerY = (pos.y / 100) * boardH;
    
    // Determine if pedal has top jacks
    const hasTopJacks = slot.pedal.topJacks;
    
    // Jack offset from center (percentage of pedal dimension)
    const jackOffset = 0.4;
    
    let inputX: number, inputY: number, outputX: number, outputY: number;
    
    if (hasTopJacks) {
      // Top-mounted jacks (input on right, output on left for right-to-left flow)
      switch (pos.rotation) {
        case 0:
          inputX = centerX + pedalW * jackOffset;  // Input on right
          inputY = centerY - pedalH / 2;
          outputX = centerX - pedalW * jackOffset; // Output on left
          outputY = centerY - pedalH / 2;
          break;
        case 90:
          inputX = centerX + pedalW / 2;
          inputY = centerY + pedalH * jackOffset;  // Input rotates
          outputX = centerX + pedalW / 2;
          outputY = centerY - pedalH * jackOffset; // Output rotates
          break;
        case 180:
          inputX = centerX - pedalW * jackOffset;  // Input flips
          inputY = centerY + pedalH / 2;
          outputX = centerX + pedalW * jackOffset; // Output flips
          outputY = centerY + pedalH / 2;
          break;
        case 270:
          inputX = centerX - pedalW / 2;
          inputY = centerY - pedalH * jackOffset;  // Input rotates
          outputX = centerX - pedalW / 2;
          outputY = centerY + pedalH * jackOffset; // Output rotates
          break;
        default:
          inputX = centerX;
          inputY = centerY;
          outputX = centerX;
          outputY = centerY;
      }
    } else {
      // Side-mounted jacks (input on right, output on left for right-to-left flow)
      switch (pos.rotation) {
        case 0:
          inputX = centerX + pedalW / 2;  // Input on right
          inputY = centerY;
          outputX = centerX - pedalW / 2; // Output on left
          outputY = centerY;
          break;
        case 90:
          inputX = centerX;
          inputY = centerY + pedalH / 2;  // Input rotates to bottom
          outputX = centerX;
          outputY = centerY - pedalH / 2; // Output rotates to top
          break;
        case 180:
          inputX = centerX - pedalW / 2;  // Input flips to left
          inputY = centerY;
          outputX = centerX + pedalW / 2; // Output flips to right
          outputY = centerY;
          break;
        case 270:
          inputX = centerX;
          inputY = centerY - pedalH / 2;  // Input rotates to top
          outputX = centerX;
          outputY = centerY + pedalH / 2; // Output rotates to bottom
          break;
        default:
          inputX = centerX;
          inputY = centerY;
          outputX = centerX;
          outputY = centerY;
      }
    }
    
    return {
      input: { x: inputX, y: inputY },
      output: { x: outputX, y: outputY },
    };
  };

  // Handle pedal drag
  const handleMouseDown = (e: React.MouseEvent, pedalId: string) => {
    e.preventDefault();
    setSelectedPedal(pedalId);
    setIsDragging(true);
    setHasMoved(false);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const pos = positions.get(pedalId);
      if (pos) {
        const boardW = boardWidthMm * displayScale * scale;
        const boardH = boardDepthMm * displayScale * scale;
        setDragOffset({
          x: e.clientX - rect.left - (pos.x / 100) * boardW,
          y: e.clientY - rect.top - (pos.y / 100) * boardH,
        });
      }
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedPedal || !containerRef.current) return;
    
    setHasMoved(true);
    setShowPedalCard(null); // Close card when dragging
    
    const rect = containerRef.current.getBoundingClientRect();
    const boardW = boardWidthMm * displayScale * scale;
    const boardH = boardDepthMm * displayScale * scale;
    
    const newX = ((e.clientX - rect.left - dragOffset.x) / boardW) * 100;
    const newY = ((e.clientY - rect.top - dragOffset.y) / boardH) * 100;
    
    // Clamp to board bounds
    const clampedX = Math.max(5, Math.min(95, newX));
    const clampedY = Math.max(5, Math.min(95, newY));
    
    setPositions(prev => {
      const newMap = new Map(prev);
      const pos = newMap.get(selectedPedal);
      if (pos) {
        newMap.set(selectedPedal, { ...pos, x: clampedX, y: clampedY });
      }
      return newMap;
    });
  }, [isDragging, selectedPedal, dragOffset, boardWidthMm, boardDepthMm, displayScale, scale]);

  const handleMouseUp = useCallback(() => {
    if (!hasMoved && selectedPedal) {
      // It was a click, not a drag - show the pedal card
      setShowPedalCard(prev => prev === selectedPedal ? null : selectedPedal);
    }
    setIsDragging(false);
    setHasMoved(false);
  }, [hasMoved, selectedPedal]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Rotate selected pedal
  const rotatePedal = (direction: 'cw' | 'ccw') => {
    if (!selectedPedal) return;
    
    setPositions(prev => {
      const newMap = new Map(prev);
      const pos = newMap.get(selectedPedal);
      if (pos) {
        const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
        const currentIndex = rotations.indexOf(pos.rotation);
        const newIndex = direction === 'cw' 
          ? (currentIndex + 1) % 4 
          : (currentIndex - 1 + 4) % 4;
        newMap.set(selectedPedal, { ...pos, rotation: rotations[newIndex] });
      }
      return newMap;
    });
  };

  const actualScale = displayScale * scale;
  const boardDisplayW = boardWidthMm * actualScale;
  const boardDisplayH = boardDepthMm * actualScale;

  if (board.slots.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-board-elevated rounded-xl border border-board-border">
        <p className="text-board-muted">Add pedals to your board to visualize the signal flow</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-board-surface rounded-xl p-4 border border-board-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-board-muted" />
            <span className="text-sm text-board-muted">Drag pedals to move</span>
          </div>
          {selectedPedal && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => rotatePedal('ccw')}
                className="p-2 rounded-lg bg-board-elevated hover:bg-board-border text-white transition-colors"
                title="Rotate counter-clockwise"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => rotatePedal('cw')}
                className="p-2 rounded-lg bg-board-elevated hover:bg-board-border text-white transition-colors"
                title="Rotate clockwise"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <span className="text-sm text-board-accent ml-2">
                {board.slots.find(s => s.pedal.id === selectedPedal)?.pedal.model} selected
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
            className="p-2 rounded-lg bg-board-elevated hover:bg-board-border text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-white w-16 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(s => Math.min(2, s + 0.1))}
            className="p-2 rounded-lg bg-board-elevated hover:bg-board-border text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Signal Flow Legend (Right to Left) */}
      <div className="bg-board-surface rounded-xl p-4 border border-board-border">
        <h3 className="text-sm font-medium text-white mb-3">Signal Flow (Right → Left)</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-300" />
            <span className="text-xs text-board-muted">Input (Guitar)</span>
          </div>
          <span className="text-xs text-board-muted">→</span>
          {board.slots.map((slot, index) => (
            <div key={slot.pedal.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-1 rounded-full"
                style={{ backgroundColor: SIGNAL_COLORS[index % SIGNAL_COLORS.length] }}
              />
              <span className="text-xs text-board-muted">
                {index + 1}. {slot.pedal.model}
              </span>
              {index < board.slots.length - 1 && <span className="text-xs text-board-muted">→</span>}
            </div>
          ))}
          <span className="text-xs text-board-muted">→</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-300" />
            <span className="text-xs text-board-muted">Output (Amp)</span>
          </div>
        </div>
      </div>

      {/* Board Visualization */}
      <div 
        ref={containerRef}
        className="relative bg-board-elevated rounded-xl p-6 border border-board-border overflow-visible"
        style={{ minHeight: '500px', paddingTop: '80px', paddingBottom: '80px' }}
      >
        {/* Board Surface */}
        <div
          ref={boardRef}
          className="relative mx-auto rounded-lg shadow-2xl overflow-visible"
          style={{
            width: boardDisplayW,
            height: boardDisplayH,
            background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
            border: '3px solid #333',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 10px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Board texture */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }}
          />
          
          {/* Input indicator (right side - signal flows right to left) */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 flex flex-col items-center gap-1"
          >
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-300 shadow-lg shadow-green-500/50" />
            <span className="text-[10px] text-green-400 font-medium whitespace-nowrap">IN</span>
          </div>
          
          {/* Output indicator (left side - signal flows right to left) */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 flex flex-col items-center gap-1"
          >
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-300 shadow-lg shadow-red-500/50" />
            <span className="text-[10px] text-red-400 font-medium whitespace-nowrap">OUT</span>
          </div>

          {/* SVG for signal flow lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={boardDisplayW}
            height={boardDisplayH}
            style={{ overflow: 'visible' }}
          >
            {/* Draw signal flow lines (right to left) */}
            {board.slots.map((slot, index) => {
              const pos = positions.get(slot.pedal.id);
              if (!pos) return null;
              
              const jacks = getJackPositions(slot, pos, actualScale);
              const color = SIGNAL_COLORS[index % SIGNAL_COLORS.length];
              
              // Line from previous pedal's output (or input from right) to this pedal's input
              let startX: number, startY: number;
              
              if (index === 0) {
                // First pedal - line comes from off-screen right, directly to pedal's input jack
                startX = boardDisplayW + 40;
                startY = jacks.input.y; // Same Y level as the pedal's input
              } else {
                // Get previous pedal's output jack
                const prevSlot = board.slots[index - 1];
                const prevPos = positions.get(prevSlot.pedal.id);
                if (prevPos) {
                  const prevJacks = getJackPositions(prevSlot, prevPos, actualScale);
                  startX = prevJacks.output.x;
                  startY = prevJacks.output.y;
                }
              }
              
              // Calculate control points for curved line
              const midX = (startX! + jacks.input.x) / 2;
              const midY = (startY! + jacks.input.y) / 2;
              const curve = Math.abs(jacks.input.y - startY!) * 0.3;
              
              return (
                <g key={slot.pedal.id}>
                  {/* First pedal: straight line from off-screen */}
                  {index === 0 ? (
                    <path
                      d={`M ${startX} ${startY} L ${jacks.input.x} ${jacks.input.y}`}
                      fill="none"
                      stroke={color}
                      strokeWidth={3}
                      strokeLinecap="round"
                      opacity={0.8}
                      style={{
                        filter: `drop-shadow(0 0 4px ${color})`,
                      }}
                    />
                  ) : (
                    <path
                      d={`M ${startX} ${startY} Q ${midX} ${midY - curve} ${jacks.input.x} ${jacks.input.y}`}
                      fill="none"
                      stroke={color}
                      strokeWidth={3}
                      strokeLinecap="round"
                      opacity={0.8}
                      style={{
                        filter: `drop-shadow(0 0 4px ${color})`,
                      }}
                    />
                  )}
                  {/* Input jack marker */}
                  <circle
                    cx={jacks.input.x}
                    cy={jacks.input.y}
                    r={4}
                    fill={color}
                    stroke="white"
                    strokeWidth={1}
                  />
                  {/* Output jack marker */}
                  <circle
                    cx={jacks.output.x}
                    cy={jacks.output.y}
                    r={4}
                    fill={color}
                    stroke="white"
                    strokeWidth={1}
                  />
                </g>
              );
            })}
            
            {/* Final line to output (left side) - straight line off-screen */}
            {board.slots.length > 0 && (() => {
              const lastSlot = board.slots[board.slots.length - 1];
              const lastPos = positions.get(lastSlot.pedal.id);
              if (!lastPos) return null;
              
              const lastJacks = getJackPositions(lastSlot, lastPos, actualScale);
              const color = SIGNAL_COLORS[(board.slots.length - 1) % SIGNAL_COLORS.length];
              
              const endX = -40; // Output goes off-screen to the left
              const endY = lastJacks.output.y; // Same Y level as the pedal's output
              
              return (
                <path
                  d={`M ${lastJacks.output.x} ${lastJacks.output.y} L ${endX} ${endY}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={0.8}
                  style={{
                    filter: `drop-shadow(0 0 4px ${color})`,
                  }}
                />
              );
            })()}
          </svg>

          {/* Pedals */}
          {board.slots.map((slot, index) => {
            const pos = positions.get(slot.pedal.id);
            if (!pos) return null;
            
            const pedalW = slot.pedal.widthMm * actualScale;
            const pedalH = slot.pedal.depthMm * actualScale;
            const isSelected = selectedPedal === slot.pedal.id;
            const categoryColor = CATEGORY_INFO[slot.pedal.category]?.color || '#888';
            
            // Calculate actual position (center-based)
            const left = (pos.x / 100) * boardDisplayW - pedalW / 2;
            const top = (pos.y / 100) * boardDisplayH - pedalH / 2;
            
            // Generate descriptive effect name based on category, subtype, and rating
            const getEffectDescription = () => {
              const category = slot.pedal.category;
              const subtype = slot.pedal.subtype || '';
              const rating = slot.pedal.categoryRating;
              
              // Category-specific descriptors based on rating
              if (category === 'gain') {
                const gainLevel = rating <= 3 ? 'Clean Boost' : rating <= 5 ? 'Low Gain' : rating <= 7 ? 'Medium Gain' : 'High Gain';
                if (subtype.toLowerCase().includes('boost')) return 'Clean Boost';
                if (subtype.toLowerCase().includes('fuzz')) return rating <= 6 ? 'Vintage Fuzz' : 'Heavy Fuzz';
                if (subtype.toLowerCase().includes('distortion')) return rating <= 6 ? 'Crunch Distortion' : 'High Gain Distortion';
                return `${gainLevel} ${subtype || 'Overdrive'}`;
              }
              
              if (category === 'reverb') {
                const size = rating <= 5 ? 'Subtle' : rating <= 8 ? 'Lush' : 'Ambient';
                if (subtype.toLowerCase().includes('spring')) return 'Spring Reverb';
                if (subtype.toLowerCase().includes('plate')) return 'Plate Reverb';
                if (subtype.toLowerCase().includes('hall')) return rating <= 7 ? 'Hall Reverb' : 'Cathedral Reverb';
                if (subtype.toLowerCase().includes('shimmer')) return 'Shimmer Reverb';
                if (subtype.toLowerCase().includes('room')) return 'Room Reverb';
                return `${size} ${subtype || 'Reverb'}`;
              }
              
              if (category === 'delay') {
                const style = rating <= 5 ? 'Slapback' : rating <= 8 ? 'Rhythmic' : 'Ambient';
                if (subtype.toLowerCase().includes('tape')) return 'Tape Delay';
                if (subtype.toLowerCase().includes('analog')) return 'Analog Delay';
                if (subtype.toLowerCase().includes('digital')) return 'Digital Delay';
                if (subtype.toLowerCase().includes('looper')) return 'Looper';
                return `${style} ${subtype || 'Delay'}`;
              }
              
              if (category === 'modulation') {
                if (subtype.toLowerCase().includes('chorus')) return rating <= 6 ? 'Subtle Chorus' : 'Lush Chorus';
                if (subtype.toLowerCase().includes('phaser')) return rating <= 6 ? 'Smooth Phaser' : 'Swirly Phaser';
                if (subtype.toLowerCase().includes('flanger')) return rating <= 6 ? 'Subtle Flanger' : 'Jet Flanger';
                if (subtype.toLowerCase().includes('tremolo')) return rating <= 6 ? 'Gentle Tremolo' : 'Deep Tremolo';
                if (subtype.toLowerCase().includes('vibrato')) return 'Vibrato';
                if (subtype.toLowerCase().includes('rotary')) return 'Rotary Speaker';
                return subtype || 'Modulation';
              }
              
              if (category === 'dynamics') {
                if (subtype.toLowerCase().includes('compressor')) return rating <= 5 ? 'Subtle Comp' : 'Studio Compressor';
                if (subtype.toLowerCase().includes('limiter')) return 'Limiter';
                if (subtype.toLowerCase().includes('noise')) return 'Noise Gate';
                return subtype || 'Dynamics';
              }
              
              if (category === 'filter') {
                if (subtype.toLowerCase().includes('wah')) return 'Wah';
                if (subtype.toLowerCase().includes('envelope')) return 'Auto Wah';
                return subtype || 'Filter';
              }
              
              if (category === 'pitch') {
                if (subtype.toLowerCase().includes('octave')) return 'Octaver';
                if (subtype.toLowerCase().includes('harmony')) return 'Harmonizer';
                if (subtype.toLowerCase().includes('whammy')) return 'Pitch Shifter';
                return subtype || 'Pitch';
              }
              
              if (category === 'utility') {
                if (subtype.toLowerCase().includes('tuner')) return 'Tuner';
                if (subtype.toLowerCase().includes('buffer')) return 'Buffer';
                if (subtype.toLowerCase().includes('switcher')) return 'Switcher';
                if (subtype.toLowerCase().includes('di')) return 'DI Box';
                return subtype || 'Utility';
              }
              
              if (category === 'eq') return subtype || 'EQ';
              if (category === 'volume') return subtype || 'Volume';
              if (category === 'amp') return subtype || 'Amp Sim';
              if (category === 'synth') return subtype || 'Synth';
              
              return subtype || category.charAt(0).toUpperCase() + category.slice(1);
            };
            
            const pedalFunction = getEffectDescription();
            
            return (
              <div
                key={slot.pedal.id}
                className={`absolute cursor-move select-none transition-shadow ${
                  isSelected ? 'ring-2 ring-board-accent ring-offset-2 ring-offset-board-dark z-20' : 'z-10 hover:z-20'
                }`}
                style={{
                  left,
                  top,
                  width: pedalW,
                  height: pedalH,
                  transform: `rotate(${pos.rotation}deg)`,
                  transformOrigin: 'center center',
                }}
                onMouseDown={(e) => handleMouseDown(e, slot.pedal.id)}
                onClick={() => setSelectedPedal(slot.pedal.id)}
              >
                {/* Function label above pedal */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
                  style={{ 
                    top: -18,
                    transform: `translateX(-50%) rotate(-${pos.rotation}deg)`,
                  }}
                >
                  <span 
                    className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide"
                    style={{
                      backgroundColor: `${categoryColor}cc`,
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      boxShadow: `0 2px 4px rgba(0,0,0,0.3)`,
                    }}
                  >
                    {pedalFunction}
                  </span>
                </div>
                
                {/* Pedal body */}
                <div
                  className="w-full h-full rounded-lg flex flex-col items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(145deg, ${categoryColor}dd, ${categoryColor}99)`,
                    border: `2px solid ${categoryColor}`,
                    boxShadow: isSelected 
                      ? `0 4px 20px ${categoryColor}66, inset 0 1px 0 rgba(255,255,255,0.2)`
                      : `0 2px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  {/* Pedal content - counter-rotate text */}
                  <div 
                    className="flex flex-col items-center justify-center text-center p-1"
                    style={{ transform: `rotate(-${pos.rotation}deg)` }}
                  >
                    <span className="text-[8px] text-white/70 font-medium truncate max-w-full">
                      {slot.pedal.brand}
                    </span>
                    <span className="text-[10px] text-white font-bold truncate max-w-full leading-tight">
                      {slot.pedal.model.length > 12 ? slot.pedal.model.slice(0, 12) + '...' : slot.pedal.model}
                    </span>
                    <span className="text-[8px] text-white/50 mt-0.5">
                      #{index + 1}
                    </span>
                  </div>
                  
                  {/* Footswitch indicator */}
                  <div 
                    className="absolute bottom-1 w-3 h-3 rounded-full bg-black/30 border border-white/20"
                    style={{ transform: `rotate(-${pos.rotation}deg)` }}
                  />
                </div>
                
                {/* Jack indicators - IN on right, OUT on left (right-to-left flow) */}
                {slot.pedal.topJacks ? (
                  // Top jacks
                  <>
                    {/* Input on right side */}
                    <div 
                      className="absolute flex flex-col items-center"
                      style={{
                        top: -10,
                        left: '75%',
                        transform: 'translateX(-50%)',
                      }}
                      title="Input"
                    >
                      <span className="text-[6px] text-green-400 font-bold mb-0.5">IN</span>
                      <div className="w-2 h-2 rounded-full bg-green-600 border border-green-400" />
                    </div>
                    {/* Output on left side */}
                    <div 
                      className="absolute flex flex-col items-center"
                      style={{
                        top: -10,
                        left: '25%',
                        transform: 'translateX(-50%)',
                      }}
                      title="Output"
                    >
                      <span className="text-[6px] text-red-400 font-bold mb-0.5">OUT</span>
                      <div className="w-2 h-2 rounded-full bg-red-600 border border-red-400" />
                    </div>
                  </>
                ) : (
                  // Side jacks - IN on right, OUT on left
                  <>
                    {/* Input on right side */}
                    <div 
                      className="absolute flex items-center"
                      style={{
                        right: -16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                      title="Input"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-600 border border-green-400" />
                      <span className="text-[6px] text-green-400 font-bold ml-0.5">IN</span>
                    </div>
                    {/* Output on left side */}
                    <div 
                      className="absolute flex items-center"
                      style={{
                        left: -16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                      title="Output"
                    >
                      <span className="text-[6px] text-red-400 font-bold mr-0.5">OUT</span>
                      <div className="w-2 h-2 rounded-full bg-red-600 border border-red-400" />
                    </div>
                  </>
                )}
                
                {/* Pedal Info Card Popup */}
                {showPedalCard === slot.pedal.id && (() => {
                  // Check if there's enough space above (if pedal is in top 35% of board, show below)
                  const showBelow = pos.y < 35;
                  
                  return (
                    <div 
                      className="absolute z-50 pointer-events-auto"
                      style={showBelow ? {
                        top: pedalH + 10,
                        left: '50%',
                        transform: `translateX(-50%) rotate(-${pos.rotation}deg)`,
                        transformOrigin: 'top center',
                      } : {
                        bottom: pedalH + 10,
                        left: '50%',
                        transform: `translateX(-50%) rotate(-${pos.rotation}deg)`,
                        transformOrigin: 'bottom center',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div 
                        className="bg-board-dark border-2 rounded-xl shadow-2xl p-4 min-w-[240px] max-w-[280px]"
                        style={{ borderColor: categoryColor }}
                      >
                        {/* Close button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPedalCard(null);
                          }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-board-elevated hover:bg-board-border flex items-center justify-center text-board-muted hover:text-white transition-colors"
                        >
                          ×
                        </button>
                        
                        {/* Header */}
                        <div className="mb-3">
                          <span 
                            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-2"
                            style={{ backgroundColor: `${categoryColor}cc`, color: 'white' }}
                          >
                            {pedalFunction}
                          </span>
                          <h3 className="text-white font-bold text-sm">{slot.pedal.brand}</h3>
                          <h4 className="text-white/90 font-semibold text-base">{slot.pedal.model}</h4>
                        </div>
                        
                        {/* Description */}
                        {slot.pedal.description && (
                          <p className="text-board-muted text-xs mb-3 italic">
                            "{slot.pedal.description}"
                          </p>
                        )}
                        
                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="bg-board-elevated rounded-lg p-2">
                            <span className="text-board-muted block text-[10px]">Price</span>
                            <span className="text-green-400 font-semibold">${slot.pedal.reverbPrice}</span>
                          </div>
                          <div className="bg-board-elevated rounded-lg p-2">
                            <span className="text-board-muted block text-[10px]">Size</span>
                            <span className="text-white font-medium">
                              {(slot.pedal.widthMm / 25.4).toFixed(1)}" × {(slot.pedal.depthMm / 25.4).toFixed(1)}"
                            </span>
                          </div>
                          <div className="bg-board-elevated rounded-lg p-2">
                            <span className="text-board-muted block text-[10px]">Power</span>
                            <span className="text-yellow-400 font-medium">{slot.pedal.currentMa}mA</span>
                          </div>
                          <div className="bg-board-elevated rounded-lg p-2">
                            <span className="text-board-muted block text-[10px]">Signal</span>
                            <span className="text-blue-400 font-medium capitalize">{slot.pedal.signal}</span>
                          </div>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-board-elevated text-[10px] text-board-muted">
                            {slot.pedal.bypassType} bypass
                          </span>
                          {slot.pedal.circuitType && (
                            <span className="px-2 py-0.5 rounded-full bg-board-elevated text-[10px] text-board-muted capitalize">
                              {slot.pedal.circuitType}
                            </span>
                          )}
                          {slot.pedal.topJacks && (
                            <span className="px-2 py-0.5 rounded-full bg-board-elevated text-[10px] text-board-muted">
                              Top jacks
                            </span>
                          )}
                        </div>
                        
                        {/* Arrow pointing to pedal */}
                        <div 
                          className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
                          style={showBelow ? {
                            top: -8,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderBottom: `8px solid ${categoryColor}`,
                          } : {
                            bottom: -8,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: `8px solid ${categoryColor}`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
        
        {/* Board dimensions label */}
        <div className="text-center mt-4 text-sm text-board-muted">
          {(boardWidthMm / 25.4).toFixed(1)}" × {(boardDepthMm / 25.4).toFixed(1)}" pedalboard
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-board-surface/50 rounded-xl p-4 border border-board-border">
        <h3 className="text-sm font-medium text-white mb-2">Tips</h3>
        <ul className="text-xs text-board-muted space-y-1">
          <li>• <strong>Click</strong> a pedal to view its details card</li>
          <li>• <strong>Drag</strong> pedals to reposition them on the board</li>
          <li>• <strong>Rotate</strong> selected pedals using the buttons above</li>
          <li>• <strong>Colored lines</strong> show signal flow from input to output</li>
          <li>• Pedals are shown at their actual relative sizes</li>
        </ul>
      </div>
    </div>
  );
}

