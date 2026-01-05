import { GenreProfile } from '../data/genres';

interface GenreIconProps {
  genre: GenreProfile;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-lg',
  md: 'w-10 h-10 text-2xl',
  lg: 'w-14 h-14 text-3xl',
  xl: 'w-20 h-20 text-4xl',
};

export const GenreIcon = ({ genre, size = 'md', className = '' }: GenreIconProps) => {
  const sizeClass = sizeClasses[size];
  
  if (genre.iconImage) {
    return (
      <img 
        src={genre.iconImage} 
        alt={genre.name}
        className={`${sizeClass} rounded-lg object-cover ${className}`}
      />
    );
  }
  
  return (
    <span className={`${sizeClass} flex items-center justify-center ${className}`}>
      {genre.icon}
    </span>
  );
};

