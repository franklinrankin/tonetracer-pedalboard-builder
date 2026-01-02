import { Pedal } from '../../../types';
import { ANALOG_TAPE_PEDALS } from './analog';
import { DIGITAL_PEDALS } from './digital';
import { AMBIENT_SPECIAL_PEDALS } from './ambient';

export const ALL_PEDALS: Pedal[] = [
  ...ANALOG_TAPE_PEDALS,
  ...DIGITAL_PEDALS,
  ...AMBIENT_SPECIAL_PEDALS,
];

export default ALL_PEDALS;

