import { Eye, ChevronRight, ChevronLeft } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { BoardVisualizer } from '../components/BoardVisualizer';

interface VisualizePageProps {
  onContinue: () => void;
  onBack: () => void;
}

export function VisualizePage({ onContinue, onBack }: VisualizePageProps) {
  const { state } = useBoard();
  const { board, totalCost } = state;

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-board-surface border-b border-board-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Visualize Your Board</h1>
                <p className="text-sm text-board-muted">
                  Arrange pedals and see the signal flow
                </p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-3 text-board-muted hover:text-white border border-board-border rounded-xl hover:bg-board-elevated transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Build
              </button>
              {board.slots.length > 0 && (
                <button
                  onClick={onContinue}
                  className="flex items-center gap-2 px-6 py-3 bg-board-accent text-white font-medium rounded-xl hover:bg-board-accent-dim transition-colors"
                >
                  Review Board
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-board-muted">Pedals:</span>
              <span className="text-white font-medium">{board.slots.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-board-muted">Total Cost:</span>
              <span className="text-board-accent font-medium">${totalCost}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-board-muted">Board Size:</span>
              <span className="text-white font-medium">
                {(board.constraints.maxWidthMm / 25.4).toFixed(1)}" × {(board.constraints.maxDepthMm / 25.4).toFixed(1)}"
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <BoardVisualizer />
      </div>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-board-surface border-t border-board-border">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={isCapturing}
            className="flex-1 py-3 border border-board-border text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Build
          </button>
          <button
            onClick={handleContinue}
            disabled={isCapturing}
            className="flex-1 py-3 bg-board-accent text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isCapturing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Review
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

