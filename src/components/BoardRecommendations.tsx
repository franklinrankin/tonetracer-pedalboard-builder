import { useState } from 'react';
import { Sparkles, Ruler, DollarSign, Zap, Check, ChevronDown, ArrowRight } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { BOARD_TEMPLATES, getTemplateDimensionsDisplay } from '../data/boardTemplates';
import { formatInches, formatArea } from '../utils/measurements';
import { BoardTemplate } from '../types';

interface BoardRecommendation {
  template: BoardTemplate;
  fitScore: number; // 0-100, how well pedals fit
  headroom: number; // percentage of extra space
}

export function BoardRecommendations() {
  const { state, dispatch } = useBoard();
  const { board, totalCost, totalArea, totalCurrent } = state;
  const [showAllBoards, setShowAllBoards] = useState(false);
  
  if (board.slots.length === 0) {
    return null;
  }
  
  // Calculate minimum dimensions needed
  const pedals = board.slots.map(s => s.pedal);
  const totalWidth = pedals.reduce((sum, p) => sum + p.widthMm, 0);
  const maxDepth = Math.max(...pedals.map(p => p.depthMm));
  
  // Add spacing between pedals (roughly 10mm per pedal gap)
  const spacingMm = (pedals.length - 1) * 10;
  const minWidthNeeded = totalWidth + spacingMm;
  const minDepthNeeded = maxDepth + 20; // 20mm buffer
  
  // Calculate area needed (with some padding)
  const minAreaNeeded = totalArea * 1.2; // 20% headroom
  
  // Find recommended board templates
  const getRecommendations = (): BoardRecommendation[] => {
    return BOARD_TEMPLATES
      .filter(t => t.widthMm > 0 && t.depthMm > 0) // Skip custom
      .map(template => {
        const templateArea = template.widthMm * template.depthMm * 0.85; // 85% usable
        const fitsWidth = template.widthMm >= minWidthNeeded * 0.9; // Allow 10% tight fit
        const fitsDepth = template.depthMm >= minDepthNeeded;
        const fitsArea = templateArea >= totalArea;
        
        // Calculate fit score
        let fitScore = 0;
        if (fitsWidth && fitsDepth && fitsArea) {
          // Perfect fit - calculate how much headroom
          const widthHeadroom = (template.widthMm - minWidthNeeded) / minWidthNeeded;
          const depthHeadroom = (template.depthMm - minDepthNeeded) / minDepthNeeded;
          const areaHeadroom = (templateArea - totalArea) / totalArea;
          
          // Ideal is 10-30% headroom - too much is wasteful, too little is tight
          const idealHeadroom = 0.2;
          const headroomScore = 1 - Math.abs(areaHeadroom - idealHeadroom);
          
          fitScore = Math.min(100, Math.round((headroomScore * 0.5 + 0.5) * 100));
        } else if (fitsArea) {
          // Might fit with creative arrangement
          fitScore = 40;
        }
        
        const headroom = templateArea > 0 ? ((templateArea - totalArea) / templateArea) * 100 : 0;
        
        return { template, fitScore, headroom };
      })
      .filter(r => r.fitScore > 0)
      .sort((a, b) => b.fitScore - a.fitScore);
  };
  
  const recommendations = getRecommendations();
  const topRecommendation = recommendations[0];
  const displayedRecommendations = showAllBoards ? recommendations : recommendations.slice(0, 3);
  
  // Calculate recommended budget (current total + 10% buffer for cables/accessories)
  const recommendedBudget = Math.ceil((totalCost * 1.1) / 50) * 50; // Round to nearest $50
  
  // Calculate recommended power supply
  const recommendedPower = Math.ceil((totalCurrent * 1.25) / 100) * 100; // 25% headroom, round to 100mA
  
  // Common power supply options
  const powerOptions = [
    { name: 'Basic (500mA)', mA: 500, price: '$30-50' },
    { name: 'Standard (1000mA)', mA: 1000, price: '$80-120' },
    { name: 'Pro (2000mA)', mA: 2000, price: '$150-200' },
    { name: 'High-Current (3000mA+)', mA: 3000, price: '$200+' },
  ];
  
  const recommendedPowerOption = powerOptions.find(p => p.mA >= recommendedPower) || powerOptions[powerOptions.length - 1];
  
  const applyBoardRecommendation = (template: BoardTemplate) => {
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        maxWidthMm: template.widthMm,
        maxDepthMm: template.depthMm,
      },
    });
  };
  
  const applyBudgetRecommendation = () => {
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        maxBudget: recommendedBudget,
      },
    });
  };
  
  const applyPowerRecommendation = () => {
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        ...board.constraints,
        maxCurrentMa: recommendedPower,
      },
    });
  };
  
  const applyAllRecommendations = () => {
    if (topRecommendation) {
      dispatch({
        type: 'SET_CONSTRAINTS',
        constraints: {
          ...board.constraints,
          maxWidthMm: topRecommendation.template.widthMm,
          maxDepthMm: topRecommendation.template.depthMm,
          maxBudget: recommendedBudget,
          maxCurrentMa: recommendedPower,
        },
      });
    }
  };
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-board-border bg-gradient-to-r from-board-accent/10 to-board-highlight/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-board-accent/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-board-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Recommended Setup</h2>
              <p className="text-xs text-board-muted">Based on your {board.slots.length} pedals</p>
            </div>
          </div>
          
          <button
            onClick={applyAllRecommendations}
            className="px-4 py-2 text-sm font-medium bg-board-accent text-white rounded-lg hover:bg-board-accent-dim transition-colors flex items-center gap-2"
          >
            Apply All
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 border-b border-board-border bg-board-elevated/30">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{formatArea(totalArea)}</div>
          <div className="text-xs text-board-muted">sq in needed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">${totalCost}</div>
          <div className="text-xs text-board-muted">pedal cost</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{totalCurrent}mA</div>
          <div className="text-xs text-board-muted">power draw</div>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Board Size Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Recommended Board Size</h3>
          </div>
          
          <div className="space-y-2">
            {displayedRecommendations.map((rec, index) => {
              const isCurrentSize = 
                board.constraints.maxWidthMm === rec.template.widthMm &&
                board.constraints.maxDepthMm === rec.template.depthMm;
              
              return (
                <button
                  key={rec.template.id}
                  onClick={() => applyBoardRecommendation(rec.template)}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                    isCurrentSize
                      ? 'border-board-accent bg-board-accent/10'
                      : 'border-board-border hover:border-board-accent/50 bg-board-elevated/50'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    index === 0 
                      ? 'bg-board-accent/20 text-board-accent' 
                      : 'bg-board-elevated text-board-muted'
                  }`}>
                    {index === 0 ? <Sparkles className="w-4 h-4" /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{rec.template.name}</span>
                      {index === 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-board-accent/20 text-board-accent">
                          BEST FIT
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-board-muted">
                      {getTemplateDimensionsDisplay(rec.template)} • {rec.headroom.toFixed(0)}% headroom
                    </div>
                  </div>
                  
                  {/* Status */}
                  {isCurrentSize ? (
                    <Check className="w-5 h-5 text-board-accent flex-shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-board-muted flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
          
          {recommendations.length > 3 && (
            <button
              onClick={() => setShowAllBoards(!showAllBoards)}
              className="w-full mt-2 py-2 text-xs text-board-muted hover:text-white transition-colors flex items-center justify-center gap-1"
            >
              {showAllBoards ? 'Show Less' : `Show ${recommendations.length - 3} More Options`}
              <ChevronDown className={`w-3 h-3 transition-transform ${showAllBoards ? 'rotate-180' : ''}`} />
            </button>
          )}
          
          {recommendations.length === 0 && (
            <div className="p-4 rounded-lg bg-board-warning/10 border border-board-warning/30 text-center">
              <p className="text-sm text-board-warning">
                Your pedals are too large for standard boards. Consider a custom build or removing some pedals.
              </p>
              <p className="text-xs text-board-muted mt-1">
                Minimum needed: {formatInches(minWidthNeeded)}" × {formatInches(minDepthNeeded)}"
              </p>
            </div>
          )}
        </div>
        
        {/* Budget Recommendation */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-medium text-white">Recommended Budget</h3>
          </div>
          
          <button
            onClick={applyBudgetRecommendation}
            className={`w-full p-4 rounded-lg border text-left transition-all ${
              board.constraints.maxBudget === recommendedBudget
                ? 'border-board-success bg-board-success/10'
                : 'border-board-border hover:border-board-success/50 bg-board-elevated/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">${recommendedBudget}</div>
                <div className="text-xs text-board-muted">
                  Includes ${totalCost} for pedals + ~10% for cables & accessories
                </div>
              </div>
              {board.constraints.maxBudget === recommendedBudget ? (
                <Check className="w-5 h-5 text-board-success" />
              ) : (
                <span className="px-3 py-1 text-xs font-medium rounded bg-board-success/20 text-board-success">
                  Apply
                </span>
              )}
            </div>
          </button>
          
          {board.constraints.maxBudget < totalCost && (
            <p className="text-xs text-board-warning mt-2">
              ⚠️ Current budget (${board.constraints.maxBudget}) is below pedal cost (${totalCost})
            </p>
          )}
        </div>
        
        {/* Power Supply Recommendation */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-medium text-white">Recommended Power Supply</h3>
          </div>
          
          <button
            onClick={applyPowerRecommendation}
            className={`w-full p-4 rounded-lg border text-left transition-all ${
              board.constraints.maxCurrentMa === recommendedPower
                ? 'border-board-warning bg-board-warning/10'
                : 'border-board-border hover:border-board-warning/50 bg-board-elevated/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{recommendedPower}mA+</div>
                <div className="text-xs text-board-muted">
                  {recommendedPowerOption.name} ({recommendedPowerOption.price})
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Your pedals draw {totalCurrent}mA • 25% headroom recommended
                </div>
              </div>
              {board.constraints.maxCurrentMa === recommendedPower ? (
                <Check className="w-5 h-5 text-board-warning" />
              ) : (
                <span className="px-3 py-1 text-xs font-medium rounded bg-board-warning/20 text-board-warning">
                  Apply
                </span>
              )}
            </div>
          </button>
          
          {/* Power Supply Options */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {powerOptions.map(option => {
              const isSelected = board.constraints.maxCurrentMa === option.mA;
              const isSufficient = option.mA >= totalCurrent;
              
              return (
                <button
                  key={option.mA}
                  onClick={() => dispatch({
                    type: 'SET_CONSTRAINTS',
                    constraints: { ...board.constraints, maxCurrentMa: option.mA },
                  })}
                  disabled={!isSufficient}
                  className={`p-2 rounded-lg border text-left text-xs transition-all ${
                    isSelected
                      ? 'border-board-warning bg-board-warning/10'
                      : isSufficient
                        ? 'border-board-border hover:border-board-warning/50'
                        : 'border-board-border/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="font-medium text-white">{option.mA}mA</div>
                  <div className="text-board-muted">{option.price}</div>
                  {!isSufficient && (
                    <div className="text-board-danger text-[10px] mt-0.5">Too small</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

