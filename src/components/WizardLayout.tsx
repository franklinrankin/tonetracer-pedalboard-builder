import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Check, Music2, Settings2, Sliders, ListChecks, RotateCcw } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { getGenreById } from '../data/genres';
import { formatInches } from '../utils/measurements';

export type WizardStep = 'genre' | 'constraints' | 'build' | 'review';

interface WizardLayoutProps {
  currentStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
  onStartOver: () => void;
  children: ReactNode;
}

const STEPS: { id: WizardStep; label: string; icon: ReactNode }[] = [
  { id: 'genre', label: 'Choose Style', icon: <Music2 className="w-5 h-5" /> },
  { id: 'constraints', label: 'Set Limits', icon: <Settings2 className="w-5 h-5" /> },
  { id: 'build', label: 'Build Board', icon: <Sliders className="w-5 h-5" /> },
  { id: 'review', label: 'Review', icon: <ListChecks className="w-5 h-5" /> },
];

export function WizardLayout({ currentStep, onStepChange, onStartOver, children }: WizardLayoutProps) {
  const { state } = useBoard();
  const { selectedGenre, board, totalCost, sectionScores } = state;
  
  const hasProgress = selectedGenre || board.slots.length > 0;
  
  const genre = selectedGenre ? getGenreById(selectedGenre) : null;
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  
  const canGoNext = () => {
    switch (currentStep) {
      case 'genre':
        return true; // Genre is optional
      case 'constraints':
        return true; // Constraints have defaults
      case 'build':
        return board.slots.length > 0;
      case 'review':
        return false;
      default:
        return false;
    }
  };
  
  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      onStepChange(STEPS[nextIndex].id);
    }
  };
  
  const goPrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      onStepChange(STEPS[prevIndex].id);
    }
  };
  
  return (
    <div className="min-h-screen bg-board-dark flex">
      {/* Left Sidebar - Progress & Choices */}
      <aside className="w-80 bg-board-surface border-r border-board-border flex flex-col">
        {/* Logo & Start Over */}
        <div className="p-4 border-b border-board-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-board-accent to-board-highlight flex items-center justify-center">
                <Sliders className="w-5 h-5 text-board-dark" />
              </div>
              <div>
                <h1 className="text-lg font-bold">
                  <span className="gradient-text">TONE</span>
                  <span className="text-white">TRACER</span>
                </h1>
                <p className="text-xs text-board-muted">Pedalboard Builder</p>
              </div>
            </div>
            
            {/* Start Over Button */}
            <button
              onClick={onStartOver}
              className={`p-2 rounded-lg transition-all ${
                hasProgress
                  ? 'text-board-muted hover:text-white hover:bg-board-danger/20 hover:text-board-danger'
                  : 'text-board-muted/30 cursor-not-allowed'
              }`}
              disabled={!hasProgress}
              title="Start Over"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Steps */}
        <nav className="p-4 border-b border-board-border">
          <div className="space-y-2">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              const isClickable = index <= currentStepIndex || (index === currentStepIndex + 1 && canGoNext());
              
              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && onStepChange(step.id)}
                  disabled={!isClickable}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-board-accent text-white'
                      : isCompleted
                        ? 'bg-board-elevated text-white hover:bg-board-accent/20'
                        : isClickable
                          ? 'text-board-muted hover:bg-board-elevated hover:text-white'
                          : 'text-board-muted/50 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-white/20'
                      : isCompleted
                        ? 'bg-board-success/20 text-board-success'
                        : 'bg-board-elevated'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{step.label}</div>
                    <div className="text-xs opacity-70">Step {index + 1}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
        
        {/* Current Choices Summary */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-xs font-medium text-board-muted uppercase tracking-wider mb-3">
            Your Choices
          </h3>
          
          <div className="space-y-4">
            {/* Genre Choice */}
            {(currentStepIndex > 0 || currentStep === 'genre') && (
              <div 
                className={`p-3 rounded-lg border transition-all ${
                  genre ? 'border-board-border bg-board-elevated' : 'border-dashed border-board-border'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-board-muted">Genre</span>
                  {currentStepIndex > 0 && (
                    <button
                      onClick={() => onStepChange('genre')}
                      className="text-xs text-board-accent hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {genre ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{genre.icon}</span>
                    <span className="font-medium text-white">{genre.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-zinc-500">Not selected (optional)</span>
                )}
              </div>
            )}
            
            {/* Constraints Choice */}
            {currentStepIndex > 1 && (
              <div className="p-3 rounded-lg border border-board-border bg-board-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-board-muted">Board Size</span>
                  <button
                    onClick={() => onStepChange('constraints')}
                    className="text-xs text-board-accent hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-sm text-white font-medium">
                  {formatInches(board.constraints.maxWidthMm)}" × {formatInches(board.constraints.maxDepthMm)}"
                </div>
                <div className="text-xs text-board-muted mt-1">
                  Budget: ${board.constraints.maxBudget}
                </div>
              </div>
            )}
            
            {/* Board Summary */}
            {currentStepIndex >= 2 && board.slots.length > 0 && (
              <div className="p-3 rounded-lg border border-board-border bg-board-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-board-muted">Your Board</span>
                  <button
                    onClick={() => onStepChange('build')}
                    className="text-xs text-board-accent hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-sm text-white font-medium">
                  {board.slots.length} pedal{board.slots.length !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-board-muted mt-1">
                  Total: ${totalCost}
                </div>
                
                {/* Mini pedal list */}
                <div className="mt-2 pt-2 border-t border-board-border space-y-1">
                  {board.slots.slice(0, 4).map(slot => (
                    <div key={slot.pedal.id} className="text-xs text-zinc-400 truncate">
                      • {slot.pedal.model}
                    </div>
                  ))}
                  {board.slots.length > 4 && (
                    <div className="text-xs text-board-muted">
                      +{board.slots.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Section Tags Preview */}
            {currentStepIndex >= 2 && sectionScores.length > 0 && (
              <div className="p-3 rounded-lg border border-board-border bg-board-elevated">
                <span className="text-xs text-board-muted block mb-2">Tone Tags</span>
                <div className="flex flex-wrap gap-1">
                  {sectionScores.slice(0, 4).map(score => (
                    <span 
                      key={score.category}
                      className="px-2 py-0.5 text-xs rounded-full bg-board-accent/20 text-board-accent"
                    >
                      {score.tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="p-4 border-t border-board-border">
          <div className="flex gap-3">
            {currentStepIndex > 0 && (
              <button
                onClick={goPrev}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-board-border text-white hover:bg-board-elevated transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {currentStepIndex < STEPS.length - 1 && (
              <button
                onClick={goNext}
                disabled={!canGoNext()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                  canGoNext()
                    ? 'bg-board-accent text-white hover:bg-board-accent-dim'
                    : 'bg-board-border text-zinc-500 cursor-not-allowed'
                }`}
              >
                {currentStep === 'genre' && !selectedGenre ? 'Skip' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

