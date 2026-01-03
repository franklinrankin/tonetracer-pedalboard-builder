import { CategoryInfo, Category } from '../types';

export const CATEGORY_INFO: Record<Category, CategoryInfo> = {
  gain: {
    id: 'gain',
    name: 'gain',
    displayName: 'Gain / Dirt',
    color: '#ff4444',
    maxScore: 10,
    tags: ['mr. clean', 'dirty bird', 'burner', 'screamer', 'melt my face why don\'t you'],
    tagRanges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]],
    ratingLabels: [
      { range: [1, 2], label: 'Boost' },
      { range: [3, 5], label: 'Low-Gain Overdrive' },
      { range: [5, 7], label: 'Mid-Gain Drive / Low Fuzz' },
      { range: [8, 10], label: 'Burning Drive / Big Fuzz' },
    ],
  },
  modulation: {
    id: 'modulation',
    name: 'modulation',
    displayName: 'Modulation',
    color: '#9b59b6',
    maxScore: 10,
    tags: ['still water', 'a little motion', 'swirly', 'spin cycle', 'it\'s a twister'],
    tagRanges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]],
    ratingLabels: [
      { range: [1, 3], label: 'Simple Modulation' },
      { range: [4, 7], label: 'Shaped Modulation' },
      { range: [8, 10], label: 'Multi / Advanced Modulation' },
    ],
  },
  delay: {
    id: 'delay',
    name: 'delay',
    displayName: 'Delay',
    color: '#3498db',
    maxScore: 10,
    tags: ['come again?', 'repeater', 'spelunker', 'long term memory', 'time traveler'],
    tagRanges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]],
    ratingLabels: [
      { range: [1, 3], label: 'Simple Delay (3-Knob)' },
      { range: [4, 7], label: 'Tap-Tempo / Shaped Delay' },
      { range: [8, 10], label: 'Preset / Multi Delay' },
    ],
  },
  reverb: {
    id: 'reverb',
    name: 'reverb',
    displayName: 'Reverb',
    color: '#1abc9c',
    maxScore: 10,
    tags: ['bone dry', 'moist', 'drippy', 'dreamy', 'floating'],
    tagRanges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]],
    ratingLabels: [
      { range: [1, 3], label: 'Simple Reverb (3-Knob)' },
      { range: [4, 7], label: 'Shaped Reverb' },
      { range: [8, 10], label: 'Preset / Ambient Reverb' },
    ],
  },
  dynamics: {
    id: 'dynamics',
    name: 'dynamics',
    displayName: 'Dynamics',
    color: '#e67e22',
    maxScore: 10,
    tags: ['wide open', 'gluey', 'smooth operator', 'squashed', 'clamped down'],
    tagRanges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]],
    ratingLabels: [
      { range: [1, 3], label: 'Simple Dynamics' },
      { range: [4, 7], label: 'Shaped Dynamics' },
      { range: [8, 10], label: 'Studio Dynamics' },
    ],
  },
  filter: {
    id: 'filter',
    name: 'filter',
    displayName: 'Filter',
    color: '#f1c40f',
    maxScore: 10,
    tags: ['town crier', 'quack doctor', 'funky chicken', 'street sweeper', 'what are you talking about'],
    tagRanges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]],
    ratingLabels: [
      { range: [1, 3], label: 'Fixed Filter' },
      { range: [4, 7], label: 'Expressive Filter' },
      { range: [8, 10], label: 'Advanced / Synth Filter' },
    ],
  },
  pitch: {
    id: 'pitch',
    name: 'pitch',
    displayName: 'Pitch',
    color: '#e91e63',
    maxScore: 10,
    tags: ['pitchy', 'pitchier', 'harmonious', 'warped', 'unrecognizable'],
    tagRanges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]],
    ratingLabels: [
      { range: [1, 3], label: 'Single Pitch' },
      { range: [4, 7], label: 'Harmony / Multi Pitch' },
      { range: [8, 10], label: 'Advanced Pitch / Whammy' },
    ],
  },
  eq: {
    id: 'eq',
    name: 'eq',
    displayName: 'EQ / Tone Shaping',
    color: '#00bcd4',
    maxScore: 10,
    tags: ['shaper', 'sculptor', 'surgical'],
    tagRanges: [[0, 3], [4, 7], [8, 10]],
    ratingLabels: [
      { range: [1, 3], label: 'Tone Control' },
      { range: [4, 7], label: 'Graphic / Shaped EQ' },
      { range: [8, 10], label: 'Parametric / Surgical EQ' },
    ],
  },
  volume: {
    id: 'volume',
    name: 'volume',
    displayName: 'Volume & Control',
    color: '#607d8b',
    maxScore: 10,
    tags: ['in control', 'manager', 'board administrator'],
    tagRanges: [[0, 3], [4, 7], [8, 10]],
    ratingLabels: [
      { range: [1, 3], label: 'Basic Level Control' },
      { range: [4, 7], label: 'Playable Control' },
      { range: [8, 10], label: 'Advanced Control' },
    ],
  },
  amp: {
    id: 'amp',
    name: 'amp',
    displayName: 'Amp & Cab',
    color: '#795548',
    maxScore: 10,
    tags: ['direct', 'amplifier', 'simulator'],
    tagRanges: [[0, 3], [4, 7], [8, 10]],
    ratingLabels: [
      { range: [1, 3], label: 'Simple Preamp' },
      { range: [4, 7], label: 'Amp Shaping' },
      { range: [8, 10], label: 'Full Amp / Cab Rig' },
    ],
  },
  utility: {
    id: 'utility',
    name: 'utility',
    displayName: 'Utility / Routing',
    color: '#9e9e9e',
    maxScore: 10,
    tags: ['work smarter', 'router', 'pedal nerd', 'geeked out', 'board scholar'],
    tagRanges: [[0, 2], [3, 4], [5, 6], [7, 8], [9, 10]],
    ratingLabels: [
      { range: [1, 3], label: 'Single Utility' },
      { range: [4, 7], label: 'Board Helper' },
      { range: [8, 10], label: 'Board Brain' },
    ],
  },
  synth: {
    id: 'synth',
    name: 'synth',
    displayName: 'Synth / Special Effects',
    color: '#673ab7',
    maxScore: 10,
    tags: ['effect flavor', 'texture / synth-like', 'sound design tool'],
    tagRanges: [[0, 3], [4, 7], [8, 10]],
    ratingLabels: [
      { range: [1, 3], label: 'Effect Flavor' },
      { range: [4, 7], label: 'Texture / Synth-Like' },
      { range: [8, 10], label: 'Sound Design Tool' },
    ],
  },
};

export const CATEGORY_ORDER: Category[] = [
  'gain',
  'modulation',
  'delay',
  'reverb',
  'dynamics',
  'filter',
  'pitch',
  'eq',
  'volume',
  'amp',
  'utility',
  'synth',
];

export function getCategoryTag(category: Category, score: number): string {
  const info = CATEGORY_INFO[category];
  for (let i = 0; i < info.tagRanges.length; i++) {
    const [min, max] = info.tagRanges[i];
    if (score >= min && score <= max) {
      return info.tags[i];
    }
  }
  return info.tags[0];
}

export function getRatingLabel(category: Category, rating: number): string {
  const info = CATEGORY_INFO[category];
  for (const { range, label } of info.ratingLabels) {
    if (rating >= range[0] && rating <= range[1]) {
      return label;
    }
  }
  return 'Unknown';
}

