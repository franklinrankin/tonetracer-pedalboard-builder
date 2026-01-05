import { Sparkles, ArrowRight, Music2 } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { CATEGORY_INFO } from '../data/categories';
import { getGenreById } from '../data/genres';
import { Pedal, Category, PedalWithStatus } from '../types';

// Fisher-Yates shuffle for variety
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Pick a random item from the top N best options
function pickRandomFromTopN<T>(items: T[], n: number = 5): T | undefined {
  if (items.length === 0) return undefined;
  const topN = items.slice(0, Math.min(n, items.length));
  return topN[Math.floor(Math.random() * topN.length)];
}

interface Recommendation {
  type: 'swap' | 'add' | 'remove' | 'upgrade' | 'genre';
  title: string;
  description: string;
  currentPedal?: Pedal;
  suggestedPedal?: Pedal;
  reason: string;
  impact: string;
  priority?: number;
}

export function Recommendations() {
  const { state, dispatch } = useBoard();
  const { board, allPedals, sectionScores, selectedGenres } = state;
  
  // Use primary genre for recommendations (first selected)
  const genre = selectedGenres.length > 0 ? getGenreById(selectedGenres[0]) : null;
  
  // Generate recommendations based on current board state and selected genre
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // GENRE-BASED RECOMMENDATIONS (higher priority)
    if (genre) {
      // Check what sections need pedals based on genre targets
      for (const [category, target] of Object.entries(genre.sectionTargets)) {
        if (!target) continue;
        
        const currentScore = sectionScores.find(s => s.category === category)?.totalScore || 0;
        const hasCategoryPedals = board.slots.some(s => s.pedal.category === category);
        
        // If we're below minimum for this genre
        if (currentScore < target.min) {
          // Find pedals that match genre preferences
          const genrePedals = allPedals.filter(p => 
            p.category === category &&
            p.fits &&
            !board.slots.some(s => s.pedal.id === p.id) &&
            (genre.preferredSubtypes.includes(p.subtype || '') || 
             genre.keywords.some(kw => p.description?.toLowerCase().includes(kw)))
          ).sort((a, b) => {
            // Prioritize pedals that get us closer to ideal
            const aToIdeal = Math.abs((currentScore + a.categoryRating) - target.ideal);
            const bToIdeal = Math.abs((currentScore + b.categoryRating) - target.ideal);
            return aToIdeal - bToIdeal;
          });
          
          // Fallback to any fitting pedal in category
          const fallbackPedals = allPedals.filter(p =>
            p.category === category &&
            p.fits &&
            !board.slots.some(s => s.pedal.id === p.id)
          ).sort((a, b) => {
            const aToIdeal = Math.abs((currentScore + a.categoryRating) - target.ideal);
            const bToIdeal = Math.abs((currentScore + b.categoryRating) - target.ideal);
            return aToIdeal - bToIdeal;
          });
          
          // Pick randomly from top options for variety
          const bestMatch = pickRandomFromTopN(genrePedals, 5) || pickRandomFromTopN(fallbackPedals, 5);
          
          if (bestMatch) {
            const neededPoints = target.min - currentScore;
            recommendations.push({
              type: 'genre',
              title: `${genre.name}: Add ${CATEGORY_INFO[category as Category].displayName}`,
              description: `Add ${bestMatch.model}`,
              suggestedPedal: bestMatch,
              reason: hasCategoryPedals 
                ? `Need ${neededPoints}+ more points to hit ${genre.name} target`
                : `${genre.name} needs ${CATEGORY_INFO[category as Category].displayName.toLowerCase()}`,
              impact: '+$' + bestMatch.reverbPrice,
              priority: 10,
            });
          }
        }
        
        // If we're above maximum for this genre - suggest removal or swap
        if (currentScore > target.max && hasCategoryPedals) {
          const categoryPedals = board.slots
            .filter(s => s.pedal.category === category)
            .sort((a, b) => b.pedal.categoryRating - a.pedal.categoryRating);
          
          if (categoryPedals.length > 1) {
            const highestRated = categoryPedals[0].pedal;
            const lowerAlternative = allPedals.find(p =>
              p.category === category &&
              p.fits &&
              p.categoryRating < highestRated.categoryRating &&
              (currentScore - highestRated.categoryRating + p.categoryRating) <= target.max &&
              p.id !== highestRated.id
            );
            
            if (lowerAlternative) {
              recommendations.push({
                type: 'genre',
                title: `${genre.name}: Dial Back ${CATEGORY_INFO[category as Category].displayName}`,
                description: `Swap ${highestRated.model} for ${lowerAlternative.model}`,
                currentPedal: highestRated,
                suggestedPedal: lowerAlternative,
                reason: `Current ${category} level exceeds ${genre.name} style`,
                impact: lowerAlternative.reverbPrice > highestRated.reverbPrice 
                  ? `+$${lowerAlternative.reverbPrice - highestRated.reverbPrice}`
                  : `-$${highestRated.reverbPrice - lowerAlternative.reverbPrice}`,
                priority: 8,
              });
            }
          }
        }
      }
      
      // Suggest preferred pedal types for genre
      const missingPreferredTypes = genre.preferredSubtypes.filter(subtype =>
        !board.slots.some(s => s.pedal.subtype === subtype)
      );
      
      if (missingPreferredTypes.length > 0 && recommendations.length < 3) {
        const preferredType = missingPreferredTypes[0];
        const matchingPedal = allPedals.find(p =>
          p.subtype === preferredType &&
          p.fits &&
          !board.slots.some(s => s.pedal.id === p.id)
        );
        
        if (matchingPedal) {
          recommendations.push({
            type: 'genre',
            title: `${genre.name} Essential: ${preferredType}`,
            description: `Add ${matchingPedal.model}`,
            suggestedPedal: matchingPedal,
            reason: `${preferredType} is key for ${genre.name} tones`,
            impact: '+$' + matchingPedal.reverbPrice,
            priority: 7,
          });
        }
      }
    }
    
    // GENERAL RECOMMENDATIONS (if no genre or to supplement)
    if (board.slots.length === 0 && !genre) {
      return [];
    }
    
    // Only add general recommendations if we have few genre recommendations
    if (recommendations.length < 3) {
      // Check for missing essentials
      const hasTuner = board.slots.some(s => s.pedal.subtype === 'Tuner');
      
      if (!hasTuner && board.slots.length > 0) {
        const tuners = allPedals.filter(p => p.subtype === 'Tuner' && p.fits);
        if (tuners.length > 0) {
          recommendations.push({
            type: 'add',
            title: 'Add a Tuner',
            description: `Consider adding ${tuners[0].model}`,
            suggestedPedal: tuners[0],
            reason: 'Every board needs a tuner! Stay in tune, mute silently.',
            impact: '+$' + tuners[0].reverbPrice,
            priority: 5,
          });
        }
      }
      
      // Space optimization suggestions
      const largePedals = board.slots.filter(s => s.pedal.widthMm > 100 || s.pedal.depthMm > 140);
      largePedals.slice(0, 1).forEach(slot => {
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
            reason: `Save ${slot.pedal.widthMm - alt.widthMm}mm width`,
            impact: alt.reverbPrice > slot.pedal.reverbPrice 
              ? `+$${alt.reverbPrice - slot.pedal.reverbPrice}` 
              : `-$${slot.pedal.reverbPrice - alt.reverbPrice}`,
            priority: 3,
          });
        }
      });
      
      // Budget optimization
      const expensivePedals = board.slots.filter(s => s.pedal.reverbPrice > 200);
      expensivePedals.slice(0, 1).forEach(slot => {
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
            reason: `Similar rating, much cheaper`,
            impact: `-$${slot.pedal.reverbPrice - alt.reverbPrice}`,
            priority: 2,
          });
        }
      });
    }
    
    // Sort by priority and limit
    return recommendations
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 5);
  };
  
  const recommendations = generateRecommendations();
  
  // Show starter suggestions if board is empty but genre is selected
  if (board.slots.length === 0 && genre) {
    const starterPedals = allPedals
      .filter(p => 
        p.fits &&
        (genre.preferredSubtypes.includes(p.subtype || '') ||
         Object.keys(genre.sectionTargets).includes(p.category))
      )
      .sort((a, b) => {
        // Prioritize by matching preferred subtypes
        const aMatch = genre.preferredSubtypes.includes(a.subtype || '') ? 1 : 0;
        const bMatch = genre.preferredSubtypes.includes(b.subtype || '') ? 1 : 0;
        return bMatch - aMatch || a.reverbPrice - b.reverbPrice;
      })
      .slice(0, 5);
    
    return (
      <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-board-border">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${genre.color}20` }}
            >
              <Music2 className="w-5 h-5" style={{ color: genre.color }} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Start Your {genre.name} Board</h2>
              <p className="text-xs text-board-muted">Suggested pedals to get started</p>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-board-border">
          {starterPedals.map((pedal, index) => (
            <div key={pedal.id} className="p-4 hover:bg-board-elevated/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="px-2 py-0.5 text-xs font-medium rounded-full"
                      style={{ backgroundColor: `${genre.color}20`, color: genre.color }}
                    >
                      {pedal.subtype || pedal.category}
                    </span>
                    <span className="text-sm font-medium text-white">{pedal.model}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-1">{pedal.brand}</p>
                  <span className="text-xs text-board-muted">${pedal.reverbPrice}</span>
                </div>
                
                <button
                  onClick={() => dispatch({ type: 'ADD_PEDAL', pedal })}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                  style={{ backgroundColor: `${genre.color}20`, color: genre.color }}
                >
                  Add
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
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
            <h2 className="font-semibold text-white">
              {genre ? `Perfect for ${genre.name}!` : 'All Good!'}
            </h2>
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
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ 
              backgroundColor: genre ? `${genre.color}20` : 'rgba(255, 210, 63, 0.2)'
            }}
          >
            {genre ? (
              <Music2 className="w-5 h-5" style={{ color: genre.color }} />
            ) : (
              <Sparkles className="w-5 h-5 text-board-highlight" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-white">
              {genre ? `${genre.name} Suggestions` : 'Smart Suggestions'}
            </h2>
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
                    rec.type === 'genre'
                      ? 'bg-purple-500/20 text-purple-400'
                      : rec.type === 'swap' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : rec.type === 'add'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {rec.type === 'genre' ? 'GENRE' : rec.type.toUpperCase()}
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
                onClick={() => rec.type === 'swap' || rec.currentPedal ? handleApplySwap(rec) : handleApplyAdd(rec)}
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
