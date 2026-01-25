import { useState, useEffect } from 'react';
import { Sliders, Users, BookOpen, HelpCircle, Lightbulb, Plus, ArrowRight } from 'lucide-react';
import { UserMenu } from '../components/UserMenu';

interface HomePageProps {
  onBuildBoard: () => void;
  onBrowseProBoards: () => void;
  onPedalIndex: () => void;
  onAbout: () => void;
  onSignIn: () => void;
  onSavedBoards?: () => void;
  onProfile?: () => void;
  onPedalRequest?: () => void;
  onFeedback?: () => void;
}

export function HomePage({ onBuildBoard, onBrowseProBoards, onPedalIndex, onAbout, onSignIn, onSavedBoards, onProfile, onPedalRequest, onFeedback }: HomePageProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const options = [
    {
      id: 'build',
      title: 'BUILD',
      subtitle: 'A BOARD',
      description: 'Create your perfect pedalboard from scratch',
      icon: Sliders,
      bgColor: '#FF5722',
      onClick: onBuildBoard,
      featured: true,
    },
    {
      id: 'pro',
      title: 'PRO',
      subtitle: 'BOARDS',
      description: 'See what professionals use',
      icon: Users,
      bgColor: '#2196F3',
      onClick: onBrowseProBoards,
    },
    {
      id: 'index',
      title: 'PEDAL',
      subtitle: 'INDEX',
      description: '700+ pedals in database',
      icon: BookOpen,
      bgColor: '#4CAF50',
      onClick: onPedalIndex,
    },
    {
      id: 'about',
      title: 'ABOUT',
      subtitle: '',
      description: 'Coming soon',
      icon: HelpCircle,
      bgColor: '#9E9E9E',
      onClick: onAbout,
      disabled: true,
    },
  ];

  return (
    <div 
      className="min-h-screen p-4 sm:p-8"
      style={{
        backgroundColor: '#FFFEF0',
        fontFamily: '"Space Mono", "IBM Plex Mono", monospace',
      }}
    >
      {/* User Menu - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <UserMenu 
          onSignInClick={onSignIn} 
          onSavedBoards={onSavedBoards} 
          onProfile={onProfile}
          onPedalRequest={onPedalRequest}
          onFeedback={onFeedback}
        />
      </div>
      
      {/* Main content */}
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header 
          className={`mb-8 sm:mb-12 transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div 
            className="inline-block px-6 py-4 bg-black text-white"
            style={{ 
              border: '4px solid black',
              boxShadow: '8px 8px 0px black',
            }}
          >
            <h1 
              className="text-4xl sm:text-6xl font-black tracking-tighter"
              style={{ fontFamily: '"Space Grotesk", "Inter", sans-serif' }}
            >
              BOARDSIE
            </h1>
          </div>
          <p 
            className="mt-4 text-lg sm:text-xl font-bold uppercase tracking-wider"
            style={{ color: 'black' }}
          >
            Pedalboard Builder Tool
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {options.map((option, index) => {
            const Icon = option.icon;
            const isDisabled = 'disabled' in option && option.disabled;
            const isFeatured = 'featured' in option && option.featured;
            const isHovered = hoveredCard === option.id;
            
            return (
              <button
                key={option.id}
                onClick={isDisabled ? undefined : option.onClick}
                disabled={isDisabled}
                onMouseEnter={() => !isDisabled && setHoveredCard(option.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative text-left transition-all duration-150 ${
                  isFeatured ? 'sm:col-span-2' : ''
                } ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  transitionDelay: `${index * 50}ms`,
                  opacity: mounted ? 1 : 0,
                  transform: mounted 
                    ? isHovered && !isDisabled
                      ? 'translate(-4px, -4px)' 
                      : 'translate(0, 0)'
                    : 'translateY(20px)',
                }}
              >
                {/* Card */}
                <div 
                  className="relative p-6 sm:p-8"
                  style={{
                    backgroundColor: option.bgColor,
                    border: '4px solid black',
                    boxShadow: isHovered && !isDisabled 
                      ? '12px 12px 0px black' 
                      : '8px 8px 0px black',
                    transition: 'box-shadow 150ms ease',
                  }}
                >
                  {/* Icon */}
                  <div 
                    className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-4 bg-white"
                    style={{ border: '3px solid black' }}
                  >
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-black" strokeWidth={2.5} />
                  </div>
                  
                  {/* Title */}
                  <div className="mb-2">
                    <h2 
                      className="text-3xl sm:text-5xl font-black text-white leading-none"
                      style={{ 
                        fontFamily: '"Space Grotesk", "Inter", sans-serif',
                        textShadow: '3px 3px 0px black',
                      }}
                    >
                      {option.title}
                    </h2>
                    {option.subtitle && (
                      <h2 
                        className="text-3xl sm:text-5xl font-black text-white leading-none"
                        style={{ 
                          fontFamily: '"Space Grotesk", "Inter", sans-serif',
                          textShadow: '3px 3px 0px black',
                        }}
                      >
                        {option.subtitle}
                      </h2>
                    )}
                  </div>
                  
                  {/* Description */}
                  <p 
                    className="text-sm sm:text-base font-bold text-white uppercase tracking-wide"
                    style={{ textShadow: '1px 1px 0px black' }}
                  >
                    {option.description}
                  </p>
                  
                  {/* Arrow */}
                  {!isDisabled && (
                    <div 
                      className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white flex items-center justify-center"
                      style={{ 
                        border: '3px solid black',
                        transform: isHovered ? 'rotate(0deg)' : 'rotate(-45deg)',
                        transition: 'transform 150ms ease',
                      }}
                    >
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-black" strokeWidth={3} />
                    </div>
                  )}
                  
                  {/* Featured tag */}
                  {isFeatured && (
                    <div 
                      className="absolute -top-3 -right-3 px-3 py-1 bg-yellow-400 text-black text-xs sm:text-sm font-black uppercase"
                      style={{ 
                        border: '3px solid black',
                        transform: 'rotate(3deg)',
                      }}
                    >
                      START HERE →
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats Row */}
        <div 
          className={`flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-12 transition-all duration-500 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {[
            { value: '700+', label: 'PEDALS' },
            { value: 'SMART', label: 'MATCHING' },
            { value: 'BUDGET', label: 'AWARE' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="px-4 py-3 sm:px-6 sm:py-4 bg-black text-white text-center"
              style={{ border: '3px solid black' }}
            >
              <div className="text-xl sm:text-2xl font-black">{stat.value}</div>
              <div className="text-xs sm:text-sm font-bold tracking-wider opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Feedback Section */}
        <div 
          className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center transition-all duration-500 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={onFeedback}
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wide transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1"
            style={{ 
              border: '3px solid black',
              boxShadow: '4px 4px 0px black',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px black';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px black';
            }}
          >
            <Lightbulb className="w-5 h-5" strokeWidth={2.5} />
            <span>FEEDBACK</span>
          </button>
          <button
            onClick={onPedalRequest}
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wide transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1"
            style={{ 
              border: '3px solid black',
              boxShadow: '4px 4px 0px black',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px black';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px black';
            }}
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            <span>REQUEST PEDAL</span>
          </button>
        </div>
        
        {/* Footer */}
        <footer 
          className="mt-12 sm:mt-16 pt-6 text-center"
          style={{ borderTop: '3px solid black' }}
        >
          <p className="text-sm font-bold uppercase tracking-wider text-black/60">
            Built for guitar nerds, by guitar nerds
          </p>
        </footer>
      </div>
    </div>
  );
}
