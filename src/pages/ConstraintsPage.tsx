import { useState } from 'react';
import { Ruler, DollarSign, Check } from 'lucide-react';
import { useBoard } from '../context/BoardContext';

// Neo-Brutalist Toggle
function OnOffToggle({ 
  enabled, 
  onToggle,
  color = 'board-accent',
}: { 
  enabled: boolean; 
  onToggle: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative px-4 py-2 font-bold text-xs uppercase transition-all ${
        enabled 
          ? 'bg-black text-white' 
          : 'bg-white text-black'
      }`}
      style={{ 
        border: '3px solid black',
        boxShadow: enabled ? '3px 3px 0px black' : 'none',
      }}
    >
      {enabled ? 'ON' : 'OFF'}
    </button>
  );
}

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
    <div className="min-h-full p-4 sm:p-6 lg:p-8 overflow-auto" style={{ backgroundColor: '#FFFEF0' }}>
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 
          className="text-2xl sm:text-4xl font-black text-black mb-2 uppercase tracking-tight"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Set Your Limits
        </h1>
        <p className="text-sm sm:text-base text-black/70 font-bold">
          How big? How much?
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Board Size */}
        <div 
          className={`p-5 sm:p-6 transition-all ${sizeEnabled ? '' : 'opacity-50'}`}
          style={{
            backgroundColor: sizeEnabled ? '#FF5722' : '#E0E0E0',
            border: '4px solid black',
            boxShadow: sizeEnabled ? '6px 6px 0px black' : '4px 4px 0px black',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-black flex items-center gap-2 text-white uppercase">
              <div 
                className="w-10 h-10 bg-white flex items-center justify-center"
                style={{ border: '3px solid black' }}
              >
                <Ruler className="w-5 h-5 text-black" />
              </div>
              Board Size
            </h2>
            <OnOffToggle 
              enabled={sizeEnabled}
              onToggle={toggleSizeEnabled}
            />
          </div>
          
          {/* Size Options */}
          <div className="grid grid-cols-5 gap-2">
            {SIZE_OPTIONS.map(size => (
              <button
                key={size.id}
                onClick={() => handleSizeSelect(size.id)}
                className={`p-3 text-center transition-all font-bold ${
                  selectedSize === size.id
                    ? 'bg-black text-white -translate-y-1'
                    : 'bg-white text-black hover:-translate-y-0.5'
                }`}
                style={{ 
                  border: '3px solid black',
                  boxShadow: selectedSize === size.id ? '4px 4px 0px white' : '3px 3px 0px black',
                }}
              >
                <div className="text-2xl sm:text-3xl mb-1">{size.pedals}</div>
                <div className="text-[10px] sm:text-xs uppercase">{size.name}</div>
                {selectedSize === size.id && (
                  <Check className="w-4 h-4 mx-auto mt-1" />
                )}
              </button>
            ))}
          </div>
          
          <p className="text-xs text-white/80 mt-4 text-center font-bold">
            We'll suggest a board that fits on the review page.
          </p>
        </div>
        
        {/* Budget */}
        <div 
          className={`p-5 sm:p-6 transition-all ${budgetEnabled ? '' : 'opacity-50'}`}
          style={{
            backgroundColor: budgetEnabled ? '#4CAF50' : '#E0E0E0',
            border: '4px solid black',
            boxShadow: budgetEnabled ? '6px 6px 0px black' : '4px 4px 0px black',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-black flex items-center gap-2 text-white uppercase">
              <div 
                className="w-10 h-10 bg-white flex items-center justify-center"
                style={{ border: '3px solid black' }}
              >
                <DollarSign className="w-5 h-5 text-black" />
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
            className="text-center mb-5 py-4 bg-white"
            style={{ border: '3px solid black' }}
          >
            <span 
              className="text-4xl sm:text-5xl font-black text-black"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
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
            className="w-full mb-4 h-3 bg-white appearance-none cursor-pointer"
            style={{ 
              border: '2px solid black',
              outline: 'none',
            }}
          />
          
          {/* Quick Presets */}
          <div className="grid grid-cols-5 gap-2">
            {[300, 500, 1000, 1500, 2000].map(amount => (
              <button
                key={amount}
                onClick={() => handleBudgetChange(amount)}
                className={`py-2 text-xs sm:text-sm font-bold transition-all ${
                  board.constraints.maxBudget === amount
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:-translate-y-0.5'
                }`}
                style={{ 
                  border: '2px solid black',
                  boxShadow: board.constraints.maxBudget === amount ? '2px 2px 0px white' : '2px 2px 0px black',
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
