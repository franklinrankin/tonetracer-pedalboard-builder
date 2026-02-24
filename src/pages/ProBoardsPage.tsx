import { ArrowLeft, Music, Calendar, ExternalLink } from 'lucide-react';
import { PRO_BOARDS, ProBoard } from '../data/proBoards';

interface ProBoardsPageProps {
  onBack: () => void;
  onSelectBoard: (board: ProBoard) => void;
}

// Genre colors - dark muted tones
const GENRE_COLORS: Record<string, string> = {
  'Rock': '#8B4A4A',
  'Blues': '#2D5A6A',
  'Metal': '#3A3A3A',
  'Jazz': '#5A3D6A',
  'Country': '#6A5A3D',
  'Alternative': '#5A4A3D',
  'Indie': '#3D5A4A',
  'Pop': '#6A3D5A',
  'Funk': '#6A5A3D',
  'Soul': '#5A3D6A',
};

// Accent colors for cards without images - dark tones matching homepage
const CARD_COLORS = [
  '#8B6B4A', // dark gold/brown
  '#8B4A5A', // dark rose
  '#2D6A6A', // dark teal
  '#6A5A3D', // dark tan
  '#3D5A4A', // dark forest
  '#5A3D6A', // dark plum
  '#3D4A6A', // dark slate blue
  '#4A4A4A', // dark gray
];

export function ProBoardsPage({ onBack, onSelectBoard }: ProBoardsPageProps) {
  return (
    <div className="min-h-screen p-4 sm:p-6 bg-theme-dark">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-theme font-bold uppercase tracking-wide hover:bg-yellow-300 hover:text-black px-3 py-2 transition-colors mb-6"
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
        <p className="text-base sm:text-lg text-theme-muted font-medium">
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
                    <>
                      <img 
                        src={board.image} 
                        alt={`${board.artist} ${board.name}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {/* Artist name overlay on image */}
                      <div className="absolute inset-0 flex items-end justify-start p-4">
                        <h2 
                          className="text-2xl sm:text-3xl font-black uppercase leading-tight px-3 py-1"
                          style={{ 
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                          }}
                        >
                          {board.artist}
                        </h2>
                      </div>
                    </>
                  ) : (
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: cardColor }}
                    >
                      {/* Artist name in colored box - white text on dark backgrounds */}
                      <h2 
                        className="text-2xl sm:text-3xl font-black uppercase text-center px-4 leading-tight"
                        style={{ 
                          color: 'white',
                          textShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                        }}
                      >
                        {board.artist}
                      </h2>
                    </div>
                  )}
                  
                  {/* Year badge */}
                  <div 
                    className="absolute top-3 right-3 px-3 py-1 bg-black text-white flex items-center gap-1.5"
                    style={{ border: '2px solid black' }}
                  >
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs font-black">{board.year}</span>
                  </div>

                  {/* Genre badge - black text always */}
                  <div 
                    className="absolute top-3 left-3 px-3 py-1 flex items-center gap-1.5"
                    style={{ 
                      backgroundColor: '#FFE600',
                      border: '2px solid black',
                      color: 'black'
                    }}
                  >
                    <Music className="w-3 h-3" />
                    <span className="text-xs font-black uppercase">{board.genre}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 border-t-4 brutal-border bg-theme-surface">
                  <h3 className="text-lg font-black text-theme uppercase mb-1">
                    {board.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-xs font-black px-2 py-1 text-black"
                      style={{ backgroundColor: '#FFE600', border: '2px solid var(--color-board-border)' }}
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
              border: '4px dashed var(--color-board-border)',
            }}
          >
            <div className="aspect-[4/3] flex flex-col items-center justify-center p-6 text-center bg-theme-elevated">
              <div 
                className="w-16 h-16 flex items-center justify-center mb-4 font-black text-3xl text-black"
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
            <div className="p-4 border-t-4 border-dashed brutal-border bg-theme-surface">
              <div className="h-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

