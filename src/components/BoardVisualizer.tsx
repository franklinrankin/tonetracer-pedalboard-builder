import { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCw, Move, ZoomIn, ZoomOut, RotateCcw, ChevronDown, Check, Sparkles, Ruler, X, Zap } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { BoardSlot } from '../types';
import { CATEGORY_INFO } from '../data/categories';
import { getYouTubeReviewUrl } from '../utils/youtube';
import { POPULAR_BOARDS, BoardSize } from '../data/boardSizes';
import { POWER_SUPPLIES, PowerSupply } from '../data/powerSupplies';

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

interface BoardVisualizerProps {
  overrideWidth?: number;
  overrideDepth?: number;
  boardName?: string;
  boardDimensions?: string;
  suggestedBoard?: BoardSize | null;
  onBoardChange?: (board: BoardSize | { widthMm: number; depthMm: number; name: string; brand: string }) => void;
  suggestedPowerSupply?: PowerSupply | null;
  pedalCount?: number;
  onPowerSupplyChange?: (ps: PowerSupply) => void;
}

export function BoardVisualizer({ overrideWidth, overrideDepth, boardName, boardDimensions, suggestedBoard, onBoardChange, suggestedPowerSupply, pedalCount = 0, onPowerSupplyChange }: BoardVisualizerProps = {}) {
  const { state, dispatch } = useBoard();
  const { board } = state;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [positions, setPositions] = useState<Map<string, PedalPosition>>(new Map());
  const [selectedPedal, setSelectedPedal] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [showPedalCard, setShowPedalCard] = useState<string | null>(null);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [customWidth, setCustomWidth] = useState('18');
  const [customDepth, setCustomDepth] = useState('12');
  const boardMenuRef = useRef<HTMLDivElement>(null);
  const [showPowerSupplyMenu, setShowPowerSupplyMenu] = useState(false);
  const [selectedPowerSupply, setSelectedPowerSupply] = useState<PowerSupply | null>(null);
  const [showPowerSupplyOnBoard, setShowPowerSupplyOnBoard] = useState(false);
  const [powerSupplyPosition, setPowerSupplyPosition] = useState({ x: 50, y: 85 }); // Position as percentage
  const [isDraggingPowerSupply, setIsDraggingPowerSupply] = useState(false);
  const [powerSupplyDragOffset, setPowerSupplyDragOffset] = useState({ x: 0, y: 0 });
  const powerSupplyMenuRef = useRef<HTMLDivElement>(null);

  // Use selected or suggested power supply
  const currentPowerSupply = selectedPowerSupply || suggestedPowerSupply;

  // Group power supplies by category
  const powerSuppliesByCategory = {
    'Compact': POWER_SUPPLIES.filter(ps => ps.totalOutputs <= 5),
    'Mid-Size': POWER_SUPPLIES.filter(ps => ps.totalOutputs > 5 && ps.totalOutputs <= 10),
    'Large': POWER_SUPPLIES.filter(ps => ps.totalOutputs > 10),
  };

  const handlePowerSupplySelect = (ps: PowerSupply) => {
    setSelectedPowerSupply(ps);
    onPowerSupplyChange?.(ps);
    setShowPowerSupplyMenu(false);
  };

  // Close board menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (boardMenuRef.current && !boardMenuRef.current.contains(event.target as Node)) {
        setShowBoardMenu(false);
        setShowCustomSize(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group boards by brand
  const boardsByBrand = POPULAR_BOARDS.reduce((acc, b) => {
    if (!acc[b.brand]) acc[b.brand] = [];
    acc[b.brand].push(b);
    return acc;
  }, {} as Record<string, BoardSize[]>);

  const handleBoardSelect = (selectedBoard: BoardSize) => {
    onBoardChange?.(selectedBoard);
    setShowBoardMenu(false);
    setShowCustomSize(false);
  };

  const handleCustomSizeSubmit = () => {
    const widthIn = parseFloat(customWidth);
    const depthIn = parseFloat(customDepth);
    if (widthIn > 0 && depthIn > 0) {
      onBoardChange?.({
        widthMm: widthIn * 25.4,
        depthMm: depthIn * 25.4,
        name: `${widthIn}" × ${depthIn}"`,
        brand: 'Custom',
      });
      setShowBoardMenu(false);
      setShowCustomSize(false);
    }
  };

  // Board dimensions in mm - use overrides if provided
  const boardWidthMm = overrideWidth || board.constraints.maxWidthMm;
  const boardDepthMm = overrideDepth || board.constraints.maxDepthMm;
  
  // Calculate display scale (pixels per mm)
  const [displayScale, setDisplayScale] = useState(1);
  
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48; // padding
      const maxDisplayWidth = Math.min(containerWidth, 900);
      setDisplayScale(maxDisplayWidth / boardWidthMm);
    }
  }, [boardWidthMm]);

  // Check if board has custom layout positions (e.g., pro boards)
  const hasCustomLayout = board.slots.some(s => s.positionX !== undefined && s.positionY !== undefined);

  // Initialize pedal positions in signal chain order (right to left, packed toward bottom)
  // Uses actual pedal dimensions to prevent overlaps
  // OR uses custom positions if provided (for pro boards)
  useEffect(() => {
    const newPositions = new Map<string, PedalPosition>();
    const pedalCount = board.slots.length;
    
    if (pedalCount === 0) {
      setPositions(newPositions);
      return;
    }
    
    // If we have custom layout positions (pro boards), use those
    if (hasCustomLayout) {
      board.slots.forEach((slot) => {
        if (slot.positionX !== undefined && slot.positionY !== undefined) {
          newPositions.set(slot.pedal.id, {
            id: slot.pedal.id,
            x: slot.positionX,
            y: slot.positionY,
            rotation: (slot.rotation as 0 | 90 | 180 | 270) || 0,
          });
        }
      });
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
  }, [board.slots.length, boardWidthMm, boardDepthMm, hasCustomLayout]);

  // Get jack positions based on rotation (right-to-left flow: input on right, output on left)
  // All jacks are on the sides for simplicity
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
    
    let inputX: number, inputY: number, outputX: number, outputY: number;
    
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
    
    return {
      input: { x: inputX, y: inputY },
      output: { x: outputX, y: outputY },
    };
  };

  // Handle pedal drag - Mouse events
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

  // Handle pedal drag - Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent, pedalId: string) => {
    if (e.touches.length !== 1) return; // Only single touch
    
    const touch = e.touches[0];
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
          x: touch.clientX - rect.left - (pos.x / 100) * boardW,
          y: touch.clientY - rect.top - (pos.y / 100) * boardH,
        });
      }
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const boardW = boardWidthMm * displayScale * scale;
    const boardH = boardDepthMm * displayScale * scale;
    
    // Handle power supply dragging
    if (isDraggingPowerSupply) {
      const newX = ((e.clientX - rect.left - powerSupplyDragOffset.x) / boardW) * 100;
      const newY = ((e.clientY - rect.top - powerSupplyDragOffset.y) / boardH) * 100;
      
      // Clamp to board bounds (allow going slightly outside for under-board mounting)
      const clampedX = Math.max(10, Math.min(90, newX));
      const clampedY = Math.max(10, Math.min(120, newY));
      
      setPowerSupplyPosition({ x: clampedX, y: clampedY });
      return;
    }
    
    if (!isDragging || !selectedPedal) return;
    
    setHasMoved(true);
    setShowPedalCard(null); // Close card when dragging
    
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
  }, [isDragging, isDraggingPowerSupply, selectedPedal, dragOffset, powerSupplyDragOffset, boardWidthMm, boardDepthMm, displayScale, scale]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!containerRef.current) return;
    if (e.touches.length !== 1) return;
    
    e.preventDefault(); // Prevent scrolling while dragging
    const touch = e.touches[0];
    
    const rect = containerRef.current.getBoundingClientRect();
    const boardW = boardWidthMm * displayScale * scale;
    const boardH = boardDepthMm * displayScale * scale;
    
    // Handle power supply dragging
    if (isDraggingPowerSupply) {
      const newX = ((touch.clientX - rect.left - powerSupplyDragOffset.x) / boardW) * 100;
      const newY = ((touch.clientY - rect.top - powerSupplyDragOffset.y) / boardH) * 100;
      
      const clampedX = Math.max(10, Math.min(90, newX));
      const clampedY = Math.max(10, Math.min(120, newY));
      
      setPowerSupplyPosition({ x: clampedX, y: clampedY });
      return;
    }
    
    if (!isDragging || !selectedPedal) return;
    
    setHasMoved(true);
    setShowPedalCard(null); // Close card when dragging
    
    const newX = ((touch.clientX - rect.left - dragOffset.x) / boardW) * 100;
    const newY = ((touch.clientY - rect.top - dragOffset.y) / boardH) * 100;
    
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
  }, [isDragging, isDraggingPowerSupply, selectedPedal, dragOffset, powerSupplyDragOffset, boardWidthMm, boardDepthMm, displayScale, scale]);

  const handleMouseUp = useCallback(() => {
    // Handle power supply drag end
    if (isDraggingPowerSupply) {
      setIsDraggingPowerSupply(false);
      return;
    }
    
    if (!hasMoved && selectedPedal) {
      // It was a click, not a drag - show the pedal card
      setShowPedalCard(prev => prev === selectedPedal ? null : selectedPedal);
    } else if (hasMoved) {
      // Save positions to board context when drag ends
      const positionsMap = new Map<string, { x: number; y: number; rotation: number }>();
      positions.forEach((pos, id) => {
        positionsMap.set(id, { x: pos.x, y: pos.y, rotation: pos.rotation });
      });
      dispatch({ type: 'SET_PEDAL_POSITIONS', positions: positionsMap });
    }
    setIsDragging(false);
    setHasMoved(false);
  }, [hasMoved, selectedPedal, positions, dispatch, isDraggingPowerSupply]);

  const handleTouchEnd = useCallback(() => {
    // Handle power supply drag end
    if (isDraggingPowerSupply) {
      setIsDraggingPowerSupply(false);
      return;
    }
    
    if (!hasMoved && selectedPedal) {
      // It was a tap, not a drag - show the pedal card
      setShowPedalCard(prev => prev === selectedPedal ? null : selectedPedal);
    } else if (hasMoved) {
      // Save positions to board context when drag ends
      const positionsMap = new Map<string, { x: number; y: number; rotation: number }>();
      positions.forEach((pos, id) => {
        positionsMap.set(id, { x: pos.x, y: pos.y, rotation: pos.rotation });
      });
      dispatch({ type: 'SET_PEDAL_POSITIONS', positions: positionsMap });
    }
    setIsDragging(false);
    setHasMoved(false);
  }, [hasMoved, selectedPedal, positions, dispatch, isDraggingPowerSupply]);

  useEffect(() => {
    if (isDragging || isDraggingPowerSupply) {
      // Mouse events
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Touch events
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('touchcancel', handleTouchEnd);
      };
    }
  }, [isDragging, isDraggingPowerSupply, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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
      
      // Save positions to board context after rotation
      const positionsMap = new Map<string, { x: number; y: number; rotation: number }>();
      newMap.forEach((p, id) => {
        positionsMap.set(id, { x: p.x, y: p.y, rotation: p.rotation });
      });
      dispatch({ type: 'SET_PEDAL_POSITIONS', positions: positionsMap });
      
      return newMap;
    });
  };

  const actualScale = displayScale * scale;
  const boardDisplayW = boardWidthMm * actualScale;
  const boardDisplayH = boardDepthMm * actualScale;

  if (board.slots.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-96"
        style={{ backgroundColor: '#FFFEF0', border: '3px solid black' }}
      >
        <p className="text-theme font-bold">Add pedals to your board to visualize the signal flow</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls - Compact on mobile */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-board-surface rounded-xl p-2 sm:p-4 border border-board-border">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Move className="w-4 h-4 text-board-muted" />
            <span className="text-sm text-board-muted">Drag to move</span>
          </div>
          
          {/* Rotate buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => rotatePedal('ccw')}
              disabled={!selectedPedal}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                selectedPedal 
                  ? 'bg-board-accent hover:bg-board-accent-dim text-white' 
                  : 'bg-board-elevated text-board-muted cursor-not-allowed'
              }`}
              title="Rotate counter-clockwise"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => rotatePedal('cw')}
              disabled={!selectedPedal}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                selectedPedal 
                  ? 'bg-board-accent hover:bg-board-accent-dim text-white' 
                  : 'bg-board-elevated text-board-muted cursor-not-allowed'
              }`}
              title="Rotate clockwise"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm text-board-muted max-w-[120px] sm:max-w-none truncate">
              {selectedPedal 
                ? <span className="text-board-accent">{board.slots.find(s => s.pedal.id === selectedPedal)?.pedal.model}</span>
                : <span className="hidden sm:inline">Click pedal to rotate</span>
              }
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
            className="p-1.5 sm:p-2 rounded-lg bg-board-elevated hover:bg-board-border text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs sm:text-sm text-white w-10 sm:w-16 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(s => Math.min(2, s + 0.1))}
            className="p-1.5 sm:p-2 rounded-lg bg-board-elevated hover:bg-board-border text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Signal Flow Legend (Right to Left) - Collapsible on mobile */}
      <details className="bg-board-surface rounded-xl border border-board-border group">
        <summary className="p-3 sm:p-4 cursor-pointer list-none flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-medium text-white">Signal Flow (Right → Left)</h3>
          <span className="text-board-muted text-xs group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500 border border-green-300" />
              <span className="text-[10px] sm:text-xs text-board-muted">Input</span>
            </div>
            <span className="text-[10px] text-board-muted">→</span>
            {board.slots.map((slot, index) => (
              <div key={slot.pedal.id} className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: SIGNAL_COLORS[index % SIGNAL_COLORS.length] }}
                />
                <span className="text-[10px] sm:text-xs text-board-muted">
                  {index + 1}. {slot.pedal.model.length > 10 ? slot.pedal.model.slice(0, 10) + '…' : slot.pedal.model}
                </span>
                {index < board.slots.length - 1 && <span className="text-[10px] text-board-muted">→</span>}
              </div>
            ))}
            <span className="text-[10px] text-board-muted">→</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500 border border-red-300" />
              <span className="text-[10px] sm:text-xs text-board-muted">Output</span>
            </div>
          </div>
        </div>
      </details>

      {/* Board Visualization */}
      <div 
        ref={containerRef}
        className="relative p-6 overflow-visible"
        style={{ 
          minHeight: '500px', 
          paddingTop: '80px', 
          paddingBottom: '80px',
          backgroundColor: '#e5e5e5', 
          border: '4px solid black' 
        }}
      >
        {/* Board Surface */}
        <div
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
              let startX: number = boardDisplayW + 40;
              let startY: number = jacks.input.y;
              
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
              
              // Fallback for any other category
              return subtype || (category as string).charAt(0).toUpperCase() + (category as string).slice(1);
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
                  touchAction: 'none', // Prevent scrolling while dragging on mobile
                  width: pedalW,
                  height: pedalH,
                  transform: `rotate(${pos.rotation}deg)`,
                  transformOrigin: 'center center',
                }}
                onMouseDown={(e) => handleMouseDown(e, slot.pedal.id)}
                onTouchStart={(e) => handleTouchStart(e, slot.pedal.id)}
                onClick={() => setSelectedPedal(slot.pedal.id)}
              >
                {/* Function label above pedal - hidden on mobile unless selected */}
                <div 
                  className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 sm:opacity-100'
                  }`}
                  style={{ 
                    top: -16,
                    transform: `translateX(-50%) rotate(-${pos.rotation}deg)`,
                  }}
                >
                  <span 
                    className="px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] font-semibold uppercase tracking-wide"
                    style={{
                      backgroundColor: `${categoryColor}dd`,
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      boxShadow: `0 2px 4px rgba(0,0,0,0.3)`,
                    }}
                  >
                    {slot.pedal.subtype || slot.pedal.category}
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
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-board-muted text-xs">Rating:</span>
                          <span className="text-sm font-semibold" style={{ color: categoryColor }}>
                            {slot.pedal.categoryRating}/10
                          </span>
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
                        <div className="flex flex-wrap gap-1 mb-3">
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
                        
                        {/* Watch Review Link */}
                        <a
                          href={getYouTubeReviewUrl(slot.pedal.brand, slot.pedal.model)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          Watch review
                        </a>
                        
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

          {/* Power Supply Visualization - Draggable */}
          {showPowerSupplyOnBoard && currentPowerSupply && (() => {
            // Convert power supply dimensions from inches to mm, then to pixels
            const psWidthMm = currentPowerSupply.widthIn * 25.4;
            const psDepthMm = currentPowerSupply.depthIn * 25.4;
            const psWidthPx = psWidthMm * actualScale;
            const psDepthPx = psDepthMm * actualScale;
            
            // Calculate position based on percentage
            const left = (powerSupplyPosition.x / 100) * boardDisplayW - psWidthPx / 2;
            const top = (powerSupplyPosition.y / 100) * boardDisplayH - psDepthPx / 2;
            
            const handlePowerSupplyMouseDown = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingPowerSupply(true);
              setSelectedPedal(null); // Deselect any pedal
              setShowPedalCard(null);
              
              const rect = containerRef.current?.getBoundingClientRect();
              if (rect) {
                const boardW = boardWidthMm * displayScale * scale;
                const boardH = boardDepthMm * displayScale * scale;
                setPowerSupplyDragOffset({
                  x: e.clientX - rect.left - (powerSupplyPosition.x / 100) * boardW,
                  y: e.clientY - rect.top - (powerSupplyPosition.y / 100) * boardH,
                });
              }
            };
            
            const handlePowerSupplyTouchStart = (e: React.TouchEvent) => {
              if (e.touches.length !== 1) return;
              e.stopPropagation();
              const touch = e.touches[0];
              setIsDraggingPowerSupply(true);
              setSelectedPedal(null);
              setShowPedalCard(null);
              
              const rect = containerRef.current?.getBoundingClientRect();
              if (rect) {
                const boardW = boardWidthMm * displayScale * scale;
                const boardH = boardDepthMm * displayScale * scale;
                setPowerSupplyDragOffset({
                  x: touch.clientX - rect.left - (powerSupplyPosition.x / 100) * boardW,
                  y: touch.clientY - rect.top - (powerSupplyPosition.y / 100) * boardH,
                });
              }
            };
            
            return (
              <div
                className={`absolute cursor-move select-none transition-shadow z-[5] ${
                  isDraggingPowerSupply ? 'ring-2 ring-green-400 ring-offset-2' : 'hover:ring-2 hover:ring-green-400/50'
                }`}
                style={{
                  left,
                  top,
                  width: psWidthPx,
                  height: psDepthPx,
                  touchAction: 'none',
                }}
                onMouseDown={handlePowerSupplyMouseDown}
                onTouchStart={handlePowerSupplyTouchStart}
              >
                {/* Power supply body */}
                <div
                  className="w-full h-full rounded-md shadow-lg relative"
                  style={{
                    background: 'linear-gradient(145deg, #444, #222)',
                    border: '2px solid #555',
                    boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Output jacks indicator */}
                  <div className="absolute top-1 left-0 right-0 flex justify-center gap-0.5">
                    {Array.from({ length: Math.min(currentPowerSupply.totalOutputs, 12) }).map((_, i) => (
                      <div 
                        key={i}
                        className="rounded-full bg-yellow-500"
                        style={{ 
                          width: Math.max(3, Math.min(6, psWidthPx / 25)), 
                          height: Math.max(3, Math.min(6, psWidthPx / 25)) 
                        }}
                      />
                    ))}
                    {currentPowerSupply.totalOutputs > 12 && (
                      <span className="text-yellow-500" style={{ fontSize: 6 }}>+{currentPowerSupply.totalOutputs - 12}</span>
                    )}
                  </div>
                  {/* Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 pt-3">
                    <div 
                      className="text-white font-bold truncate w-full px-1"
                      style={{ fontSize: Math.max(8, Math.min(11, psWidthPx / 14)) }}
                    >
                      {currentPowerSupply.brand}
                    </div>
                    <div 
                      className="text-gray-400 truncate w-full px-1"
                      style={{ fontSize: Math.max(7, Math.min(9, psWidthPx / 16)) }}
                    >
                      {currentPowerSupply.model}
                    </div>
                    <div 
                      className="text-green-400 font-mono"
                      style={{ fontSize: Math.max(6, Math.min(8, psWidthPx / 18)) }}
                    >
                      {currentPowerSupply.totalOutputs} out
                    </div>
                  </div>
                </div>
                {/* Dimensions label */}
                <div 
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none"
                  style={{ fontSize: 9 }}
                >
                  <span className="text-gray-500">{currentPowerSupply.widthIn}" × {currentPowerSupply.depthIn}"</span>
                </div>
              </div>
            );
          })()}
        </div>
        
        {/* Board name and Power Supply buttons */}
        <div className="flex flex-wrap items-stretch justify-center gap-2 mt-4">
          {/* Board name and dimensions label - clickable to change board */}
          <button 
            onClick={() => onBoardChange && setShowBoardMenu(true)}
            className={`text-center px-4 py-2 flex items-center gap-2 transition-all ${onBoardChange ? 'hover:scale-[1.02] cursor-pointer' : ''}`}
            style={{ backgroundColor: '#FFFEF0', border: '2px solid black' }}
            disabled={!onBoardChange}
          >
            <Ruler className="w-4 h-4 text-black" />
            <div>
              {boardName ? (
                <>
                  <div className="text-sm font-black text-black">{boardName}</div>
                  <div className="text-xs font-bold text-black/70">{boardDimensions}</div>
                </>
              ) : (
                <div className="text-sm font-black text-black">
                  {(boardWidthMm / 25.4).toFixed(1)}" × {(boardDepthMm / 25.4).toFixed(1)}"
                </div>
              )}
            </div>
            {onBoardChange && (
              <div className="text-xs text-black/60 font-bold uppercase">Change</div>
            )}
          </button>

          {/* Power Supply button */}
          {onPowerSupplyChange && (
            <button 
              onClick={() => setShowPowerSupplyMenu(true)}
              className="text-center px-4 py-2 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: '#E8F5E9', border: '2px solid black' }}
            >
              <Zap className="w-4 h-4 text-black" />
              <div>
                <div className="text-sm font-black text-black">
                  {currentPowerSupply ? `${currentPowerSupply.brand} ${currentPowerSupply.model}` : 'Select Power'}
                </div>
                <div className="text-xs font-bold text-black/70">
                  {currentPowerSupply ? `${currentPowerSupply.totalOutputs} outputs • ${currentPowerSupply.totalMa}mA` : 'Choose power supply'}
                </div>
              </div>
              <div className="text-xs text-black/60 font-bold uppercase">Change</div>
            </button>
          )}

          {/* Show Power Supply Checkbox */}
          {currentPowerSupply && (
            <label 
              className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
              style={{ backgroundColor: showPowerSupplyOnBoard ? '#E8F5E9' : '#f5f5f5', border: '2px solid black' }}
            >
              <input
                type="checkbox"
                checked={showPowerSupplyOnBoard}
                onChange={(e) => setShowPowerSupplyOnBoard(e.target.checked)}
                className="w-4 h-4 accent-green-600"
              />
              <span className="text-sm font-bold text-black">Show Power Supply</span>
            </label>
          )}
        </div>

        {/* Board Selection Modal */}
        {showBoardMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60"
              onClick={() => {
                setShowBoardMenu(false);
                setShowCustomSize(false);
              }}
            />
            
            {/* Modal */}
            <div 
              ref={boardMenuRef}
              className="relative w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
              style={{ backgroundColor: '#FFFEF0', border: '4px solid black', boxShadow: '8px 8px 0px black' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-4 border-black bg-black text-white">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5" />
                  <h2 className="font-black uppercase">Choose Board Size</h2>
                </div>
                <button
                  onClick={() => {
                    setShowBoardMenu(false);
                    setShowCustomSize(false);
                  }}
                  className="p-1 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Suggested Board */}
                {suggestedBoard && (
                  <div className="p-3 border-b-2 border-black bg-yellow-100">
                    <div className="text-xs font-bold text-black/60 uppercase mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Recommended for your pedals
                    </div>
                    <button
                      onClick={() => handleBoardSelect(suggestedBoard)}
                      className="w-full text-left p-3 bg-white hover:bg-yellow-200 transition-colors flex items-center justify-between"
                      style={{ border: '2px solid black' }}
                    >
                      <div>
                        <div className="font-black text-black">{suggestedBoard.brand} {suggestedBoard.name}</div>
                        <div className="text-sm text-black/70">{suggestedBoard.widthIn}" × {suggestedBoard.depthIn}" • {suggestedBoard.pedalCapacity} pedals</div>
                      </div>
                      {boardName === `${suggestedBoard.brand} ${suggestedBoard.name}` && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </button>
                  </div>
                )}

                {/* All Boards by Brand */}
                {Object.entries(boardsByBrand).map(([brand, boards]) => (
                  <div key={brand}>
                    <div className="px-4 py-2 text-xs font-black text-black/60 uppercase bg-black/10 sticky top-0">{brand}</div>
                    <div className="p-2 space-y-1">
                      {boards.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => handleBoardSelect(b)}
                          className="w-full text-left px-3 py-2 hover:bg-yellow-200 transition-colors flex items-center justify-between"
                          style={{ border: '2px solid transparent' }}
                        >
                          <div>
                            <div className="font-bold text-black">{b.name}</div>
                            <div className="text-xs text-black/70">{b.widthIn}" × {b.depthIn}" • {b.pedalCapacity} pedals</div>
                          </div>
                          {boardName === `${b.brand} ${b.name}` && (
                            <Check className="w-5 h-5 text-green-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Custom Size Option */}
                <div className="p-3 border-t-4 border-black bg-gray-100">
                  {!showCustomSize ? (
                    <button
                      onClick={() => setShowCustomSize(true)}
                      className="w-full text-left p-3 bg-white hover:bg-yellow-200 transition-colors flex items-center gap-3"
                      style={{ border: '2px solid black' }}
                    >
                      <Ruler className="w-5 h-5 text-black" />
                      <div>
                        <div className="font-black text-black">Custom Size</div>
                        <div className="text-sm text-black/70">Enter your own dimensions</div>
                      </div>
                    </button>
                  ) : (
                    <div className="p-3 bg-white space-y-4" style={{ border: '2px solid black' }}>
                      <div className="text-sm font-black text-black uppercase">Custom Dimensions</div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-black/70 block mb-1 font-bold">Width (inches)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={customWidth}
                            onChange={(e) => setCustomWidth(e.target.value)}
                            className="w-full px-3 py-2 text-base border-2 border-black bg-white text-black font-bold"
                            placeholder="18"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-black/70 block mb-1 font-bold">Depth (inches)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={customDepth}
                            onChange={(e) => setCustomDepth(e.target.value)}
                            className="w-full px-3 py-2 text-base border-2 border-black bg-white text-black font-bold"
                            placeholder="12"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleCustomSizeSubmit}
                        className="w-full py-3 bg-black text-white font-black uppercase hover:bg-gray-800 transition-colors"
                      >
                        Apply Custom Size
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Power Supply Selection Modal */}
        {showPowerSupplyMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowPowerSupplyMenu(false)}
            />
            
            {/* Modal */}
            <div 
              ref={powerSupplyMenuRef}
              className="relative w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
              style={{ backgroundColor: '#E8F5E9', border: '4px solid black', boxShadow: '8px 8px 0px black' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-4 border-black bg-black text-white">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <h2 className="font-black uppercase">Choose Power Supply</h2>
                </div>
                <button
                  onClick={() => setShowPowerSupplyMenu(false)}
                  className="p-1 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pedal count info */}
              <div className="px-4 py-2 bg-yellow-100 border-b-2 border-black">
                <div className="text-sm font-bold text-black">
                  Your board has <span className="font-black">{pedalCount} pedals</span> — power supply needs at least {pedalCount} outputs
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Suggested Power Supply */}
                {suggestedPowerSupply && (
                  <div className="p-3 border-b-2 border-black bg-green-100">
                    <div className="text-xs font-bold text-black/60 uppercase mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Recommended for your pedals
                    </div>
                    <button
                      onClick={() => handlePowerSupplySelect(suggestedPowerSupply)}
                      className="w-full text-left p-3 bg-white hover:bg-green-200 transition-colors flex items-center justify-between"
                      style={{ border: '2px solid black' }}
                    >
                      <div>
                        <div className="font-black text-black">{suggestedPowerSupply.brand} {suggestedPowerSupply.model}</div>
                        <div className="text-sm text-black/70">
                          {suggestedPowerSupply.totalOutputs} outputs • {suggestedPowerSupply.totalMa}mA • ${suggestedPowerSupply.reverbPrice}
                        </div>
                      </div>
                      {currentPowerSupply?.id === suggestedPowerSupply.id && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </button>
                  </div>
                )}

                {/* All Power Supplies by Category */}
                {Object.entries(powerSuppliesByCategory).map(([category, supplies]) => (
                  <div key={category}>
                    <div className="px-4 py-2 text-xs font-black text-black/60 uppercase bg-black/10 sticky top-0">
                      {category} ({supplies.length})
                    </div>
                    <div className="p-2 space-y-1">
                      {supplies.map((ps) => {
                        const hasEnoughOutputs = ps.totalOutputs >= pedalCount;
                        return (
                          <button
                            key={ps.id}
                            onClick={() => hasEnoughOutputs && handlePowerSupplySelect(ps)}
                            disabled={!hasEnoughOutputs}
                            className={`w-full text-left px-3 py-2 transition-colors flex items-center justify-between ${
                              hasEnoughOutputs 
                                ? 'hover:bg-green-200 cursor-pointer' 
                                : 'opacity-40 cursor-not-allowed'
                            }`}
                            style={{ border: '2px solid transparent' }}
                          >
                            <div>
                              <div className={`font-bold ${hasEnoughOutputs ? 'text-black' : 'text-black/50'}`}>
                                {ps.brand} {ps.model}
                              </div>
                              <div className={`text-xs ${hasEnoughOutputs ? 'text-black/70' : 'text-black/40'}`}>
                                <span className={`font-bold ${!hasEnoughOutputs ? 'text-red-500' : ''}`}>
                                  {ps.totalOutputs} outputs
                                </span>
                                {' • '}{ps.totalMa}mA • ${ps.reverbPrice}
                              </div>
                            </div>
                            {currentPowerSupply?.id === ps.id && (
                              <Check className="w-5 h-5 text-green-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions - Hidden on mobile */}
      <div 
        className="hidden sm:block p-4"
        style={{ backgroundColor: '#FFFEF0', border: '3px solid black' }}
      >
        <h3 className="text-sm font-black text-black mb-2 uppercase">Tips</h3>
        <ul className="text-xs text-black space-y-1">
          <li>• <strong>Click</strong> a pedal to select it and view details</li>
          <li>• <strong>Drag</strong> pedals to reposition them on the board</li>
          <li>• <strong>Rotate</strong> – click a pedal first, then use rotate buttons above</li>
          <li>• <strong>Colored lines</strong> show signal flow from guitar (right) to amp (left)</li>
        </ul>
      </div>
    </div>
  );
}

