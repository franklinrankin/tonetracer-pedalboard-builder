import { X, HelpCircle, Zap, Target, Sliders, Music2 } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-board-surface border border-board-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-board-border bg-gradient-to-r from-board-accent/10 to-board-highlight/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-board-accent to-board-highlight flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-board-dark" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">About ToneTracer</h2>
                <p className="text-sm text-board-muted">Your pedalboard planning companion</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-board-muted hover:text-white hover:bg-board-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Why ToneTracer */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-board-accent" />
              <h3 className="text-lg font-semibold text-white">Why ToneTracer?</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Building a pedalboard can be overwhelming. With thousands of pedals out there, 
              how do you know what fits your style, your budget, and your physical board space? 
              ToneTracer helps you plan the perfect pedalboard by suggesting pedals based on 
              your musical genre, filtering by your constraints, and showing you how pedals 
              work together.
            </p>
          </section>
          
          {/* Rating System */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-5 h-5 text-board-highlight" />
              <h3 className="text-lg font-semibold text-white">The Rating System</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Each pedal has a <span className="text-board-accent font-medium">Category Rating from 1-10</span> that 
              tells you how intense or complex it is within its category. All categories use the same 1-10 scale, 
              making it easy to compare and balance your board.
            </p>
            
            <div className="space-y-3">
              {/* Gain Rating */}
              <div className="p-3 rounded-lg bg-board-elevated border border-board-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="font-medium text-white text-sm">Gain / Dirt (1-10)</span>
                </div>
                <div className="text-xs text-zinc-400 space-y-1">
                  <p><span className="text-zinc-300">1-2:</span> Clean boost, subtle warmth</p>
                  <p><span className="text-zinc-300">3-4:</span> Light overdrive, edge of breakup</p>
                  <p><span className="text-zinc-300">5-6:</span> Classic overdrive, crunchy</p>
                  <p><span className="text-zinc-300">7-8:</span> High gain, distortion</p>
                  <p><span className="text-zinc-300">9-10:</span> Extreme fuzz, wall of sound</p>
                </div>
              </div>
              
              {/* Modulation Rating */}
              <div className="p-3 rounded-lg bg-board-elevated border border-board-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="font-medium text-white text-sm">Modulation (1-10)</span>
                </div>
                <div className="text-xs text-zinc-400 space-y-1">
                  <p><span className="text-zinc-300">1-3:</span> Subtle movement, light chorus/vibrato</p>
                  <p><span className="text-zinc-300">4-6:</span> Noticeable effect, classic sounds</p>
                  <p><span className="text-zinc-300">7-10:</span> Deep, complex, multi-mode</p>
                </div>
              </div>
              
              {/* Delay/Reverb Rating */}
              <div className="p-3 rounded-lg bg-board-elevated border border-board-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="font-medium text-white text-sm">Delay & Reverb (1-10)</span>
                </div>
                <div className="text-xs text-zinc-400 space-y-1">
                  <p><span className="text-zinc-300">1-3:</span> Subtle ambience, slapback, room</p>
                  <p><span className="text-zinc-300">4-6:</span> Moderate depth, tape/analog character</p>
                  <p><span className="text-zinc-300">7-10:</span> Lush, ambient, infinite possibilities</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* How to Use */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Music2 className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">How to Use</h3>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-board-accent/20 text-board-accent flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                <div>
                  <p className="text-sm font-medium text-white">Choose Your Style</p>
                  <p className="text-xs text-zinc-400">Pick a genre to get tailored suggestions, or skip to browse freely.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-board-accent/20 text-board-accent flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                <div>
                  <p className="text-sm font-medium text-white">Set Your Limits</p>
                  <p className="text-xs text-zinc-400">Define your board size, budget, and power supply capacity.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-board-accent/20 text-board-accent flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                <div>
                  <p className="text-sm font-medium text-white">Build Your Board</p>
                  <p className="text-xs text-zinc-400">Add pedals from the Starter Kit or browse the full catalog. Drag to reorder.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-board-accent/20 text-board-accent flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                <div>
                  <p className="text-sm font-medium text-white">Review & Export</p>
                  <p className="text-xs text-zinc-400">See your tone tags, total cost, and export your board to share.</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Tone Tags */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Tone Tags</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              As you add pedals, ToneTracer calculates your board's overall character and 
              gives you <span className="text-board-accent font-medium">Tone Tags</span> — 
              descriptive labels like "dirty bird" for high-gain boards or "pristine" for 
              clean setups. These help you understand what your board will sound like at a glance.
            </p>
          </section>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-board-border bg-board-elevated/50">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-lg bg-board-accent text-white font-medium hover:bg-board-accent-dim transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

