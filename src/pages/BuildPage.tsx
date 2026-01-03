import { useState } from 'react';
import { Sliders, ChevronRight, Sparkles, RotateCcw } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { GenreStarterKit } from '../components/GenreStarterKit';
import { PedalCatalog } from '../components/PedalCatalog';
import { BoardBuilder } from '../components/BoardBuilder';
import { SectionScores } from '../components/SectionScores';
import { BoardRecommendations } from '../components/BoardRecommendations';

interface BuildPageProps {
  onContinue: () => void;
}

type BuildTab = 'starter' | 'catalog' | 'scores' | 'recommend';

export function BuildPage({ onContinue }: BuildPageProps) {
  const { state, dispatch } = useBoard();
  const { selectedGenres, board } = state;
  const hasGenres = selectedGenres.length > 0;
  const [activeTab, setActiveTab] = useState<BuildTab>(hasGenres ? 'starter' : 'catalog');
  const [starterKitKey, setStarterKitKey] = useState(0);
  
  const handleStartOverBoard = () => {
    if (board.slots.length === 0 || window.confirm('Clear your board and restart the recommendations?')) {
      dispatch({ type: 'CLEAR_BOARD' });
      setStarterKitKey(prev => prev + 1); // Reset GenreStarterKit state
      setActiveTab(hasGenres ? 'starter' : 'catalog');
    }
  };
  
  const tabs = [
    ...(hasGenres ? [{ id: 'starter' as BuildTab, label: selectedGenres.length > 1 ? 'Multi-Genre Kit' : 'Starter Kit' }] : []),
    { id: 'catalog' as BuildTab, label: 'All Pedals' },
    { id: 'scores' as BuildTab, label: 'Tone Tags' },
    ...(board.slots.length > 0 ? [{ id: 'recommend' as BuildTab, label: 'Recommend Setup', icon: <Sparkles className="w-4 h-4" /> }] : []),
  ];
  
  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-board-surface border-b border-board-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-board-accent/20 flex items-center justify-center">
                <Sliders className="w-6 h-6 text-board-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Build Your Board</h1>
                <p className="text-sm text-board-muted">
                  {board.slots.length === 0 
                    ? 'Add pedals to get started' 
                    : `${board.slots.length} pedal${board.slots.length !== 1 ? 's' : ''} on your board`
                  }
                </p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-3">
              {board.slots.length > 0 && (
                <button
                  onClick={handleStartOverBoard}
                  className="flex items-center gap-2 px-4 py-3 text-board-muted hover:text-white border border-board-border rounded-xl hover:bg-board-elevated transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Start Over
                </button>
              )}
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
          
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-board-accent text-white'
                    : tab.id === 'recommend'
                      ? 'text-board-accent hover:bg-board-accent/20 border border-board-accent/50'
                      : 'text-board-muted hover:text-white hover:bg-board-elevated'
                }`}
              >
                {'icon' in tab && tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Board Preview - Full Width at Top */}
        <div className="mb-6">
          <div className="sticky top-36 z-5">
            <BoardBuilder />
          </div>
        </div>
        
        {/* Pedal Selection - Below Board */}
        <div className="space-y-6">
          {activeTab === 'starter' && hasGenres && (
            <GenreStarterKit key={starterKitKey} onFinishUp={onContinue} />
          )}
          
          {activeTab === 'catalog' && (
            <PedalCatalog />
          )}
          
          {activeTab === 'scores' && (
            <SectionScores />
          )}
          
          {activeTab === 'recommend' && (
            <BoardRecommendations />
          )}
        </div>
      </div>
      
      {/* Mobile Continue Button */}
      {board.slots.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-board-surface border-t border-board-border">
          <button
            onClick={onContinue}
            className="w-full py-4 bg-board-accent text-white font-medium rounded-xl flex items-center justify-center gap-2"
          >
            Review Board ({board.slots.length} pedals)
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

