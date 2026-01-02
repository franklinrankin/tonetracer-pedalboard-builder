// Core Types for ToneTracer Pedalboard Builder

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

export type SignalType = 'mono' | 'stereo';

export type EnclosureType = 
  | 'mini'
  | '1590A'
  | '1590B'
  | '125B'
  | '1590BB'
  | 'boss-compact'
  | 'boss-twin'
  | 'medium'
  | 'large'
  | 'xl';

export interface Pedal {
  id: string;
  brand: string;
  model: string;
  category: Category;
  subtype?: string;
  categoryRating: number; // 1-10
  
  // Physical
  widthMm: number;
  depthMm: number;
  heightMm: number;
  enclosure: EnclosureType;
  topJacks: boolean;
  
  // Signal
  signal: SignalType;
  buffered: boolean;
  bypassType: BypassType;
  
  // Power
  voltage: number; // e.g., 9, 12, 18
  currentMa: number;
  centerNegative: boolean;
  
  // Commerce
  msrp: number;
  reverbPrice: number;
  reverbRating: number; // 1-5 stars
  
  // Optional
  imageUrl?: string;
  description?: string;
}

export interface BoardConstraints {
  maxWidthMm: number;
  maxDepthMm: number;
  maxBudget: number;
  minBudget?: number;
  maxCurrentMa?: number;
  rightAngleCablesOnly?: boolean;
}

export interface BoardSlot {
  pedal: Pedal;
  positionX?: number;
  positionY?: number;
}

export interface SectionScore {
  category: Category;
  totalScore: number;
  maxScore: number;
  tag: string;
  pedals: Pedal[];
}

export interface Board {
  id: string;
  name: string;
  constraints: BoardConstraints;
  slots: BoardSlot[];
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

