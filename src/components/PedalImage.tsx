import { Category } from '../types';
import { CATEGORY_INFO } from '../data/categories';

interface PedalImageProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Category abbreviations (replacing emojis)
const CATEGORY_ABBREV: Record<Category, string> = {
  gain: 'G',
  modulation: 'M',
  delay: 'D',
  reverb: 'R',
  dynamics: 'C',
  filter: 'F',
  pitch: 'P',
  eq: 'EQ',
  volume: 'V',
  amp: 'A',
  utility: 'U',
  synth: 'S',
};

const SIZE_CLASSES = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

const ABBREV_SIZES = {
  sm: 'text-xs font-bold',
  md: 'text-sm font-bold',
  lg: 'text-lg font-bold',
};

export function PedalImage({ 
  category, 
  size = 'md',
  className = '' 
}: PedalImageProps) {
  const categoryInfo = CATEGORY_INFO[category];
  const abbrev = CATEGORY_ABBREV[category];

  return (
    <div 
      className={`${SIZE_CLASSES[size]} rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ backgroundColor: `${categoryInfo.color}20` }}
    >
      <span className={ABBREV_SIZES[size]} style={{ color: categoryInfo.color }}>{abbrev}</span>
    </div>
  );
}

