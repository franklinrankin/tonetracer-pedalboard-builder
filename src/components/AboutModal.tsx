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
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-[#FFFEF0] max-w-2xl w-full max-h-[85vh] overflow-hidden"
        style={{ border: '4px solid black', boxShadow: '8px 8px 0px black' }}
      >
        {/* Header */}
        <div 
          className="p-4 sm:p-6 bg-board-accent"
          style={{ borderBottom: '4px solid black' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white flex items-center justify-center"
                style={{ border: '3px solid black' }}
              >
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-black uppercase">About Boardsie</h2>
                <p className="text-xs sm:text-sm font-bold text-black/70">Your pedalboard planning companion</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white flex items-center justify-center hover:-translate-y-0.5 transition-transform"
              style={{ border: '3px solid black' }}
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Why Boardsie */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-8 h-8 bg-board-accent flex items-center justify-center"
                style={{ border: '2px solid black' }}
              >
                <Target className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-black uppercase">Why Boardsie?</h3>
            </div>
            <p className="text-sm text-black/80 leading-relaxed">
              Building a pedalboard can be overwhelming. With thousands of pedals out there, 
              how do you know what fits your style, your budget, and your physical board space? 
              Boardsie helps you plan the perfect pedalboard by suggesting pedals based on 
              your musical genre, filtering by your constraints, and showing you how pedals 
              work together.
            </p>
          </section>
          
          {/* Rating System */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-8 h-8 bg-board-highlight flex items-center justify-center"
                style={{ border: '2px solid black' }}
              >
                <Sliders className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-black uppercase">The Rating System</h3>
            </div>
            <p className="text-sm text-black/80 leading-relaxed mb-4">
              Each pedal has a <span className="font-bold">Category Rating from 1-10</span> that 
              tells you how intense or complex it is within its category. All categories use the same 1-10 scale, 
              making it easy to compare and balance your board.
            </p>
            
            <div className="space-y-3">
              {/* Gain Rating */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-orange-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black text-sm">Gain / Dirt (1-10)</span>
                </div>
                <div className="text-xs text-black/70 space-y-1">
                  <p><span className="font-bold text-black">1-2:</span> Clean boost, subtle warmth</p>
                  <p><span className="font-bold text-black">3-4:</span> Light overdrive, edge of breakup</p>
                  <p><span className="font-bold text-black">5-6:</span> Classic overdrive, crunchy</p>
                  <p><span className="font-bold text-black">7-8:</span> High gain, distortion</p>
                  <p><span className="font-bold text-black">9-10:</span> Extreme fuzz, wall of sound</p>
                </div>
              </div>
              
              {/* Modulation Rating */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-purple-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black text-sm">Modulation (1-10)</span>
                </div>
                <div className="text-xs text-black/70 space-y-1">
                  <p><span className="font-bold text-black">1-3:</span> Subtle movement, light chorus/vibrato</p>
                  <p><span className="font-bold text-black">4-6:</span> Noticeable effect, classic sounds</p>
                  <p><span className="font-bold text-black">7-10:</span> Deep, complex, multi-mode</p>
                </div>
              </div>
              
              {/* Delay/Reverb Rating */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-cyan-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black text-sm">Delay & Reverb (1-10)</span>
                </div>
                <div className="text-xs text-black/70 space-y-1">
                  <p><span className="font-bold text-black">1-3:</span> Subtle ambience, slapback, room</p>
                  <p><span className="font-bold text-black">4-6:</span> Moderate depth, tape/analog character</p>
                  <p><span className="font-bold text-black">7-10:</span> Lush, ambient, infinite possibilities</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* How to Use */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-8 h-8 bg-board-success flex items-center justify-center"
                style={{ border: '2px solid black' }}
              >
                <Music2 className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-black uppercase">How to Use</h3>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div 
                  className="w-8 h-8 bg-board-accent flex items-center justify-center flex-shrink-0 text-sm font-black text-black"
                  style={{ border: '2px solid black' }}
                >
                  1
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Choose Your Style</p>
                  <p className="text-xs text-black/70">Pick a genre to get tailored suggestions, or skip to browse freely.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div 
                  className="w-8 h-8 bg-board-accent flex items-center justify-center flex-shrink-0 text-sm font-black text-black"
                  style={{ border: '2px solid black' }}
                >
                  2
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Set Your Limits</p>
                  <p className="text-xs text-black/70">Define your board size, budget, and power supply capacity.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div 
                  className="w-8 h-8 bg-board-accent flex items-center justify-center flex-shrink-0 text-sm font-black text-black"
                  style={{ border: '2px solid black' }}
                >
                  3
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Build Your Board</p>
                  <p className="text-xs text-black/70">Add pedals from the Starter Kit or browse the full catalog. Drag to reorder.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div 
                  className="w-8 h-8 bg-board-accent flex items-center justify-center flex-shrink-0 text-sm font-black text-black"
                  style={{ border: '2px solid black' }}
                >
                  4
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Review & Export</p>
                  <p className="text-xs text-black/70">See your tone tags, total cost, and export your board to share.</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Tone Tags */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-8 h-8 bg-amber-400 flex items-center justify-center"
                style={{ border: '2px solid black' }}
              >
                <Zap className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-black uppercase">Tone Tags</h3>
            </div>
            <p className="text-sm text-black/80 leading-relaxed mb-3">
              As you add pedals, Boardsie calculates your board's overall character and 
              gives you <span className="font-bold">Tone Tags</span> — 
              fun labels that describe your sound in each category.
            </p>
            <p className="text-sm text-black/80 leading-relaxed mb-4">
              Tags are based on your <span className="font-bold">average intensity</span> across 
              pedals in that category. Each pedal is rated 1-10, and your tag is determined by 
              where your average falls. The ranges below show what average you need to hit each tag. 
              <span className="font-bold"> The total score scales with how many pedals you have</span> (1 pedal = out of 10, 
              2 pedals = out of 20, etc.) but your tag stays consistent based on your average.
            </p>
            
            <div className="space-y-3 text-xs">
              {/* Gain Tags */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black">Gain / Dirt</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-black/70">
                  <span><span className="font-bold text-black">0-2:</span> mr. clean</span>
                  <span><span className="font-bold text-black">3-4:</span> dirty bird</span>
                  <span><span className="font-bold text-black">5-6:</span> burner</span>
                  <span><span className="font-bold text-black">7-8:</span> screamer</span>
                  <span className="col-span-2"><span className="font-bold text-black">9-10:</span> melt my face why don't you</span>
                </div>
              </div>
              
              {/* Modulation Tags */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-purple-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black">Modulation</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-black/70">
                  <span><span className="font-bold text-black">0-2:</span> still water</span>
                  <span><span className="font-bold text-black">3-4:</span> a little motion</span>
                  <span><span className="font-bold text-black">5-6:</span> swirly</span>
                  <span><span className="font-bold text-black">7-8:</span> spin cycle</span>
                  <span><span className="font-bold text-black">9-10:</span> it's a twister</span>
                </div>
              </div>
              
              {/* Delay Tags */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black">Delay</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-black/70">
                  <span><span className="font-bold text-black">0-2:</span> come again?</span>
                  <span><span className="font-bold text-black">3-4:</span> repeater</span>
                  <span><span className="font-bold text-black">5-6:</span> spelunker</span>
                  <span><span className="font-bold text-black">7-8:</span> long term memory</span>
                  <span><span className="font-bold text-black">9-10:</span> time traveler</span>
                </div>
              </div>
              
              {/* Reverb Tags */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-teal-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black">Reverb</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-black/70">
                  <span><span className="font-bold text-black">0-2:</span> bone dry</span>
                  <span><span className="font-bold text-black">3-4:</span> moist</span>
                  <span><span className="font-bold text-black">5-6:</span> drippy</span>
                  <span><span className="font-bold text-black">7-8:</span> dreamy</span>
                  <span><span className="font-bold text-black">9-10:</span> floating</span>
                </div>
              </div>
              
              {/* Dynamics Tags */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-orange-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black">Dynamics</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-black/70">
                  <span><span className="font-bold text-black">0-2:</span> wide open</span>
                  <span><span className="font-bold text-black">3-4:</span> gluey</span>
                  <span><span className="font-bold text-black">5-6:</span> smooth operator</span>
                  <span><span className="font-bold text-black">7-8:</span> squashed</span>
                  <span><span className="font-bold text-black">9-10:</span> clamped down</span>
                </div>
              </div>
              
              {/* Filter Tags */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black">Filter</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-black/70">
                  <span><span className="font-bold text-black">0-2:</span> town crier</span>
                  <span><span className="font-bold text-black">3-4:</span> quack doctor</span>
                  <span><span className="font-bold text-black">5-6:</span> funky chicken</span>
                  <span><span className="font-bold text-black">7-8:</span> street sweeper</span>
                  <span className="col-span-2"><span className="font-bold text-black">9-10:</span> what are you talking about</span>
                </div>
              </div>
              
              {/* Pitch Tags */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-pink-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black">Pitch</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-black/70">
                  <span><span className="font-bold text-black">0-2:</span> pitchy</span>
                  <span><span className="font-bold text-black">3-4:</span> pitchier</span>
                  <span><span className="font-bold text-black">5-6:</span> harmonious</span>
                  <span><span className="font-bold text-black">7-8:</span> warped</span>
                  <span><span className="font-bold text-black">9-10:</span> unrecognizable</span>
                </div>
              </div>
              
              {/* EQ Tags */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-cyan-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black">EQ / Tone Shaping</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-black/70">
                  <span><span className="font-bold text-black">0-3:</span> shaper</span>
                  <span><span className="font-bold text-black">4-7:</span> sculptor</span>
                  <span><span className="font-bold text-black">8-10:</span> surgical</span>
                </div>
              </div>
              
              {/* Volume Tags */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-slate-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black">Volume & Control</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-black/70">
                  <span><span className="font-bold text-black">0-3:</span> in control</span>
                  <span><span className="font-bold text-black">4-7:</span> manager</span>
                  <span><span className="font-bold text-black">8-10:</span> board administrator</span>
                </div>
              </div>
              
              {/* Amp Tags */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-amber-700" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black">Amp & Cab</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-black/70">
                  <span><span className="font-bold text-black">0-3:</span> direct</span>
                  <span><span className="font-bold text-black">4-7:</span> amplifier</span>
                  <span><span className="font-bold text-black">8-10:</span> simulator</span>
                </div>
              </div>
              
              {/* Utility Tags */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-gray-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black">Utility / Routing</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-black/70">
                  <span><span className="font-bold text-black">0-2:</span> work smarter</span>
                  <span><span className="font-bold text-black">3-4:</span> router</span>
                  <span><span className="font-bold text-black">5-6:</span> pedal nerd</span>
                  <span><span className="font-bold text-black">7-8:</span> geeked out</span>
                  <span><span className="font-bold text-black">9-10:</span> board scholar</span>
                </div>
              </div>
              
              {/* Synth Tags */}
              <div 
                className="p-3 bg-white"
                style={{ border: '2px solid black' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-violet-500" style={{ border: '1px solid black' }} />
                  <span className="font-bold text-black">Synth / Special Effects</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-black/70">
                  <span><span className="font-bold text-black">0-3:</span> effect flavor</span>
                  <span><span className="font-bold text-black">4-7:</span> texture / synth-like</span>
                  <span><span className="font-bold text-black">8-10:</span> sound design tool</span>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        {/* Footer */}
        <div 
          className="p-4 bg-white"
          style={{ borderTop: '4px solid black' }}
        >
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-black text-white font-black uppercase hover:-translate-y-0.5 transition-transform"
            style={{ border: '3px solid black' }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
