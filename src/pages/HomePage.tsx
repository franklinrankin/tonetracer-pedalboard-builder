import { Sliders, Users, BookOpen, HelpCircle } from 'lucide-react';

interface HomePageProps {
  onBuildBoard: () => void;
  onBrowseProBoards: () => void;
  onPedalIndex: () => void;
  onAbout: () => void;
}

export function HomePage({ onBuildBoard, onBrowseProBoards, onPedalIndex, onAbout }: HomePageProps) {
  const options = [
    {
      id: 'build',
      title: 'Build a Board',
      description: 'Create your perfect pedalboard from scratch with guided recommendations',
      icon: Sliders,
      color: 'from-orange-500 to-amber-600',
      shadowColor: 'shadow-orange-500/30',
      onClick: onBuildBoard,
      image: '/images/home/build.jpg',
    },
    {
      id: 'pro',
      title: 'Browse Pro Boards',
      description: 'Explore pedalboards used by professional guitarists',
      icon: Users,
      color: 'from-cyan-500 to-blue-600',
      shadowColor: 'shadow-cyan-500/30',
      onClick: onBrowseProBoards,
      image: '/images/home/pro-boards.jpg',
    },
    {
      id: 'index',
      title: 'Pedal Index',
      description: 'Browse our complete database of guitar pedals',
      icon: BookOpen,
      color: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/30',
      onClick: onPedalIndex,
      image: '/images/home/pedal-index.jpg',
    },
    {
      id: 'about',
      title: 'What is Boardsie?',
      description: 'Coming soon',
      icon: HelpCircle,
      color: 'from-zinc-600 to-zinc-700',
      shadowColor: 'shadow-zinc-500/10',
      onClick: onAbout,
      disabled: true,
      image: '/images/home/about.jpg',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Blurred Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/images/home/stage-bg.jpg)',
          filter: 'blur(8px)',
          transform: 'scale(1.1)',
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
      {/* Logo and Title */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-board-accent to-orange-600 flex items-center justify-center shadow-lg shadow-board-accent/30">
            <span className="text-2xl font-black text-white tracking-tighter">B</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">
            BOARDSIE
          </h1>
        </div>
        <p className="text-xl text-zinc-400 max-w-md mx-auto">
          Your pedalboard buddy
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
        {options.map((option) => {
          const Icon = option.icon;
          const isDisabled = 'disabled' in option && option.disabled;
          return (
            <button
              key={option.id}
              onClick={isDisabled ? undefined : option.onClick}
              disabled={isDisabled}
              className={`group relative p-6 rounded-2xl bg-board-surface border border-board-border text-left transition-all duration-300 overflow-hidden min-h-[180px] ${
                isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : `hover:scale-[1.02] hover:border-transparent ${option.shadowColor} hover:shadow-xl`
              }`}
            >
              {/* Background Image */}
              {option.image && (
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${option.image})` }}
                />
              )}
              
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
              
              {/* Gradient overlay on hover */}
              {!isDisabled && (
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} 
                />
              )}
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center mb-3 shadow-lg ${option.shadowColor}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {option.title}
                </h2>
                <p className="text-sm text-zinc-300">
                  {option.description}
                </p>
              </div>
              
              {/* Arrow indicator */}
              {!isDisabled && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-12 text-sm text-zinc-400">
        700+ pedals • Smart recommendations • Size & budget aware
      </p>
      </div>
    </div>
  );
}

