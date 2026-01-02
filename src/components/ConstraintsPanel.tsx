import { useState } from 'react';
import { Settings2, DollarSign, Ruler, Zap, ChevronDown } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { BOARD_TEMPLATES } from '../data/boardTemplates';
import { BoardTemplate } from '../types';

export function ConstraintsPanel() {
  const { state, dispatch } = useBoard();
  const { board } = state;
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const handleTemplateSelect = (template: BoardTemplate) => {
    setSelectedTemplate(template.id);
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
  
  const usableArea = (board.constraints.maxWidthMm * board.constraints.maxDepthMm * 0.85) / 100; // cm²
  
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
                    {template.widthMm}×{template.depthMm}mm
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
                  Width (mm)
                </label>
                <input
                  type="number"
                  value={board.constraints.maxWidthMm}
                  onChange={(e) => handleConstraintChange('maxWidthMm', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                  <Ruler className="w-4 h-4" />
                  Depth (mm)
                </label>
                <input
                  type="number"
                  value={board.constraints.maxDepthMm}
                  onChange={(e) => handleConstraintChange('maxDepthMm', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-board-dark border border-board-border rounded-lg text-white focus:outline-none focus:border-board-accent transition-colors"
                />
              </div>
            </div>
            
            <div className="text-xs text-board-muted">
              Usable area: ~{usableArea.toFixed(0)} cm² ({(usableArea / 10000 * 155).toFixed(1)} sq in)
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

