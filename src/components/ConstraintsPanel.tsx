import { useState } from 'react';
import { Settings2, DollarSign, Ruler, Zap, ChevronDown } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { BOARD_TEMPLATES, getTemplateDimensionsDisplay } from '../data/boardTemplates';
import { BoardTemplate } from '../types';
import { mmToInches, inchesToMm, formatInches, formatArea } from '../utils/measurements';

export function ConstraintsPanel() {
  const { state, dispatch } = useBoard();
  const { board } = state;
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Local state for inch inputs (to avoid conversion rounding issues while typing)
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
  
  const handleConstraintChange = (key: string, value: number) => {
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        [key]: value,
      },
    });
    setSelectedTemplate(null);
  };
  
  // Calculate usable area in square inches
  const usableAreaMmSq = board.constraints.maxWidthMm * board.constraints.maxDepthMm * 0.85;
  const usableAreaInSq = formatArea(usableAreaMmSq);
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-board-elevated/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-board-accent/10 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-board-accent" />
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-white">Board Constraints</h2>
            <p className="text-xs text-board-muted">Size • Budget • Power</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-board-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0 space-y-6 animate-fadeIn">
          {/* Board Templates */}
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-3 block">Board Template</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
              {BOARD_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-board-accent bg-board-accent/10'
                      : 'border-board-border hover:border-board-accent/50 bg-board-elevated/50'
                  }`}
                >
                  <div className="text-sm font-medium text-white truncate">{template.name}</div>
                  <div className="text-xs text-board-muted mt-0.5">
                    {getTemplateDimensionsDisplay(template)}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Manual Controls */}
          <div className="space-y-4">
            {/* Board Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                  <Ruler className="w-4 h-4" />
                  Width (in)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={widthInches}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full px-3 py-2 pr-8 bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-board-muted text-sm">"</span>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                  <Ruler className="w-4 h-4" />
                  Depth (in)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={depthInches}
                    onChange={(e) => handleDepthChange(e.target.value)}
                    className="w-full px-3 py-2 pr-8 bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-board-muted text-sm">"</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-board-muted">
              Usable area: ~{usableAreaInSq} sq in
            </div>
            
            {/* Budget */}
            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                <DollarSign className="w-4 h-4" />
                Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-board-muted">$</span>
                <input
                  type="number"
                  value={board.constraints.maxBudget}
                  onChange={(e) => handleConstraintChange('maxBudget', parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent transition-colors"
                />
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={board.constraints.maxBudget}
                onChange={(e) => handleConstraintChange('maxBudget', parseInt(e.target.value))}
                className="w-full mt-2 accent-board-accent"
              />
            </div>
            
            {/* Power */}
            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                <Zap className="w-4 h-4" />
                Max Power (mA)
              </label>
              <input
                type="number"
                value={board.constraints.maxCurrentMa || 2000}
                onChange={(e) => handleConstraintChange('maxCurrentMa', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent transition-colors"
              />
              <p className="text-xs text-board-muted mt-1">
                Typical isolated supply: 500-2000mA total
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
