import { Sliders, Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-board-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-board-accent to-board-highlight flex items-center justify-center">
                <Sliders className="w-5 h-5 text-board-dark" />
              </div>
              <Zap className="w-4 h-4 text-board-highlight absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="gradient-text">TONE</span>
                <span className="text-white">TRACER</span>
              </h1>
              <p className="text-xs text-board-muted -mt-0.5">Pedalboard Builder</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#builder" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Builder
            </a>
            <a href="#catalog" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Catalog
            </a>
            <a href="#learn" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Learn
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-board-accent border border-board-accent/30 rounded-lg hover:bg-board-accent/10 transition-colors">
              Load Board
            </button>
            <button className="px-4 py-2 text-sm font-medium bg-board-accent text-white rounded-lg hover:bg-board-accent-dim transition-colors">
              Save Board
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

