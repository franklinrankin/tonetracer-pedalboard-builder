import { useState } from 'react';
import { Lightbulb, ChevronRight, X } from 'lucide-react';
import { useBoard } from '../context/BoardContext';

interface Tip {
  id: string;
  title: string;
  content: string;
  category?: string;
}

const GENERAL_TIPS: Tip[] = [
  {
    id: 'signal-chain',
    title: 'Signal Chain Order',
    content: 'A typical signal chain: Tuner → Wah → Compressor → Overdrive/Distortion → Modulation → Delay → Reverb. But rules are made to be broken!',
  },
  {
    id: 'buffer-placement',
    title: 'Buffer Placement',
    content: 'Place a buffer early in your chain if using many true bypass pedals or long cable runs. This preserves your high-end frequencies.',
  },
  {
    id: 'power-isolation',
    title: 'Isolated Power Supplies',
    content: 'An isolated power supply prevents ground loops and noise. Digital pedals especially benefit from isolated outputs.',
  },
  {
    id: 'gain-stacking',
    title: 'Gain Stacking',
    content: 'Stack multiple low-gain pedals for more control and texture than one high-gain pedal. Order affects character dramatically.',
  },
  {
    id: 'stereo-routing',
    title: 'Stereo Considerations',
    content: 'If running stereo, place stereo pedals (delay, reverb, modulation) at the end of your chain. Everything before should be mono.',
  },
  {
    id: 'top-jacks',
    title: 'Top-Mounted Jacks',
    content: 'Pedals with top-mounted jacks save horizontal space and allow tighter pedal placement. Great for compact boards.',
  },
];

const CATEGORY_TIPS: Record<string, Tip[]> = {
  gain: [
    {
      id: 'gain-tip-1',
      title: 'Overdrive vs Distortion',
      content: 'Overdrives push your amp; distortions create their own clipping. Use OD into a cooking amp, distortion into a clean amp.',
    },
    {
      id: 'gain-tip-2',
      title: 'Fuzz Placement',
      content: 'Most fuzzes want to see your guitar directly—no buffers! Place fuzz first in the chain for best cleanup with volume knob.',
    },
  ],
  delay: [
    {
      id: 'delay-tip-1',
      title: 'Tap Tempo Value',
      content: 'Tap tempo is invaluable live. Consider how you\'ll tap—external switch? Expression pedal? Plan your setup accordingly.',
    },
    {
      id: 'delay-tip-2',
      title: 'Analog vs Digital',
      content: 'Analog delays are warm and degrade naturally. Digital delays stay pristine. Both have their place—analog for vibe, digital for clarity.',
    },
  ],
  reverb: [
    {
      id: 'reverb-tip-1',
      title: 'Less Is More',
      content: 'In a band mix, less reverb often sounds bigger. Heavy reverb can muddy your tone and lose definition.',
    },
  ],
  modulation: [
    {
      id: 'mod-tip-1',
      title: 'Pre vs Post Gain',
      content: 'Modulation before gain creates a vintage sound. After gain is cleaner and more defined. Try both!',
    },
  ],
};

export function EducationalTips() {
  const { state } = useBoard();
  const [currentTip, setCurrentTip] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());
  
  // Get relevant tips based on board contents
  const getRelevantTips = (): Tip[] => {
    const tips: Tip[] = [...GENERAL_TIPS];
    
    // Add category-specific tips based on what's on the board
    const categories = new Set(state.board.slots.map(s => s.pedal.category));
    categories.forEach(cat => {
      if (CATEGORY_TIPS[cat]) {
        tips.push(...CATEGORY_TIPS[cat]);
      }
    });
    
    return tips.filter(t => !dismissedTips.has(t.id));
  };
  
  const relevantTips = getRelevantTips();
  
  if (relevantTips.length === 0) {
    return null;
  }
  
  const tip = relevantTips[currentTip % relevantTips.length];
  
  const handleNext = () => {
    setCurrentTip((prev) => (prev + 1) % relevantTips.length);
  };
  
  const handleDismiss = () => {
    setDismissedTips(prev => new Set([...prev, tip.id]));
    if (currentTip >= relevantTips.length - 1) {
      setCurrentTip(0);
    }
  };
  
  return (
    <div className="bg-gradient-to-r from-board-accent/10 to-board-highlight/10 border border-board-accent/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-board-accent/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-board-accent/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-board-accent" />
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-white">Pro Tips</h2>
            <p className="text-xs text-board-muted">Learn as you build</p>
          </div>
        </div>
        <span className="text-xs text-board-muted">
          {currentTip + 1} / {relevantTips.length}
        </span>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 animate-fadeIn">
          <div className="bg-board-surface/50 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-medium text-board-accent">{tip.title}</h3>
              <button
                onClick={handleDismiss}
                className="text-board-muted hover:text-white transition-colors"
                title="Dismiss this tip"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{tip.content}</p>
          </div>
          
          <button
            onClick={handleNext}
            className="w-full mt-3 py-2 flex items-center justify-center gap-2 text-sm text-board-accent hover:text-board-highlight transition-colors"
          >
            Next Tip
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

