import { ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Music2, Settings2, Sliders, ListChecks, RotateCcw, HelpCircle, Database, X, Menu, Home } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { getGenreById } from '../data/genres';
import { BOARD_TEMPLATES } from '../data/boardTemplates';
import { formatInches } from '../utils/measurements';
import { AboutModal } from './AboutModal';
import { PedalCatalog } from './PedalCatalog';
import { GenreIcon } from './GenreIcon';
import { UserMenu } from './UserMenu';

export type WizardStep = 'genre' | 'constraints' | 'build' | 'review';

interface WizardLayoutProps {
  currentStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
  onStartOver: () => void;
  onGoHome?: () => void;
  onSignInClick?: () => void;
  onSavedBoards?: () => void;
  onProfile?: () => void;
  onPedalRequest?: () => void;
  onFeedback?: () => void;
  children: ReactNode;
}

const STEPS: { id: WizardStep; label: string; shortLabel: string; icon: ReactNode }[] = [
  { id: 'genre', label: 'Choose Style', shortLabel: 'Style', icon: <Music2 className="w-4 h-4" /> },
  { id: 'constraints', label: 'Set Limits', shortLabel: 'Limits', icon: <Settings2 className="w-4 h-4" /> },
  { id: 'build', label: 'Build Board', shortLabel: 'Build', icon: <Sliders className="w-4 h-4" /> },
  { id: 'review', label: 'Review', shortLabel: 'Review', icon: <ListChecks className="w-4 h-4" /> },
];

export function WizardLayout({ currentStep, onStepChange, onStartOver, onGoHome, onSignInClick, onSavedBoards, onProfile, onPedalRequest, onFeedback, children }: WizardLayoutProps) {
  const { state } = useBoard();
  const { selectedGenres, board, totalCost, sectionScores } = state;
  const [showAbout, setShowAbout] = useState(false);
  const [showPedalIndex, setShowPedalIndex] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const hasProgress = selectedGenres.length > 0 || board.slots.length > 0;
  
  const genres = selectedGenres.map(id => getGenreById(id)).filter(Boolean);
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  
  const canGoNext = () => {
    switch (currentStep) {
      case 'genre':
        return selectedGenres.length > 0; // At least one genre required
      case 'constraints':
        return true;
      case 'build':
        // Check if any pedals are selected in buildSlots
        return (board.buildSlots?.some(slot => slot.selectedPedalId) ?? false);
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
  
  // Get board size info
  const matchingTemplate = BOARD_TEMPLATES.find(
    t => t.widthMm === board.constraints.maxWidthMm && t.depthMm === board.constraints.maxDepthMm
  );
  
  return (
    <div className="min-h-screen bg-board-dark flex flex-col">
      {/* Floating Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-board-surface/95 backdrop-blur-md border-b border-board-border shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center h-14 sm:h-16 gap-2 sm:gap-4">
            {/* Logo - clickable to go home */}
            <button 
              onClick={onGoHome}
              className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-board-accent to-board-highlight flex items-center justify-center">
                <Sliders className="w-4 h-4 text-board-dark" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold leading-tight text-white">
                  BOARDSIE
                </h1>
              </div>
            </button>
            
            {/* Mobile: Simple Step Counter */}
            <div className="flex-1 flex items-center justify-center sm:hidden">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-board-elevated">
                <span className="text-board-accent font-bold text-sm">{currentStepIndex + 1}</span>
                <span className="text-board-muted text-xs">/</span>
                <span className="text-board-muted text-xs">4</span>
                <span className="text-white text-sm font-medium ml-1">{STEPS[currentStepIndex].shortLabel}</span>
              </div>
            </div>
            
            {/* Desktop: Breadcrumb Step Navigation - Center */}
            <nav className="hidden sm:flex flex-1 items-center justify-center">
              <div className="flex items-center gap-1 md:gap-2">
                {STEPS.map((step, index) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = index < currentStepIndex;
                  const isClickable = index <= currentStepIndex || (index === currentStepIndex + 1 && canGoNext());
                  
                  return (
                    <div key={step.id} className="flex items-center gap-1 md:gap-2">
                      <button
                        onClick={() => isClickable && onStepChange(step.id)}
                        disabled={!isClickable}
                        className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-full transition-all text-xs md:text-sm font-medium ${
                          isActive
                            ? 'bg-board-accent text-white shadow-lg shadow-board-accent/30'
                            : isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : isClickable
                                ? 'bg-board-elevated text-board-muted hover:bg-board-border hover:text-white'
                                : 'bg-board-elevated/50 text-board-muted/40 cursor-not-allowed'
                        }`}
                      >
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                          isActive ? 'bg-white/20' : isCompleted ? 'bg-emerald-500/30' : 'bg-board-dark/30'
                        }`}>
                          {isCompleted ? <Check className="w-3 h-3" /> : step.icon}
                        </span>
                        <span className="hidden lg:inline">{step.label}</span>
                        <span className="lg:hidden">{step.shortLabel}</span>
                      </button>
                      {index < STEPS.length - 1 && (
                        <ChevronRight className={`w-3 h-3 md:w-4 md:h-4 ${
                          isCompleted ? 'text-emerald-500' : 'text-board-muted/30'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>
            
            {/* Right Side - Quick Info & Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Quick Summary Button - Desktop only */}
              {hasProgress && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-board-elevated text-xs text-white hover:bg-board-border transition-colors"
                >
                  {genres.length > 0 && (
                    <span className="flex items-center gap-1">
                      {genres[0]?.icon}
                      {genres.length > 1 && <span>+{genres.length - 1}</span>}
                    </span>
                  )}
                  {board.slots.length > 0 && (
                    <span className="text-board-accent font-medium">
                      {board.slots.length} pedals · ${totalCost}
                    </span>
                  )}
                </button>
              )}
              
              {/* Desktop Quick Actions */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => setShowPedalIndex(true)}
                  className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
                  title="Pedal Index"
                >
                  <Database className="w-4 h-4" />
                  <span className="text-[10px]">Index</span>
                </button>
                
                <button
                  onClick={() => setShowAbout(true)}
                  className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
                  title="About"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-[10px]">About</span>
                </button>
                
                {hasProgress && (
                  <button
                    onClick={onStartOver}
                    className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-board-muted hover:text-board-danger hover:bg-board-danger/10 transition-colors"
                    title="Start Over"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-[10px]">Reset</span>
                  </button>
                )}
                
                {/* User Menu - Desktop */}
                <UserMenu 
                  onSignInClick={onSignInClick || (() => {})} 
                  onSavedBoards={onSavedBoards}
                  onProfile={onProfile}
                  onPedalRequest={onPedalRequest}
                  onFeedback={onFeedback}
                />
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 rounded-lg text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Nav Buttons */}
              <div className="flex items-center gap-1">
                {currentStepIndex > 0 && (
                  <button
                    onClick={goPrev}
                    className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-board-border text-white hover:bg-board-elevated transition-colors text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                )}
                {currentStepIndex < STEPS.length - 1 && (
                  <button
                    onClick={goNext}
                    disabled={!canGoNext()}
                    className={`flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-lg font-medium transition-colors text-sm ${
                      canGoNext()
                        ? 'bg-board-accent text-white hover:bg-board-accent-dim'
                        : 'bg-board-border text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="sm:hidden border-t border-board-border bg-board-surface">
            <div className="px-3 py-2 space-y-1">
              {/* Step Navigation */}
              <div className="flex items-center gap-1 py-2 overflow-x-auto">
                {STEPS.map((step, index) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = index < currentStepIndex;
                  const isClickable = index <= currentStepIndex || (index === currentStepIndex + 1 && canGoNext());
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => {
                        if (isClickable) {
                          onStepChange(step.id);
                          setShowMobileMenu(false);
                        }
                      }}
                      disabled={!isClickable}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${
                        isActive
                          ? 'bg-board-accent text-white'
                          : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isClickable
                              ? 'bg-board-elevated text-board-muted'
                              : 'bg-board-elevated/50 text-board-muted/40'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : step.icon}
                      <span>{step.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="border-t border-board-border pt-2 grid grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    onGoHome?.();
                    setShowMobileMenu(false);
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span className="text-[10px]">Home</span>
                </button>
                <button
                  onClick={() => {
                    setShowPedalIndex(true);
                    setShowMobileMenu(false);
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
                >
                  <Database className="w-5 h-5" />
                  <span className="text-[10px]">Index</span>
                </button>
                <button
                  onClick={() => {
                    setShowAbout(true);
                    setShowMobileMenu(false);
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="text-[10px]">About</span>
                </button>
                {hasProgress && (
                  <button
                    onClick={() => {
                      onStartOver();
                      setShowMobileMenu(false);
                    }}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg text-board-danger hover:bg-board-danger/10 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span className="text-[10px]">Reset</span>
                  </button>
                )}
              </div>
              
              {/* User Menu Section */}
              <div className="border-t border-board-border pt-2">
                <UserMenu 
                  onSignInClick={onSignInClick || (() => {})} 
                  onSavedBoards={onSavedBoards}
                  onProfile={onProfile}
                  onPedalRequest={onPedalRequest}
                  onFeedback={onFeedback}
                  mobile
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Expandable Details Panel */}
        {showDetails && hasProgress && (
          <div className="border-t border-board-border bg-board-elevated/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center gap-6 text-sm">
                {/* Genres */}
                {genres.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-board-muted">Style:</span>
                    <div className="flex items-center gap-1">
                      {genres.map((g, i) => g && (
                        <span key={g.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-board-surface text-white text-xs">
                          <GenreIcon genre={g} size="sm" /> {g.name}
                        </span>
                      ))}
                    </div>
                    <button onClick={() => onStepChange('genre')} className="text-board-accent text-xs hover:underline">Edit</button>
                  </div>
                )}
                
                {/* Board Size */}
                {currentStepIndex > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-board-muted">Board:</span>
                    <span className="text-white">
                      {board.constraints.maxPedalCount 
                        ? `${board.constraints.maxPedalCount} pedals`
                        : matchingTemplate 
                          ? matchingTemplate.name 
                          : `${formatInches(board.constraints.maxWidthMm)}" × ${formatInches(board.constraints.maxDepthMm)}"`
                      }
                    </span>
                    <span className="text-board-muted">·</span>
                    <span className="text-white">${board.constraints.maxBudget} budget</span>
                    <button onClick={() => onStepChange('constraints')} className="text-board-accent text-xs hover:underline">Edit</button>
                  </div>
                )}
                
                {/* Pedals */}
                {board.slots.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-board-muted">Pedals:</span>
                    <span className="text-white">{board.slots.length}</span>
                    <span className="text-board-muted">·</span>
                    <span className="text-board-accent font-medium">${totalCost}</span>
                    <button onClick={() => onStepChange('build')} className="text-board-accent text-xs hover:underline">Edit</button>
                  </div>
                )}
                
                {/* Tone Tags */}
                {sectionScores.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-board-muted">Tags:</span>
                    <div className="flex gap-1">
                      {sectionScores.slice(0, 3).map(score => (
                        <span 
                          key={score.category}
                          className="px-2 py-0.5 text-xs rounded-full bg-board-accent/20 text-board-accent"
                        >
                          {score.tag}
                        </span>
                      ))}
                      {sectionScores.length > 3 && (
                        <span className="text-board-muted text-xs">+{sectionScores.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Close */}
                <button 
                  onClick={() => setShowDetails(false)}
                  className="ml-auto p-1 rounded hover:bg-board-surface text-board-muted hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content - with top padding for fixed header */}
      <main className="flex-1 pt-16 sm:pt-20">
        {children}
      </main>
      
      {/* About Modal */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      
      {/* Pedal Index Modal */}
      {showPedalIndex && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPedalIndex(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-board-dark border border-board-border rounded-2xl w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-board-border bg-board-surface flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-board-accent to-board-highlight flex items-center justify-center">
                  <Database className="w-5 h-5 text-board-dark" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Pedal Index</h2>
                  <p className="text-xs text-board-muted">Browse all pedals in the database</p>
                </div>
              </div>
              <button
                onClick={() => setShowPedalIndex(false)}
                className="px-4 py-2 rounded-lg bg-board-elevated text-white hover:bg-board-border transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
            
            {/* Catalog */}
            <div className="flex-1 overflow-y-auto p-4">
              <PedalCatalog />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
