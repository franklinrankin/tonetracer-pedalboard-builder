// Top 20 power supplies for pedalboards with varied outputs and power capacities

export interface PowerSupply {
  id: string;
  brand: string;
  model: string;
  totalOutputs: number;
  totalMa: number;
  outputs: PowerOutput[];
  isolated: boolean;
  msrp: number;
  reverbPrice: number;
  widthIn: number;
  depthIn: number;
  heightIn: number;
  mountable: boolean; // Can mount under board
  features: string[];
}

export interface PowerOutput {
  voltage: number;
  ma: number;
  count: number;
}

export const POWER_SUPPLIES: PowerSupply[] = [
  // === ENTRY LEVEL (3-5 outputs, <500mA total) ===
  {
    id: 'ps-truetone-1spot-pro-cs6',
    brand: 'Truetone',
    model: '1 Spot Pro CS6',
    totalOutputs: 6,
    totalMa: 900,
    outputs: [
      { voltage: 9, ma: 100, count: 4 },
      { voltage: 9, ma: 250, count: 2 },
    ],
    isolated: true,
    msrp: 130,
    reverbPrice: 120,
    widthIn: 5.75,
    depthIn: 2.9,
    heightIn: 1.1,
    mountable: true,
    features: ['Isolated outputs', 'Compact size', 'Switchable voltage on 2 outputs'],
  },
  {
    id: 'ps-mxr-iso-brick',
    brand: 'MXR',
    model: 'Iso-Brick',
    totalOutputs: 10,
    totalMa: 2800,
    outputs: [
      { voltage: 9, ma: 100, count: 2 },
      { voltage: 9, ma: 300, count: 4 },
      { voltage: 9, ma: 450, count: 2 },
      { voltage: 18, ma: 250, count: 2 },
    ],
    isolated: true,
    msrp: 200,
    reverbPrice: 150,
    widthIn: 6.0,
    depthIn: 3.0,
    heightIn: 1.25,
    mountable: true,
    features: ['Fully isolated', '18V outputs', 'Toroidal transformer'],
  },
  {
    id: 'ps-voodoo-lab-pp2-plus',
    brand: 'Voodoo Lab',
    model: 'Pedal Power 2 Plus',
    totalOutputs: 8,
    totalMa: 1200,
    outputs: [
      { voltage: 9, ma: 100, count: 4 },
      { voltage: 9, ma: 250, count: 4 },
    ],
    isolated: true,
    msrp: 200,
    reverbPrice: 180,
    widthIn: 6.5,
    depthIn: 3.0,
    heightIn: 1.1,
    mountable: true,
    features: ['Industry standard', 'Sag control on 2 outputs', 'Extremely quiet'],
  },
  
  // === MID-RANGE (6-10 outputs, 1000-2000mA total) ===
  {
    id: 'ps-cioks-dc7',
    brand: 'Cioks',
    model: 'DC7',
    totalOutputs: 7,
    totalMa: 1560,
    outputs: [
      { voltage: 9, ma: 660, count: 4 },
      { voltage: 9, ma: 150, count: 3 },
    ],
    isolated: true,
    msrp: 280,
    reverbPrice: 260,
    widthIn: 6.1,
    depthIn: 2.6,
    heightIn: 0.95,
    mountable: true,
    features: ['Ultra-low profile', 'Expandable', 'Premium quality', '4 high-current outputs'],
  },
  {
    id: 'ps-strymon-zuma',
    brand: 'Strymon',
    model: 'Zuma',
    totalOutputs: 5,
    totalMa: 2500,
    outputs: [
      { voltage: 9, ma: 500, count: 5 },
    ],
    isolated: true,
    msrp: 299,
    reverbPrice: 279,
    widthIn: 8.5,
    depthIn: 3.25,
    heightIn: 0.87,
    mountable: true,
    features: ['High current outputs', 'Ultra quiet', 'Expandable with Ojai'],
  },
  {
    id: 'ps-truetone-1spot-pro-cs12',
    brand: 'Truetone',
    model: '1 Spot Pro CS12',
    totalOutputs: 12,
    totalMa: 3000,
    outputs: [
      { voltage: 9, ma: 100, count: 4 },
      { voltage: 9, ma: 200, count: 4 },
      { voltage: 9, ma: 400, count: 2 },
      { voltage: 18, ma: 200, count: 2 },
    ],
    isolated: true,
    msrp: 230,
    reverbPrice: 200,
    widthIn: 10.75,
    depthIn: 2.9,
    heightIn: 1.1,
    mountable: true,
    features: ['12 outputs', 'Switchable voltage', 'Great value'],
  },
  {
    id: 'ps-walrus-phoenix',
    brand: 'Walrus Audio',
    model: 'Phoenix',
    totalOutputs: 15,
    totalMa: 3000,
    outputs: [
      { voltage: 9, ma: 100, count: 8 },
      { voltage: 9, ma: 300, count: 4 },
      { voltage: 9, ma: 500, count: 1 },
      { voltage: 12, ma: 100, count: 1 },
      { voltage: 18, ma: 100, count: 1 },
    ],
    isolated: true,
    msrp: 300,
    reverbPrice: 250,
    widthIn: 10.0,
    depthIn: 2.75,
    heightIn: 1.25,
    mountable: true,
    features: ['15 outputs', '12V and 18V options', 'Clean power'],
  },
  
  // === HIGH-END (10+ outputs, 2000+ mA total) ===
  {
    id: 'ps-cioks-dc10',
    brand: 'Cioks',
    model: 'DC10',
    totalOutputs: 10,
    totalMa: 3000,
    outputs: [
      { voltage: 9, ma: 660, count: 6 },
      { voltage: 9, ma: 150, count: 4 },
    ],
    isolated: true,
    msrp: 449,
    reverbPrice: 380,
    widthIn: 10.0,
    depthIn: 2.6,
    heightIn: 0.95,
    mountable: true,
    features: ['10 isolated outputs', 'Expandable', 'Studio-grade'],
  },
  {
    id: 'ps-strymon-zuma-r300',
    brand: 'Strymon',
    model: 'Zuma R300',
    totalOutputs: 9,
    totalMa: 4500,
    outputs: [
      { voltage: 9, ma: 500, count: 9 },
    ],
    isolated: true,
    msrp: 449,
    reverbPrice: 400,
    widthIn: 11.0,
    depthIn: 3.25,
    heightIn: 0.87,
    mountable: true,
    features: ['9 high current outputs', 'Rack mountable', 'Expandable'],
  },
  {
    id: 'ps-voodoo-lab-pp3-plus',
    brand: 'Voodoo Lab',
    model: 'Pedal Power 3 Plus',
    totalOutputs: 12,
    totalMa: 3000,
    outputs: [
      { voltage: 9, ma: 250, count: 8 },
      { voltage: 9, ma: 500, count: 4 },
    ],
    isolated: true,
    msrp: 299,
    reverbPrice: 270,
    widthIn: 8.0,
    depthIn: 3.5,
    heightIn: 1.2,
    mountable: true,
    features: ['Advanced digital control', 'Automatic ground loops prevention'],
  },
  
  // === COMPACT/MINI OPTIONS ===
  {
    id: 'ps-strymon-ojai',
    brand: 'Strymon',
    model: 'Ojai',
    totalOutputs: 5,
    totalMa: 2500,
    outputs: [
      { voltage: 9, ma: 500, count: 5 },
    ],
    isolated: true,
    msrp: 179,
    reverbPrice: 169,
    widthIn: 4.1,
    depthIn: 2.7,
    heightIn: 1.0,
    mountable: true,
    features: ['Ultra compact', 'High current', 'Expansion for Zuma'],
  },
  {
    id: 'ps-cioks-4',
    brand: 'Cioks',
    model: 'Cioks 4',
    totalOutputs: 4,
    totalMa: 1280,
    outputs: [
      { voltage: 9, ma: 320, count: 4 },
    ],
    isolated: true,
    msrp: 149,
    reverbPrice: 125,
    widthIn: 4.7,
    depthIn: 2.6,
    heightIn: 0.95,
    mountable: true,
    features: ['Ultra-compact', 'Expansion ready', 'Low profile'],
  },
  {
    id: 'ps-eventide-powermini',
    brand: 'Eventide',
    model: 'PowerMini',
    totalOutputs: 5,
    totalMa: 2000,
    outputs: [
      { voltage: 9, ma: 400, count: 5 },
    ],
    isolated: true,
    msrp: 149,
    reverbPrice: 130,
    widthIn: 4.5,
    depthIn: 2.5,
    heightIn: 1.1,
    mountable: true,
    features: ['Compact', 'Designed for Eventide pedals', 'Works with any pedal'],
  },
  
  // === PREMIUM/LARGE BOARDS ===
  {
    id: 'ps-gigrig-generator',
    brand: 'TheGigRig',
    model: 'Generator',
    totalOutputs: 11,
    totalMa: 4400,
    outputs: [
      { voltage: 9, ma: 400, count: 11 },
    ],
    isolated: true,
    msrp: 449,
    reverbPrice: 400,
    widthIn: 10.5,
    depthIn: 3.0,
    heightIn: 1.3,
    mountable: true,
    features: ['Professional grade', 'High current all outputs', 'Expandable'],
  },
  {
    id: 'ps-fender-engine-room-lvl12',
    brand: 'Fender',
    model: 'Engine Room LVL12',
    totalOutputs: 12,
    totalMa: 3600,
    outputs: [
      { voltage: 9, ma: 300, count: 12 },
    ],
    isolated: true,
    msrp: 250,
    reverbPrice: 220,
    widthIn: 8.5,
    depthIn: 3.0,
    heightIn: 1.2,
    mountable: true,
    features: ['12 isolated outputs', 'Fender reliability', 'Good value'],
  },
  {
    id: 'ps-mooer-macro-power-s12',
    brand: 'Mooer',
    model: 'Macro Power S12',
    totalOutputs: 12,
    totalMa: 2800,
    outputs: [
      { voltage: 9, ma: 100, count: 6 },
      { voltage: 9, ma: 300, count: 4 },
      { voltage: 12, ma: 150, count: 1 },
      { voltage: 18, ma: 150, count: 1 },
    ],
    isolated: true,
    msrp: 170,
    reverbPrice: 140,
    widthIn: 8.0,
    depthIn: 2.7,
    heightIn: 1.1,
    mountable: true,
    features: ['Great value', '12 outputs', 'Multiple voltages'],
  },
];

// Helper function to recommend power supply based on board needs
export function recommendPowerSupply(
  totalPedals: number,
  totalCurrentMa: number,
  budget?: number
): PowerSupply[] {
  // Add 20% headroom to current needs
  const requiredMa = Math.ceil(totalCurrentMa * 1.2);
  const requiredOutputs = totalPedals;
  
  // Filter supplies that meet requirements
  let suitable = POWER_SUPPLIES.filter(ps => 
    ps.totalOutputs >= requiredOutputs &&
    ps.totalMa >= requiredMa
  );
  
  // If budget provided, filter by it
  if (budget !== undefined) {
    suitable = suitable.filter(ps => ps.reverbPrice <= budget);
  }
  
  // Sort by best fit (closest to needs without being too oversized)
  suitable.sort((a, b) => {
    // Score based on how well it fits (lower is better)
    const aOutputFit = a.totalOutputs - requiredOutputs;
    const bOutputFit = b.totalOutputs - requiredOutputs;
    const aMaFit = (a.totalMa - requiredMa) / 1000;
    const bMaFit = (b.totalMa - requiredMa) / 1000;
    
    // Prefer isolated supplies
    const aIso = a.isolated ? 0 : 5;
    const bIso = b.isolated ? 0 : 5;
    
    const aScore = aOutputFit + aMaFit + aIso;
    const bScore = bOutputFit + bMaFit + bIso;
    
    return aScore - bScore;
  });
  
  // Return top 3 recommendations
  return suitable.slice(0, 3);
}

// Get a single best recommendation
export function getBestPowerSupply(
  totalPedals: number,
  totalCurrentMa: number,
  budget?: number
): PowerSupply | null {
  const recommendations = recommendPowerSupply(totalPedals, totalCurrentMa, budget);
  return recommendations[0] || null;
}

// Get power supply by ID
export function getPowerSupplyById(id: string): PowerSupply | undefined {
  return POWER_SUPPLIES.find(ps => ps.id === id);
}

