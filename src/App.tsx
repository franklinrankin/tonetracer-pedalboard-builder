import { useState, useCallback } from 'react';
import { BoardProvider, useBoard } from './context/BoardContext';
import { WizardLayout, WizardStep } from './components/WizardLayout';
import { GenrePage, ConstraintsPage, BuildPage, VisualizePage, ReviewPage } from './pages';
import html2canvas from 'html2canvas';

function AppContent() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('genre');
  const { dispatch } = useBoard();
  
  // Capture visualizer screenshot with high quality for clear text
  const captureVisualizerScreenshot = useCallback(async () => {
    const element = document.getElementById('board-visualizer-capture');
    console.log('Capturing screenshot, element found:', !!element);
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          backgroundColor: '#1a1a1a',
          scale: 3, // 3x resolution for sharp, clear text
          logging: false,
          useCORS: true,
          allowTaint: true,
        });
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        console.log('Screenshot captured, length:', dataUrl.length);
        dispatch({ type: 'SET_VISUALIZER_SCREENSHOT', screenshot: dataUrl });
      } catch (error) {
        console.error('Failed to capture visualizer:', error);
      }
    } else {
      console.warn('board-visualizer-capture element not found');
    }
  }, [dispatch]);
  
  const handleStepChange = async (step: WizardStep) => {
    // Capture screenshot when going from visualize to review
    if (currentStep === 'visualize' && step === 'review') {
      await captureVisualizerScreenshot();
    }
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
    // Clear any selected genres and set no limits, then go straight to build
    dispatch({ type: 'CLEAR_GENRES' });
    dispatch({ 
      type: 'SET_CONSTRAINTS', 
      constraints: {
        maxWidthMm: 100000, // Effectively no limit
        maxDepthMm: 100000,
        maxBudget: 100000,
        maxCurrentMa: undefined,
        applyAfterSize: true,
        applyAfterBudget: true,
        applyAfterPower: true,
      }
    });
    handleStepChange('build'); // Skip constraints, go straight to build
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
