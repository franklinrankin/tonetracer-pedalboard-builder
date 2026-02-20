// Core Types for Boardsie Pedalboard Builder

export type Category = 
  | 'gain'
  | 'modulation'
  | 'delay'
  | 'reverb'
  | 'dynamics'
  | 'filter'
  | 'pitch'
  | 'eq'
  | 'volume'
  | 'amp'
  | 'utility'
  | 'synth';

export type BypassType = 'true' | 'buffered' | 'selectable';

export type SignalType = 'mono' | 'stereo' | 'mono-in-stereo-out';

export type CircuitType = 'analog' | 'digital' | 'hybrid';

export type PowerType = 
  | '9V DC'
  | '12V DC'
  | '18V DC'
  | '24V DC'
  | '9-18V DC'
  | '9V AC'
  | '12V AC'
  | 'AC'
  | 'DC'
  | '48V Phantom'
  | 'Battery Only'
  | 'USB'
  | 'Passive';

export type EnclosureType = 
  | 'nano'        // ~1.5" x 1.5"
  | 'mini'        // ~1.75" x 3.5"
  | '1590A'       // ~2.4" x 3.9"
  | '1590B'       // ~2.4" x 4.4"
  | '125B'        // ~3" x 4.75"
  | '1590BB'      // ~4.7" x 3.7"
  | 'boss-compact'// ~2.9" x 5.1"
  | 'boss-twin'   // ~4.9" x 5.1"
  | 'medium'      // ~4" x 5"
  | 'large'       // ~5" x 6"
  | 'xl'          // ~7"+ 
  | 'wah'         // wah pedal enclosure
  | 'round'       // round fuzz face style
  | 'rack'        // rack mount unit
  | 'floor'       // floor multi-FX unit
  | 'custom';

export interface Pedal {
  id: string;
  brand: string;
  model: string;
  category: Category;
  subtype?: string;
  
  // Category-specific rating (scale depends on category)
  // Gain: 1-10, Modulation/Delay/Reverb/Dynamics/Utility: 1-15, Filter/Pitch/EQ/Volume/Amp: 1-10
  categoryRating: number;
  
  // Physical dimensions (stored in mm internally, displayed in inches)
  widthMm: number;
  depthMm: number;
  heightMm: number;
  enclosure: EnclosureType;
  topJacks: boolean;
  
  // Signal & Electronics
  signal: SignalType;
  buffered: boolean;
  bypassType: BypassType;
  circuitType?: CircuitType; // analog, digital, or hybrid
  
  // Power
  powerType?: PowerType; // e.g., '9V DC', '18V DC', etc.
  voltage: number; // e.g., 9, 12, 18
  currentMa: number;
  centerNegative: boolean;
  
  // Commerce
  msrp: number;
  reverbPrice: number;
  reverbPriceRange?: { min: number; max: number }; // Price range for used
  reverbRating?: number; // 1-5 stars
  
  // Optional metadata
  imageUrl?: string;
  description?: string;
  releaseYear?: number;
  discontinued?: boolean;
  madeIn?: string;
}

export interface BoardConstraints {
  maxWidthMm: number;
  maxDepthMm: number;
  maxBudget: number;
  minBudget?: number;
  maxCurrentMa?: number;
  maxPedalCount?: number; // If set, use this instead of board size
  rightAngleCablesOnly?: boolean;
  // "Apply After" flags - when true, constraint doesn't filter pedals during build
  applyAfterSize?: boolean;
  applyAfterBudget?: boolean;
  applyAfterPower?: boolean;
}

export interface BoardSlot {
  pedal: Pedal;
  positionX?: number;  // percentage from left (0-100)
  positionY?: number;  // percentage from top (0-100)
  rotation?: number;   // degrees
}

export interface SectionScore {
  category: Category;
  totalScore: number;
  maxScore: number;
  tag: string;
  pedals: Pedal[];
}

// Type slot represents a pedal TYPE (not a specific pedal) for the build flow
export interface TypeSlot {
  type: string; // e.g., "Tuner", "Overdrive", "Delay"
  category: Category;
  subtypes: string[]; // Actual subtypes to search for in pedal database
}

// Build slot for the build page - stores type + selected pedal
export interface BuildSlot {
  id: string;
  type: string;
  category: Category;
  signalOrder: number;
  selectedPedalId?: string;
}

export interface Board {
  id: string;
  name: string;
  constraints: BoardConstraints;
  slots: BoardSlot[];
  typeSlots?: TypeSlot[]; // Selected pedal types from build page
  buildSlots?: BuildSlot[]; // Build page state - persisted between navigation
  multiEffects?: MultiEffectsSelection; // Multi-FX/modeler selection
  createdAt: Date;
  updatedAt: Date;
}

export interface DisqualificationReason {
  type: 'budget' | 'size' | 'power' | 'depth' | 'width';
  message: string;
  value: number;
  limit: number;
}

export interface PedalWithStatus extends Pedal {
  fits: boolean;
  reasons: DisqualificationReason[];
}

// Category display info
export interface CategoryInfo {
  id: Category;
  name: string;
  displayName: string;
  color: string;
  maxScore: number;
  tags: string[];
  tagRanges: [number, number][];
  ratingLabels: { range: [number, number]; label: string }[];
}

// Board template
export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  widthMm: number;
  depthMm: number;
  brand?: string;
  suggestedBudget?: number;
}

// Saved board for user's saved boards list
export interface SavedBoard {
  id: string;
  name: string;
  board: Board;
  genres: string[]; // Genre names or empty for "Created Board"
  createdAt: Date;
  updatedAt: Date;
}

// Multi-FX selection for when user has a modeler covering multiple effect types
export interface MultiEffectsSelection {
  pedalId: string | null; // The multi-FX pedal being used (e.g., 'line6-hx-stomp')
  coveringCategories: Category[]; // Which categories it's covering (e.g., ['delay', 'reverb', 'modulation'])
  isAmpSimOnly: boolean; // If true, just using it as amp sim at end of chain
}
