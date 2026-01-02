import { useState } from 'react';
import { Settings2, Ruler, DollarSign, Zap, ChevronRight, Check } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { BOARD_TEMPLATES, getTemplateDimensionsDisplay } from '../data/boardTemplates';
import { BoardTemplate } from '../types';
import { formatInches, inchesToMm, formatArea } from '../utils/measurements';

interface ConstraintsPageProps {
  onContinue: () => void;
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
      </div>
      
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Board Size Selection */}
          <div className="bg-board-surface border border-board-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-board-accent" />
              Board Size
            </h2>
            
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
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedTemplate === template.id
                            ? 'border-board-accent bg-board-accent/10'
                            : 'border-board-border hover:border-board-accent/50 bg-board-elevated/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white truncate">{template.name}</span>
                          {selectedTemplate === template.id && (
                            <Check className="w-4 h-4 text-board-accent flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-board-muted mt-0.5">
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
          </div>
          
          {/* Budget & Power */}
          <div className="space-y-6">
            {/* Budget */}
            <div className="bg-board-surface border border-board-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-board-success" />
                Budget
              </h2>
              
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
            <div className="bg-board-surface border border-board-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-board-warning" />
                Power Supply (Optional)
              </h2>
              
              <p className="text-sm text-zinc-400 mb-4">
                Set the total mA your power supply can provide. We'll warn you if your pedals exceed this.
              </p>
              
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

