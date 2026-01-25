import { useState } from 'react';
import { Ruler, DollarSign, Check } from 'lucide-react';
import { useBoard } from '../context/BoardContext';

// Simple On/Off toggle component
function OnOffToggle({ 
  enabled, 
  onToggle,
}: { 
  enabled: boolean; 
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-14 h-7 rounded-full transition-colors ${
        enabled ? 'bg-board-accent' : 'bg-board-elevated border border-board-border'
      }`}
    >
      <div 
        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
          enabled ? 'translate-x-8' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// Simple size options - just names and pedal counts
const SIZE_OPTIONS = [
  { id: 'mini', name: 'Mini', pedals: 4, description: 'Essentials only' },
  { id: 'small', name: 'Small', pedals: 6, description: 'Compact setup' },
  { id: 'medium', name: 'Medium', pedals: 8, description: 'Most popular' },
  { id: 'large', name: 'Large', pedals: 10, description: 'Full rig' },
  { id: 'huge', name: 'Huge', pedals: 12, description: 'Go big' },
] as const;

interface ConstraintsPageProps {
  onContinue: () => void;
}

export function ConstraintsPage({ onContinue }: ConstraintsPageProps) {
  const { state, dispatch } = useBoard();
  const { board } = state;
  
  // Find current size based on pedal count
  const currentSize = SIZE_OPTIONS.find(s => s.pedals === board.constraints.maxPedalCount) || SIZE_OPTIONS[2];
  const [selectedSize, setSelectedSize] = useState(currentSize.id);
  
  const handleSizeSelect = (sizeId: typeof SIZE_OPTIONS[number]['id']) => {
    const size = SIZE_OPTIONS.find(s => s.id === sizeId);
    if (!size) return;
    
    setSelectedSize(sizeId);
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        maxPedalCount: size.pedals,
        applyAfterSize: true, // Use pedal count mode
      },
    });
  };
  
  const handleBudgetChange = (value: number) => {
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        maxBudget: value,
      },
    });
  };
  
  const toggleSizeEnabled = () => {
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        applyAfterSize: board.constraints.applyAfterSize ? false : true,
      },
    });
  };
  
  const toggleBudgetEnabled = () => {
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        applyAfterBudget: !board.constraints.applyAfterBudget,
      },
    });
  };
  
  const sizeEnabled = !board.constraints.applyAfterSize || board.constraints.maxPedalCount !== undefined;
  const budgetEnabled = !board.constraints.applyAfterBudget;
  
  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 overflow-auto">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Set Your Limits
        </h1>
        <p className="text-sm sm:text-base text-zinc-400">
          How big? How much?
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Board Size */}
        <div className={`border rounded-xl p-4 sm:p-5 transition-all ${
          sizeEnabled
            ? 'bg-board-surface border-board-accent shadow-lg shadow-board-accent/20' 
            : 'bg-board-surface/50 border-board-border opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-base sm:text-lg font-semibold flex items-center gap-2 ${
              sizeEnabled ? 'text-white' : 'text-zinc-400'
            }`}>
              <Ruler className={`w-5 h-5 ${sizeEnabled ? 'text-board-accent' : 'text-zinc-500'}`} />
              Board Size
            </h2>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${sizeEnabled ? 'text-board-accent font-medium' : 'text-board-muted'}`}>
                {sizeEnabled ? 'On' : 'Off'}
              </span>
              <OnOffToggle 
                enabled={sizeEnabled}
                onToggle={toggleSizeEnabled}
              />
            </div>
          </div>
          
          {/* Size Options - Responsive Grid */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {SIZE_OPTIONS.map(size => (
              <button
                key={size.id}
                onClick={() => handleSizeSelect(size.id)}
                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border text-center transition-all ${
                  selectedSize === size.id
                    ? 'border-board-accent bg-board-accent/20 ring-2 ring-board-accent/30'
                    : 'border-board-border hover:border-board-accent/50 bg-board-elevated/50'
                }`}
              >
                <div className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">{size.pedals}</div>
                <div className={`text-[10px] sm:text-xs font-medium ${selectedSize === size.id ? 'text-board-accent' : 'text-zinc-400'}`}>
                  {size.name}
                </div>
                {selectedSize === size.id && (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-board-accent mx-auto mt-0.5 sm:mt-1" />
                )}
              </button>
            ))}
          </div>
          
          <p className="text-[10px] sm:text-xs text-zinc-500 mt-3 text-center">
            We'll suggest a board that fits on the review page.
          </p>
        </div>
        
        {/* Budget */}
        <div className={`border rounded-xl p-4 sm:p-5 transition-all ${
          budgetEnabled 
            ? 'bg-board-surface border-green-500 shadow-lg shadow-green-500/20' 
            : 'bg-board-surface/50 border-board-border opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-base sm:text-lg font-semibold flex items-center gap-2 ${
              budgetEnabled ? 'text-white' : 'text-zinc-400'
            }`}>
              <DollarSign className={`w-5 h-5 ${budgetEnabled ? 'text-green-500' : 'text-zinc-500'}`} />
              Budget
            </h2>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${budgetEnabled ? 'text-green-500 font-medium' : 'text-board-muted'}`}>
                {budgetEnabled ? 'On' : 'Off'}
              </span>
              <OnOffToggle 
                enabled={budgetEnabled}
                onToggle={toggleBudgetEnabled}
              />
            </div>
          </div>
          
          {/* Budget Display */}
          <div className="text-center mb-4">
            <span className="text-3xl sm:text-4xl font-bold text-white">${board.constraints.maxBudget}</span>
          </div>
          
          {/* Slider */}
          <input
            type="range"
            min="200"
            max="3000"
            step="100"
            value={board.constraints.maxBudget}
            onChange={(e) => handleBudgetChange(parseInt(e.target.value))}
            className="w-full accent-green-500 mb-4"
          />
          
          {/* Quick Presets */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {[300, 500, 1000, 1500, 2000].map(amount => (
              <button
                key={amount}
                onClick={() => handleBudgetChange(amount)}
                className={`py-2 text-xs sm:text-sm rounded-lg border transition-colors ${
                  board.constraints.maxBudget === amount
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-board-border text-board-muted hover:border-green-500/50'
                }`}
              >
                ${amount >= 1000 ? `${amount/1000}k` : amount}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
