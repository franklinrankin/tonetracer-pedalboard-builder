import { useState, useEffect, useRef } from 'react';
import { BoardProvider, useBoard } from './context/BoardContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WizardLayout, WizardStep } from './components/WizardLayout';
import { GenrePage, ConstraintsPage, BuildPage, ReviewPage, HomePage, ProBoardsPage } from './pages';
import { SavedBoardsPage } from './pages/SavedBoardsPage';
import { ProfilePage } from './pages/ProfilePage';
import { CollectionPage } from './pages/CollectionPage';
import { PedalReviewPage } from './pages/PedalReviewPage';
import { PedalCatalog } from './components/PedalCatalog';
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
import { ThemeToggle } from './components/ThemeToggle';
import { PedalRequestModal } from './components/PedalRequestModal';
import { FeedbackModal } from './components/FeedbackModal';
import { CommunityPage, PublicBoard, PublicCollection } from './pages/CommunityPage';
import { getProBoardById, ProBoard } from './data/proBoards';
import { PEDALS } from './data/pedals';
import { sortBySignalChain } from './utils/signalChain';
import { SavedBoard } from './types';
import { generateUUID } from './utils/uuid';
import { supabase } from './lib/supabase';
import { getSharedBoardFromUrl, clearShareFromUrl } from './utils/shareBoard';

type AppPage = 'home' | 'wizard' | 'proboards' | 'index' | 'about' | 'pro-review' | 'saved-boards' | 'profile' | 'collection' | 'pedal-review' | 'community' | 'community-review' | 'community-collection';

// Check if localStorage is available (some in-app browsers block it)
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

const storageAvailable = isLocalStorageAvailable();

// Safe localStorage helpers
function safeGetItem(key: string): string | null {
  if (!storageAvailable) return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (!storageAvailable) return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Silently fail
  }
}

// Local storage helpers
const SAVED_BOARDS_KEY = 'boardsie_saved_boards';
const FAVORITES_KEY = 'boardsie_favorites';
const COLLECTION_KEY = 'boardsie_collection';
const BOOKMARKS_KEY = 'boardsie_bookmarks';

type FavoritesMap = Record<string, string | null>;

// Bookmarked board type
interface BookmarkedBoard {
  id: string;
  board_id: string;
  username: string;
  name: string;
  bookmarkedAt: Date;
}

function loadBookmarks(): BookmarkedBoard[] {
  try {
    const stored = safeGetItem(BOOKMARKS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load bookmarks:', e);
  }
  return [];
}

function saveBookmarksToStorage(bookmarks: BookmarkedBoard[]) {
  try {
    safeSetItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save bookmarks:', e);
  }
}

const DEFAULT_FAVORITES: FavoritesMap = {};

function loadFavorites(): FavoritesMap {
  try {
    const stored = safeGetItem(FAVORITES_KEY);
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
    safeSetItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites:', e);
  }
}

function loadSavedBoards(): SavedBoard[] {
  try {
    const stored = safeGetItem(SAVED_BOARDS_KEY);
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
    safeSetItem(SAVED_BOARDS_KEY, JSON.stringify(boards));
  } catch (e) {
    console.error('Failed to save boards:', e);
  }
}

function loadCollection(): string[] {
  try {
    const stored = safeGetItem(COLLECTION_KEY);
    if (stored) {
      const parsed: string[] = JSON.parse(stored);
      // Deduplicate in case of corrupted data
      return [...new Set(parsed)];
    }
  } catch (e) {
    console.error('Failed to load collection:', e);
  }
  return [];
}

function saveCollectionToStorage(collection: string[]) {
  try {
    safeSetItem(COLLECTION_KEY, JSON.stringify(collection));
  } catch (e) {
    console.error('Failed to save collection:', e);
  }
}

// Map URL hashes to pages
const HASH_TO_PAGE: Record<string, AppPage> = {
  '': 'home',
  'home': 'home',
  'wizard': 'wizard',
  'proboards': 'proboards',
  'index': 'index',
  'saved-boards': 'saved-boards',
  'profile': 'profile',
  'collection': 'collection',
  'community': 'community',
};

const PAGE_TO_HASH: Record<AppPage, string> = {
  'home': '',
  'wizard': 'wizard',
  'proboards': 'proboards',
  'index': 'index',
  'about': 'about',
  'pro-review': 'pro-review',
  'saved-boards': 'saved-boards',
  'profile': 'profile',
  'collection': 'collection',
  'pedal-review': 'pedal-review',
  'community': 'community',
  'community-review': 'community-review',
  'community-collection': 'community-collection',
};

function getInitialPage(): AppPage {
  try {
    const hash = window.location.hash.slice(1); // Remove the #
    return HASH_TO_PAGE[hash] || 'home';
  } catch (e) {
    return 'home';
  }
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<AppPage>(getInitialPage);
  const [currentStep, setCurrentStep] = useState<WizardStep>('genre');
  const [selectedProBoard, setSelectedProBoard] = useState<ProBoard | null>(null);
  const [selectedCommunityBoard, setSelectedCommunityBoard] = useState<PublicBoard | null>(null);
  const [selectedCommunityCollection, setSelectedCommunityCollection] = useState<PublicCollection | null>(null);
  const [initialForumPostId, setInitialForumPostId] = useState<string | undefined>(undefined);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPedalRequestModal, setShowPedalRequestModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>(() => loadSavedBoards());
  const [currentSavedBoardId, setCurrentSavedBoardId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoritesMap>(() => loadFavorites());
  const [collection, setCollection] = useState<string[]>(() => loadCollection());
  const [bookmarks, setBookmarks] = useState<BookmarkedBoard[]>(() => loadBookmarks());
  const [dataLoaded, setDataLoaded] = useState(false);
  const isInitialMount = useRef(true);
  const { dispatch, state } = useBoard();
  const { user } = useAuth();
  
  // Update URL hash when page changes
  useEffect(() => {
    const hash = PAGE_TO_HASH[currentPage];
    if (hash) {
      window.location.hash = hash;
    } else {
      // Remove hash for home page
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [currentPage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const page = HASH_TO_PAGE[hash];
      if (page && page !== currentPage) {
        setCurrentPage(page);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPage]);

  // Persist saved boards to localStorage when they change
  useEffect(() => {
    saveBoardsToStorage(savedBoards);
  }, [savedBoards]);
  
  // Persist favorites to localStorage when they change
  useEffect(() => {
    saveFavoritesToStorage(favorites);
  }, [favorites]);
  
  // Persist collection to localStorage when it changes
  useEffect(() => {
    saveCollectionToStorage(collection);
  }, [collection]);
  
  // Load all data from Supabase when user logs in
  useEffect(() => {
    async function loadDataFromSupabase() {
      if (!user || !supabase) {
        setDataLoaded(true);
        return;
      }
      
      try {
        // Load Collection
        const { data: collectionData, error: collectionError } = await supabase
          .from('collections')
          .select('pedal_ids')
          .eq('user_id', user.id)
          .single();
        
        if (collectionError && collectionError.code !== 'PGRST116') {
          console.error('Error loading collection:', collectionError);
        }
        
        if (collectionData?.pedal_ids) {
          // Logged-in users: ONLY use Supabase data, ignore localStorage
          // This prevents cross-contamination between accounts on shared browsers
          const ids: string[] = collectionData.pedal_ids;
          setCollection([...new Set(ids)]);
        } else if (supabase) {
          // User has no collection in Supabase - start fresh
          // Don't inherit localStorage from previous users on this browser
          setCollection([]);
        }
        // Clear localStorage to prevent contamination
        saveCollectionToStorage([]);
        
        // Load Favorites
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('favorites')
          .select('favorites_data')
          .eq('user_id', user.id)
          .single();
        
        if (favoritesError && favoritesError.code !== 'PGRST116') {
          console.error('Error loading favorites:', favoritesError);
        }
        
        if (favoritesData?.favorites_data) {
          // Logged-in users: ONLY use Supabase data, ignore localStorage
          setFavorites(favoritesData.favorites_data);
        } else if (supabase) {
          // User has no favorites in Supabase - start fresh
          setFavorites({});
        }
        // Clear localStorage to prevent contamination
        saveFavoritesToStorage({});
        
        // Load Saved Boards
        const { data: boardsData, error: boardsError } = await supabase
          .from('saved_boards')
          .select('*')
          .eq('user_id', user.id);
        
        if (boardsError) {
          console.error('Error loading saved boards:', boardsError);
        }
        
        if (boardsData && boardsData.length > 0) {
          const cloudBoards: SavedBoard[] = boardsData.map(b => {
            // Parse the board_data and convert date strings to Date objects
            const boardData = b.board_data;
            return {
              id: b.board_id,
              name: b.name,
              genres: b.genres || [],
              board: {
                ...boardData,
                createdAt: new Date(boardData.createdAt),
                updatedAt: new Date(boardData.updatedAt),
              },
              createdAt: new Date(b.created_at),
              updatedAt: new Date(b.updated_at),
            };
          });
          
          // Merge with local boards (cloud takes priority for same ID)
          const localBoards = loadSavedBoards();
          const cloudIds = new Set(cloudBoards.map(b => b.id));
          const uniqueLocalBoards = localBoards.filter(b => !cloudIds.has(b.id));
          const merged = [...cloudBoards, ...uniqueLocalBoards];
          setSavedBoards(merged);
          
          // Upload unique local boards to cloud
          if (uniqueLocalBoards.length > 0 && supabase) {
            for (const board of uniqueLocalBoards) {
              const { error } = await supabase
                .from('saved_boards')
                .insert({
                  user_id: user.id,
                  board_id: board.id,
                  name: board.name,
                  genres: board.genres,
                  board_data: {
                    ...board.board,
                    createdAt: board.board.createdAt instanceof Date 
                      ? board.board.createdAt.toISOString() 
                      : board.board.createdAt,
                    updatedAt: board.board.updatedAt instanceof Date 
                      ? board.board.updatedAt.toISOString() 
                      : board.board.updatedAt,
                  },
                  created_at: board.createdAt instanceof Date 
                    ? board.createdAt.toISOString() 
                    : board.createdAt,
                  updated_at: board.updatedAt instanceof Date 
                    ? board.updatedAt.toISOString() 
                    : board.updatedAt,
                });
              if (error) console.error('Error uploading local board:', board.id, error);
            }
          }
        } else if (supabase) {
          // No cloud boards - upload local boards
          const localBoards = loadSavedBoards();
          for (const board of localBoards) {
            const { error } = await supabase
              .from('saved_boards')
              .insert({
                user_id: user.id,
                board_id: board.id,
                name: board.name,
                genres: board.genres,
                board_data: {
                  ...board.board,
                  createdAt: board.board.createdAt instanceof Date 
                    ? board.board.createdAt.toISOString() 
                    : board.board.createdAt,
                  updatedAt: board.board.updatedAt instanceof Date 
                    ? board.board.updatedAt.toISOString() 
                    : board.board.updatedAt,
                },
                created_at: board.createdAt instanceof Date 
                  ? board.createdAt.toISOString() 
                  : board.createdAt,
                updated_at: board.updatedAt instanceof Date 
                  ? board.updatedAt.toISOString() 
                  : board.updatedAt,
              });
            if (error) console.error('Error uploading local board:', board.id, error);
          }
        }
      } catch (e) {
        console.error('Failed to load data from Supabase:', e);
      }
      
      setDataLoaded(true);
    }
    
    loadDataFromSupabase();
  }, [user]);
  
  // Save collection to Supabase when it changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!dataLoaded || !user || !supabase) return;
    
    supabase
      .from('collections')
      .upsert({ 
        user_id: user.id, 
        pedal_ids: collection,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .then(({ error }) => {
        if (error) console.error('Error saving collection:', error);
      });
  }, [collection, user, dataLoaded]);
  
  // Save favorites to Supabase when they change
  useEffect(() => {
    if (!dataLoaded || !user || !supabase) return;
    
    supabase
      .from('favorites')
      .upsert({ 
        user_id: user.id, 
        favorites_data: favorites,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .then(({ error }) => {
        if (error) console.error('Error saving favorites:', error);
      });
  }, [favorites, user, dataLoaded]);
  
  // Save boards to Supabase when they change
  useEffect(() => {
    if (!dataLoaded || !user || !supabase) return;
    
    const userId = user.id;
    const sb = supabase;
    
    async function syncBoards() {
      const { data: existingBoards, error: fetchError } = await sb
        .from('saved_boards')
        .select('board_id')
        .eq('user_id', userId);
      
      if (fetchError) {
        console.error('Error fetching existing boards:', fetchError);
        return;
      }
      
      const existingIds = new Set(existingBoards?.map(b => b.board_id) || []);
      const currentIds = new Set(savedBoards.map(b => b.id));
      
      // Delete boards that were removed
      const toDelete = [...existingIds].filter(id => !currentIds.has(id));
      for (const boardId of toDelete) {
        await sb
          .from('saved_boards')
          .delete()
          .eq('user_id', userId)
          .eq('board_id', boardId);
      }
      
      // Upsert current boards
      for (const board of savedBoards) {
        const { error } = await sb
          .from('saved_boards')
          .upsert({
            user_id: userId,
            board_id: board.id,
            name: board.name,
            genres: board.genres,
            board_data: {
              ...board.board,
              createdAt: board.board.createdAt instanceof Date 
                ? board.board.createdAt.toISOString() 
                : board.board.createdAt,
              updatedAt: board.board.updatedAt instanceof Date 
                ? board.board.updatedAt.toISOString() 
                : board.board.updatedAt,
            },
            created_at: board.createdAt instanceof Date 
              ? board.createdAt.toISOString() 
              : board.createdAt,
            updated_at: board.updatedAt instanceof Date 
              ? board.updatedAt.toISOString() 
              : board.updatedAt,
          }, { onConflict: 'user_id,board_id' });
        
        if (error) {
          console.error('Error upserting board:', board.id, error);
        }
      }
    }
    
    syncBoards().catch(e => console.error('Error syncing boards:', e));
  }, [savedBoards, user, dataLoaded]);
  
  // Check for shared board in URL on mount
  useEffect(() => {
    const sharedBoard = getSharedBoardFromUrl();
    if (sharedBoard) {
      // Look up pedals by ID and reconstruct the board
      const slots = sharedBoard.slots
        .map(slotData => {
          const pedal = PEDALS.find(p => p.id === slotData.pedalId);
          if (!pedal) return null;
          return {
            pedal,
            positionX: slotData.positionX,
            positionY: slotData.positionY,
            rotation: slotData.rotation,
          };
        })
        .filter(Boolean) as typeof state.board.slots;
      
      if (slots.length > 0) {
        // Clear existing board and load the shared one
        dispatch({ type: 'CLEAR_BOARD' });
        dispatch({ type: 'CLEAR_GENRES' });
        
        // Set constraints
        dispatch({
          type: 'SET_CONSTRAINTS',
          constraints: {
            maxWidthMm: sharedBoard.constraints.maxWidthMm,
            maxDepthMm: sharedBoard.constraints.maxDepthMm,
            maxBudget: sharedBoard.constraints.maxBudget,
            maxPedalCount: sharedBoard.constraints.maxPedalCount,
            maxCurrentMa: 2000, // Default
            applyAfterSize: true,
            applyAfterBudget: true,
          },
        });
        
        // Set board name
        dispatch({ type: 'SET_BOARD_NAME', name: sharedBoard.name });
        
        // Add pedals (they already have positions)
        slots.forEach(slot => {
          dispatch({ type: 'ADD_PEDAL', pedal: slot.pedal });
        });
        
        // Set positions after adding all pedals
        const positionsMap = new Map<string, { x: number; y: number; rotation: number }>();
        slots.forEach(slot => {
          if (slot.positionX !== undefined && slot.positionY !== undefined) {
            positionsMap.set(slot.pedal.id, {
              x: slot.positionX,
              y: slot.positionY,
              rotation: slot.rotation || 0,
            });
          }
        });
        if (positionsMap.size > 0) {
          dispatch({ type: 'SET_PEDAL_POSITIONS', positions: positionsMap });
        }
        
        // Toggle genres
        sharedBoard.genres.forEach(genreId => {
          dispatch({ type: 'TOGGLE_GENRE', genreId });
        });
        
        // Navigate to review page
        setCurrentPage('wizard');
        setCurrentStep('review');
        
        // Clear the URL parameter
        clearShareFromUrl();
      }
    }
  }, []); // Run only on mount
  
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
  
  const handleCollection = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentPage('collection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleAddToCollection = (pedalId: string) => {
    setCollection(prev => {
      if (prev.includes(pedalId)) return prev;
      return [...prev, pedalId];
    });
  };
  
  const handleRemoveFromCollection = (pedalId: string) => {
    setCollection(prev => prev.filter(id => id !== pedalId));
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
  
  const handleDeleteBoard = async (boardId: string) => {
    setSavedBoards(prev => prev.filter(b => b.id !== boardId));
    if (currentSavedBoardId === boardId) {
      setCurrentSavedBoardId(null);
    }
    
    // Delete from Supabase
    if (supabase && user) {
      const { error } = await supabase
        .from('saved_boards')
        .delete()
        .eq('user_id', user.id)
        .eq('board_id', boardId);
      
      if (error) {
        console.error('Error deleting board from cloud:', error);
      }
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
          id: generateUUID(),
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

  const handleViewCommunityBoard = (publicBoard: PublicBoard) => {
    setSelectedCommunityBoard(publicBoard);
    
    // Clear existing board
    dispatch({ type: 'CLEAR_BOARD' });
    dispatch({ type: 'CLEAR_GENRES' });
    
    // Get pedals from the public board
    const boardSlots = publicBoard.board_data.slots;
    const boardPedals = boardSlots.map(s => s.pedal);
    
    const totalPower = boardPedals.reduce((sum, p) => sum + p.currentMa, 0);
    const totalCost = boardPedals.reduce((sum, p) => sum + p.reverbPrice, 0);
    
    // Calculate board dimensions
    const totalArea = boardPedals.reduce((sum, p) => sum + (p.widthMm * p.depthMm), 0);
    const maxPedalWidth = Math.max(...boardPedals.map(p => p.widthMm));
    const maxPedalDepth = Math.max(...boardPedals.map(p => p.depthMm));
    const usableAreaRatio = 0.85;
    const estimatedArea = totalArea / usableAreaRatio;
    const aspectRatio = 2;
    const boardWidth = Math.max(maxPedalWidth * 1.1, Math.sqrt(estimatedArea * aspectRatio));
    const boardDepth = Math.max(maxPedalDepth * 1.1, Math.sqrt(estimatedArea / aspectRatio));

    // Set genres if available
    publicBoard.genres.forEach(genre => {
      dispatch({ type: 'TOGGLE_GENRE', genreId: genre });
    });

    // Set constraints
    dispatch({
      type: 'SET_CONSTRAINTS',
      constraints: {
        maxWidthMm: Math.ceil(boardWidth),
        maxDepthMm: Math.ceil(boardDepth),
        maxBudget: Math.ceil(totalCost * 1.1),
        maxCurrentMa: Math.ceil(totalPower * 1.2),
        applyAfterSize: true,
        applyAfterBudget: true,
        applyAfterPower: true,
      },
    });

    // Load the board with slots (including positions if available)
    const slots = boardSlots.map(s => ({
      pedal: s.pedal,
      positionX: (s as any).positionX,
      positionY: (s as any).positionY,
      rotation: (s as any).rotation || 0,
    }));

    dispatch({
      type: 'LOAD_BOARD',
      board: {
        id: generateUUID(),
        name: publicBoard.name,
        constraints: {
          maxWidthMm: Math.ceil(boardWidth),
          maxDepthMm: Math.ceil(boardDepth),
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

    // Go to community review page
    setCurrentPage('community-review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleBookmark = (board: PublicBoard) => {
    const isBookmarked = bookmarks.some(b => b.board_id === board.board_id);
    
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter(b => b.board_id !== board.board_id);
      setBookmarks(newBookmarks);
      saveBookmarksToStorage(newBookmarks);
    } else {
      const newBookmark: BookmarkedBoard = {
        id: board.id,
        board_id: board.board_id,
        username: board.username,
        name: board.name,
        bookmarkedAt: new Date(),
      };
      const newBookmarks = [...bookmarks, newBookmark];
      setBookmarks(newBookmarks);
      saveBookmarksToStorage(newBookmarks);
    }
  };

  const isBookmarked = (boardId: string) => bookmarks.some(b => b.board_id === boardId);

  const handleOpenBookmark = async (bookmark: BookmarkedBoard) => {
    if (!supabase) return;
    
    try {
      // Fetch the full board data from Supabase
      const { data } = await supabase
        .from('public_boards')
        .select('*')
        .eq('board_id', bookmark.board_id)
        .single();
      
      if (data) {
        handleViewCommunityBoard(data as PublicBoard);
      }
    } catch (e) {
      console.warn('Failed to open bookmark:', e);
    }
  };

  const handleRemoveBookmark = (boardId: string) => {
    const newBookmarks = bookmarks.filter(b => b.board_id !== boardId);
    setBookmarks(newBookmarks);
    saveBookmarksToStorage(newBookmarks);
  };

  const handleViewCommunityCollection = (publicCollection: PublicCollection) => {
    setSelectedCommunityCollection(publicCollection);
    setCurrentPage('community-collection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewForumPost = (postId: string) => {
    setInitialForumPostId(postId);
    setCurrentPage('community');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentStep) {
      case 'genre':
        return <GenrePage onContinue={() => handleStepChange('constraints')} onCreateOwn={handleCreateOwn} />;
      case 'constraints':
        return <ConstraintsPage onContinue={() => handleStepChange('build')} />;
      case 'build':
        return <BuildPage onContinue={() => handleStepChange('review')} collection={collection} />;
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
            onPedalRequest={() => setShowPedalRequestModal(true)}
            onFeedback={() => setShowFeedbackModal(true)}
            onCollection={handleCollection}
            onCommunity={() => setCurrentPage('community')}
            onViewForumPost={handleViewForumPost}
          />
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        <PedalRequestModal
          isOpen={showPedalRequestModal}
          onClose={() => setShowPedalRequestModal(false)}
        />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
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
            onPedalRequest={() => setShowPedalRequestModal(true)}
            onFeedback={() => setShowFeedbackModal(true)}
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
        <PedalRequestModal
          isOpen={showPedalRequestModal}
          onClose={() => setShowPedalRequestModal(false)}
        />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      </div>
    );
  }
  
  // Collection page
  if (currentPage === 'collection') {
    return (
      <div className="min-h-screen bg-board-dark">
        {/* User Menu - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <UserMenu 
            onSignInClick={() => setShowAuthModal(true)} 
            onSavedBoards={handleSavedBoards}
            onPedalRequest={() => setShowPedalRequestModal(true)}
            onFeedback={() => setShowFeedbackModal(true)}
          />
        </div>
        <CollectionPage
          collection={collection}
          allPedals={PEDALS}
          onAddToCollection={handleAddToCollection}
          onRemoveFromCollection={handleRemoveFromCollection}
          onBack={handleGoHome}
        />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        <PedalRequestModal
          isOpen={showPedalRequestModal}
          onClose={() => setShowPedalRequestModal(false)}
        />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      </div>
    );
  }

  // Community page
  if (currentPage === 'community') {
    return (
      <div className="min-h-screen bg-board-dark">
        {/* User Menu - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <UserMenu 
            onSignInClick={() => setShowAuthModal(true)} 
            onSavedBoards={handleSavedBoards}
            onPedalRequest={() => setShowPedalRequestModal(true)}
            onFeedback={() => setShowFeedbackModal(true)}
          />
        </div>
        <CommunityPage
          onBack={() => { setInitialForumPostId(undefined); handleGoHome(); }}
          onViewBoard={handleViewCommunityBoard}
          onViewCollection={handleViewCommunityCollection}
          onSignInClick={() => setShowAuthModal(true)}
          initialForumPostId={initialForumPostId}
        />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        <PedalRequestModal
          isOpen={showPedalRequestModal}
          onClose={() => setShowPedalRequestModal(false)}
        />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
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
            onPedalRequest={() => setShowPedalRequestModal(true)}
            onFeedback={() => setShowFeedbackModal(true)}
          />
        </div>
        <div className="relative">
          <SavedBoardsPage
            onBack={handleGoHome}
            onOpenBoard={handleOpenSavedBoard}
            savedBoards={savedBoards}
            onRenameBoard={handleRenameBoard}
            onDeleteBoard={handleDeleteBoard}
            bookmarks={bookmarks}
            onOpenBookmark={handleOpenBookmark}
            onRemoveBookmark={handleRemoveBookmark}
          />
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        <PedalRequestModal
          isOpen={showPedalRequestModal}
          onClose={() => setShowPedalRequestModal(false)}
        />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
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
            onPedalRequest={() => setShowPedalRequestModal(true)}
            onFeedback={() => setShowFeedbackModal(true)}
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
        <PedalRequestModal
          isOpen={showPedalRequestModal}
          onClose={() => setShowPedalRequestModal(false)}
        />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
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
                <ThemeToggle />
                <UserMenu 
                  onSignInClick={() => setShowAuthModal(true)} 
                  onSavedBoards={handleSavedBoards}
                  onPedalRequest={() => setShowPedalRequestModal(true)}
                  onFeedback={() => setShowFeedbackModal(true)}
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
        <PedalRequestModal
          isOpen={showPedalRequestModal}
          onClose={() => setShowPedalRequestModal(false)}
        />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      </div>
    );
  }

  // Pedal Review page (for subcategory editing)
  if (currentPage === 'pedal-review') {
    return <PedalReviewPage />;
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
                <ThemeToggle />
                <UserMenu 
                  onSignInClick={() => setShowAuthModal(true)} 
                  onSavedBoards={handleSavedBoards}
                  onPedalRequest={() => setShowPedalRequestModal(true)}
                  onFeedback={() => setShowFeedbackModal(true)}
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
        <PedalRequestModal
          isOpen={showPedalRequestModal}
          onClose={() => setShowPedalRequestModal(false)}
        />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      </div>
    );
  }

  // Community Board Review page (read-only)
  if (currentPage === 'community-review' && selectedCommunityBoard) {
    return (
      <div className="min-h-screen bg-board-dark">
        <div className="noise-overlay" />
        <div className="fixed inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
        <div className="relative">
          {/* Custom header for community board review */}
          <div className="sticky top-0 z-50 bg-board-dark/95 backdrop-blur-sm border-b border-board-border">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage('community')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Community
              </button>
              <div className="text-center">
                <span className="text-sm text-purple-400 font-medium">COMMUNITY BOARD</span>
                <h1 className="text-lg font-bold text-white">{selectedCommunityBoard.name}</h1>
                <p className="text-xs text-zinc-400">by {selectedCommunityBoard.username}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleBookmark(selectedCommunityBoard)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    isBookmarked(selectedCommunityBoard.board_id)
                      ? 'bg-yellow-400 text-black'
                      : 'bg-zinc-700 text-white hover:bg-zinc-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill={isBookmarked(selectedCommunityBoard.board_id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {isBookmarked(selectedCommunityBoard.board_id) ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button
                  onClick={handleBuildBoard}
                  className="px-4 py-2 bg-board-accent text-white text-sm font-medium rounded-lg hover:bg-board-accent-dim transition-colors"
                >
                  Build Your Own
                </button>
                <ThemeToggle />
                <UserMenu 
                  onSignInClick={() => setShowAuthModal(true)} 
                  onSavedBoards={handleSavedBoards}
                  onPedalRequest={() => setShowPedalRequestModal(true)}
                  onFeedback={() => setShowFeedbackModal(true)}
                />
              </div>
            </div>
          </div>
          <ReviewPage 
            onSignInClick={() => setShowAuthModal(true)}
            readOnly={true}
            communityUsername={selectedCommunityBoard.username}
          />
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        <PedalRequestModal
          isOpen={showPedalRequestModal}
          onClose={() => setShowPedalRequestModal(false)}
        />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      </div>
    );
  }

  // Community Collection page (read-only)
  if (currentPage === 'community-collection' && selectedCommunityCollection) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFEF0' }}>
        <CollectionPage
          collection={selectedCommunityCollection.pedal_ids}
          allPedals={PEDALS}
          onBack={() => setCurrentPage('community')}
          readOnly={true}
          communityUsername={selectedCommunityCollection.username}
        />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        <PedalRequestModal
          isOpen={showPedalRequestModal}
          onClose={() => setShowPedalRequestModal(false)}
        />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
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
      onPedalRequest={() => setShowPedalRequestModal(true)}
      onFeedback={() => setShowFeedbackModal(true)}
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
      <PedalRequestModal
        isOpen={showPedalRequestModal}
        onClose={() => setShowPedalRequestModal(false)}
      />
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </WizardLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BoardProvider>
          <AppContent />
        </BoardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
