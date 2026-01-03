import { BoardTemplate } from '../types';
import { formatInches } from '../utils/measurements';

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: 'pt-nano',
    name: 'Pedaltrain Nano',
    description: 'Ultra-compact, 3-4 mini pedals',
    widthMm: 356,
    depthMm: 127,
    brand: 'Pedaltrain',
    suggestedBudget: 300,
  },
  {
    id: 'pt-nano-plus',
    name: 'Pedaltrain Nano+',
    description: 'Compact with room for power supply underneath',
    widthMm: 457,
    depthMm: 127,
    brand: 'Pedaltrain',
    suggestedBudget: 400,
  },
  {
    id: 'pt-metro-16',
    name: 'Pedaltrain Metro 16',
    description: 'Small board, 4-5 standard pedals',
    widthMm: 406,
    depthMm: 152,
    brand: 'Pedaltrain',
    suggestedBudget: 500,
  },
  {
    id: 'pt-metro-20',
    name: 'Pedaltrain Metro 20',
    description: 'Slightly larger small board',
    widthMm: 508,
    depthMm: 152,
    brand: 'Pedaltrain',
    suggestedBudget: 600,
  },
  {
    id: 'pt-metro-24',
    name: 'Pedaltrain Metro 24',
    description: 'Popular gigging size',
    widthMm: 610,
    depthMm: 203,
    brand: 'Pedaltrain',
    suggestedBudget: 800,
  },
  {
    id: 'pt-classic-jr',
    name: 'Pedaltrain Classic Jr',
    description: 'Versatile medium board',
    widthMm: 457,
    depthMm: 318,
    brand: 'Pedaltrain',
    suggestedBudget: 700,
  },
  {
    id: 'pt-classic-1',
    name: 'Pedaltrain Classic 1',
    description: 'Standard medium-large board',
    widthMm: 559,
    depthMm: 318,
    brand: 'Pedaltrain',
    suggestedBudget: 1000,
  },
  {
    id: 'pt-classic-2',
    name: 'Pedaltrain Classic 2',
    description: 'Large professional board',
    widthMm: 610,
    depthMm: 318,
    brand: 'Pedaltrain',
    suggestedBudget: 1500,
  },
  {
    id: 'pt-classic-pro',
    name: 'Pedaltrain Classic Pro',
    description: 'Extra-large touring board',
    widthMm: 813,
    depthMm: 419,
    brand: 'Pedaltrain',
    suggestedBudget: 2500,
  },
  {
    id: 'boss-bcb-30',
    name: 'Boss BCB-30',
    description: 'Compact Boss carrying case board',
    widthMm: 310,
    depthMm: 170,
    brand: 'Boss',
    suggestedBudget: 400,
  },
  {
    id: 'boss-bcb-60',
    name: 'Boss BCB-60',
    description: 'Medium Boss carrying case board',
    widthMm: 480,
    depthMm: 220,
    brand: 'Boss',
    suggestedBudget: 600,
  },
  {
    id: 'templeboard-duo-17',
    name: 'Temple Audio DUO 17',
    description: 'Modular quick-release system',
    widthMm: 432,
    depthMm: 127,
    brand: 'Temple Audio',
    suggestedBudget: 500,
  },
  {
    id: 'templeboard-duo-24',
    name: 'Temple Audio DUO 24',
    description: 'Medium modular board',
    widthMm: 610,
    depthMm: 127,
    brand: 'Temple Audio',
    suggestedBudget: 700,
  },
  {
    id: 'custom-small',
    name: 'Custom Small',
    description: 'Define your own small board',
    widthMm: 400,
    depthMm: 150,
    suggestedBudget: 500,
  },
  {
    id: 'custom-medium',
    name: 'Custom Medium',
    description: 'Define your own medium board',
    widthMm: 550,
    depthMm: 250,
    suggestedBudget: 1000,
  },
  {
    id: 'custom-large',
    name: 'Custom Large',
    description: 'Define your own large board',
    widthMm: 700,
    depthMm: 350,
    suggestedBudget: 2000,
  },
];

// Helper to get display dimensions in inches
export function getTemplateDimensionsDisplay(template: BoardTemplate): string {
  return `${formatInches(template.widthMm)}" × ${formatInches(template.depthMm)}"`;
}

// Get board template by dimensions
export function getBoardTemplateByDimensions(widthMm: number, depthMm: number): BoardTemplate | undefined {
  const tolerance = 0.1;
  return BOARD_TEMPLATES.find(template =>
    Math.abs(template.widthMm - widthMm) < tolerance &&
    Math.abs(template.depthMm - depthMm) < tolerance
  );
}

// Estimate how many pedals can fit on a board
// Based on average pedal size of ~75mm wide x 125mm deep with 10mm spacing
export function estimatePedalCapacity(widthMm: number, depthMm: number): number {
  const AVG_PEDAL_WIDTH = 75; // mm (~3")
  const AVG_PEDAL_DEPTH = 125; // mm (~5")
  const SPACING = 10; // mm between pedals

  const pedalsPerRow = Math.floor(widthMm / (AVG_PEDAL_WIDTH + SPACING));
  const numRows = Math.floor(depthMm / (AVG_PEDAL_DEPTH + SPACING));
  
  return Math.max(pedalsPerRow * numRows, 3); // Minimum 3 pedals
}

// Get recommended number of essential pedal categories based on board size
export function getRecommendedEssentialCount(widthMm: number, depthMm: number): number {
  const capacity = estimatePedalCapacity(widthMm, depthMm);
  
  // Small boards (3-5 capacity): 3-4 essentials
  // Medium boards (6-10 capacity): 5-6 essentials
  // Large boards (11-15 capacity): 7-8 essentials
  // XL boards (16+ capacity): 8-10 essentials
  
  if (capacity <= 5) return Math.min(capacity, 4);
  if (capacity <= 10) return Math.min(capacity - 1, 6);
  if (capacity <= 15) return Math.min(capacity - 2, 8);
  return Math.min(capacity - 3, 10);
}

// Get recommended number of bonus pedals based on board size
export function getRecommendedBonusCount(widthMm: number, depthMm: number): number {
  const capacity = estimatePedalCapacity(widthMm, depthMm);
  const essentials = getRecommendedEssentialCount(widthMm, depthMm);
  
  // Leave some room - bonus pedals fill remaining capacity minus a buffer
  const remaining = capacity - essentials;
  
  if (remaining <= 1) return 0;
  if (remaining <= 3) return 2;
  if (remaining <= 5) return 3;
  return Math.min(remaining - 1, 5);
}
