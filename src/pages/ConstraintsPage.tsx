import { useState } from 'react';
import { Ruler, DollarSign, Check, Hash } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { BOARD_TEMPLATES, getTemplateDimensionsDisplay } from '../data/boardTemplates';
import { BoardTemplate } from '../types';
import { formatInches, inchesToMm, formatArea } from '../utils/measurements';

// Simple On/Off toggle component
function OnOffToggle({ 
  enabled, 
  onToggle,
  onLabel = 'On',
  offLabel = 'Off',
}: { 
  enabled: boolean; 
  onToggle: () => void;
  onLabel?: string;
  offLabel?: string;
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
      <span className="sr-only">{enabled ? onLabel : offLabel}</span>
    </button>
  );
}

interface ConstraintsPageProps {
  onContinue: () => void;
}

export function ConstraintsPage({ onContinue }: ConstraintsPageProps) {
  const { state, dispatch } = useBoard();
  const { board } = state;
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [widthInches, setWidthInches] = useState(formatInches(board.constraints.maxWidthMm));
  const [depthInches, setDepthInches] = useState(formatInches(board.constraints.maxDepthMm));
  const [sizingMode, setSizingMode] = useState<'board' | 'count'>(
    board.constraints.maxPedalCount ? 'count' : 'board'
  );
  const [pedalCount, setPedalCount] = useState(board.constraints.maxPedalCount || 5);
  
  const handleTemplateSelect = (template: BoardTemplate) => {
    setSelectedTemplate(template.id);
    setWidthInches(formatInches(template.widthMm));
    setDepthInches(formatInches(template.depthMm));
    setSizingMode('board');
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        maxWidthMm: template.widthMm,
        maxDepthMm: template.depthMm,
        maxBudget: template.suggestedBudget || board.constraints.maxBudget,
        maxPedalCount: undefined, // Clear pedal count when using board size
        applyAfterSize: false, // Enforce board size when selecting a template
      },
    });
  };
  
  const handlePedalCountChange = (count: number) => {
    setPedalCount(count);
    setSizingMode('count');
    setSelectedTemplate(null);
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        maxPedalCount: count,
        applyAfterSize: true, // When using pedal count, ignore board size
      },
    });
  };
  
  const handleSizingModeChange = (mode: 'board' | 'count') => {
    setSizingMode(mode);
    if (mode === 'board') {
      dispatch({
        type: 'SET_CONSTRAINTS',
        constraints: {
          ...board.constraints,
          maxPedalCount: undefined,
          applyAfterSize: false, // Enforce board size when switching to board mode
        },
      });
    } else {
      dispatch({
        type: 'SET_CONSTRAINTS',
        constraints: {
          ...board.constraints,
          maxPedalCount: pedalCount,
          applyAfterSize: true, // Ignore board size when using pedal count
        },
      });
    }
  };
  
  const handleWidthChange = (value: string) => {
    setWidthInches(value);
    const inches = parseFloat(value) || 0;
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        maxWidthMm: Math.round(inchesToMm(inches)),
        applyAfterSize: false, // Enforce size when manually setting dimensions
      },
    });
    setSelectedTemplate(null);
  };
  
  const handleDepthChange = (value: string) => {
    setDepthInches(value);
    const inches = parseFloat(value) || 0;
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        maxDepthMm: Math.round(inchesToMm(inches)),
        applyAfterSize: false, // Enforce size when manually setting dimensions
      },
    });
    setSelectedTemplate(null);
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
  
  const toggleApplyAfterSize = () => {
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        applyAfterSize: !board.constraints.applyAfterSize,
      },
    });
  };
  
  const toggleApplyAfterBudget = () => {
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        applyAfterBudget: !board.constraints.applyAfterBudget,
      },
    });
  };
  
  const usableAreaMmSq = board.constraints.maxWidthMm * board.constraints.maxDepthMm * 0.85;
  
  // Group templates by brand
  const templatesByBrand = BOARD_TEMPLATES.reduce((acc, template) => {
    const brand = template.brand || 'Custom';
    if (!acc[brand]) acc[brand] = [];
    acc[brand].push(template);
    return acc;
  }, {} as Record<string, BoardTemplate[]>);
  
  return (
    <div className="h-full p-6 lg:p-8 overflow-hidden">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Set Your Limits
        </h1>
        <p className="text-base text-zinc-400">
          Choose your pedalboard size and budget to filter pedal recommendations.
        </p>
      </div>
      
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Board Size / Pedal Count Selection */}
          <div className={`bg-board-surface border rounded-xl p-5 transition-all ${
            !board.constraints.applyAfterSize && sizingMode === 'board'
              ? 'border-board-accent/50' 
              : 'border-board-border'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                {sizingMode === 'board' ? (
                  <Ruler className="w-4 h-4 text-board-accent" />
                ) : (
                  <Hash className="w-4 h-4 text-board-accent" />
                )}
                {sizingMode === 'board' ? 'Board Size' : 'Pedal Count'}
              </h2>
              {sizingMode === 'board' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-board-muted">On/Off</span>
                  <OnOffToggle 
                    enabled={!board.constraints.applyAfterSize}
                    onToggle={toggleApplyAfterSize}
                  />
                </div>
              )}
            </div>
            
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => handleSizingModeChange('board')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  sizingMode === 'board'
                    ? 'border-board-accent bg-board-accent/20 text-board-accent'
                    : 'border-board-border text-board-muted hover:border-board-accent/50'
                }`}
              >
                Board size
              </button>
              <button
                onClick={() => handleSizingModeChange('count')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  sizingMode === 'count'
                    ? 'border-board-accent bg-board-accent/20 text-board-accent'
                    : 'border-board-border text-board-muted hover:border-board-accent/50'
                }`}
              >
                Number of pedals
              </button>
            </div>
            
            {sizingMode === 'count' ? (
              /* Pedal Count Mode */
              <div>
                {/* Pedal Count Display */}
                <div className="text-center mb-3">
                  <span className="text-5xl font-bold text-board-accent">{pedalCount}</span>
                  <span className="text-lg text-board-muted ml-2">pedals</span>
                </div>
                
                {/* Slider */}
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={pedalCount}
                  onChange={(e) => handlePedalCountChange(parseInt(e.target.value))}
                  className="w-full accent-board-accent mb-1"
                />
                
                {/* Quick Presets */}
                <div className="flex gap-2 mt-3">
                  {[3, 5, 8, 12, 15].map(count => (
                    <button
                      key={count}
                      onClick={() => handlePedalCountChange(count)}
                      className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${
                        pedalCount === count
                          ? 'border-board-accent bg-board-accent/20 text-board-accent'
                          : 'border-board-border text-board-muted hover:border-board-accent/50'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                
                <p className="text-xs text-board-muted mt-3 text-center">
                  We'll suggest a board that fits after you build.
                </p>
              </div>
            ) : (
              /* Board Size Mode */
              <>
                {/* Templates by Brand */}
                <div className="space-y-3 mb-4 max-h-44 overflow-y-auto pr-1">
                  {Object.entries(templatesByBrand).map(([brand, templates]) => (
                    <div key={brand}>
                      <h3 className="text-[10px] font-medium text-board-muted uppercase tracking-wider mb-1.5">
                        {brand}
                      </h3>
                      <div className="grid grid-cols-2 gap-1.5">
                        {templates.map(template => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className={`p-2 rounded-lg border text-left transition-all ${
                              selectedTemplate === template.id
                                ? 'border-board-accent bg-board-accent/10'
                                : 'border-board-border hover:border-board-accent/50 bg-board-elevated/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-[11px] font-medium text-white leading-tight">{template.name}</span>
                              {selectedTemplate === template.id && (
                                <Check className="w-3 h-3 text-board-accent flex-shrink-0" />
                              )}
                            </div>
                            <div className="text-[9px] text-board-muted mt-0.5">
                              {getTemplateDimensionsDisplay(template)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Manual Input */}
                <div className="pt-3 border-t border-board-border">
                  <h3 className="text-xs font-medium text-white mb-2">Custom size:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-board-muted block mb-1">Width</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={widthInches}
                          onChange={(e) => handleWidthChange(e.target.value)}
                          className="w-full px-2 py-1.5 pr-6 bg-board-dark border border-board-border rounded-lg text-white text-sm focus:outline-none focus:border-board-accent"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-board-muted text-sm">"</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-board-muted block mb-1">Depth</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={depthInches}
                          onChange={(e) => handleDepthChange(e.target.value)}
                          className="w-full px-2 py-1.5 pr-6 bg-board-dark border border-board-border rounded-lg text-white text-sm focus:outline-none focus:border-board-accent"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-board-muted text-sm">"</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Budget */}
          <div className={`bg-board-surface border rounded-xl p-5 transition-all h-full ${
            !board.constraints.applyAfterBudget 
              ? 'border-board-success/50' 
              : 'border-board-border'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-board-success" />
                Budget
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-board-muted">On/Off</span>
                <OnOffToggle 
                  enabled={!board.constraints.applyAfterBudget}
                  onToggle={toggleApplyAfterBudget}
                />
              </div>
            </div>
              
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-board-muted">$</span>
                <input
                  type="number"
                  value={board.constraints.maxBudget}
                  onChange={(e) => handleBudgetChange(parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-3 text-2xl font-bold bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent text-center"
                />
              </div>
              
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={board.constraints.maxBudget}
                onChange={(e) => handleBudgetChange(parseInt(e.target.value))}
                className="w-full accent-board-accent"
              />
              
            {/* Budget presets */}
            <div className="flex gap-2 mt-3">
              {[300, 500, 1000, 2000].map(amount => (
                <button
                  key={amount}
                  onClick={() => handleBudgetChange(amount)}
                  className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${
                    board.constraints.maxBudget === amount
                      ? 'border-board-accent bg-board-accent/20 text-board-accent'
                      : 'border-board-border text-board-muted hover:border-board-accent/50'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

