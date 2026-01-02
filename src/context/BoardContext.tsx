import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Board, BoardConstraints, BoardSlot, Pedal, PedalWithStatus, DisqualificationReason, Category, SectionScore } from '../types';
import { CATEGORY_INFO, getCategoryTag } from '../data/categories';
import { PEDALS } from '../data/pedals';
import { formatInches } from '../utils/measurements';

interface BoardState {
  board: Board;
  allPedals: PedalWithStatus[];
  sectionScores: SectionScore[];
  totalCost: number;
  totalArea: number;
  totalCurrent: number;
  genres: string[];
  selectedGenre: string | null;
}

type BoardAction =
  | { type: 'SET_CONSTRAINTS'; constraints: BoardConstraints }
  | { type: 'ADD_PEDAL'; pedal: Pedal }
  | { type: 'REMOVE_PEDAL'; pedalId: string }
  | { type: 'CLEAR_BOARD' }
  | { type: 'SET_BOARD_NAME'; name: string }
  | { type: 'LOAD_BOARD'; board: Board }
  | { type: 'SET_GENRE'; genreId: string | null };

const defaultConstraints: BoardConstraints = {
  maxWidthMm: 610,
  maxDepthMm: 318,
  maxBudget: 1000,
  maxCurrentMa: 2000,
};

const createDefaultBoard = (): Board => ({
  id: crypto.randomUUID(),
  name: 'My Pedalboard',
  constraints: defaultConstraints,
  slots: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

function calculatePedalStatus(
  pedal: Pedal,
  constraints: BoardConstraints,
  currentSlots: BoardSlot[]
): PedalWithStatus {
  const reasons: DisqualificationReason[] = [];
  
  // Calculate current totals
  const currentCost = currentSlots.reduce((sum, s) => sum + s.pedal.reverbPrice, 0);
  const currentArea = currentSlots.reduce((sum, s) => sum + (s.pedal.widthMm * s.pedal.depthMm), 0);
  const currentCurrent = currentSlots.reduce((sum, s) => sum + s.pedal.currentMa, 0);
  
  // Check if this pedal is already on the board
  const isOnBoard = currentSlots.some(s => s.pedal.id === pedal.id);
  
  // Budget check (skip if applyAfterBudget is true)
  if (!constraints.applyAfterBudget) {
    const costWithPedal = currentCost + pedal.reverbPrice;
    if (costWithPedal > constraints.maxBudget) {
      reasons.push({
        type: 'budget',
        message: `Over budget by $${costWithPedal - constraints.maxBudget}`,
        value: costWithPedal,
        limit: constraints.maxBudget,
      });
    }
  }
  
  // Size checks (skip if applyAfterSize is true)
  if (!constraints.applyAfterSize) {
    // Size check (simplified - just checking area)
    const maxArea = constraints.maxWidthMm * constraints.maxDepthMm;
    const pedalArea = pedal.widthMm * pedal.depthMm;
    const areaWithPedal = currentArea + pedalArea;
    if (areaWithPedal > maxArea * 0.85) { // 85% usable area accounting for spacing
      reasons.push({
        type: 'size',
        message: `Board area exceeded`,
        value: areaWithPedal,
        limit: maxArea * 0.85,
      });
    }
    
    // Width check
    if (pedal.widthMm > constraints.maxWidthMm) {
      reasons.push({
        type: 'width',
        message: `Too wide by ${formatInches(pedal.widthMm - constraints.maxWidthMm)}"`,
        value: pedal.widthMm,
        limit: constraints.maxWidthMm,
      });
    }
    
    // Depth check
    if (pedal.depthMm > constraints.maxDepthMm) {
      reasons.push({
        type: 'depth',
        message: `Too deep by ${formatInches(pedal.depthMm - constraints.maxDepthMm)}"`,
        value: pedal.depthMm,
        limit: constraints.maxDepthMm,
      });
    }
  }
  
  // Power check (skip if applyAfterPower is true)
  if (!constraints.applyAfterPower && constraints.maxCurrentMa) {
    const currentWithPedal = currentCurrent + pedal.currentMa;
    if (currentWithPedal > constraints.maxCurrentMa) {
      reasons.push({
        type: 'power',
        message: `Power draw exceeds by ${currentWithPedal - constraints.maxCurrentMa}mA`,
        value: currentWithPedal,
        limit: constraints.maxCurrentMa,
      });
    }
  }
  
  return {
    ...pedal,
    fits: reasons.length === 0 || isOnBoard,
    reasons: isOnBoard ? [] : reasons,
  };
}

function calculateSectionScores(slots: BoardSlot[]): SectionScore[] {
  const categories = Object.keys(CATEGORY_INFO) as Category[];
  
  return categories.map(category => {
    const categoryPedals = slots.filter(s => s.pedal.category === category).map(s => s.pedal);
    const totalScore = categoryPedals.reduce((sum, p) => sum + p.categoryRating, 0);
    const info = CATEGORY_INFO[category];
    
    return {
      category,
      totalScore,
      maxScore: info.maxScore,
      tag: getCategoryTag(category, totalScore),
      pedals: categoryPedals,
    };
  }).filter(s => s.pedals.length > 0);
}

function guessGenres(slots: BoardSlot[], sectionScores: SectionScore[]): string[] {
  const genres: string[] = [];
  
  const gainScore = sectionScores.find(s => s.category === 'gain');
  const modScore = sectionScores.find(s => s.category === 'modulation');
  const delayScore = sectionScores.find(s => s.category === 'delay');
  const reverbScore = sectionScores.find(s => s.category === 'reverb');
  const synthScore = sectionScores.find(s => s.category === 'synth');
  
  // High gain = Metal/Rock
  if (gainScore && gainScore.totalScore >= 15) {
    genres.push('Metal');
  } else if (gainScore && gainScore.totalScore >= 10) {
    genres.push('Rock');
  }
  
  // Heavy modulation + delay = Shoegaze/Ambient
  if ((modScore?.totalScore || 0) >= 8 && (reverbScore?.totalScore || 0) >= 8) {
    genres.push('Shoegaze');
  }
  
  // Lots of delay and reverb = Ambient
  if ((delayScore?.totalScore || 0) >= 10 && (reverbScore?.totalScore || 0) >= 10) {
    genres.push('Ambient');
  }
  
  // Clean + light gain = Blues/Jazz
  if (gainScore && gainScore.totalScore <= 8 && gainScore.totalScore > 0) {
    if (gainScore.totalScore <= 4) {
      genres.push('Jazz');
    } else {
      genres.push('Blues');
    }
  }
  
  // Synth sounds = Experimental
  if (synthScore && synthScore.totalScore >= 5) {
    genres.push('Experimental');
  }
  
  // Light modulation + some delay = Indie
  if ((modScore?.totalScore || 0) >= 3 && (modScore?.totalScore || 0) <= 7) {
    genres.push('Indie');
  }
  
  // Country markers
  const hasCompressor = slots.some(s => s.pedal.subtype === 'Compressor');
  const hasLightGain = gainScore && gainScore.totalScore <= 6 && gainScore.totalScore > 0;
  if (hasCompressor && hasLightGain) {
    genres.push('Country');
  }
  
  return [...new Set(genres)].slice(0, 3);
}

function calculateState(board: Board): Omit<BoardState, 'board'> {
  const allPedals = PEDALS.map(p => calculatePedalStatus(p, board.constraints, board.slots));
  const sectionScores = calculateSectionScores(board.slots);
  const totalCost = board.slots.reduce((sum, s) => sum + s.pedal.reverbPrice, 0);
  const totalArea = board.slots.reduce((sum, s) => sum + (s.pedal.widthMm * s.pedal.depthMm), 0);
  const totalCurrent = board.slots.reduce((sum, s) => sum + s.pedal.currentMa, 0);
  const genres = guessGenres(board.slots, sectionScores);
  
  return { allPedals, sectionScores, totalCost, totalArea, totalCurrent, genres };
}

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  let newBoard: Board;
  
  switch (action.type) {
    case 'SET_CONSTRAINTS':
      newBoard = {
        ...state.board,
        constraints: action.constraints,
        updatedAt: new Date(),
      };
      return { ...state, board: newBoard, ...calculateState(newBoard) };
      
    case 'ADD_PEDAL':
      // Don't add if already on board
      if (state.board.slots.some(s => s.pedal.id === action.pedal.id)) {
        return state;
      }
      newBoard = {
        ...state.board,
        slots: [...state.board.slots, { pedal: action.pedal }],
        updatedAt: new Date(),
      };
      return { ...state, board: newBoard, ...calculateState(newBoard) };
      
    case 'REMOVE_PEDAL':
      newBoard = {
        ...state.board,
        slots: state.board.slots.filter(s => s.pedal.id !== action.pedalId),
        updatedAt: new Date(),
      };
      return { ...state, board: newBoard, ...calculateState(newBoard) };
      
    case 'CLEAR_BOARD':
      newBoard = {
        ...state.board,
        slots: [],
        updatedAt: new Date(),
      };
      return { ...state, board: newBoard, ...calculateState(newBoard) };
      
    case 'SET_BOARD_NAME':
      newBoard = {
        ...state.board,
        name: action.name,
        updatedAt: new Date(),
      };
      return { ...state, board: newBoard };
      
    case 'LOAD_BOARD':
      return { ...state, board: action.board, ...calculateState(action.board) };
      
    case 'SET_GENRE':
      return { ...state, selectedGenre: action.genreId };
      
    default:
      return state;
  }
}

const BoardContext = createContext<{
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
} | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const defaultBoard = createDefaultBoard();
  const initialState: BoardState = {
    board: defaultBoard,
    ...calculateState(defaultBoard),
    selectedGenre: null,
  };
  
  const [state, dispatch] = useReducer(boardReducer, initialState);
  
  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}

