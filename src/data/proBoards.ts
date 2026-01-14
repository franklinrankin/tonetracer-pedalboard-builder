// Pro Boards - Curated pedalboards from professional guitarists
// NOTE: Signal flows RIGHT to LEFT on pedalboards (guitar on right, amp on left)
// So earlier pedals in signal chain should have HIGHER x values

export interface PedalPosition {
  pedalId: string;
  x: number;  // percentage from left (0-100) - higher = closer to guitar (right side)
  y: number;  // percentage from top (0-100)
  rotation?: number;  // degrees, optional
}

export interface ProBoard {
  id: string;
  name: string;
  artist: string;
  year: number;
  description: string;
  image?: string;
  pedalIds: string[];
  // Custom board dimensions (mm)
  boardWidthMm?: number;
  boardDepthMm?: number;
  // Exact pedal positions (optional - if not provided, uses auto-layout)
  layout?: PedalPosition[];
  genre: string;
  source?: string;
}

export const PRO_BOARDS: ProBoard[] = [
  {
    id: 'slash-gnr',
    name: 'Paradise City / GN\'R Rig',
    artist: 'Slash',
    year: 1990,
    description: 'Slash\'s iconic Guns N\' Roses pedalboard. Features the MXR Stereo Chorus for that lush Paradise City intro, plus classic MXR effects throughout.',
    pedalIds: [
      'mxr-smart-gate',
      'boss-tu2',
      'dunlop-crybaby-gcb95',
      'dunlop-qzone',
      'mxr-phase90',
      'mxr-blue-box',
      'mxr-m233-boost-line-driver',
      'mxr-m134-stereo-chorus',
      'mxr-m159-tremolo',
      'boss-dd3',
    ],
    boardWidthMm: 900,  // ~35 inches
    boardDepthMm: 400,  // ~16 inches
    // Layout from diagram - EXACT ORDER: Smart Gate, TU, Crybaby, Q Zone, Phase 90, Blue Box, Line Driver, Chorus, Trem, Delay
    layout: [
      { pedalId: 'mxr-smart-gate', x: 95, y: 25 },
      { pedalId: 'boss-tu2', x: 82, y: 25 },
      { pedalId: 'dunlop-crybaby-gcb95', x: 68, y: 35 },
      { pedalId: 'dunlop-qzone', x: 92, y: 75 },
      { pedalId: 'mxr-phase90', x: 78, y: 75 },
      { pedalId: 'mxr-blue-box', x: 64, y: 75 },
      { pedalId: 'mxr-m233-boost-line-driver', x: 50, y: 75 },
      { pedalId: 'mxr-m134-stereo-chorus', x: 32, y: 30 },
      { pedalId: 'mxr-m159-tremolo', x: 15, y: 30 },
      { pedalId: 'boss-dd3', x: 15, y: 75 },
    ],
    genre: 'Hard Rock',
    source: 'GN\'R Era',
  },
  {
    id: 'prince-hohner-tele',
    name: 'Hohner Telecaster Rig',
    artist: 'Prince',
    year: 1990,
    description: 'Prince\'s iconic pedalboard. Features the original WH-1 Whammy for his signature pitch bends, plus classic Boss effects for funk, rock, and everything in between.',
    pedalIds: [
      'digitech-whammy-1',
      'dunlop-crybaby-gcb95',
      'boss-bd2',
      'boss-ds2',
      'boss-bf2-flanger',
      'boss-dd3',
      'boss-vb2-vibrato',
      'line6-mm4',
    ],
    boardWidthMm: 900,  // ~35 inches
    boardDepthMm: 250,  // ~10 inches
    // Layout from diagram - EXACT ORDER: Whammy, Crybaby, BD, DS, BF, DD3, VB, MM4
    layout: [
      { pedalId: 'digitech-whammy-1', x: 92, y: 50 },
      { pedalId: 'dunlop-crybaby-gcb95', x: 80, y: 50 },
      { pedalId: 'boss-bd2', x: 68, y: 50 },
      { pedalId: 'boss-ds2', x: 56, y: 50 },
      { pedalId: 'boss-bf2-flanger', x: 44, y: 50 },
      { pedalId: 'boss-dd3', x: 32, y: 50 },
      { pedalId: 'boss-vb2-vibrato', x: 20, y: 50 },
      { pedalId: 'line6-mm4', x: 8, y: 50 },
    ],
    genre: 'Funk / Rock',
    source: 'photopix.ch/hohner',
  },
  {
    id: 'mac-demarco-live',
    name: 'Live Board',
    artist: 'Mac DeMarco',
    year: 2016,
    description: 'Mac DeMarco\'s famously simple live setup. Lo-fi indie vibes with the VB-2W vibrato and DM-2W delay that define his jangly, warbly sound.',
    pedalIds: [
      'boss-tu3',
      'boss-vb2w',
      'boss-dm2w',
      'ehx-holy-grail-plus',
      'mxr-m133-micro-amp',
    ],
    boardWidthMm: 500,  // ~20 inches
    boardDepthMm: 250,  // ~10 inches
    // Layout based on photo - signal flows RIGHT to LEFT
    // Tuner → VB-2W → DM-2W → Holy Grail → Micro Amp
    layout: [
      { pedalId: 'boss-tu3', x: 90, y: 50 },
      { pedalId: 'boss-vb2w', x: 70, y: 50 },
      { pedalId: 'boss-dm2w', x: 50, y: 50 },
      { pedalId: 'ehx-holy-grail-plus', x: 30, y: 50 },
      { pedalId: 'mxr-m133-micro-amp', x: 12, y: 50 },
    ],
    genre: 'Indie / Lo-Fi',
    source: 'Live Shows',
  },
  {
    id: 'john-mayer-2005-trio',
    name: '2005 Trio Board',
    artist: 'John Mayer',
    year: 2005,
    description: 'John Mayer\'s pedalboard from the Try! Trio era. A simple but iconic setup featuring the TS808 and Blues Driver stack that defined his early blues tone.',
    pedalIds: [
      'boss-tu2',
      'keeley-katana',
      'boss-bd2',
      'ibanez-ts808',
      't-rex-replica',
      'way-huge-aqua-puss',
    ],
    // Custom board: ~24" x 12" (610mm x 305mm)
    boardWidthMm: 610,
    boardDepthMm: 305,
    // Layout based on the photo - 2 rows, signal flows RIGHT to LEFT
    layout: [
      // Top row (back) - delays: Aqua Puss → Replica (right to left)
      { pedalId: 'way-huge-aqua-puss', x: 70, y: 25 },
      { pedalId: 't-rex-replica', x: 30, y: 25 },
      
      // Bottom row (front) - Tuner → Katana → BD2 → TS808 (right to left)
      { pedalId: 'boss-tu2', x: 85, y: 75 },
      { pedalId: 'keeley-katana', x: 65, y: 75 },
      { pedalId: 'boss-bd2', x: 45, y: 75 },
      { pedalId: 'ibanez-ts808', x: 20, y: 75 },
    ],
    genre: 'Blues / Blues Rock',
    source: 'Try! Live Album Era',
  },
];

export const getProBoardById = (id: string): ProBoard | undefined => {
  return PRO_BOARDS.find(board => board.id === id);
};
