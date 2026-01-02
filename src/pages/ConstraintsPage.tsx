import { useState } from 'react';
import { Settings2, Ruler, DollarSign, Zap, Check, Clock, Shield } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { BOARD_TEMPLATES, getTemplateDimensionsDisplay } from '../data/boardTemplates';
import { BoardTemplate } from '../types';
import { formatInches, inchesToMm, formatArea } from '../utils/measurements';

interface ConstraintsPageProps {
  onContinue: () => void;
}

// Toggle component for "Apply After" feature
function ApplyAfterToggle({ 
  enabled, 
  onToggle,
}: { 
  enabled: boolean; 
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-all ${
        enabled
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          : 'bg-board-elevated text-board-muted hover:text-white'
      }`}
    >
      {enabled ? <Clock className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
      {enabled ? 'Apply After' : 'Enforced'}
    </button>
  );
}

export function ConstraintsPage({ onContinue }: ConstraintsPageProps) {
  const { state, dispatch } = useBoard();
  const { board } = state;
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [widthInches, setWidthInches] = useState(formatInches(board.constraints.maxWidthMm));
  const [depthInches, setDepthInches] = useState(formatInches(board.constraints.maxDepthMm));
  
  const handleTemplateSelect = (template: BoardTemplate) => {
    setSelectedTemplate(template.id);
    setWidthInches(formatInches(template.widthMm));
    setDepthInches(formatInches(template.depthMm));
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        maxWidthMm: template.widthMm,
        maxDepthMm: template.depthMm,
        maxBudget: template.suggestedBudget || board.constraints.maxBudget,
      },
    });
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
    <div className="h-screen flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-4 flex-shrink-0">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-board-accent/20 mb-3">
          <Settings2 className="w-6 h-6 text-board-accent" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Set Your Limits</h1>
        <p className="text-sm text-zinc-400">
          Choose board size and budget • Click "Apply After" to decide later
        </p>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-5xl mx-auto h-full grid lg:grid-cols-2 gap-4">
          {/* Board Size */}
          <div className={`bg-board-surface border rounded-xl p-4 flex flex-col overflow-hidden ${
            board.constraints.applyAfterSize ? 'border-amber-500/30' : 'border-board-border'
          }`}>
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Ruler className="w-4 h-4 text-board-accent" />
                Board Size
              </h2>
              <ApplyAfterToggle 
                enabled={board.constraints.applyAfterSize || false}
                onToggle={toggleApplyAfterSize}
              />
            </div>
            
            {/* Templates - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0 mb-3">
              <div className="space-y-3">
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
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-white truncate">{template.name}</span>
                            {selectedTemplate === template.id && (
                              <Check className="w-3 h-3 text-board-accent flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] text-board-muted">
                            {getTemplateDimensionsDisplay(template)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Custom Size */}
            <div className="pt-3 border-t border-board-border flex-shrink-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-board-muted block mb-1">Width</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      value={widthInches}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="w-full px-2 py-1.5 pr-6 text-sm bg-board-dark border border-board-border rounded text-white focus:outline-none focus:border-board-accent"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-board-muted">"</span>
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
                      className="w-full px-2 py-1.5 pr-6 text-sm bg-board-dark border border-board-border rounded text-white focus:outline-none focus:border-board-accent"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-board-muted">"</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-board-muted mt-1.5">
                Usable: ~{formatArea(usableAreaMmSq)} sq in
              </p>
            </div>
          </div>
          
          {/* Budget & Power */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Budget */}
            <div className={`bg-board-surface border rounded-xl p-4 flex-1 ${
              board.constraints.applyAfterBudget ? 'border-amber-500/30' : 'border-board-border'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  Budget
                </h2>
                <ApplyAfterToggle 
                  enabled={board.constraints.applyAfterBudget || false}
                  onToggle={toggleApplyAfterBudget}
                />
              </div>
              
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-board-muted">$</span>
                <input
                  type="number"
                  value={board.constraints.maxBudget}
                  onChange={(e) => handleBudgetChange(parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 text-2xl font-bold bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent text-center"
                />
              </div>
              
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={board.constraints.maxBudget}
                onChange={(e) => handleBudgetChange(parseInt(e.target.value))}
                className="w-full accent-green-500 mb-2"
              />
              
              <div className="grid grid-cols-4 gap-1.5">
                {[300, 500, 1000, 2000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleBudgetChange(amount)}
                    className={`py-1.5 text-xs rounded border transition-colors ${
                      board.constraints.maxBudget === amount
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-board-border text-board-muted hover:border-green-500/50'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Power Supply */}
            <div className={`bg-board-surface border rounded-xl p-4 flex-1 ${
              board.constraints.applyAfterPower ? 'border-amber-500/30' : 'border-board-border'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Power Supply
                </h2>
                <ApplyAfterToggle 
                  enabled={board.constraints.applyAfterPower || false}
                  onToggle={toggleApplyAfterPower}
                />
              </div>
              
              <div className="relative mb-3">
                <input
                  type="number"
                  value={board.constraints.maxCurrentMa || 2000}
                  onChange={(e) => handlePowerChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 pr-12 text-lg bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-board-muted">mA</span>
              </div>
              
              <div className="grid grid-cols-4 gap-1.5">
                {[500, 1000, 2000, 3000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => handlePowerChange(amount)}
                    className={`py-1.5 text-xs rounded border transition-colors ${
                      board.constraints.maxCurrentMa === amount
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                        : 'border-board-border text-board-muted hover:border-yellow-500/50'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
