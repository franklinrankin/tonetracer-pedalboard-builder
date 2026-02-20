import { ArrowLeft, Music, Calendar, ExternalLink } from 'lucide-react';
import { PRO_BOARDS, ProBoard } from '../data/proBoards';

interface ProBoardsPageProps {
  onBack: () => void;
  onSelectBoard: (board: ProBoard) => void;
}

// Genre colors - muted pastels
const GENRE_COLORS: Record<string, string> = {
  'Rock': '#FFCDD2',
  'Blues': '#B2EBF2',
  'Metal': '#CFD8DC',
  'Jazz': '#E1BEE7',
  'Country': '#FFE0B2',
  'Alternative': '#FFCCBC',
  'Indie': '#C8E6C9',
  'Pop': '#F8BBD9',
  'Funk': '#FFE0B2',
  'Soul': '#E1BEE7',
};

// Accent colors for cards without images - muted pastels
const CARD_COLORS = [
  '#FFF9C4', // soft yellow
  '#FFCDD2', // soft coral
  '#B2DFDB', // soft teal
  '#FFE0B2', // soft orange
  '#C8E6C9', // soft mint
  '#E1BEE7', // soft plum
  '#BBDEFB', // soft blue
  '#F5F5F5', // soft gray
];

export function ProBoardsPage({ onBack, onSelectBoard }: ProBoardsPageProps) {
  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: '#FFFEF0' }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-theme font-bold uppercase tracking-wide hover:bg-yellow-300 px-3 py-2 transition-colors mb-6"
          style={{ border: '3px solid var(--color-board-border)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        
        <h1 
          className="text-3xl sm:text-5xl font-black text-theme uppercase tracking-tight mb-3"
          style={{ textShadow: '3px 3px 0px #FFE600' }}
        >
          Pro Boards
        </h1>
        <p className="text-base sm:text-lg text-theme font-medium">
          Explore pedalboards used by professional guitarists. Click any board to see the full breakdown.
        </p>
      </div>

      {/* Boards Grid */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRO_BOARDS.map((board, index) => {
            const genreColor = GENRE_COLORS[board.genre] || '#FFE600';
            const cardColor = CARD_COLORS[index % CARD_COLORS.length];
            return (
              <button
                key={board.id}
                onClick={() => onSelectBoard(board)}
                className="group relative overflow-hidden text-left transition-all duration-150 bg-theme-surface hover:-translate-x-1 hover:-translate-y-1"
                style={{ 
                  border: '4px solid var(--color-board-border)',
                  boxShadow: '6px 6px 0px var(--color-board-shadow)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '8px 8px 0px var(--color-board-shadow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '6px 6px 0px black';
                }}
              >
                {/* Background Image */}
                <div className="aspect-[4/3] relative">
                  {board.image ? (
                    <img 
                      src={board.image} 
                      alt={`${board.artist} ${board.name}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div 
                      className="absolute inset-0"
                      style={{ backgroundColor: cardColor }}
                    />
                  )}
                  
                  {/* Year badge */}
                  <div 
                    className="absolute top-3 right-3 px-3 py-1 bg-black text-white flex items-center gap-1.5"
                    style={{ border: '2px solid black' }}
                  >
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs font-black">{board.year}</span>
                  </div>

                  {/* Genre badge */}
                  <div 
                    className="absolute top-3 left-3 px-3 py-1 flex items-center gap-1.5"
                    style={{ 
                      backgroundColor: genreColor,
                      border: '2px solid black',
                      color: board.genre === 'Metal' ? 'white' : 'black'
                    }}
                  >
                    <Music className="w-3 h-3" />
                    <span className="text-xs font-black uppercase">{board.genre}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 border-t-4 border-black" style={{ backgroundColor: '#FFFEF0' }}>
                  <h3 className="text-xl font-black text-theme uppercase mb-1">
                    {board.artist}
                  </h3>
                  <p className="text-sm font-bold text-theme-muted mb-3">
                    {board.name}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-xs font-black px-2 py-1"
                      style={{ backgroundColor: '#FFE600', border: '2px solid black' }}
                    >
                      {board.pedalIds.length} PEDALS
                    </span>
                    {board.source && (
                      <span className="text-xs font-bold text-theme-muted flex items-center gap-1 uppercase">
                        <ExternalLink className="w-3 h-3" />
                        {board.source}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Coming Soon Card */}
          <div 
            className="relative overflow-hidden bg-theme-surface"
            style={{ 
              border: '4px dashed black',
            }}
          >
            <div className="aspect-[4/3] flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: '#f5f5f5' }}>
              <div 
                className="w-16 h-16 flex items-center justify-center mb-4 font-black text-3xl"
                style={{ backgroundColor: '#FFE600', border: '3px solid var(--color-board-border)' }}
              >
                +
              </div>
              <h3 className="text-lg font-black text-theme uppercase mb-2">
                More Coming Soon
              </h3>
              <p className="text-sm font-medium text-theme-muted">
                We're adding more pro boards regularly
              </p>
            </div>
            {/* Bottom section to match other cards */}
            <div className="p-4 border-t-4 border-dashed border-black" style={{ backgroundColor: '#FFFEF0' }}>
              <div className="h-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

