// Popular pedalboard sizes based on industry standards
// Dimensions in inches, converted to mm for calculations

const IN_TO_MM = 25.4;

export interface BoardSize {
  id: string;
  name: string;
  brand: string;
  widthIn: number;
  depthIn: number;
  widthMm: number;
  depthMm: number;
  areaSqIn: number;
  areaSqMm: number;
  pedalCapacity: string;
}

export const POPULAR_BOARDS: BoardSize[] = [
  {
    id: 'nano',
    name: 'Nano',
    brand: 'Pedaltrain',
    widthIn: 14,
    depthIn: 5.5,
    widthMm: 14 * IN_TO_MM,
    depthMm: 5.5 * IN_TO_MM,
    areaSqIn: 14 * 5.5,
    areaSqMm: (14 * IN_TO_MM) * (5.5 * IN_TO_MM),
    pedalCapacity: '3-5 mini',
  },
  {
    id: 'nano-plus',
    name: 'Nano+',
    brand: 'Pedaltrain',
    widthIn: 18,
    depthIn: 5,
    widthMm: 18 * IN_TO_MM,
    depthMm: 5 * IN_TO_MM,
    areaSqIn: 18 * 5,
    areaSqMm: (18 * IN_TO_MM) * (5 * IN_TO_MM),
    pedalCapacity: '4-6',
  },
  {
    id: 'metro-16',
    name: 'Metro 16',
    brand: 'Pedaltrain',
    widthIn: 16,
    depthIn: 8,
    widthMm: 16 * IN_TO_MM,
    depthMm: 8 * IN_TO_MM,
    areaSqIn: 16 * 8,
    areaSqMm: (16 * IN_TO_MM) * (8 * IN_TO_MM),
    pedalCapacity: '5-7',
  },
  {
    id: 'metro-20',
    name: 'Metro 20',
    brand: 'Pedaltrain',
    widthIn: 20,
    depthIn: 8,
    widthMm: 20 * IN_TO_MM,
    depthMm: 8 * IN_TO_MM,
    areaSqIn: 20 * 8,
    areaSqMm: (20 * IN_TO_MM) * (8 * IN_TO_MM),
    pedalCapacity: '6-8',
  },
  {
    id: 'classic-jr',
    name: 'Classic Jr',
    brand: 'Pedaltrain',
    widthIn: 18,
    depthIn: 12.5,
    widthMm: 18 * IN_TO_MM,
    depthMm: 12.5 * IN_TO_MM,
    areaSqIn: 18 * 12.5,
    areaSqMm: (18 * IN_TO_MM) * (12.5 * IN_TO_MM),
    pedalCapacity: '8-10',
  },
  {
    id: 'classic-1',
    name: 'Classic 1',
    brand: 'Pedaltrain',
    widthIn: 22,
    depthIn: 12.5,
    widthMm: 22 * IN_TO_MM,
    depthMm: 12.5 * IN_TO_MM,
    areaSqIn: 22 * 12.5,
    areaSqMm: (22 * IN_TO_MM) * (12.5 * IN_TO_MM),
    pedalCapacity: '10-12',
  },
  {
    id: 'classic-2',
    name: 'Classic 2',
    brand: 'Pedaltrain',
    widthIn: 24,
    depthIn: 12.5,
    widthMm: 24 * IN_TO_MM,
    depthMm: 12.5 * IN_TO_MM,
    areaSqIn: 24 * 12.5,
    areaSqMm: (24 * IN_TO_MM) * (12.5 * IN_TO_MM),
    pedalCapacity: '12-14',
  },
  {
    id: 'classic-pro',
    name: 'Classic Pro',
    brand: 'Pedaltrain',
    widthIn: 32,
    depthIn: 16,
    widthMm: 32 * IN_TO_MM,
    depthMm: 16 * IN_TO_MM,
    areaSqIn: 32 * 16,
    areaSqMm: (32 * IN_TO_MM) * (16 * IN_TO_MM),
    pedalCapacity: '16-20',
  },
  // Boss boards
  {
    id: 'boss-bcb-30',
    name: 'BCB-30',
    brand: 'Boss',
    widthIn: 12.2,
    depthIn: 6.7,
    widthMm: 310,
    depthMm: 170,
    areaSqIn: 12.2 * 6.7,
    areaSqMm: 310 * 170,
    pedalCapacity: '3-4',
  },
  {
    id: 'boss-bcb-60',
    name: 'BCB-60',
    brand: 'Boss',
    widthIn: 18.9,
    depthIn: 8.7,
    widthMm: 480,
    depthMm: 220,
    areaSqIn: 18.9 * 8.7,
    areaSqMm: 480 * 220,
    pedalCapacity: '5-6',
  },
  // Temple Audio boards
  {
    id: 'temple-duo-17',
    name: 'DUO 17',
    brand: 'Temple Audio',
    widthIn: 17,
    depthIn: 5,
    widthMm: 432,
    depthMm: 127,
    areaSqIn: 17 * 5,
    areaSqMm: 432 * 127,
    pedalCapacity: '4-5',
  },
  {
    id: 'temple-duo-24',
    name: 'DUO 24',
    brand: 'Temple Audio',
    widthIn: 24,
    depthIn: 5,
    widthMm: 610,
    depthMm: 127,
    areaSqIn: 24 * 5,
    areaSqMm: 610 * 127,
    pedalCapacity: '5-7',
  },
];

/**
 * Select the best fitting board based on total pedal area
 * Adds generous buffer for cables, spacing, and comfortable layout
 */
export function selectBoardForPedals(totalPedalAreaMm: number): BoardSize {
  // Add 60% buffer for cables, spacing, and comfortable layout
  const requiredArea = totalPedalAreaMm * 1.6;
  
  // Find the smallest board that fits
  for (const board of POPULAR_BOARDS) {
    if (board.areaSqMm >= requiredArea) {
      return board;
    }
  }
  
  // If nothing fits, return the largest
  return POPULAR_BOARDS[POPULAR_BOARDS.length - 1];
}
