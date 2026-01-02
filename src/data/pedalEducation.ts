// Educational content about pedal types for beginners

export interface PedalTypeInfo {
  subtype: string;
  category: string;
  whatItDoes: string;
  whenToUse: string;
  signalChainPosition: string;
  beginnerTip: string;
}

export const PEDAL_EDUCATION: Record<string, PedalTypeInfo> = {
  // GAIN
  'Boost': {
    subtype: 'Boost',
    category: 'gain',
    whatItDoes: 'Increases your signal volume without adding distortion. Makes your amp work harder for more natural breakup.',
    whenToUse: 'For solos, to push your amp into overdrive, or as an "always-on" tone enhancer.',
    signalChainPosition: 'Early in chain, often first after tuner',
    beginnerTip: 'A clean boost is one of the most versatile pedals. It can make any other drive pedal sound better!',
  },
  'Overdrive': {
    subtype: 'Overdrive',
    category: 'gain',
    whatItDoes: 'Adds warm, amp-like distortion that responds to your playing dynamics. Soft picking stays clean, hard picking breaks up.',
    whenToUse: 'For blues, rock, and any style where you want natural-sounding grit that cleans up with your volume knob.',
    signalChainPosition: 'After compressor, before distortion/fuzz',
    beginnerTip: 'Start with the gain low and volume high. Let your amp do some of the work!',
  },
  'Distortion': {
    subtype: 'Distortion',
    category: 'gain',
    whatItDoes: 'Creates its own clipping/saturation regardless of your amp. More aggressive and consistent than overdrive.',
    whenToUse: 'For rock, metal, and when you need a consistent heavy tone regardless of amp volume.',
    signalChainPosition: 'After overdrive pedals',
    beginnerTip: 'Distortion pedals work great into clean amps. You don\'t need a loud amp to get heavy tones!',
  },
  'Fuzz': {
    subtype: 'Fuzz',
    category: 'gain',
    whatItDoes: 'Extreme, woolly distortion with lots of sustain. Creates a thick, vintage sound.',
    whenToUse: 'For psychedelic rock, stoner metal, or when you want that classic 60s/70s tone.',
    signalChainPosition: 'Usually FIRST in chain - most fuzzes don\'t like buffers before them',
    beginnerTip: 'Fuzz cleans up beautifully with your guitar\'s volume knob. Try rolling it back for bluesy tones!',
  },

  // MODULATION
  'Chorus': {
    subtype: 'Chorus',
    category: 'modulation',
    whatItDoes: 'Doubles your signal with slight pitch variation, creating a shimmery, wider sound like multiple guitars.',
    whenToUse: 'For clean tones that need movement, 80s sounds, or to add depth to arpeggios.',
    signalChainPosition: 'After gain pedals, before delay/reverb',
    beginnerTip: 'A little chorus goes a long way. Start subtle - you can always add more!',
  },
  'Phaser': {
    subtype: 'Phaser',
    category: 'modulation',
    whatItDoes: 'Creates a sweeping, swooshing sound by splitting your signal and shifting the phase.',
    whenToUse: 'For funk rhythms, psychedelic leads, or adding movement to clean or dirty tones.',
    signalChainPosition: 'After gain pedals, before delay/reverb',
    beginnerTip: 'Slow speeds sound subtle and musical. Fast speeds get more dramatic and spacey.',
  },
  'Flanger': {
    subtype: 'Flanger',
    category: 'modulation',
    whatItDoes: 'Similar to phaser but more dramatic - creates jet-plane swooshes and metallic textures.',
    whenToUse: 'For dramatic effect, 80s rock tones, or experimental sounds.',
    signalChainPosition: 'After gain pedals, before delay/reverb',
    beginnerTip: 'Flanger can sound extreme. Use the depth and rate controls to find the sweet spot.',
  },
  'Tremolo': {
    subtype: 'Tremolo',
    category: 'modulation',
    whatItDoes: 'Rapidly varies your volume up and down, creating a pulsing, wavering effect.',
    whenToUse: 'For surf rock, country, ambient textures, or adding rhythm to sustained chords.',
    signalChainPosition: 'Near the end of chain, often after delay',
    beginnerTip: 'Tremolo sounds amazing with reverb. It\'s one of the oldest guitar effects!',
  },
  'Univibe': {
    subtype: 'Univibe',
    category: 'modulation',
    whatItDoes: 'A unique rotating speaker simulation that\'s part phaser, part chorus. Very organic sounding.',
    whenToUse: 'For Hendrix-style leads, psychedelic rock, or adding liquid movement to your tone.',
    signalChainPosition: 'Can go before or after gain - experiment!',
    beginnerTip: 'Univibe sounds incredible with light overdrive. Think "Machine Gun" by Hendrix.',
  },

  // DELAY
  'Analog': {
    subtype: 'Analog',
    category: 'delay',
    whatItDoes: 'Creates warm, dark repeats that degrade naturally over time. Very musical and organic.',
    whenToUse: 'For slapback, warm ambient tones, or when you want delay that sits behind your playing.',
    signalChainPosition: 'After modulation, before reverb',
    beginnerTip: 'Analog delays blend beautifully and never overpower your dry signal.',
  },
  'Digital': {
    subtype: 'Digital',
    category: 'delay',
    whatItDoes: 'Creates pristine, exact repeats of your signal. Very clear and defined.',
    whenToUse: 'For precise rhythmic delays, dotted-eighth patterns, or when you need clarity.',
    signalChainPosition: 'After modulation, before reverb',
    beginnerTip: 'Digital delays are great for learning timing. Use tap tempo to sync with songs!',
  },
  'Tape': {
    subtype: 'Tape',
    category: 'delay',
    whatItDoes: 'Emulates vintage tape echo machines with warm, wobbly repeats and natural saturation.',
    whenToUse: 'For vintage vibes, rockabilly slapback, or atmospheric ambient sounds.',
    signalChainPosition: 'After modulation, before reverb',
    beginnerTip: 'The slight warble of tape delay adds character that digital can\'t match.',
  },

  // REVERB
  'Multi': {
    subtype: 'Multi',
    category: 'reverb',
    whatItDoes: 'Offers multiple reverb types (hall, plate, spring, etc.) in one pedal for versatility.',
    whenToUse: 'When you need different reverb sounds for different songs or styles.',
    signalChainPosition: 'Last in chain (usually)',
    beginnerTip: 'Start with a room or plate setting - they work for almost everything!',
  },
  'Ambient': {
    subtype: 'Ambient',
    category: 'reverb',
    whatItDoes: 'Creates huge, atmospheric spaces with shimmer, modulation, and infinite decay options.',
    whenToUse: 'For post-rock, ambient music, worship, or creating massive soundscapes.',
    signalChainPosition: 'Last in chain',
    beginnerTip: 'Ambient reverbs can turn a simple chord into a symphony. Less is more at first!',
  },

  // DYNAMICS
  'Compressor': {
    subtype: 'Compressor',
    category: 'dynamics',
    whatItDoes: 'Evens out your volume by making quiet notes louder and loud notes quieter. Adds sustain.',
    whenToUse: 'For clean funk playing, country chicken-picking, or adding polish to any tone.',
    signalChainPosition: 'Early in chain, after tuner',
    beginnerTip: 'Compression is subtle but powerful. It makes your playing feel more "pro" and polished.',
  },
  'Limiter': {
    subtype: 'Limiter',
    category: 'dynamics',
    whatItDoes: 'Prevents your signal from exceeding a certain volume. Like a compressor but more aggressive.',
    whenToUse: 'For protecting amps/speakers, controlling dynamics in recording, or extreme sustain.',
    signalChainPosition: 'Early in chain or at the very end',
    beginnerTip: 'Great for bass players or anyone who needs consistent volume levels.',
  },
  'Gate': {
    subtype: 'Gate',
    category: 'dynamics',
    whatItDoes: 'Cuts your signal when it drops below a threshold, eliminating noise and hum.',
    whenToUse: 'For high-gain tones, to tighten up palm mutes, or remove amp noise between notes.',
    signalChainPosition: 'After your gain pedals',
    beginnerTip: 'Essential for metal! Set the threshold just high enough to cut noise without affecting sustain.',
  },

  // FILTER
  'Wah': {
    subtype: 'Wah',
    category: 'filter',
    whatItDoes: 'A foot-controlled filter that sweeps through frequencies, creating a vocal-like sound.',
    whenToUse: 'For funk rhythms, expressive leads, or that classic "wah-wah" sound.',
    signalChainPosition: 'Very early in chain, often first',
    beginnerTip: 'Practice moving the pedal in rhythm with your playing. It\'s an instrument in itself!',
  },
  'Envelope': {
    subtype: 'Envelope',
    category: 'filter',
    whatItDoes: 'An automatic wah that responds to how hard you play. Harder picking = more filter sweep.',
    whenToUse: 'For funk, synth-like sounds, or when you can\'t use a wah pedal.',
    signalChainPosition: 'Early in chain, after compressor',
    beginnerTip: 'Also called "auto-wah" or "envelope filter". Super funky for rhythmic playing!',
  },
  'Auto-Wah': {
    subtype: 'Auto-Wah',
    category: 'filter',
    whatItDoes: 'Automatically sweeps the wah filter based on your playing dynamics.',
    whenToUse: 'For funk grooves, bass lines, or hands-free wah sounds.',
    signalChainPosition: 'Early in chain',
    beginnerTip: 'Works great with a compressor before it for more consistent triggering.',
  },

  // PITCH
  'Octave': {
    subtype: 'Octave',
    category: 'pitch',
    whatItDoes: 'Adds notes one or two octaves above or below your playing.',
    whenToUse: 'For bass-like sounds, organ tones, or thickening your signal.',
    signalChainPosition: 'Early in chain, before gain',
    beginnerTip: 'Octave down is great for guitar players who also need to cover bass parts!',
  },
  'Harmonizer': {
    subtype: 'Harmonizer',
    category: 'pitch',
    whatItDoes: 'Adds harmony notes (thirds, fifths, etc.) that follow your playing in a musical key.',
    whenToUse: 'For creating instant harmonies, dual-guitar sounds, or prog rock leads.',
    signalChainPosition: 'After gain pedals for best tracking',
    beginnerTip: 'Set your key correctly! Wrong key = wrong harmonies.',
  },
  'Shifter': {
    subtype: 'Shifter',
    category: 'pitch',
    whatItDoes: 'Shifts your pitch up or down by a set interval. Can create detuned or transposed sounds.',
    whenToUse: 'For special effects, drop-tuning without retuning, or creating dissonance.',
    signalChainPosition: 'After gain pedals',
    beginnerTip: 'A subtle detune (few cents) can make your tone sound huge and chorus-like.',
  },
  'Whammy': {
    subtype: 'Whammy',
    category: 'pitch',
    whatItDoes: 'Expression pedal-controlled pitch shifting for dive bombs, harmonies, and wild effects.',
    whenToUse: 'For dramatic pitch bends, Tom Morello-style effects, or creating unique sounds.',
    signalChainPosition: 'Before gain for synth sounds, after gain for more natural pitch bends',
    beginnerTip: 'The Whammy is an instrument of its own. Spend time learning its possibilities!',
  },

  // EQ
  'Graphic': {
    subtype: 'Graphic',
    category: 'eq',
    whatItDoes: 'Multiple sliders that let you boost or cut specific frequency ranges.',
    whenToUse: 'For fine-tuning your tone, compensating for room acoustics, or shaping drive sounds.',
    signalChainPosition: 'After gain pedals, or in effects loop',
    beginnerTip: 'Cut frequencies more than you boost. It usually sounds more natural!',
  },
  'Parametric': {
    subtype: 'Parametric',
    category: 'eq',
    whatItDoes: 'Lets you choose exactly which frequency to adjust, with control over width.',
    whenToUse: 'For surgical tone shaping, removing problem frequencies, or studio-quality control.',
    signalChainPosition: 'After gain pedals, or in effects loop',
    beginnerTip: 'More complex than graphic EQ, but more powerful once you learn it.',
  },

  // UTILITY
  'Tuner': {
    subtype: 'Tuner',
    category: 'utility',
    whatItDoes: 'Displays your pitch so you can tune your guitar accurately. Usually mutes output while tuning.',
    whenToUse: 'Always! Tune before every song and whenever something sounds off.',
    signalChainPosition: 'First in chain',
    beginnerTip: 'The most important pedal on your board. An out-of-tune guitar sounds bad no matter what!',
  },
  'Buffer': {
    subtype: 'Buffer',
    category: 'utility',
    whatItDoes: 'Strengthens your signal to prevent high-frequency loss over long cable runs.',
    whenToUse: 'If you have many pedals, long cables, or notice your tone getting dull.',
    signalChainPosition: 'First or last in chain',
    beginnerTip: 'If your tone sounds fine, you might not need one. But they\'re great insurance!',
  },
  'Switcher': {
    subtype: 'Switcher',
    category: 'utility',
    whatItDoes: 'Routes your signal to different paths or switches between amps/pedal combinations.',
    whenToUse: 'For complex rigs, switching between clean and dirty amps, or creating presets.',
    signalChainPosition: 'Depends on your routing needs',
    beginnerTip: 'A/B/Y boxes let you run two amps at once for huge stereo sounds!',
  },
  'Loop Switcher': {
    subtype: 'Loop Switcher',
    category: 'utility',
    whatItDoes: 'Lets you turn multiple pedals on/off with one footswitch, and create presets.',
    whenToUse: 'For complex boards where you need to switch multiple pedals at once.',
    signalChainPosition: 'Your pedals go in its loops',
    beginnerTip: 'The ultimate organization tool for big pedalboards. Saves tap-dancing!',
  },
  'Looper': {
    subtype: 'Looper',
    category: 'volume',
    whatItDoes: 'Records your playing and plays it back in a loop so you can layer parts or practice over yourself.',
    whenToUse: 'For practice, songwriting, live performance, or creating one-person-band arrangements.',
    signalChainPosition: 'Last in chain (to capture your full tone)',
    beginnerTip: 'Amazing practice tool! Loop a chord progression and practice scales over it.',
  },

  // VOLUME
  'Volume': {
    subtype: 'Volume',
    category: 'volume',
    whatItDoes: 'A foot-controlled volume knob. Create swells, adjust volume hands-free.',
    whenToUse: 'For violin-like volume swells, adjusting stage volume, or ambient sounds.',
    signalChainPosition: 'After gain for post-gain volume, before for pre-gain swells',
    beginnerTip: 'Volume swells into delay and reverb create beautiful ambient textures!',
  },

  // AMP
  'Amp Sim': {
    subtype: 'Amp Sim',
    category: 'amp',
    whatItDoes: 'Emulates the sound of guitar amplifiers, letting you go direct to PA or recording.',
    whenToUse: 'For silent practice, direct recording, or playing without a traditional amp.',
    signalChainPosition: 'End of chain, replaces your amp',
    beginnerTip: 'Modern amp sims sound incredible. Great for apartment players or recording!',
  },
  'Cab Sim': {
    subtype: 'Cab Sim',
    category: 'amp',
    whatItDoes: 'Emulates the sound of a speaker cabinet, essential for direct recording.',
    whenToUse: 'When going direct to PA/interface, or using a preamp pedal as your "amp".',
    signalChainPosition: 'Very end of chain',
    beginnerTip: 'Without cab simulation, direct guitar sounds thin and harsh. This fixes that!',
  },
  'Preamp': {
    subtype: 'Preamp',
    category: 'amp',
    whatItDoes: 'Shapes your tone like an amp\'s preamp section. Adds EQ, gain staging, and character.',
    whenToUse: 'To add amp-like qualities to your signal, or as an always-on tone shaper.',
    signalChainPosition: 'After your other pedals, before power amp or cab sim',
    beginnerTip: 'A good preamp pedal can make any amp sound better!',
  },

  // SYNTH
  'Synth': {
    subtype: 'Synth',
    category: 'synth',
    whatItDoes: 'Transforms your guitar into synthesizer-like sounds using pitch tracking and filters.',
    whenToUse: 'For experimental sounds, keyboard-like tones, or expanding your sonic palette.',
    signalChainPosition: 'Usually early in chain for best tracking',
    beginnerTip: 'Play cleanly and let notes ring - synth pedals track better with clear input.',
  },
  'Special': {
    subtype: 'Special',
    category: 'synth',
    whatItDoes: 'Unique effects that don\'t fit other categories - glitch, lo-fi, ring mod, etc.',
    whenToUse: 'For experimental music, creating unique sounds, or adding ear-catching moments.',
    signalChainPosition: 'Varies - experiment!',
    beginnerTip: 'These are the spices of your pedalboard. A little goes a long way!',
  },
};

export function getPedalEducation(subtype: string): PedalTypeInfo | undefined {
  return PEDAL_EDUCATION[subtype];
}

export function getEducationByCategory(category: string): PedalTypeInfo[] {
  return Object.values(PEDAL_EDUCATION).filter(p => p.category === category);
}

