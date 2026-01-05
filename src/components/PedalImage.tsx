import { Category } from '../types';
import { CATEGORY_INFO } from '../data/categories';

interface PedalImageProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Category emoji icons
const CATEGORY_ICONS: Record<Category, string> = {
  gain: '🔥',
  modulation: '🌊',
  delay: '⏱️',
  reverb: '✨',
  dynamics: '💪',
  filter: '🎭',
  pitch: '🎵',
  eq: '📊',
  volume: '🎚️',
  amp: '🔊',
  utility: '🔧',
  synth: '🎹',
};

const SIZE_CLASSES = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

const ICON_SIZES = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export function PedalImage({ 
  category, 
  size = 'md',
  className = '' 
}: PedalImageProps) {
  const categoryInfo = CATEGORY_INFO[category];
  const icon = CATEGORY_ICONS[category];

  return (
    <div 
      className={`${SIZE_CLASSES[size]} rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ backgroundColor: `${categoryInfo.color}20` }}
    >
      <span className={ICON_SIZES[size]}>{icon}</span>
    </div>
  );
}

