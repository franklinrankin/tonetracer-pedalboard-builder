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
  { id: 'genre', label: 'Style', icon: <Music2 className="w-4 h-4" /> },
  { id: 'constraints', label: 'Limits', icon: <Settings2 className="w-4 h-4" /> },
  { id: 'build', label: 'Build', icon: <Sliders className="w-4 h-4" /> },
  { id: 'review', label: 'Review', icon: <ListChecks className="w-4 h-4" /> },
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
        return true;
      case 'constraints':
        return true;
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
    <div className="h-screen bg-board-dark flex overflow-hidden">
      {/* Left Sidebar - Compact */}
      <aside className="w-64 bg-board-surface border-r border-board-border flex flex-col flex-shrink-0">
        {/* Logo & Start Over */}
        <div className="p-3 border-b border-board-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-board-accent to-board-highlight flex items-center justify-center">
                <Sliders className="w-4 h-4 text-board-dark" />
              </div>
              <div>
                <h1 className="text-sm font-bold">
                  <span className="gradient-text">TONE</span>
                  <span className="text-white">TRACER</span>
                </h1>
              </div>
            </div>
            
            <button
              onClick={onStartOver}
              className={`p-1.5 rounded transition-all ${
                hasProgress
                  ? 'text-board-muted hover:text-board-danger hover:bg-board-danger/20'
                  : 'text-board-muted/30 cursor-not-allowed'
              }`}
              disabled={!hasProgress}
              title="Start Over"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Steps */}
        <nav className="p-2 border-b border-board-border flex-shrink-0">
          <div className="space-y-1">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              const isClickable = index <= currentStepIndex || (index === currentStepIndex + 1 && canGoNext());
              
              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && onStepChange(step.id)}
                  disabled={!isClickable}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-sm ${
                    isActive
                      ? 'bg-board-accent text-white'
                      : isCompleted
                        ? 'bg-board-elevated text-white hover:bg-board-accent/20'
                        : isClickable
                          ? 'text-board-muted hover:bg-board-elevated hover:text-white'
                          : 'text-board-muted/50 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-white/20'
                      : isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-board-elevated'
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3" /> : step.icon}
                  </div>
                  <span className="font-medium">{step.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        
        {/* Current Choices Summary */}
        <div className="flex-1 p-2 overflow-y-auto min-h-0">
          <h3 className="text-[10px] font-medium text-board-muted uppercase tracking-wider mb-2 px-1">
            Your Choices
          </h3>
          
          <div className="space-y-2">
            {/* Genre Choice */}
            {(currentStepIndex > 0 || currentStep === 'genre') && (
              <div 
                className={`p-2 rounded-lg border text-sm ${
                  genre ? 'border-board-border bg-board-elevated' : 'border-dashed border-board-border'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-board-muted">Genre</span>
                  {currentStepIndex > 0 && (
                    <button
                      onClick={() => onStepChange('genre')}
                      className="text-[10px] text-board-accent hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {genre ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{genre.icon}</span>
                    <span className="font-medium text-white text-xs">{genre.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-500">Not selected</span>
                )}
              </div>
            )}
            
            {/* Constraints Choice */}
            {currentStepIndex > 1 && (
              <div className="p-2 rounded-lg border border-board-border bg-board-elevated">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-board-muted">Board</span>
                  <button
                    onClick={() => onStepChange('constraints')}
                    className="text-[10px] text-board-accent hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-xs text-white font-medium">
                  {formatInches(board.constraints.maxWidthMm)}" × {formatInches(board.constraints.maxDepthMm)}"
                </div>
                <div className="text-[10px] text-board-muted">
                  ${board.constraints.maxBudget} budget
                </div>
              </div>
            )}
            
            {/* Board Summary */}
            {currentStepIndex >= 2 && board.slots.length > 0 && (
              <div className="p-2 rounded-lg border border-board-border bg-board-elevated">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-board-muted">Pedals</span>
                  <button
                    onClick={() => onStepChange('build')}
                    className="text-[10px] text-board-accent hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-xs text-white font-medium">
                  {board.slots.length} pedal{board.slots.length !== 1 ? 's' : ''} • ${totalCost}
                </div>
                
                {/* Mini pedal list */}
                <div className="mt-1 pt-1 border-t border-board-border space-y-0.5">
                  {board.slots.slice(0, 3).map(slot => (
                    <div key={slot.pedal.id} className="text-[10px] text-zinc-400 truncate">
                      • {slot.pedal.model}
                    </div>
                  ))}
                  {board.slots.length > 3 && (
                    <div className="text-[10px] text-board-muted">
                      +{board.slots.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Section Tags Preview */}
            {currentStepIndex >= 2 && sectionScores.length > 0 && (
              <div className="p-2 rounded-lg border border-board-border bg-board-elevated">
                <span className="text-[10px] text-board-muted block mb-1">Tone Tags</span>
                <div className="flex flex-wrap gap-1">
                  {sectionScores.slice(0, 3).map(score => (
                    <span 
                      key={score.category}
                      className="px-1.5 py-0.5 text-[10px] rounded-full bg-board-accent/20 text-board-accent"
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
        <div className="p-2 border-t border-board-border flex-shrink-0">
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={goPrev}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-board-border text-white text-sm hover:bg-board-elevated transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {currentStepIndex < STEPS.length - 1 && (
              <button
                onClick={goNext}
                disabled={!canGoNext()}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  canGoNext()
                    ? 'bg-board-accent text-white hover:bg-board-accent-dim'
                    : 'bg-board-border text-zinc-500 cursor-not-allowed'
                }`}
              >
                {currentStep === 'genre' && !selectedGenre ? 'Skip' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
