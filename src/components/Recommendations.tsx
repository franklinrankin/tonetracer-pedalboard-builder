import { useState } from 'react';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { CATEGORY_INFO } from '../data/categories';
import { Pedal, Category } from '../types';

interface Recommendation {
  type: 'swap' | 'add' | 'remove' | 'upgrade';
  title: string;
  description: string;
  currentPedal?: Pedal;
  suggestedPedal?: Pedal;
  reason: string;
  impact: string;
}

export function Recommendations() {
  const { state, dispatch } = useBoard();
  const { board, allPedals, sectionScores } = state;
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Generate recommendations based on current board state
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    if (board.slots.length === 0) {
      return [];
    }
    
    // Check for missing essentials
    const hasGain = board.slots.some(s => s.pedal.category === 'gain');
    const hasTuner = board.slots.some(s => s.pedal.subtype === 'Tuner');
    const hasDelay = board.slots.some(s => s.pedal.category === 'delay');
    const hasReverb = board.slots.some(s => s.pedal.category === 'reverb');
    
    if (!hasTuner) {
      const tuners = allPedals.filter(p => p.subtype === 'Tuner' && p.fits);
      if (tuners.length > 0) {
        recommendations.push({
          type: 'add',
          title: 'Add a Tuner',
          description: `Consider adding ${tuners[0].model}`,
          suggestedPedal: tuners[0],
          reason: 'Every board needs a tuner! Stay in tune, mute silently.',
          impact: '+$' + tuners[0].reverbPrice,
        });
      }
    }
    
    // Space optimization suggestions
    const largePedals = board.slots.filter(s => s.pedal.widthMm > 100 || s.pedal.depthMm > 140);
    largePedals.forEach(slot => {
      const smallerAlternatives = allPedals.filter(p => 
        p.category === slot.pedal.category &&
        p.fits &&
        p.widthMm < slot.pedal.widthMm &&
        p.depthMm < slot.pedal.depthMm &&
        p.id !== slot.pedal.id
      ).sort((a, b) => (a.widthMm * a.depthMm) - (b.widthMm * b.depthMm));
      
      if (smallerAlternatives.length > 0) {
        const alt = smallerAlternatives[0];
        recommendations.push({
          type: 'swap',
          title: `Space Saver: ${slot.pedal.model}`,
          description: `Swap for ${alt.model}`,
          currentPedal: slot.pedal,
          suggestedPedal: alt,
          reason: `Save ${slot.pedal.widthMm - alt.widthMm}mm width, ${slot.pedal.depthMm - alt.depthMm}mm depth`,
          impact: alt.reverbPrice > slot.pedal.reverbPrice 
            ? `+$${alt.reverbPrice - slot.pedal.reverbPrice}` 
            : `-$${slot.pedal.reverbPrice - alt.reverbPrice}`,
        });
      }
    });
    
    // Budget optimization
    const expensivePedals = board.slots.filter(s => s.pedal.reverbPrice > 200);
    expensivePedals.forEach(slot => {
      const cheaperAlternatives = allPedals.filter(p => 
        p.category === slot.pedal.category &&
        p.fits &&
        p.reverbPrice < slot.pedal.reverbPrice * 0.6 &&
        p.categoryRating >= slot.pedal.categoryRating - 2 &&
        p.id !== slot.pedal.id
      ).sort((a, b) => b.categoryRating - a.categoryRating);
      
      if (cheaperAlternatives.length > 0) {
        const alt = cheaperAlternatives[0];
        recommendations.push({
          type: 'swap',
          title: `Budget Option: ${slot.pedal.model}`,
          description: `Swap for ${alt.model}`,
          currentPedal: slot.pedal,
          suggestedPedal: alt,
          reason: `Similar rating (${alt.categoryRating} vs ${slot.pedal.categoryRating}), much cheaper`,
          impact: `-$${slot.pedal.reverbPrice - alt.reverbPrice}`,
        });
      }
    });
    
    // Section enhancement suggestions
    sectionScores.forEach(section => {
      const info = CATEGORY_INFO[section.category];
      const tagIndex = info.tags.indexOf(section.tag);
      
      // If not at max tag level, suggest upgrade
      if (tagIndex < info.tags.length - 1 && section.pedals.length > 0) {
        const upgrades = allPedals.filter(p => 
          p.category === section.category &&
          p.fits &&
          p.categoryRating > Math.max(...section.pedals.map(sp => sp.categoryRating)) &&
          !board.slots.some(s => s.pedal.id === p.id)
        ).sort((a, b) => b.categoryRating - a.categoryRating);
        
        if (upgrades.length > 0) {
          recommendations.push({
            type: 'add',
            title: `Boost ${info.displayName}`,
            description: `Add ${upgrades[0].model}`,
            suggestedPedal: upgrades[0],
            reason: `Reach "${info.tags[tagIndex + 1]}" tag level`,
            impact: '+$' + upgrades[0].reverbPrice,
          });
        }
      }
    });
    
    // Top-jack suggestions for space
    const sideJackPedals = board.slots.filter(s => !s.pedal.topJacks);
    if (sideJackPedals.length >= 3) {
      const topJackAlternatives = sideJackPedals.map(slot => {
        const alt = allPedals.find(p => 
          p.category === slot.pedal.category &&
          p.fits &&
          p.topJacks &&
          p.categoryRating >= slot.pedal.categoryRating - 1 &&
          p.id !== slot.pedal.id
        );
        return { slot, alt };
      }).filter(x => x.alt);
      
      if (topJackAlternatives.length > 0) {
        const { slot, alt } = topJackAlternatives[0];
        recommendations.push({
          type: 'swap',
          title: 'Top-Jack Alternative',
          description: `${slot.pedal.model} → ${alt!.model}`,
          currentPedal: slot.pedal,
          suggestedPedal: alt,
          reason: 'Top-mounted jacks save horizontal space',
          impact: alt!.reverbPrice > slot.pedal.reverbPrice 
            ? `+$${alt!.reverbPrice - slot.pedal.reverbPrice}` 
            : `-$${slot.pedal.reverbPrice - alt!.reverbPrice}`,
        });
      }
    }
    
    return recommendations.slice(0, 5);
  };
  
  const recommendations = generateRecommendations();
  
  if (board.slots.length === 0) {
    return null;
  }
  
  if (recommendations.length === 0) {
    return (
      <div className="bg-board-surface border border-board-border rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-board-success/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-board-success" />
          </div>
          <div>
            <h2 className="font-semibold text-white">All Good!</h2>
            <p className="text-xs text-board-muted">No recommendations right now</p>
          </div>
        </div>
      </div>
    );
  }
  
  const handleApplySwap = (rec: Recommendation) => {
    if (rec.currentPedal) {
      dispatch({ type: 'REMOVE_PEDAL', pedalId: rec.currentPedal.id });
    }
    if (rec.suggestedPedal) {
      dispatch({ type: 'ADD_PEDAL', pedal: rec.suggestedPedal });
    }
  };
  
  const handleApplyAdd = (rec: Recommendation) => {
    if (rec.suggestedPedal) {
      dispatch({ type: 'ADD_PEDAL', pedal: rec.suggestedPedal });
    }
  };
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-board-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-board-highlight/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-board-highlight" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Smart Suggestions</h2>
            <p className="text-xs text-board-muted">{recommendations.length} ways to optimize</p>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-board-border">
        {recommendations.map((rec, index) => (
          <div key={index} className="p-4 hover:bg-board-elevated/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    rec.type === 'swap' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : rec.type === 'add'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {rec.type.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-white">{rec.title}</span>
                </div>
                
                <p className="text-sm text-zinc-400 mb-2">{rec.description}</p>
                
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-board-muted">{rec.reason}</span>
                  <span className={`font-mono ${
                    rec.impact.startsWith('-') ? 'text-board-success' : 'text-board-warning'
                  }`}>
                    {rec.impact}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => rec.type === 'swap' ? handleApplySwap(rec) : handleApplyAdd(rec)}
                className="px-3 py-1.5 text-xs font-medium bg-board-accent/20 text-board-accent rounded-lg hover:bg-board-accent/30 transition-colors flex items-center gap-1"
              >
                Apply
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

