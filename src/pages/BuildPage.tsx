import { useState } from 'react';
import { Sliders, Sparkles } from 'lucide-react';
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
    ...(board.slots.length > 0 ? [{ id: 'recommend' as BuildTab, label: 'Setup', icon: <Sparkles className="w-3 h-3" /> }] : []),
  ];
  
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-board-surface border-b border-board-border flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-board-accent/20 flex items-center justify-center">
                <Sliders className="w-4 h-4 text-board-accent" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Build Your Board</h1>
                <p className="text-xs text-board-muted">
                  {board.slots.length === 0 
                    ? 'Add pedals to get started' 
                    : `${board.slots.length} pedal${board.slots.length !== 1 ? 's' : ''} • $${state.totalCost}`
                  }
                </p>
              </div>
            </div>
            
            {board.slots.length > 0 && (
              <button
                onClick={onContinue}
                className="px-4 py-1.5 text-sm bg-board-accent text-white font-medium rounded-lg hover:bg-board-accent-dim transition-colors"
              >
                Review →
              </button>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
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
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid lg:grid-cols-5 gap-4 p-4">
          {/* Main Content */}
          <div className="lg:col-span-3 overflow-y-auto">
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
          
          {/* Board Preview */}
          <div className="lg:col-span-2 overflow-y-auto">
            <BoardBuilder />
          </div>
        </div>
      </div>
    </div>
  );
}
