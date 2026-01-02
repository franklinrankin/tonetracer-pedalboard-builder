import { Pedal } from '../../../types';
import { SPRING_PLATE_PEDALS } from './spring';
import { AMBIENT_PEDALS } from './ambient';
import { HALL_ROOM_PEDALS } from './hall';

export const ALL_PEDALS: Pedal[] = [
  ...SPRING_PLATE_PEDALS,
  ...AMBIENT_PEDALS,
  ...HALL_ROOM_PEDALS,
];

export default ALL_PEDALS;

