import { useState } from 'react';
import { BoardProvider, useBoard } from './context/BoardContext';
import { WizardLayout, WizardStep } from './components/WizardLayout';
import { GenrePage, ConstraintsPage, BuildPage, VisualizePage, ReviewPage } from './pages';

function AppContent() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('genre');
  const { dispatch } = useBoard();
  
  const handleStepChange = (step: WizardStep) => {
    setCurrentStep(step);
    // Scroll to top when changing steps
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleStartOver = () => {
    if (window.confirm('Start over? This will clear your board and selections.')) {
      // Clear board
      dispatch({ type: 'CLEAR_BOARD' });
      // Clear genres
      dispatch({ type: 'CLEAR_GENRES' });
      // Go back to first step
      setCurrentStep('genre');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleCreateOwn = () => {
    // Clear any selected genres and go to Set Limits page
    dispatch({ type: 'CLEAR_GENRES' });
    handleStepChange('constraints'); // Go to constraints page to set limits
  };
  
  const renderPage = () => {
    switch (currentStep) {
      case 'genre':
        return <GenrePage onContinue={() => handleStepChange('constraints')} onCreateOwn={handleCreateOwn} />;
      case 'constraints':
        return <ConstraintsPage onContinue={() => handleStepChange('build')} />;
      case 'build':
        return <BuildPage onContinue={() => handleStepChange('visualize')} />;
      case 'visualize':
        return <VisualizePage onContinue={() => handleStepChange('review')} onBack={() => handleStepChange('build')} />;
      case 'review':
        return <ReviewPage />;
      default:
        return <GenrePage onContinue={() => handleStepChange('constraints')} onCreateOwn={handleCreateOwn} />;
    }
  };

  return (
    <WizardLayout currentStep={currentStep} onStepChange={handleStepChange} onStartOver={handleStartOver}>
      {/* Noise overlay for texture */}
      <div className="noise-overlay" />
      
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-board-accent/5 via-transparent to-board-highlight/5 pointer-events-none" />
      
      <div className="relative">
        {renderPage()}
      </div>
    </WizardLayout>
  );
}

function App() {
  return (
    <BoardProvider>
      <AppContent />
    </BoardProvider>
  );
}

export default App;
