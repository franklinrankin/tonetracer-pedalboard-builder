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
  { id: 'genre', label: 'Style', shortLabel: 'Style', icon: <Music2 className="w-4 h-4" /> },
  { id: 'constraints', label: 'Limits', shortLabel: 'Limits', icon: <Settings2 className="w-4 h-4" /> },
  { id: 'build', label: 'Build', shortLabel: 'Build', icon: <Sliders className="w-4 h-4" /> },
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
        return selectedGenres.length > 0;
      case 'constraints':
        return true;
      case 'build':
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
  
  const matchingTemplate = BOARD_TEMPLATES.find(
    t => t.widthMm === board.constraints.maxWidthMm && t.depthMm === board.constraints.maxDepthMm
  );
  
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFEF0' }}>
      {/* Neo-Brutalist Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{ borderBottom: '4px solid black' }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center h-16 sm:h-20 gap-3 sm:gap-6">
            {/* Logo */}
            <button 
              onClick={onGoHome}
              className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <div 
                className="w-10 h-10 bg-black flex items-center justify-center"
                style={{ border: '3px solid black' }}
              >
                <Sliders className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 
                  className="text-lg font-black tracking-tight text-black"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  BOARDSIE
                </h1>
              </div>
            </button>
            
            {/* Mobile: Step Counter */}
            <div className="flex-1 flex items-center justify-center sm:hidden">
              <div 
                className="flex items-center gap-2 px-4 py-2 bg-black text-white font-bold text-sm"
                style={{ border: '3px solid black' }}
              >
                <span>{currentStepIndex + 1}/4</span>
                <span className="uppercase">{STEPS[currentStepIndex].shortLabel}</span>
              </div>
            </div>
            
            {/* Desktop: Step Navigation */}
            <nav className="hidden sm:flex flex-1 items-center justify-center">
              <div className="flex items-center gap-2">
                {STEPS.map((step, index) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = index < currentStepIndex;
                  const isClickable = index <= currentStepIndex || (index === currentStepIndex + 1 && canGoNext());
                  
                  return (
                    <div key={step.id} className="flex items-center gap-2">
                      <button
                        onClick={() => isClickable && onStepChange(step.id)}
                        disabled={!isClickable}
                        className={`flex items-center gap-2 px-4 py-2 font-bold text-sm uppercase tracking-wide transition-all ${
                          isActive
                            ? 'bg-board-accent text-white'
                            : isCompleted
                              ? 'bg-board-success text-white'
                              : isClickable
                                ? 'bg-white text-black hover:-translate-y-0.5'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        style={{ 
                          border: '3px solid black',
                          boxShadow: isActive || isCompleted ? '4px 4px 0px black' : '2px 2px 0px black',
                        }}
                      >
                        <span className="w-5 h-5 flex items-center justify-center">
                          {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
                        </span>
                        <span>{step.label}</span>
                      </button>
                      {index < STEPS.length - 1 && (
                        <ChevronRight className={`w-5 h-5 ${
                          isCompleted ? 'text-board-success' : 'text-gray-300'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setShowPedalIndex(true)}
                  className="p-2 bg-white text-black font-bold transition-all hover:-translate-y-0.5"
                  style={{ border: '3px solid black', boxShadow: '2px 2px 0px black' }}
                  title="Pedal Index"
                >
                  <Database className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowAbout(true)}
                  className="p-2 bg-white text-black font-bold transition-all hover:-translate-y-0.5"
                  style={{ border: '3px solid black', boxShadow: '2px 2px 0px black' }}
                  title="About"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                
                {hasProgress && (
                  <button
                    onClick={onStartOver}
                    className="p-2 bg-white text-board-danger font-bold transition-all hover:-translate-y-0.5"
                    style={{ border: '3px solid black', boxShadow: '2px 2px 0px black' }}
                    title="Reset"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
                
                <UserMenu 
                  onSignInClick={onSignInClick || (() => {})} 
                  onSavedBoards={onSavedBoards}
                  onProfile={onProfile}
                  onPedalRequest={onPedalRequest}
                  onFeedback={onFeedback}
                />
              </div>
              
              {/* Mobile Menu */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 bg-white text-black"
                style={{ border: '3px solid black', boxShadow: '2px 2px 0px black' }}
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Nav Buttons */}
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    onClick={goPrev}
                    className="flex items-center gap-1 px-3 py-2 bg-white text-black font-bold uppercase text-sm transition-all hover:-translate-y-0.5"
                    style={{ border: '3px solid black', boxShadow: '3px 3px 0px black' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                )}
                {currentStepIndex < STEPS.length - 1 && (
                  <button
                    onClick={goNext}
                    disabled={!canGoNext()}
                    className={`flex items-center gap-1 px-3 py-2 font-bold uppercase text-sm transition-all ${
                      canGoNext()
                        ? 'bg-board-accent text-white hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    style={{ 
                      border: '3px solid black', 
                      boxShadow: canGoNext() ? '3px 3px 0px black' : 'none' 
                    }}
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
          <div 
            className="sm:hidden bg-white"
            style={{ borderTop: '3px solid black' }}
          >
            <div className="px-4 py-4 space-y-3">
              {/* Step Navigation */}
              <div className="flex flex-wrap gap-2">
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
                      className={`flex items-center gap-2 px-3 py-2 font-bold text-xs uppercase ${
                        isActive
                          ? 'bg-board-accent text-white'
                          : isCompleted
                            ? 'bg-board-success text-white'
                            : isClickable
                              ? 'bg-white text-black'
                              : 'bg-gray-200 text-gray-400'
                      }`}
                      style={{ border: '2px solid black' }}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : step.icon}
                      <span>{step.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
              
              <div 
                className="flex gap-2 pt-2"
                style={{ borderTop: '2px solid black' }}
              >
                <button
                  onClick={() => { onGoHome?.(); setShowMobileMenu(false); }}
                  className="flex-1 flex items-center justify-center gap-2 p-2 bg-white text-black font-bold text-xs uppercase"
                  style={{ border: '2px solid black' }}
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={() => { setShowPedalIndex(true); setShowMobileMenu(false); }}
                  className="flex-1 flex items-center justify-center gap-2 p-2 bg-white text-black font-bold text-xs uppercase"
                  style={{ border: '2px solid black' }}
                >
                  <Database className="w-4 h-4" />
                  Index
                </button>
                {hasProgress && (
                  <button
                    onClick={() => { onStartOver(); setShowMobileMenu(false); }}
                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-white text-board-danger font-bold text-xs uppercase"
                    style={{ border: '2px solid black' }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                )}
              </div>
              
              <div style={{ borderTop: '2px solid black', paddingTop: '12px' }}>
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
        
        {/* Progress Bar */}
        {hasProgress && (
          <div 
            className="hidden md:block bg-board-highlight"
            style={{ borderTop: '3px solid black' }}
          >
            <div className="max-w-7xl mx-auto px-6 py-2">
              <div className="flex items-center gap-6 text-sm font-bold text-black">
                {genres.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="opacity-60">Style:</span>
                    <div className="flex items-center gap-1">
                      {genres.slice(0, 2).map((g) => g && (
                        <span key={g.id} className="flex items-center gap-1">
                          {g.name}
                        </span>
                      ))}
                      {genres.length > 2 && <span>+{genres.length - 2}</span>}
                    </div>
                  </div>
                )}
                
                {board.slots.length > 0 && (
                  <>
                    <span className="opacity-30">|</span>
                    <div className="flex items-center gap-2">
                      <span className="opacity-60">Pedals:</span>
                      <span>{board.slots.length}</span>
                    </div>
                    <span className="opacity-30">|</span>
                    <div className="flex items-center gap-2">
                      <span className="opacity-60">Cost:</span>
                      <span className="text-board-accent">${totalCost}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="flex-1 pt-20 sm:pt-24">
        {children}
      </main>
      
      {/* About Modal */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      
      {/* Pedal Index Modal */}
      {showPedalIndex && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowPedalIndex(false)}
          />
          
          <div 
            className="relative bg-white w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col"
            style={{ border: '4px solid black', boxShadow: '8px 8px 0px black' }}
          >
            <div 
              className="p-4 bg-board-blue text-white flex items-center justify-between flex-shrink-0"
              style={{ borderBottom: '4px solid black' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 bg-white flex items-center justify-center"
                  style={{ border: '3px solid black' }}
                >
                  <Database className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase">Pedal Index</h2>
                  <p className="text-xs opacity-80">Browse all pedals</p>
                </div>
              </div>
              <button
                onClick={() => setShowPedalIndex(false)}
                className="px-4 py-2 bg-white text-black font-bold uppercase text-sm transition-all hover:-translate-y-0.5"
                style={{ border: '3px solid black', boxShadow: '3px 3px 0px black' }}
              >
                Close
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#FFFEF0' }}>
              <PedalCatalog />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
