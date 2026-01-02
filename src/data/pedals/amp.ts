import { Pedal } from '../../types';

const inToMm = (inches: number) => Math.round(inches * 25.4);

// AMP & CAB PEDALS - Priority 10 (2 pedals)
export const AMP_PEDALS: Pedal[] = [
  {
    id: 'strymon-iridium',
    brand: 'Strymon',
    model: 'Iridium',
    category: 'amp',
    subtype: 'Amp Sim',
    categoryRating: 10,
    widthMm: inToMm(4.5),
    depthMm: inToMm(3.7),
    heightMm: inToMm(1.6),
    enclosure: '1590BB',
    topJacks: true,
    signal: 'stereo',
    buffered: true,
    bypassType: 'selectable',
    circuitType: 'digital',
    powerType: '9V DC',
    voltage: 9,
    currentMa: 300,
    centerNegative: true,
    msrp: 399,
    reverbPrice: 340,
    description: '3 amp models with cab IRs. Studio-ready.',
  },
  {
    id: 'walrus-acs1',
    brand: 'Walrus Audio',
    model: 'ACS1 Amp + Cab Simulator',
    category: 'amp',
    subtype: 'Amp Sim',
    categoryRating: 9,
    widthMm: inToMm(4.5),
    depthMm: inToMm(3.7),
    heightMm: inToMm(2.1),
    enclosure: '1590BB',
    topJacks: true,
    signal: 'stereo',
    buffered: true,
    bypassType: 'true',
    circuitType: 'digital',
    powerType: '9V DC',
    voltage: 9,
    currentMa: 200,
    centerNegative: true,
    msrp: 299,
    reverbPrice: 250,
    description: '3 amp circuits with cab simulation.',
  },
];

export default AMP_PEDALS;

