import { Pedal } from '../../../types';
import { WAH_PEDALS } from './wah';
import { ENVELOPE_FILTER_PEDALS } from './envelope';

export const ALL_PEDALS: Pedal[] = [
  ...WAH_PEDALS,
  ...ENVELOPE_FILTER_PEDALS,
];

export default ALL_PEDALS;

