import { Pedal } from '../../../types';
import { COMPRESSOR_PEDALS } from './compressors';
import { GATE_LIMITER_PEDALS } from './gates';

export const ALL_PEDALS: Pedal[] = [
  ...COMPRESSOR_PEDALS,
  ...GATE_LIMITER_PEDALS,
];

export default ALL_PEDALS;

