import { useState } from 'react';
import { Ruler, DollarSign, Check } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { useTheme } from '../context/ThemeContext';

// Neo-Brutalist Toggle
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
      className="relative px-4 py-2 font-bold text-xs uppercase transition-all"
      style={{ 
        backgroundColor: enabled ? 'var(--color-board-border)' : 'var(--color-board-surface)',
        color: enabled ? 'var(--color-board-dark)' : 'var(--color-board-text)',
        border: '3px solid var(--color-board-border)',
        boxShadow: enabled ? '3px 3px 0px var(--color-board-shadow)' : 'none',
      }}
    >
      {enabled ? 'ON' : 'OFF'}
    </button>
  );
}

const SIZE_OPTIONS = [
  { id: 'small', label: 'Small', range: '3-5', pedals: 5 },
  { id: 'medium', label: 'Medium', range: '6-9', pedals: 8 },
  { id: 'large', label: 'Large', range: '10+', pedals: 12 },
] as const;

interface ConstraintsPageProps {
  onContinue: () => void;
}

export function ConstraintsPage({ onContinue }: ConstraintsPageProps) {
  const { state, dispatch } = useBoard();
  const { board } = state;
  const { theme } = useTheme();
  
  // Find which size category the current pedal count falls into
  const getCurrentSizeId = () => {
    const count = board.constraints.maxPedalCount ?? 8; // Default to 8 if undefined
    if (count <= 5) return 'small';
    if (count <= 9) return 'medium';
    return 'large';
  };
  const [selectedSize, setSelectedSize] = useState(getCurrentSizeId());
  
  const handleSizeSelect = (sizeId: 'small' | 'medium' | 'large') => {
    const size = SIZE_OPTIONS.find(s => s.id === sizeId);
    if (!size) return;
    
    setSelectedSize(sizeId);
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        maxPedalCount: size.pedals,
        applyAfterSize: true,
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
  
  const toggleBudgetEnabled = () => {
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        applyAfterBudget: !board.constraints.applyAfterBudget,
      },
    });
  };
  
  const budgetEnabled = !board.constraints.applyAfterBudget;
  
  // Theme-aware colors
  const sizeCardBg = theme === 'dark' ? '#5D3A2A' : '#FFCCBC';
  const budgetCardBg = theme === 'dark' ? '#1A3D1A' : '#C8E6C9';
  const disabledBg = theme === 'dark' ? '#333333' : '#E0E0E0';

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 overflow-auto" style={{ backgroundColor: 'var(--color-board-dark)' }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <h1 
          className="text-2xl sm:text-4xl font-black mb-2 uppercase tracking-tight"
          style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-board-text)' }}
        >
          Set Your Limits
        </h1>
        <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--color-board-text-muted)' }}>
          How big? How much?
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Board Size */}
        <div 
          className="p-5 sm:p-6 transition-all"
          style={{
            backgroundColor: sizeCardBg,
            border: '4px solid var(--color-board-border)',
            boxShadow: '6px 6px 0px var(--color-board-shadow)',
          }}
        >
          <div className="flex items-center mb-5">
            <h2 className="text-lg sm:text-xl font-black flex items-center gap-2 uppercase" style={{ color: 'var(--color-board-text)' }}>
              <div 
                className="w-10 h-10 flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-board-surface)', border: '3px solid var(--color-board-border)' }}
              >
                <Ruler className="w-5 h-5" style={{ color: 'var(--color-board-text)' }} />
              </div>
              Size
            </h2>
          </div>
          
          {/* Size Options */}
          <div className="grid grid-cols-3 gap-4">
            {SIZE_OPTIONS.map(size => (
              <button
                key={size.id}
                onClick={() => handleSizeSelect(size.id)}
                className={`p-6 text-center transition-all font-bold ${
                  selectedSize === size.id ? '-translate-y-1' : 'hover:-translate-y-0.5'
                }`}
                style={{ 
                  backgroundColor: selectedSize === size.id ? 'var(--color-board-border)' : 'var(--color-board-surface)',
                  color: selectedSize === size.id ? 'var(--color-board-dark)' : 'var(--color-board-text)',
                  border: '3px solid var(--color-board-border)',
                  boxShadow: selectedSize === size.id ? '4px 4px 0px var(--color-board-surface)' : '3px 3px 0px var(--color-board-shadow)',
                }}
              >
                <div className="text-2xl font-black uppercase">{size.label}</div>
                <div className="text-base opacity-70">{size.range} pedals</div>
                {selectedSize === size.id && (
                  <Check className="w-5 h-5 mx-auto mt-2" />
                )}
              </button>
            ))}
          </div>
          
          <p className="text-xs mt-4 text-center font-bold" style={{ color: 'var(--color-board-text-muted)' }}>
            Multi-FX units count as one pedal but fill multiple slots.
          </p>
        </div>
        
        {/* Budget */}
        <div 
          className={`p-5 sm:p-6 transition-all ${budgetEnabled ? '' : 'opacity-50'}`}
          style={{
            backgroundColor: budgetEnabled ? budgetCardBg : disabledBg,
            border: '4px solid var(--color-board-border)',
            boxShadow: budgetEnabled ? '6px 6px 0px var(--color-board-shadow)' : '4px 4px 0px var(--color-board-shadow)',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-black flex items-center gap-2 uppercase" style={{ color: 'var(--color-board-text)' }}>
              <div 
                className="w-10 h-10 flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-board-surface)', border: '3px solid var(--color-board-border)' }}
              >
                <DollarSign className="w-5 h-5" style={{ color: 'var(--color-board-text)' }} />
              </div>
              Budget
            </h2>
            <OnOffToggle 
              enabled={budgetEnabled}
              onToggle={toggleBudgetEnabled}
            />
          </div>
          
          {/* Budget Display */}
          <div 
            className="text-center mb-6 py-6"
            style={{ backgroundColor: 'var(--color-board-surface)', border: '3px solid var(--color-board-border)' }}
          >
            <span 
              className="text-5xl sm:text-6xl font-black"
              style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-board-text)' }}
            >
              ${board.constraints.maxBudget}
            </span>
          </div>
          
          {/* Slider */}
          <input
            type="range"
            min="200"
            max="3000"
            step="100"
            value={board.constraints.maxBudget}
            onChange={(e) => handleBudgetChange(parseInt(e.target.value))}
            className="w-full mb-4 h-3 appearance-none cursor-pointer"
            style={{ 
              backgroundColor: 'var(--color-board-surface)',
              border: '2px solid var(--color-board-border)',
              outline: 'none',
            }}
          />
          
          {/* Quick Presets */}
          <div className="grid grid-cols-5 gap-3">
            {[300, 500, 1000, 1500, 2000].map(amount => (
              <button
                key={amount}
                onClick={() => handleBudgetChange(amount)}
                className="py-3 text-sm sm:text-base font-bold transition-all hover:-translate-y-0.5"
                style={{ 
                  backgroundColor: board.constraints.maxBudget === amount ? 'var(--color-board-border)' : 'var(--color-board-surface)',
                  color: board.constraints.maxBudget === amount ? 'var(--color-board-dark)' : 'var(--color-board-text)',
                  border: '2px solid var(--color-board-border)',
                  boxShadow: board.constraints.maxBudget === amount ? '2px 2px 0px var(--color-board-surface)' : '2px 2px 0px var(--color-board-shadow)',
                }}
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
