import { useState } from 'react';
import { GraduationCap, Plus, ChevronDown, ChevronRight, Lightbulb, Info, Check } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { getGenreById, GenreProfile } from '../data/genres';
import { getPedalEducation } from '../data/pedalEducation';
import { CATEGORY_INFO } from '../data/categories';
import { PedalWithStatus, Category } from '../types';
import { formatInches } from '../utils/measurements';

interface StarterKitPedal {
  pedal: PedalWithStatus;
  priority: 'essential' | 'recommended' | 'optional';
  reason: string;
  education?: {
    whatItDoes: string;
    beginnerTip: string;
  };
}

export function GenreStarterKit() {
  const { state, dispatch } = useBoard();
  const { selectedGenre, allPedals, board } = state;
  const [expandedPedal, setExpandedPedal] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const genre = selectedGenre ? getGenreById(selectedGenre) : null;
  
  if (!genre) {
    return (
      <div className="bg-board-surface border border-board-border rounded-xl p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <GraduationCap className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Genre Starter Kits</h2>
        <p className="text-sm text-board-muted max-w-sm mx-auto">
          Select a genre from the Genre Guide to see recommended pedals with beginner-friendly explanations.
        </p>
      </div>
    );
  }
  
  const onBoardIds = new Set(board.slots.map(s => s.pedal.id));
  
  // Generate starter kit based on genre
  const generateStarterKit = (): StarterKitPedal[] => {
    const kit: StarterKitPedal[] = [];
    
    // Always suggest a tuner first
    const tuner = allPedals.find(p => p.subtype === 'Tuner' && p.fits);
    if (tuner) {
      const education = getPedalEducation('Tuner');
      kit.push({
        pedal: tuner,
        priority: 'essential',
        reason: 'Every guitarist needs a tuner!',
        education: education ? {
          whatItDoes: education.whatItDoes,
          beginnerTip: education.beginnerTip,
        } : undefined,
      });
    }
    
    // Add pedals based on genre section targets
    for (const [category, target] of Object.entries(genre.sectionTargets)) {
      if (!target) continue;
      
      // Find pedals that match genre preferences
      const categoryPedals = allPedals.filter(p => 
        p.category === category &&
        p.fits &&
        !onBoardIds.has(p.id) &&
        !kit.some(k => k.pedal.id === p.id)
      );
      
      // Prioritize preferred subtypes
      const preferredPedals = categoryPedals.filter(p => 
        genre.preferredSubtypes.includes(p.subtype || '')
      );
      
      const otherPedals = categoryPedals.filter(p => 
        !genre.preferredSubtypes.includes(p.subtype || '')
      );
      
      // Sort by rating to get good options at different price points
      const sortedPreferred = [...preferredPedals].sort((a, b) => {
        // Prefer mid-range prices for beginners
        const aMidRange = Math.abs(a.reverbPrice - 100);
        const bMidRange = Math.abs(b.reverbPrice - 100);
        return aMidRange - bMidRange;
      });
      
      const sortedOther = [...otherPedals].sort((a, b) => {
        const aMidRange = Math.abs(a.reverbPrice - 100);
        const bMidRange = Math.abs(b.reverbPrice - 100);
        return aMidRange - bMidRange;
      });
      
      // Add preferred pedals as essential/recommended
      sortedPreferred.slice(0, 2).forEach((pedal, idx) => {
        const education = getPedalEducation(pedal.subtype || '');
        const categoryInfo = CATEGORY_INFO[category as Category];
        
        kit.push({
          pedal,
          priority: idx === 0 ? 'essential' : 'recommended',
          reason: idx === 0 
            ? `Key ${categoryInfo.displayName.toLowerCase()} for ${genre.name}`
            : `Great alternative ${pedal.subtype?.toLowerCase() || categoryInfo.displayName.toLowerCase()}`,
          education: education ? {
            whatItDoes: education.whatItDoes,
            beginnerTip: education.beginnerTip,
          } : undefined,
        });
      });
      
      // Add some other options
      sortedOther.slice(0, 1).forEach(pedal => {
        const education = getPedalEducation(pedal.subtype || '');
        
        kit.push({
          pedal,
          priority: 'optional',
          reason: `Optional ${pedal.subtype?.toLowerCase() || 'pedal'} to expand your sound`,
          education: education ? {
            whatItDoes: education.whatItDoes,
            beginnerTip: education.beginnerTip,
          } : undefined,
        });
      });
    }
    
    // Sort by priority
    const priorityOrder = { essential: 0, recommended: 1, optional: 2 };
    return kit.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };
  
  const starterKit = generateStarterKit();
  const displayedKit = showAll ? starterKit : starterKit.slice(0, 6);
  
  const essentialCount = starterKit.filter(k => k.priority === 'essential').length;
  const totalCost = starterKit
    .filter(k => k.priority === 'essential' || k.priority === 'recommended')
    .reduce((sum, k) => sum + k.pedal.reverbPrice, 0);
  
  const handleAddPedal = (pedal: PedalWithStatus) => {
    dispatch({ type: 'ADD_PEDAL', pedal });
  };
  
  const handleAddAllEssentials = () => {
    starterKit
      .filter(k => k.priority === 'essential' && !onBoardIds.has(k.pedal.id))
      .forEach(k => dispatch({ type: 'ADD_PEDAL', pedal: k.pedal }));
  };
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 border-b border-board-border"
        style={{ backgroundColor: `${genre.color}10` }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${genre.color}20` }}
          >
            <GraduationCap className="w-5 h-5" style={{ color: genre.color }} />
          </div>
          <div>
            <h2 className="font-semibold text-white">{genre.name} Starter Kit</h2>
            <p className="text-xs text-board-muted">Beginner-friendly pedal guide</p>
          </div>
        </div>
        
        <p className="text-sm text-zinc-400 mb-3">{genre.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-board-muted">
              <span className="text-white font-medium">{essentialCount}</span> essentials
            </span>
            <span className="text-board-muted">
              ~<span className="text-white font-medium">${totalCost}</span> total
            </span>
          </div>
          
          <button
            onClick={handleAddAllEssentials}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
            style={{ backgroundColor: `${genre.color}20`, color: genre.color }}
          >
            <Plus className="w-3 h-3" />
            Add All Essentials
          </button>
        </div>
      </div>
      
      {/* Signal Chain Tip */}
      <div className="px-4 py-3 bg-board-elevated/50 border-b border-board-border">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-board-highlight flex-shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-400">
            <span className="text-board-highlight font-medium">Signal Chain Tip:</span> Connect pedals in this order: Tuner → Wah/Filter → Compressor → Gain → Modulation → Delay → Reverb
          </div>
        </div>
      </div>
      
      {/* Pedal List */}
      <div className="divide-y divide-board-border">
        {displayedKit.map((item, index) => {
          const isExpanded = expandedPedal === item.pedal.id;
          const isOnBoard = onBoardIds.has(item.pedal.id);
          const categoryInfo = CATEGORY_INFO[item.pedal.category];
          
          return (
            <div key={item.pedal.id} className="p-4">
              {/* Main Row */}
              <div className="flex items-start gap-3">
                {/* Priority Badge */}
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.priority === 'essential' 
                      ? 'bg-green-500/20 text-green-400' 
                      : item.priority === 'recommended'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-zinc-500/20 text-zinc-400'
                  }`}
                >
                  <span className="text-xs font-bold">{index + 1}</span>
                </div>
                
                {/* Pedal Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="px-1.5 py-0.5 text-[10px] font-medium rounded"
                      style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                    >
                      {item.pedal.subtype || categoryInfo.displayName}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                      item.priority === 'essential' 
                        ? 'bg-green-500/20 text-green-400' 
                        : item.priority === 'recommended'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-white">{item.pedal.model}</h3>
                  <p className="text-xs text-board-muted">{item.pedal.brand}</p>
                  
                  <div className="flex items-center gap-3 mt-1 text-xs text-board-muted">
                    <span>${item.pedal.reverbPrice}</span>
                    <span>{formatInches(item.pedal.widthMm)}" × {formatInches(item.pedal.depthMm)}"</span>
                  </div>
                  
                  <p className="text-xs text-zinc-400 mt-2">{item.reason}</p>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  {isOnBoard ? (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs text-green-400 bg-green-500/20 rounded">
                      <Check className="w-3 h-3" />
                      Added
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddPedal(item.pedal)}
                      className="px-3 py-1.5 text-xs font-medium bg-board-accent/20 text-board-accent rounded-lg hover:bg-board-accent/30 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                  
                  {item.education && (
                    <button
                      onClick={() => setExpandedPedal(isExpanded ? null : item.pedal.id)}
                      className="flex items-center gap-1 text-xs text-board-muted hover:text-white transition-colors"
                    >
                      <Info className="w-3 h-3" />
                      {isExpanded ? 'Less' : 'Learn'}
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Expanded Education */}
              {isExpanded && item.education && (
                <div className="mt-4 ml-11 p-3 rounded-lg bg-board-elevated border border-board-border animate-fadeIn">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-white mb-1">What It Does</h4>
                      <p className="text-xs text-zinc-400">{item.education.whatItDoes}</p>
                    </div>
                    <div className="pt-2 border-t border-board-border">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-3 h-3 text-board-highlight flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-medium text-board-highlight mb-0.5">Beginner Tip</h4>
                          <p className="text-xs text-zinc-400">{item.education.beginnerTip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Show More */}
      {starterKit.length > 6 && (
        <div className="p-4 border-t border-board-border">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-sm text-board-accent hover:text-board-highlight transition-colors flex items-center justify-center gap-1"
          >
            {showAll ? 'Show Less' : `Show ${starterKit.length - 6} More Options`}
            <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
}

