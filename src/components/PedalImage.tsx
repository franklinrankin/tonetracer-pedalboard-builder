import { useState, useRef, useEffect } from 'react';
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const categoryInfo = CATEGORY_INFO[category] || { color: '#888888', displayName: category };
  const abbrev = CATEGORY_ABBREV[category] || 'PD';
  
  // Try to get pedal-specific image
  const imageUrl = pedalId ? getPedalImageUrl(pedalId, size === 'sm' ? 'small' : 'large') : null;
  
  // Intersection Observer for true lazy loading
  useEffect(() => {
    if (!containerRef.current || !imageUrl) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Start loading 100px before visible
    );
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [imageUrl]);
  
  // Show actual image if available and not errored
  if (imageUrl && !imageError) {
    return (
      <div 
        ref={containerRef}
        className={`${SIZE_CLASSES[size]} rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
        style={{ backgroundColor: `${categoryInfo.color}10` }}
      >
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div 
            className="absolute inset-0 animate-pulse"
            style={{ backgroundColor: `${categoryInfo.color}30` }}
          />
        )}
        {isVisible && (
          <img 
            src={imageUrl}
            alt=""
            className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
          />
        )}
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
