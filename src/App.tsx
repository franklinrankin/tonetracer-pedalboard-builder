import { useState, useEffect } from 'react';
import { BoardProvider, useBoard } from './context/BoardContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WizardLayout, WizardStep } from './components/WizardLayout';
import { GenrePage, ConstraintsPage, BuildPage, ReviewPage, HomePage, ProBoardsPage } from './pages';
import { SavedBoardsPage } from './pages/SavedBoardsPage';
import { ProfilePage } from './pages/ProfilePage';
import { PedalCatalog } from './components/PedalCatalog';
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
import { getProBoardById, ProBoard } from './data/proBoards';
import { PEDALS } from './data/pedals';
import { sortBySignalChain } from './utils/signalChain';
import { SavedBoard } from './types';

type AppPage = 'home' | 'wizard' | 'proboards' | 'index' | 'about' | 'pro-review' | 'saved-boards' | 'profile';

// Local storage helpers
const SAVED_BOARDS_KEY = 'boardsie_saved_boards';
const FAVORITES_KEY = 'boardsie_favorites';

type FavoritesMap = Record<string, string | null>;

const DEFAULT_FAVORITES: FavoritesMap = {};

function loadFavorites(): FavoritesMap {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      return { ...DEFAULT_FAVORITES, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load favorites:', e);
  }
  return DEFAULT_FAVORITES;
}

function saveFavoritesToStorage(favorites: FavoritesMap) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites:', e);
  }
}

function loadSavedBoards(): SavedBoard[] {
  try {
    const stored = localStorage.getItem(SAVED_BOARDS_KEY);
    if (stored) {
      const boards = JSON.parse(stored);
      // Convert date strings back to Date objects
      return boards.map((b: SavedBoard) => ({
        ...b,
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt),
        board: {
          ...b.board,
          createdAt: new Date(b.board.createdAt),
          updatedAt: new Date(b.board.updatedAt),
        }
      }));
    }
  } catch (e) {
    console.error('Failed to load saved boards:', e);
  }
  return [];
}

function saveBoardsToStorage(boards: SavedBoard[]) {
  try {
    localStorage.setItem(SAVED_BOARDS_KEY, JSON.stringify(boards));
  } catch (e) {
    console.error('Failed to save boards:', e);
  }
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [currentStep, setCurrentStep] = useState<WizardStep>('genre');
  const [selectedProBoard, setSelectedProBoard] = useState<ProBoard | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>(() => loadSavedBoards());
  const [currentSavedBoardId, setCurrentSavedBoardId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoritesMap>(() => loadFavorites());
  const { dispatch, state } = useBoard();
  const { user } = useAuth();
  
  // Persist saved boards to localStorage when they change
  useEffect(() => {
    saveBoardsToStorage(savedBoards);
  }, [savedBoards]);
  
  // Persist favorites to localStorage when they change
  useEffect(() => {
    saveFavoritesToStorage(favorites);
  }, [favorites]);
  
  const handleStepChange = (step: WizardStep) => {
    // Sync buildSlots to board when going to review
    if (step === 'review') {
      dispatch({ type: 'SYNC_BUILD_TO_BOARD', allPedals: state.allPedals });
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleStartOver = () => {
    if (window.confirm('Start over? This will clear your board and selections.')) {
      dispatch({ type: 'CLEAR_BOARD' });
      dispatch({ type: 'CLEAR_BUILD_SLOTS' });
      dispatch({ type: 'CLEAR_GENRES' });
      setCurrentStep('genre');
      setCurrentPage('home');
      setSelectedProBoard(null);
      setCurrentSavedBoardId(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleCreateOwn = () => {
    dispatch({ type: 'CLEAR_GENRES' });
    handleStepChange('constraints');
  };
  
  const handleGoHome = () => {
    // Check if there's anything to lose (pedals on board or genres selected)
    const hasContent = state.board.slots.length > 0 || state.selectedGenres.length > 0 || (state.board.buildSlots?.length ?? 0) > 0;
    
    if (hasContent) {
      if (!window.confirm('Go back to home? This will clear your current board and selections.')) {
        return;
      }
    }
    
    // Clear everything
    dispatch({ type: 'CLEAR_BOARD' });
    dispatch({ type: 'CLEAR_BUILD_SLOTS' });
    dispatch({ type: 'CLEAR_GENRES' });
    setCurrentPage('home');
    setSelectedProBoard(null);
    setCurrentSavedBoardId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuildBoard = () => {
    setCurrentSavedBoardId(null); // Clear saved board ID for new builds
    setCurrentPage('wizard');
    setCurrentStep('genre');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBrowseProBoards = () => {
    setCurrentPage('proboards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePedalIndex = () => {
    setCurrentPage('index');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAbout = () => {
    // TODO: Add about page later
  };
  
  const handleSavedBoards = () => {
    setCurrentPage('saved-boards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleProfile = () => {
    setCurrentPage('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleUpdateFavorites = (newFavorites: FavoritesMap) => {
    setFavorites(newFavorites);
  };
  
  const handleSaveBoard = (savedBoard: SavedBoard) => {
    setSavedBoards(prev => {
      const existing = prev.findIndex(b => b.id === savedBoard.id);
      if (existing >= 0) {
        // Update existing board
        const updated = [...prev];
        updated[existing] = savedBoard;
        return updated;
      } else {
        // Add new board
        return [...prev, savedBoard];
      }
    });
    setCurrentSavedBoardId(savedBoard.id);
  };
  
  const handleRenameBoard = (boardId: string, newName: string) => {
    setSavedBoards(prev => prev.map(b => 
      b.id === boardId 
        ? { ...b, name: newName, updatedAt: new Date() }
        : b
    ));
  };
  
  const handleDeleteBoard = (boardId: string) => {
    setSavedBoards(prev => prev.filter(b => b.id !== boardId));
    if (currentSavedBoardId === boardId) {
      setCurrentSavedBoardId(null);
    }
  };
  
  const handleOpenSavedBoard = (savedBoard: SavedBoard) => {
    // Load the board into context
    dispatch({ type: 'LOAD_BOARD', board: savedBoard.board });
    
    // Set selected genres if available
    dispatch({ type: 'CLEAR_GENRES' });
    // Note: We store genre names, but the context uses IDs
    // For now, we'll leave genres as-is and rely on the board data
    
    // Set current saved board ID for updating
    setCurrentSavedBoardId(savedBoard.id);
    
    // Go to wizard review page
    setCurrentPage('wizard');
    setCurrentStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProBoard = (proBoard: ProBoard) => {
    setSelectedProBoard(proBoard);
    
    // Clear existing board
    dispatch({ type: 'CLEAR_BOARD' });
    dispatch({ type: 'CLEAR_GENRES' });
    
    // Get all pedals for this pro board
    const boardPedals = proBoard.pedalIds
      .map(pedalId => PEDALS.find(p => p.id === pedalId))
      .filter((p): p is typeof PEDALS[number] => p !== undefined);
    
    const totalPower = boardPedals.reduce((sum, p) => sum + p.currentMa, 0);
    const totalCost = boardPedals.reduce((sum, p) => sum + p.reverbPrice, 0);
    
    // Use custom board dimensions if provided, otherwise calculate
    let boardWidth = proBoard.boardWidthMm;
    let boardDepth = proBoard.boardDepthMm;
    
    if (!boardWidth || !boardDepth) {
      // Calculate custom board size to fit all pedals
      const totalArea = boardPedals.reduce((sum, p) => sum + (p.widthMm * p.depthMm), 0);
      const maxPedalWidth = Math.max(...boardPedals.map(p => p.widthMm));
      const maxPedalDepth = Math.max(...boardPedals.map(p => p.depthMm));
      
      const usableAreaRatio = 0.85;
      const requiredArea = totalArea / usableAreaRatio;
      const aspectRatio = 2;
      boardWidth = Math.sqrt(requiredArea * aspectRatio);
      boardDepth = requiredArea / boardWidth;
      boardWidth = Math.max(boardWidth, maxPedalWidth * 1.1);
      boardDepth = Math.max(boardDepth, maxPedalDepth * 2.2);
      boardWidth = Math.ceil(boardWidth / 10) * 10;
      boardDepth = Math.ceil(boardDepth / 10) * 10;
    }
    
    // Set custom constraints for this pro board
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        maxWidthMm: boardWidth,
        maxDepthMm: boardDepth,
        maxBudget: Math.ceil(totalCost * 1.1),
        maxCurrentMa: Math.ceil(totalPower * 1.2),
        applyAfterSize: true,
        applyAfterBudget: true,
        applyAfterPower: true,
      },
    });
    
    // Build slots with positions if layout is provided
    if (proBoard.layout && proBoard.layout.length > 0) {
      // Load board with exact positions
      const unsortedSlots = proBoard.layout.map(pos => {
        const pedal = boardPedals.find(p => p.id === pos.pedalId);
        if (!pedal) return null;
        return {
          pedal,
          positionX: pos.x,
          positionY: pos.y,
          rotation: pos.rotation,
        };
      }).filter((s): s is NonNullable<typeof s> => s !== null);
      
      // Use exact order from layout (don't sort - pro boards have intentional order)
      const slots = unsortedSlots;
      
      dispatch({
        type: 'LOAD_BOARD',
        board: {
          id: crypto.randomUUID(),
          name: `${proBoard.artist} - ${proBoard.name}`,
          constraints: {
            maxWidthMm: boardWidth,
            maxDepthMm: boardDepth,
            maxBudget: Math.ceil(totalCost * 1.1),
            maxCurrentMa: Math.ceil(totalPower * 1.2),
            applyAfterSize: true,
            applyAfterBudget: true,
            applyAfterPower: true,
          },
          slots,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Sort pedals by signal chain order before adding
      const sortedPedals = sortBySignalChain(
        boardPedals.map(pedal => ({ pedal }))
      ).map(slot => slot.pedal);
      
      // Add pedals in signal chain order
      sortedPedals.forEach(pedal => {
        dispatch({ type: 'ADD_PEDAL', pedal });
      });
    }
    
    // Go to review page
    setCurrentPage('pro-review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentStep) {
      case 'genre':
        return <GenrePage onContinue={() => handleStepChange('constraints')} onCreateOwn={handleCreateOwn} />;
      case 'constraints':
        return <ConstraintsPage onContinue={() => handleStepChange('build')} />;
      case 'build':
        return <BuildPage onContinue={() => handleStepChange('review')} />;
      case 'review':
        return (
          <ReviewPage 
            onSaveBoard={handleSaveBoard}
            savedBoards={savedBoards}
            currentSavedBoardId={currentSavedBoardId}
            onSignInClick={() => setShowAuthModal(true)}
          />
        );
      default:
        return <GenrePage onContinue={() => handleStepChange('constraints')} onCreateOwn={handleCreateOwn} />;
    }
  };

  // Home page - no wizard layout
  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-board-dark">
        <div className="noise-overlay" />
        <div className="fixed inset-0 bg-gradient-to-br from-board-accent/5 via-transparent to-board-highlight/5 pointer-events-none" />
        <div className="relative">
          <HomePage 
            onBuildBoard={handleBuildBoard}
            onBrowseProBoards={handleBrowseProBoards}
            onPedalIndex={handlePedalIndex}
            onAbout={handleAbout}
            onSignIn={() => setShowAuthModal(true)}
            onSavedBoards={handleSavedBoards}
            onProfile={handleProfile}
          />
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }
  
  // Profile page
  if (currentPage === 'profile') {
    return (
      <div className="min-h-screen bg-board-dark">
        {/* User Menu - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <UserMenu 
            onSignInClick={() => setShowAuthModal(true)} 
            onSavedBoards={handleSavedBoards}
            onProfile={handleProfile}
          />
        </div>
        <ProfilePage
          onBack={handleGoHome}
          favorites={favorites}
          onUpdateFavorites={handleUpdateFavorites}
        />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }
  
  // Saved Boards page
  if (currentPage === 'saved-boards') {
    return (
      <div className="min-h-screen bg-board-dark">
        <div className="noise-overlay" />
        <div className="fixed inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        {/* User Menu - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <UserMenu 
            onSignInClick={() => setShowAuthModal(true)} 
            onSavedBoards={handleSavedBoards}
            onProfile={handleProfile}
          />
        </div>
        <div className="relative">
          <SavedBoardsPage
            onBack={handleGoHome}
            onOpenBoard={handleOpenSavedBoard}
            savedBoards={savedBoards}
            onRenameBoard={handleRenameBoard}
            onDeleteBoard={handleDeleteBoard}
          />
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  // Pro Boards page
  if (currentPage === 'proboards') {
    return (
      <div className="min-h-screen bg-board-dark">
        <div className="noise-overlay" />
        <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        {/* User Menu - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <UserMenu 
            onSignInClick={() => setShowAuthModal(true)} 
            onSavedBoards={handleSavedBoards}
            onProfile={handleProfile}
          />
        </div>
        <div className="relative">
          <ProBoardsPage 
            onBack={handleGoHome}
            onSelectBoard={handleSelectProBoard}
          />
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  // Pedal Index page
  if (currentPage === 'index') {
    return (
      <div className="min-h-screen bg-board-dark">
        <div className="noise-overlay" />
        <div className="fixed inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        <div className="relative">
          {/* Header */}
          <div className="sticky top-0 z-50 bg-board-dark/95 backdrop-blur-sm border-b border-board-border">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
              <h1 className="text-lg font-bold text-white">Pedal Index</h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBuildBoard}
                  className="px-4 py-2 bg-board-accent text-white text-sm font-medium rounded-lg hover:bg-board-accent-dim transition-colors"
                >
                  Build a Board
                </button>
                <UserMenu 
                  onSignInClick={() => setShowAuthModal(true)} 
                  onSavedBoards={handleSavedBoards}
                  onProfile={handleProfile}
                />
              </div>
            </div>
          </div>
          {/* Pedal Catalog */}
          <div className="max-w-7xl mx-auto p-4">
            <PedalCatalog />
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  // Pro Board Review page
  if (currentPage === 'pro-review' && selectedProBoard) {
    return (
      <div className="min-h-screen bg-board-dark">
        <div className="noise-overlay" />
        <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="relative">
          {/* Custom header for pro board review */}
          <div className="sticky top-0 z-50 bg-board-dark/95 backdrop-blur-sm border-b border-board-border">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <button
                onClick={handleBrowseProBoards}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Pro Boards
              </button>
              <div className="text-center">
                <span className="text-sm text-cyan-400 font-medium">PRO BOARD</span>
                <h1 className="text-lg font-bold text-white">{selectedProBoard.artist} — {selectedProBoard.name}</h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBuildBoard}
                  className="px-4 py-2 bg-board-accent text-white text-sm font-medium rounded-lg hover:bg-board-accent-dim transition-colors"
                >
                  Build Your Own
                </button>
                <UserMenu 
                  onSignInClick={() => setShowAuthModal(true)} 
                  onSavedBoards={handleSavedBoards}
                  onProfile={handleProfile}
                />
              </div>
            </div>
          </div>
          <ReviewPage 
            onSaveBoard={handleSaveBoard}
            savedBoards={savedBoards}
            currentSavedBoardId={currentSavedBoardId}
            onSignInClick={() => setShowAuthModal(true)}
          />
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  // Wizard pages (build flow)
  return (
    <WizardLayout 
      currentStep={currentStep} 
      onStepChange={handleStepChange} 
      onStartOver={handleStartOver}
      onGoHome={handleGoHome}
      onSignInClick={() => setShowAuthModal(true)}
      onSavedBoards={handleSavedBoards}
      onProfile={handleProfile}
    >
      <div className="noise-overlay" />
      <div className="fixed inset-0 bg-gradient-to-br from-board-accent/5 via-transparent to-board-highlight/5 pointer-events-none" />
      <div className="relative">
        {renderPage()}
      </div>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </WizardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BoardProvider>
        <AppContent />
      </BoardProvider>
    </AuthProvider>
  );
}

export default App;
