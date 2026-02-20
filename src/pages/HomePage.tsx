import { useState, useEffect } from 'react';
import { Sliders, Users, BookOpen, HelpCircle, Lightbulb, Plus, ArrowRight, Package, Globe, MessageSquare } from 'lucide-react';
import { UserMenu } from '../components/UserMenu';
import { ThemeToggle } from '../components/ThemeToggle';
import { AboutModal } from '../components/AboutModal';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

interface ForumPost {
  id: string;
  username: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  created_at: string;
}

interface HomePageProps {
  onBuildBoard: () => void;
  onBrowseProBoards: () => void;
  onPedalIndex: () => void;
  onAbout: () => void;
  onSignIn: () => void;
  onSavedBoards?: () => void;
  onPedalRequest?: () => void;
  onFeedback?: () => void;
  onCollection?: () => void;
  onCommunity?: () => void;
  onViewForumPost?: (postId: string) => void;
}

export function HomePage({ onBuildBoard, onBrowseProBoards, onPedalIndex, onAbout, onSignIn, onSavedBoards, onPedalRequest, onFeedback, onCollection, onCommunity, onViewForumPost }: HomePageProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const { theme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch recent forum posts
  useEffect(() => {
    const loadForumPosts = async () => {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from('forum_posts')
          .select('id, username, title, content, category, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        if (data) setForumPosts(data);
      } catch (e) {
        // Network may be restricted (e.g., Instagram Safe Browsing)
        console.warn('Failed to load forum posts:', e);
      }
    };
    loadForumPosts();
  }, []);

  // Cycle through posts every 4 seconds
  useEffect(() => {
    if (forumPosts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPostIndex(prev => (prev + 1) % forumPosts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [forumPosts.length]);

  const options = [
    {
      id: 'build',
      title: 'BUILD',
      subtitle: 'A BOARD',
      description: 'Create your perfect pedalboard from scratch',
      icon: Sliders,
      bgColor: theme === 'dark' ? '#5D2A2A' : '#FFCDD2', // coral/pink
      onClick: onBuildBoard,
    },
    {
      id: 'community',
      title: 'COMMUNITY',
      subtitle: '',
      description: 'Boards, collections & forum',
      icon: Globe,
      bgColor: theme === 'dark' ? '#1A4A4F' : '#B2EBF2', // cyan/teal
      onClick: onCommunity || (() => {}),
    },
    {
      id: 'pro',
      title: 'PRO',
      subtitle: 'BOARDS',
      description: 'See what professionals use',
      icon: Users,
      bgColor: theme === 'dark' ? '#1A3A5C' : '#BBDEFB', // blue
      onClick: onBrowseProBoards,
    },
    {
      id: 'index',
      title: 'PEDAL',
      subtitle: 'INDEX',
      description: '900+ pedals in database',
      icon: BookOpen,
      bgColor: theme === 'dark' ? '#1A3D1A' : '#C8E6C9', // green
      onClick: onPedalIndex,
    },
    {
      id: 'collection',
      title: 'MY',
      subtitle: 'COLLECTION',
      description: 'Track pedals you own',
      icon: Package,
      bgColor: theme === 'dark' ? '#4A3D1A' : '#FFECB3', // amber/yellow
      onClick: onCollection || (() => {}),
    },
    {
      id: 'about',
      title: 'ABOUT',
      subtitle: 'BOARDSIE',
      description: 'Learn about Boardsie',
      icon: HelpCircle,
      bgColor: theme === 'dark' ? '#3D2A4A' : '#E1BEE7', // purple
      onClick: () => setShowAbout(true),
    },
  ];

  return (
    <div 
      className="min-h-screen p-4 sm:p-8"
      style={{
        backgroundColor: 'var(--color-board-dark)',
        fontFamily: '"Space Mono", "IBM Plex Mono", monospace',
        color: 'var(--color-board-text)',
      }}
    >
      {/* User Menu - Top Right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggle />
        <UserMenu 
          onSignInClick={onSignIn} 
          onSavedBoards={onSavedBoards} 
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
            className="inline-block px-6 py-4"
            style={{ 
              backgroundColor: 'var(--color-board-border)',
              color: 'var(--color-board-dark)',
              border: '4px solid var(--color-board-border)',
              boxShadow: '8px 8px 0px var(--color-board-shadow)',
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
            style={{ color: 'var(--color-board-text)' }}
          >
            Pedalboard Builder Tool
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {options.map((option, index) => {
            const Icon = option.icon;
            const isDisabled = 'disabled' in option && (option as { disabled?: boolean }).disabled === true;
            const isFeatured = 'featured' in option && (option as { featured?: boolean }).featured === true;
            const isHovered = hoveredCard === option.id;
            
            // For Community Board card, wrap with forum ticker above
            if (option.id === 'community' && forumPosts.length > 0) {
              const currentPost = forumPosts[currentPostIndex];
              return (
                <div key={option.id} className="flex flex-col gap-2">
                  {/* Forum Ticker */}
                  <button
                    onClick={() => onViewForumPost?.(currentPost?.id)}
                    className="flex items-center gap-3 px-4 py-3 hover:-translate-y-0.5 transition-transform text-left w-full overflow-hidden"
                    style={{ 
                      backgroundColor: 'var(--color-board-surface)',
                      border: '3px solid var(--color-board-border)', 
                      boxShadow: '4px 4px 0 var(--color-board-shadow)',
                      color: 'var(--color-board-text)',
                    }}
                  >
                    <MessageSquare className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <style>{`
                        @keyframes fade-in {
                          0% { opacity: 0; }
                          100% { opacity: 1; }
                        }
                      `}</style>
                      <div 
                        key={`header-${currentPostIndex}`}
                        className="flex items-center gap-2 mb-1"
                        style={{ animation: 'fade-in 0.6s ease-out' }}
                      >
                        <span className="text-[9px] font-bold uppercase" style={{ opacity: 0.6 }}>Forum</span>
                        <span className="text-[9px]" style={{ opacity: 0.4 }}>•</span>
                        <span className="text-[9px] font-bold" style={{ opacity: 0.6 }}>{currentPost?.username}</span>
                      </div>
                      <div 
                        key={`title-${currentPostIndex}`}
                        className="font-black text-xs mb-1"
                        style={{ animation: 'fade-in 0.6s ease-out' }}
                      >{currentPost?.title}</div>
                      <div 
                        key={currentPostIndex}
                        className="text-[11px] whitespace-nowrap"
                        style={{
                          animation: 'scroll-text 15s linear infinite',
                          opacity: 0.7,
                        }}
                      >
                        <style>{`
                          @keyframes scroll-text {
                            0% { transform: translateX(25%); opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { transform: translateX(-100%); opacity: 0; }
                          }
                        `}</style>
                        {currentPost?.content || 'Click to view forum...'}
                      </div>
                    </div>
                    {forumPosts.length > 1 && (
                      <div className="flex flex-col gap-1">
                        {forumPosts.map((_, i) => (
                          <div 
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i === currentPostIndex ? 'bg-black' : 'bg-black/30'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                  
                  {/* Community Board Card */}
                  <button
                    onClick={isDisabled ? undefined : option.onClick}
                    disabled={isDisabled}
                    onMouseEnter={() => !isDisabled && setHoveredCard(option.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`relative text-left transition-all duration-150 flex-1 ${
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
                    <div 
                      className="relative p-6 sm:p-8 h-full"
                      style={{
                        backgroundColor: option.bgColor,
                        border: '4px solid var(--color-board-border)',
                        boxShadow: isHovered && !isDisabled 
                          ? '12px 12px 0px var(--color-board-shadow)' 
                          : '8px 8px 0px var(--color-board-shadow)',
                        transition: 'box-shadow 150ms ease',
                      }}
                    >
                      <div 
                        className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-4"
                        style={{ 
                          backgroundColor: 'var(--color-board-surface)',
                          border: '3px solid var(--color-board-border)' 
                        }}
                      >
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: 'var(--color-board-text)' }} strokeWidth={2.5} />
                      </div>
                      <div className="mb-2">
                        <h2 
                          className="text-3xl sm:text-5xl font-black leading-none"
                          style={{ fontFamily: '"Space Grotesk", "Inter", sans-serif', color: 'var(--color-board-text)' }}
                        >
                          {option.title}
                        </h2>
                        {option.subtitle && (
                          <h2 
                            className="text-3xl sm:text-5xl font-black leading-none"
                            style={{ fontFamily: '"Space Grotesk", "Inter", sans-serif', color: 'var(--color-board-text)' }}
                          >
                            {option.subtitle}
                          </h2>
                        )}
                      </div>
                      <p className="text-sm sm:text-base font-bold uppercase tracking-wide" style={{ color: 'var(--color-board-text-muted)' }}>
                        {option.description}
                      </p>
                      <div 
                        className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                        style={{ 
                          backgroundColor: 'var(--color-board-surface)',
                          border: '3px solid var(--color-board-border)' 
                        }}
                      >
                        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--color-board-text)' }} strokeWidth={2.5} />
                      </div>
                    </div>
                  </button>
                </div>
              );
            }
            
            return (
              <button
                key={option.id}
                onClick={isDisabled ? undefined : option.onClick}
                disabled={isDisabled}
                onMouseEnter={() => !isDisabled && setHoveredCard(option.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative text-left transition-all duration-150 h-full ${
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
                  className="relative p-6 sm:p-8 h-full"
                  style={{
                    backgroundColor: option.bgColor,
                    border: '4px solid var(--color-board-border)',
                    boxShadow: isHovered && !isDisabled 
                      ? '12px 12px 0px var(--color-board-shadow)' 
                      : '8px 8px 0px var(--color-board-shadow)',
                    transition: 'box-shadow 150ms ease',
                  }}
                >
                  {/* Icon */}
                  <div 
                    className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-4"
                    style={{ 
                      backgroundColor: 'var(--color-board-surface)',
                      border: '3px solid var(--color-board-border)' 
                    }}
                  >
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: 'var(--color-board-text)' }} strokeWidth={2.5} />
                  </div>
                  
                  {/* Title */}
                  <div className="mb-2">
                    <h2 
                      className="text-3xl sm:text-5xl font-black leading-none"
                      style={{ 
                        fontFamily: '"Space Grotesk", "Inter", sans-serif',
                        color: 'var(--color-board-text)',
                      }}
                    >
                      {option.title}
                    </h2>
                    {option.subtitle && (
                      <h2 
                        className="text-3xl sm:text-5xl font-black leading-none"
                        style={{ 
                          fontFamily: '"Space Grotesk", "Inter", sans-serif',
                          color: 'var(--color-board-text)',
                        }}
                      >
                        {option.subtitle}
                      </h2>
                    )}
                  </div>
                  
                  {/* Description */}
                  <p 
                    className="text-sm sm:text-base font-bold uppercase tracking-wide"
                    style={{ color: 'var(--color-board-text-muted)' }}
                  >
                    {option.description}
                  </p>
                  
                  {/* Arrow */}
                  {!isDisabled && (
                    <div 
                      className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'var(--color-board-surface)',
                        border: '3px solid var(--color-board-border)',
                        transform: isHovered ? 'rotate(0deg)' : 'rotate(-45deg)',
                        transition: 'transform 150ms ease',
                      }}
                    >
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--color-board-text)' }} strokeWidth={3} />
                    </div>
                  )}
                  
                  {/* Featured tag */}
                  {isFeatured && (
                    <div 
                      className="absolute -top-3 -right-3 px-3 py-1 text-xs sm:text-sm font-black uppercase"
                      style={{ 
                        backgroundColor: 'var(--color-board-highlight)',
                        color: 'var(--color-board-text)',
                        border: '3px solid var(--color-board-border)',
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

        
        {/* Feedback Section */}
        <div 
          className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center transition-all duration-500 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={onFeedback}
            className="group flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase tracking-wide transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1"
            style={{ 
              backgroundColor: 'var(--color-board-surface)',
              color: 'var(--color-board-text)',
              border: '3px solid var(--color-board-border)',
              boxShadow: '4px 4px 0px var(--color-board-shadow)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px var(--color-board-shadow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px var(--color-board-shadow)';
            }}
          >
            <Lightbulb className="w-5 h-5" strokeWidth={2.5} />
            <span>FEEDBACK</span>
          </button>
          <button
            onClick={onPedalRequest}
            className="group flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase tracking-wide transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1"
            style={{ 
              backgroundColor: 'var(--color-board-surface)',
              color: 'var(--color-board-text)',
              border: '3px solid var(--color-board-border)',
              boxShadow: '4px 4px 0px var(--color-board-shadow)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px var(--color-board-shadow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px var(--color-board-shadow)';
            }}
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            <span>REQUEST PEDAL</span>
          </button>
        </div>
        
        {/* Footer */}
        <footer 
          className="mt-12 sm:mt-16 pt-6 text-center"
          style={{ borderTop: '3px solid var(--color-board-border)' }}
        >
          <p className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-board-text-muted)' }}>
            Built for guitar nerds, by a guitar nerd (Franklin Rankin)
          </p>
        </footer>
      </div>
      
      {/* About Modal */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}
