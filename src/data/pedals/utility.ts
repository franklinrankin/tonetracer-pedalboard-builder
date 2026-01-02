import { Pedal } from '../../types';

const inToMm = (inches: number) => Math.round(inches * 25.4);

// UTILITY PEDALS - Priority 11 (2 pedals - just tuners)
export const UTILITY_PEDALS: Pedal[] = [
  {
    id: 'boss-tu3',
    brand: 'Boss',
    model: 'TU-3 Chromatic Tuner',
    category: 'utility',
    subtype: 'Tuner',
    categoryRating: 5,
    widthMm: inToMm(2.9),
    depthMm: inToMm(5.1),
    heightMm: inToMm(2.4),
    enclosure: 'boss-compact',
    topJacks: false,
    signal: 'mono',
    buffered: true,
    bypassType: 'buffered',
    circuitType: 'digital',
    powerType: '9V DC',
    voltage: 9,
    currentMa: 85,
    centerNegative: true,
    msrp: 109,
    reverbPrice: 70,
    description: 'Industry standard pedal tuner.',
  },
  {
    id: 'tc-polytune3-mini',
    brand: 'TC Electronic',
    model: 'Polytune 3 Mini',
    category: 'utility',
    subtype: 'Tuner',
    categoryRating: 5,
    widthMm: inToMm(1.8),
    depthMm: inToMm(3.7),
    heightMm: inToMm(1.9),
    enclosure: 'mini',
    topJacks: true,
    signal: 'mono',
    buffered: true,
    bypassType: 'selectable',
    circuitType: 'digital',
    powerType: '9V DC',
    voltage: 9,
    currentMa: 50,
    centerNegative: true,
    msrp: 79,
    reverbPrice: 65,
    description: 'Polyphonic tuner with buffer. Mini.',
  },
];

export default UTILITY_PEDALS;
