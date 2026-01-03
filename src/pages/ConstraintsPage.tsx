import { useState } from 'react';
import { Settings2, Ruler, DollarSign, Zap, ChevronRight, Check, Clock, Shield, Hash } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { BOARD_TEMPLATES, getTemplateDimensionsDisplay } from '../data/boardTemplates';
import { BoardTemplate } from '../types';
import { formatInches, inchesToMm, formatArea } from '../utils/measurements';

// Toggle component for "Apply After" feature
function ApplyAfterToggle({ 
  enabled, 
  onToggle,
  label,
  color = 'board-accent'
}: { 
  enabled: boolean; 
  onToggle: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        enabled
          ? `bg-${color}/20 text-${color} border border-${color}/50`
          : 'bg-board-elevated text-board-muted hover:text-white border border-transparent hover:border-board-border'
      }`}
      style={enabled ? { 
        backgroundColor: `var(--${color === 'board-accent' ? 'board-accent' : color === 'board-success' ? 'board-success' : 'board-warning'})20`,
        borderColor: `var(--${color === 'board-accent' ? 'board-accent' : color === 'board-success' ? 'board-success' : 'board-warning'})50`,
        color: `var(--${color === 'board-accent' ? 'board-accent' : color === 'board-success' ? 'board-success' : 'board-warning'})`
      } : {}}
    >
      {enabled ? <Clock className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
      {enabled ? 'Apply After' : label}
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
  const [careAboutPower, setCareAboutPower] = useState(
    board.constraints.maxCurrentMa !== undefined && !board.constraints.applyAfterPower
  );
  
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
        },
      });
    } else {
      dispatch({
        type: 'SET_CONSTRAINTS',
        constraints: {
          ...board.constraints,
          maxPedalCount: pedalCount,
          applyAfterSize: true,
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
  
  const handlePowerChange = (value: number) => {
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        maxCurrentMa: value,
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
  
  const toggleApplyAfterPower = () => {
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        applyAfterPower: !board.constraints.applyAfterPower,
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
    <div className="min-h-full p-8 lg:p-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-board-accent/20 mb-6">
          <Settings2 className="w-8 h-8 text-board-accent" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Set Your Limits
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Choose your pedalboard size and budget. We'll show you which pedals fit 
          and gray out ones that don't.
        </p>
        
        {/* Apply After explanation */}
        <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-board-elevated border border-board-border">
          <Clock className="w-4 h-4 text-board-accent" />
          <span className="text-sm text-zinc-400">
            Click <span className="text-white font-medium">"Apply After"</span> to build freely, then get recommendations
          </span>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Board Size / Pedal Count Selection */}
          <div className={`bg-board-surface border rounded-xl p-6 transition-all ${
            board.constraints.applyAfterSize && sizingMode === 'board'
              ? 'border-board-accent/50 bg-board-accent/5' 
              : 'border-board-border'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                {sizingMode === 'board' ? (
                  <Ruler className="w-5 h-5 text-board-accent" />
                ) : (
                  <Hash className="w-5 h-5 text-board-accent" />
                )}
                {sizingMode === 'board' ? 'Board Size' : 'Pedal Count'}
              </h2>
              {sizingMode === 'board' && (
                <ApplyAfterToggle 
                  enabled={board.constraints.applyAfterSize || false}
                  onToggle={toggleApplyAfterSize}
                  label="Enforced"
                  color="board-accent"
                />
              )}
            </div>
            
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleSizingModeChange('board')}
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  sizingMode === 'board'
                    ? 'border-board-accent bg-board-accent/20 text-board-accent'
                    : 'border-board-border text-board-muted hover:border-board-accent/50'
                }`}
              >
                <Ruler className="w-4 h-4" />
                I know my board size
              </button>
              <button
                onClick={() => handleSizingModeChange('count')}
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  sizingMode === 'count'
                    ? 'border-board-accent bg-board-accent/20 text-board-accent'
                    : 'border-board-border text-board-muted hover:border-board-accent/50'
                }`}
              >
                <Hash className="w-4 h-4" />
                Just pick # of pedals
              </button>
            </div>
            
            {sizingMode === 'count' ? (
              /* Pedal Count Mode */
              <div>
                <p className="text-sm text-zinc-400 mb-4">
                  Don't know your board size? Just pick how many pedals you want and we'll help you find a board later.
                </p>
                
                {/* Pedal Count Display */}
                <div className="text-center mb-4">
                  <span className="text-6xl font-bold text-board-accent">{pedalCount}</span>
                  <span className="text-xl text-board-muted ml-2">pedals</span>
                </div>
                
                {/* Slider */}
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={pedalCount}
                  onChange={(e) => handlePedalCountChange(parseInt(e.target.value))}
                  className="w-full accent-board-accent mb-2"
                />
                <div className="flex justify-between text-xs text-board-muted">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                </div>
                
                {/* Quick Presets */}
                <div className="flex gap-2 mt-4">
                  {[3, 5, 8, 12, 15].map(count => (
                    <button
                      key={count}
                      onClick={() => handlePedalCountChange(count)}
                      className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                        pedalCount === count
                          ? 'border-board-accent bg-board-accent/20 text-board-accent'
                          : 'border-board-border text-board-muted hover:border-board-accent/50'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                
                <p className="text-xs text-board-muted mt-4 text-center">
                  After building, we'll suggest a board that fits your pedals.
                </p>
              </div>
            ) : (
              /* Board Size Mode */
              <>
                {board.constraints.applyAfterSize && (
                  <div className="mb-4 p-3 rounded-lg bg-board-accent/10 border border-board-accent/30 text-sm text-board-accent flex items-start gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Size limits won't filter pedals. Use "Recommend Setup" after building to find a board that fits.</span>
                  </div>
                )}
                
                {/* Templates by Brand */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                  {Object.entries(templatesByBrand).map(([brand, templates]) => (
                    <div key={brand}>
                      <h3 className="text-xs font-medium text-board-muted uppercase tracking-wider mb-2">
                        {brand}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {templates.map(template => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className={`p-2.5 rounded-lg border text-left transition-all ${
                              selectedTemplate === template.id
                                ? 'border-board-accent bg-board-accent/10'
                                : 'border-board-border hover:border-board-accent/50 bg-board-elevated/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-medium text-white leading-tight">{template.name}</span>
                              {selectedTemplate === template.id && (
                                <Check className="w-3 h-3 text-board-accent flex-shrink-0 mt-0.5" />
                              )}
                            </div>
                            <div className="text-[10px] text-board-muted mt-1">
                              {getTemplateDimensionsDisplay(template)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Manual Input */}
                <div className="pt-4 border-t border-board-border">
                  <h3 className="text-sm font-medium text-white mb-3">Or enter custom size:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-board-muted block mb-1">Width</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={widthInches}
                          onChange={(e) => handleWidthChange(e.target.value)}
                          className="w-full px-3 py-2 pr-8 bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-board-muted">"</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-board-muted block mb-1">Depth</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={depthInches}
                          onChange={(e) => handleDepthChange(e.target.value)}
                          className="w-full px-3 py-2 pr-8 bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-board-muted">"</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-board-muted mt-2">
                    Usable area: ~{formatArea(usableAreaMmSq)} sq in
                  </p>
                </div>
              </>
            )}
          </div>
          
          {/* Budget & Power */}
          <div className="space-y-6">
            {/* Budget */}
            <div className={`bg-board-surface border rounded-xl p-6 transition-all ${
              board.constraints.applyAfterBudget 
                ? 'border-green-500/50 bg-green-500/5' 
                : 'border-board-border'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-board-success" />
                  Budget
                </h2>
                <ApplyAfterToggle 
                  enabled={board.constraints.applyAfterBudget || false}
                  onToggle={toggleApplyAfterBudget}
                  label="Enforced"
                  color="board-success"
                />
              </div>
              
              {board.constraints.applyAfterBudget && (
                <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-sm text-green-400 flex items-start gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Budget won't filter pedals. Build freely, then check your total in "Recommend Setup".</span>
                </div>
              )}
              
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-board-muted">$</span>
                <input
                  type="number"
                  value={board.constraints.maxBudget}
                  onChange={(e) => handleBudgetChange(parseInt(e.target.value) || 0)}
                  className="w-full pl-12 pr-4 py-4 text-3xl font-bold bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent text-center"
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
              
              <div className="flex justify-between text-xs text-board-muted mt-2">
                <span>$100</span>
                <span>$5,000</span>
              </div>
              
              {/* Budget presets */}
              <div className="flex gap-2 mt-4">
                {[300, 500, 1000, 2000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleBudgetChange(amount)}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
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
            
            {/* Power Supply */}
            {!careAboutPower ? (
              /* Collapsed state - just a button */
              <button
                onClick={() => {
                  setCareAboutPower(true);
                  dispatch({
                    type: 'SET_CONSTRAINTS',
                    constraints: {
                      ...board.constraints,
                      maxCurrentMa: board.constraints.maxCurrentMa || 2000,
                      applyAfterPower: false,
                    },
                  });
                }}
                className="w-full bg-board-surface border border-board-border rounded-xl p-6 hover:border-board-warning/50 transition-all group"
              >
                <div className="flex items-center justify-center gap-3">
                  <Zap className="w-6 h-6 text-board-muted group-hover:text-board-warning transition-colors" />
                  <span className="text-lg font-medium text-board-muted group-hover:text-white transition-colors">
                    Do you care about power?
                  </span>
                </div>
                <p className="text-xs text-board-muted mt-2 text-center">
                  Click to set power supply limits
                </p>
              </button>
            ) : (
              /* Expanded state - full power options */
              <div className={`bg-board-surface border rounded-xl p-6 transition-all ${
                board.constraints.applyAfterPower 
                  ? 'border-yellow-500/50 bg-yellow-500/5' 
                  : 'border-board-border'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-board-warning" />
                    Power Supply
                  </h2>
                  <div className="flex items-center gap-2">
                    <ApplyAfterToggle 
                      enabled={board.constraints.applyAfterPower || false}
                      onToggle={toggleApplyAfterPower}
                      label="Enforced"
                      color="board-warning"
                    />
                    <button
                      onClick={() => {
                        setCareAboutPower(false);
                        dispatch({
                          type: 'SET_CONSTRAINTS',
                          constraints: {
                            ...board.constraints,
                            maxCurrentMa: undefined,
                            applyAfterPower: true,
                          },
                        });
                      }}
                      className="text-xs text-board-muted hover:text-white transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                
                {board.constraints.applyAfterPower ? (
                  <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-400 flex items-start gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Power limits disabled. After building, we'll suggest the right power supply.</span>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 mb-4">
                    Set the total mA your power supply can provide. We'll gray out pedals that exceed this.
                  </p>
                )}
                
                <div className="relative">
                  <input
                    type="number"
                    value={board.constraints.maxCurrentMa || 2000}
                    onChange={(e) => handlePowerChange(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 pr-16 bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-board-muted">mA</span>
                </div>
                
                {/* Power presets */}
                <div className="flex gap-2 mt-4">
                  {[500, 1000, 2000, 3000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => handlePowerChange(amount)}
                      className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                        board.constraints.maxCurrentMa === amount
                          ? 'border-board-warning bg-board-warning/20 text-board-warning'
                          : 'border-board-border text-board-muted hover:border-board-warning/50'
                      }`}
                    >
                      {amount}mA
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Continue Button (mobile) */}
      <div className="max-w-5xl mx-auto mt-8 lg:hidden">
        <button
          onClick={onContinue}
          className="w-full py-4 bg-board-accent text-white font-medium rounded-xl flex items-center justify-center gap-2"
        >
          Continue to Building
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

