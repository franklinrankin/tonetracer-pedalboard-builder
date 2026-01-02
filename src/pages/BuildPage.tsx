import { useState } from 'react';
import { Sliders, ChevronRight, Sparkles } from 'lucide-react';
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
  const { state } = useBoard();
  const { selectedGenre, board } = state;
  const [activeTab, setActiveTab] = useState<BuildTab>(selectedGenre ? 'starter' : 'catalog');
  
  const tabs = [
    ...(selectedGenre ? [{ id: 'starter' as BuildTab, label: 'Starter Kit' }] : []),
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
            
            {board.slots.length > 0 && (
              <button
                onClick={onContinue}
                className="hidden lg:flex items-center gap-2 px-6 py-3 bg-board-accent text-white font-medium rounded-xl hover:bg-board-accent-dim transition-colors"
              >
                Review Board
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'starter' && selectedGenre && (
              <GenreStarterKit />
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
          
          {/* Board Preview (sticky) */}
          <div className="lg:col-span-2">
            <div className="sticky top-36">
              <BoardBuilder />
            </div>
          </div>
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

