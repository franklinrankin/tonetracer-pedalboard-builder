import { useState } from 'react';
import { GraduationCap, Plus, ChevronLeft, ChevronRight, Lightbulb, Info, Check, SkipForward, PartyPopper } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { getGenreById } from '../data/genres';
import { getPedalEducation } from '../data/pedalEducation';
import { CATEGORY_INFO } from '../data/categories';
import { PedalWithStatus, Category } from '../types';
import { formatInches } from '../utils/measurements';

interface StarterKitStep {
  id: string;
  name: string;
  description: string;
  category?: Category;
  subtype?: string;
  pedals: PedalWithStatus[];
  education?: {
    whatItDoes: string;
    beginnerTip: string;
  };
}

export function GenreStarterKit() {
  const { state, dispatch } = useBoard();
  const { selectedGenre, allPedals, board } = state;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [expandedPedal, setExpandedPedal] = useState<string | null>(null);
  const [skippedSteps, setSkippedSteps] = useState<Set<string>>(new Set());
  
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
  const onBoardCategories = new Set(board.slots.map(s => s.pedal.category));
  const onBoardSubtypes = new Set(board.slots.map(s => s.pedal.subtype));
  
  // Generate steps based on genre
  const generateSteps = (): StarterKitStep[] => {
    const steps: StarterKitStep[] = [];
    
    // Step 1: Tuner (always)
    const tunerPedals = allPedals.filter(p => p.subtype === 'Tuner' && p.fits);
    if (tunerPedals.length > 0) {
      const education = getPedalEducation('Tuner');
      steps.push({
        id: 'tuner',
        name: 'Tuner',
        description: 'Every guitarist needs a tuner! It keeps you in tune and can mute your signal.',
        subtype: 'Tuner',
        pedals: tunerPedals.slice(0, 3),
        education: education ? {
          whatItDoes: education.whatItDoes,
          beginnerTip: education.beginnerTip,
        } : undefined,
      });
    }
    
    // Add steps based on genre section targets
    for (const [category, target] of Object.entries(genre.sectionTargets)) {
      if (!target) continue;
      
      const categoryInfo = CATEGORY_INFO[category as Category];
      
      // Find preferred subtypes for this category
      const preferredSubtypes = genre.preferredSubtypes.filter(subtype => {
        const matchingPedal = allPedals.find(p => p.subtype === subtype && p.category === category);
        return matchingPedal !== undefined;
      });
      
      // Get pedals for this category, prioritizing preferred subtypes
      const categoryPedals = allPedals.filter(p => 
        p.category === category && p.fits
      );
      
      const preferredPedals = categoryPedals.filter(p => 
        genre.preferredSubtypes.includes(p.subtype || '')
      );
      
      // Sort by price (mid-range first for beginners)
      const sortedPedals = [...preferredPedals].sort((a, b) => {
        const aMidRange = Math.abs(a.reverbPrice - 100);
        const bMidRange = Math.abs(b.reverbPrice - 100);
        return aMidRange - bMidRange;
      });
      
      if (sortedPedals.length > 0) {
        const primarySubtype = sortedPedals[0].subtype || categoryInfo.displayName;
        const education = getPedalEducation(primarySubtype);
        
        steps.push({
          id: `${category}-${primarySubtype}`,
          name: primarySubtype,
          description: `${categoryInfo.displayName} pedal for your ${genre.name} sound`,
          category: category as Category,
          subtype: primarySubtype,
          pedals: sortedPedals.slice(0, 3),
          education: education ? {
            whatItDoes: education.whatItDoes,
            beginnerTip: education.beginnerTip,
          } : undefined,
        });
      }
    }
    
    return steps;
  };
  
  const steps = generateSteps();
  const currentStep = steps[currentStepIndex];
  const isComplete = currentStepIndex >= steps.length;
  
  // Check if current step is already satisfied
  const isStepSatisfied = (step: StarterKitStep) => {
    if (step.subtype && onBoardSubtypes.has(step.subtype)) return true;
    if (step.category && onBoardCategories.has(step.category)) return true;
    return false;
  };
  
  const handleAddPedal = (pedal: PedalWithStatus) => {
    dispatch({ type: 'ADD_PEDAL', pedal });
    // Auto-advance to next step
    setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        setCurrentStepIndex(steps.length); // Mark complete
      }
    }, 300);
  };
  
  const handleSkip = () => {
    setSkippedSteps(prev => new Set(prev).add(currentStep.id));
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setCurrentStepIndex(steps.length); // Mark complete
    }
  };
  
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  const handleRestart = () => {
    setCurrentStepIndex(0);
    setSkippedSteps(new Set());
  };
  
  // Completion screen
  if (isComplete) {
    const addedCount = board.slots.length;
    const totalCost = board.slots.reduce((sum, s) => sum + s.pedal.reverbPrice, 0);
    
    return (
      <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
        <div 
          className="p-6 text-center"
          style={{ backgroundColor: `${genre.color}10` }}
        >
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${genre.color}20` }}
          >
            <PartyPopper className="w-8 h-8" style={{ color: genre.color }} />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            Your {genre.name} Board is Ready!
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            You've added {addedCount} pedals (${totalCost} total)
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {board.slots.map(slot => (
              <span 
                key={slot.pedal.id}
                className="px-2 py-1 text-xs rounded-full bg-board-elevated text-white"
              >
                {slot.pedal.model}
              </span>
            ))}
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRestart}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-board-border text-white hover:bg-board-elevated transition-colors"
            >
              Start Over
            </button>
            <button
              onClick={() => setCurrentStepIndex(0)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ backgroundColor: `${genre.color}20`, color: genre.color }}
            >
              Review Steps
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const stepSatisfied = isStepSatisfied(currentStep);
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
      {/* Header with Progress */}
      <div 
        className="p-4 border-b border-board-border"
        style={{ backgroundColor: `${genre.color}10` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${genre.color}20` }}
            >
              <GraduationCap className="w-5 h-5" style={{ color: genre.color }} />
            </div>
            <div>
              <h2 className="font-semibold text-white">{genre.name} Starter Kit</h2>
              <p className="text-xs text-board-muted">Step {currentStepIndex + 1} of {steps.length}</p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="flex gap-1">
          {steps.map((step, index) => {
            const isCurrent = index === currentStepIndex;
            const isPast = index < currentStepIndex;
            const isSkipped = skippedSteps.has(step.id);
            const isSatisfied = isStepSatisfied(step);
            
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(index)}
                className={`flex-1 h-2 rounded-full transition-all ${
                  isCurrent
                    ? 'ring-2 ring-offset-1 ring-offset-board-surface'
                    : ''
                }`}
                style={{
                  backgroundColor: isPast || isSatisfied
                    ? genre.color
                    : isSkipped
                      ? '#52525b'
                      : `${genre.color}30`,
                  ringColor: isCurrent ? genre.color : undefined,
                }}
                title={step.name}
              />
            );
          })}
        </div>
      </div>
      
      {/* Current Step */}
      <div className="p-4">
        {/* Step Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {currentStep.category && (
              <span 
                className="px-2 py-0.5 text-xs font-medium rounded"
                style={{ 
                  backgroundColor: `${CATEGORY_INFO[currentStep.category].color}20`, 
                  color: CATEGORY_INFO[currentStep.category].color 
                }}
              >
                {CATEGORY_INFO[currentStep.category].displayName}
              </span>
            )}
            {stepSatisfied && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Already added
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-1">
            Choose a {currentStep.name}
          </h3>
          <p className="text-sm text-zinc-400">{currentStep.description}</p>
        </div>
        
        {/* Education */}
        {currentStep.education && (
          <div className="mb-4 p-3 rounded-lg bg-board-elevated border border-board-border">
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-board-highlight flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-board-highlight mb-1">What does it do?</h4>
                <p className="text-xs text-zinc-400">{currentStep.education.whatItDoes}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-board-border">
              <p className="text-xs text-zinc-500">
                <span className="text-board-highlight font-medium">Tip:</span> {currentStep.education.beginnerTip}
              </p>
            </div>
          </div>
        )}
        
        {/* Pedal Options */}
        <div className="space-y-3">
          {currentStep.pedals.map((pedal, index) => {
            const isOnBoard = onBoardIds.has(pedal.id);
            const isExpanded = expandedPedal === pedal.id;
            
            return (
              <div 
                key={pedal.id}
                className={`p-4 rounded-xl border transition-all ${
                  isOnBoard
                    ? 'border-green-500/50 bg-green-500/10'
                    : index === 0
                      ? 'border-board-accent/50 bg-board-accent/5'
                      : 'border-board-border bg-board-elevated/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isOnBoard
                      ? 'bg-green-500/20 text-green-400'
                      : index === 0
                        ? 'bg-board-accent/20 text-board-accent'
                        : 'bg-board-elevated text-board-muted'
                  }`}>
                    {isOnBoard ? <Check className="w-4 h-4" /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-medium text-white">{pedal.model}</h4>
                      {index === 0 && !isOnBoard && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-board-accent/20 text-board-accent">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-board-muted mb-2">{pedal.brand}</p>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-white font-medium">${pedal.reverbPrice}</span>
                      <span className="text-board-muted">{formatInches(pedal.widthMm)}" × {formatInches(pedal.depthMm)}"</span>
                      <span className="text-board-muted">{pedal.currentMa}mA</span>
                    </div>
                  </div>
                  
                  {/* Action */}
                  {isOnBoard ? (
                    <span className="px-3 py-1.5 text-xs font-medium text-green-400 bg-green-500/20 rounded-lg">
                      Added
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddPedal(pedal)}
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      style={{ 
                        backgroundColor: index === 0 ? genre.color : `${genre.color}20`,
                        color: index === 0 ? 'white' : genre.color,
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  )}
                </div>
                
                {/* Expandable Details */}
                {pedal.description && (
                  <button
                    onClick={() => setExpandedPedal(isExpanded ? null : pedal.id)}
                    className="mt-2 text-xs text-board-muted hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Info className="w-3 h-3" />
                    {isExpanded ? 'Less info' : 'More info'}
                  </button>
                )}
                
                {isExpanded && pedal.description && (
                  <p className="mt-2 text-xs text-zinc-400 animate-fadeIn">
                    {pedal.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="p-4 border-t border-board-border flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
            currentStepIndex === 0
              ? 'text-board-muted/50 cursor-not-allowed'
              : 'text-board-muted hover:text-white hover:bg-board-elevated'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        
        <button
          onClick={handleSkip}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-board-border text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
        >
          Skip
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
