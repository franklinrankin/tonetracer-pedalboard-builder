import { useState } from 'react';
import { Category } from '../types';
import { CATEGORY_INFO } from '../data/categories';
import { getPedalImageUrl } from '../data/pedalImageMap';

interface PedalImageProps {
  pedalId?: string;
  category: Category;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Category emoji icons (fallback)
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
  xl: 'w-28 h-28',
};

const ICON_SIZES = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

export function PedalImage({ 
  pedalId,
  category, 
  size = 'md',
  className = '' 
}: PedalImageProps) {
  const [imageError, setImageError] = useState(false);
  const categoryInfo = CATEGORY_INFO[category];
  const icon = CATEGORY_ICONS[category];
  
  // Try to get pedal-specific image
  const imageUrl = pedalId ? getPedalImageUrl(pedalId, size === 'sm' ? 'small' : 'large') : null;
  
  // Show actual image if available and not errored
  if (imageUrl && !imageError) {
    return (
      <div 
        className={`${SIZE_CLASSES[size]} rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
        style={{ backgroundColor: `${categoryInfo.color}10` }}
      >
        <img 
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback to category icon
  return (
    <div 
      className={`${SIZE_CLASSES[size]} rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ backgroundColor: `${categoryInfo.color}20` }}
    >
      <span className={ICON_SIZES[size]}>{icon}</span>
    </div>
  );
}
