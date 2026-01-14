import { ArrowLeft, Music, Calendar, ExternalLink } from 'lucide-react';
import { PRO_BOARDS, ProBoard } from '../data/proBoards';

interface ProBoardsPageProps {
  onBack: () => void;
  onSelectBoard: (board: ProBoard) => void;
}

export function ProBoardsPage({ onBack, onSelectBoard }: ProBoardsPageProps) {
  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        
        <h1 className="text-4xl font-bold text-white mb-3">
          Pro Boards
        </h1>
        <p className="text-lg text-zinc-400">
          Explore pedalboards used by professional guitarists. Click any board to see the full breakdown.
        </p>
      </div>

      {/* Boards Grid */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRO_BOARDS.map((board) => (
            <button
              key={board.id}
              onClick={() => onSelectBoard(board)}
              className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20"
            >
              {/* Background Image or Gradient */}
              <div className="aspect-[4/3] relative">
                {board.image ? (
                  <img 
                    src={board.image} 
                    alt={`${board.artist} ${board.name}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient if image fails
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                {/* Gradient overlay - always show */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Year badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs font-medium text-white">{board.year}</span>
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-400">{board.genre}</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-100 transition-colors">
                  {board.artist}
                </h3>
                <p className="text-sm text-zinc-300 mb-3">
                  {board.name}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    {board.pedalIds.length} pedals
                  </span>
                  {board.source && (
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {board.source}
                    </span>
                  )}
                </div>
              </div>

              {/* Border glow effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-cyan-500/50 transition-colors pointer-events-none" />
            </button>
          ))}

          {/* Coming Soon Card */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-zinc-700 bg-zinc-900/50">
            <div className="aspect-[4/3] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <span className="text-2xl">🎸</span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-400 mb-2">
                More Coming Soon
              </h3>
              <p className="text-sm text-zinc-500">
                We're adding more pro boards regularly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

