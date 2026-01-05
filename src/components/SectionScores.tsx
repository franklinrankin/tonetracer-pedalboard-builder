import { useBoard } from '../context/BoardContext';
import { CATEGORY_INFO, CATEGORY_ORDER } from '../data/categories';
import { Category } from '../types';

const CategoryIcon = ({ category }: { category: Category }) => {
  const icons: Record<Category, string> = {
    gain: '🔥',
    modulation: '🌊',
    delay: '⏱️',
    reverb: '✨',
    dynamics: '💪',
    filter: '🎭',
    pitch: '🎵',
    eq: '📊',
    volume: '🎚️',
    amp: '🔊',
    utility: '🔧',
    synth: '🎹',
  };
  return <span className="text-lg">{icons[category]}</span>;
};

export function SectionScores() {
  const { state } = useBoard();
  const { sectionScores, board } = state;
  
  if (board.slots.length === 0) {
    return (
      <div className="bg-board-surface border border-board-border rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">🎸</div>
        <h3 className="font-semibold text-white mb-1">No pedals yet</h3>
        <p className="text-sm text-board-muted">
          Add pedals to see your section scores and tags
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-board-surface border border-board-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-board-border">
        <h2 className="font-semibold text-white">Section Scores & Tags</h2>
        <p className="text-xs text-board-muted mt-0.5">Based on your selected pedals</p>
      </div>
      
      <div className="divide-y divide-board-border">
        {CATEGORY_ORDER.map(category => {
          const score = sectionScores.find(s => s.category === category);
          const info = CATEGORY_INFO[category];
          
          if (!score) return null;
          
          const percentage = score.maxScore > 0 ? (score.totalScore / score.maxScore) * 100 : 0;
          const isEmpty = score.pedals.length === 0;
          
          return (
            <div key={category} className="p-4 hover:bg-board-elevated/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <CategoryIcon category={category} />
                  <div>
                    <h3 className="font-medium text-white">{info.displayName}</h3>
                    <p className="text-xs text-board-muted">
                      {isEmpty ? 'None on board' : `${score.pedals.length} pedal${score.pedals.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg text-white">
                    {score.totalScore}<span className="text-board-muted text-sm">/{score.maxScore}</span>
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-board-dark rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: info.color,
                  }}
                />
              </div>
              
              {/* Tag */}
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: `${info.color}20`,
                  color: info.color,
                  borderColor: `${info.color}40`,
                  borderWidth: '1px',
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
                {score.tag}
              </div>
              
              {/* Pedal list or empty message */}
              {isEmpty ? (
                <div className="mt-3 text-xs text-board-muted italic">
                  No {info.displayName.toLowerCase()} pedals — keeping it {score.tag}!
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-1">
                  {score.pedals.map(pedal => (
                    <span 
                      key={pedal.id}
                      className="px-2 py-0.5 text-xs rounded bg-board-elevated text-zinc-400"
                    >
                      {pedal.model.split(' ')[0]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

