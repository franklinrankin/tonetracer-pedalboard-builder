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

// Category abbreviations (fallback)
const CATEGORY_ABBREV: Record<Category, string> = {
  gain: 'GN',
  modulation: 'MD',
  delay: 'DL',
  reverb: 'RV',
  dynamics: 'DY',
  filter: 'FL',
  pitch: 'PT',
  eq: 'EQ',
  volume: 'VL',
  amp: 'AM',
  utility: 'UT',
  synth: 'SY',
};

const SIZE_CLASSES = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
};

export function PedalImage({ 
  pedalId,
  category, 
  size = 'md',
  className = '' 
}: PedalImageProps) {
  const [imageError, setImageError] = useState(false);
  const categoryInfo = CATEGORY_INFO[category];
  const abbrev = CATEGORY_ABBREV[category];
  
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

  // Fallback to category abbreviation
  return (
    <div 
      className={`${SIZE_CLASSES[size]} rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ backgroundColor: `${categoryInfo.color}20`, border: '2px solid black' }}
    >
      <span className="font-black text-black" style={{ fontSize: size === 'sm' ? '10px' : size === 'md' ? '12px' : '14px' }}>{abbrev}</span>
    </div>
  );
}
