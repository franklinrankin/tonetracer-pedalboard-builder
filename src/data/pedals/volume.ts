import { Pedal } from '../../types';

const inToMm = (inches: number) => Math.round(inches * 25.4);

// VOLUME & CONTROL PEDALS - Priority 12 (2 pedals)
export const VOLUME_PEDALS: Pedal[] = [
  {
    id: 'ernie-ball-vp-jr',
    brand: 'Ernie Ball',
    model: 'VP Jr 250K',
    category: 'volume',
    subtype: 'Volume',
    categoryRating: 5,
    widthMm: inToMm(3.5),
    depthMm: inToMm(10.0),
    heightMm: inToMm(2.5),
    enclosure: 'custom',
    topJacks: false,
    signal: 'mono',
    buffered: false,
    bypassType: 'true',
    circuitType: 'analog',
    powerType: '9V DC',
    voltage: 9,
    currentMa: 0,
    centerNegative: true,
    msrp: 99,
    reverbPrice: 70,
    description: 'Industry standard volume pedal. Passive.',
  },
  {
    id: 'boss-fv500h',
    brand: 'Boss',
    model: 'FV-500H Volume Pedal',
    category: 'volume',
    subtype: 'Volume',
    categoryRating: 6,
    widthMm: inToMm(4.0),
    depthMm: inToMm(12.0),
    heightMm: inToMm(3.0),
    enclosure: 'custom',
    topJacks: false,
    signal: 'stereo',
    buffered: false,
    bypassType: 'true',
    circuitType: 'analog',
    powerType: '9V DC',
    voltage: 9,
    currentMa: 0,
    centerNegative: true,
    msrp: 119,
    reverbPrice: 80,
    description: 'High-impedance stereo volume pedal.',
  },
];

export default VOLUME_PEDALS;

