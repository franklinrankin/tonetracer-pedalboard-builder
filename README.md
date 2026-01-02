# ToneTracer - Pedalboard Builder

A modern, educational pedalboard-building website that helps you build pedalboards that actually fit, stay within budget, and respect real wiring/power constraints.

![ToneTracer Preview](https://via.placeholder.com/800x400/12121a/ff6b35?text=ToneTracer)

## Features

### 🎛️ Smart Constraints
- **Board Size**: Select from popular templates (Pedaltrain, Boss, Temple Audio) or define custom dimensions
- **Budget**: Set a hard cap and see real-time cost tracking
- **Power**: Calculate total mA draw against your power supply capacity

### 📊 Section Scoring System
Each pedal category has a rating system (1-10) and cumulative tags:

| Category | Max Score | Tags |
|----------|-----------|------|
| Gain/Dirt | 30 | mr. clean → melt my face |
| Modulation | 15 | still water → it's a twister |
| Delay | 15 | come again? → time traveler |
| Reverb | 15 | bone dry → floating |
| Dynamics | 15 | wide open → clamped down |
| Filter | 10 | town crier → what are you talking about |
| Pitch | 10 | pitchy → unrecognizable |
| EQ | 10 | shaper → surgical |
| Volume | 10 | in control → board administrator |
| Utility | 15 | work smarter → board scholar |

### 🔍 Smart Filtering
- Pedals that don't fit constraints are **grayed out** but remain visible
- Clear reasons shown for why a pedal doesn't fit
- Filter by category, price, size, or rating

### 💡 Educational Features
- Pro tips that adapt to your board contents
- Genre suggestions based on your pedal selection
- Smart recommendations for swaps and additions

### 🎯 Recommendation Engine
- **Space savers**: Find smaller alternatives to large pedals
- **Budget options**: Cheaper pedals with similar ratings
- **Section boosters**: Suggestions to reach higher tag levels
- **Top-jack alternatives**: Save horizontal space

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
cd TONETRACER

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Framer Motion** for animations

## Project Structure

```
src/
├── components/        # React components
│   ├── Header.tsx
│   ├── ConstraintsPanel.tsx
│   ├── BoardBuilder.tsx
│   ├── BoardStats.tsx
│   ├── PedalCard.tsx
│   ├── PedalCatalog.tsx
│   ├── SectionScores.tsx
│   ├── EducationalTips.tsx
│   └── Recommendations.tsx
├── context/           # React context for state
│   └── BoardContext.tsx
├── data/              # Static data
│   ├── pedals.ts      # Pedal database
│   ├── categories.ts  # Category info & scoring
│   └── boardTemplates.ts
├── types/             # TypeScript types
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Pedal Data Structure

Each pedal in the database includes:

```typescript
interface Pedal {
  // Identity
  id: string;
  brand: string;
  model: string;
  category: Category;
  subtype?: string;
  categoryRating: number; // 1-10

  // Physical
  widthMm: number;
  depthMm: number;
  heightMm: number;
  enclosure: EnclosureType;
  topJacks: boolean;

  // Signal
  signal: 'mono' | 'stereo';
  buffered: boolean;
  bypassType: 'true' | 'buffered' | 'selectable';

  // Power
  voltage: number;
  currentMa: number;
  centerNegative: boolean;

  // Commerce
  msrp: number;
  reverbPrice: number;
  reverbRating: number;
}
```

## Adding More Pedals

Edit `src/data/pedals.ts` to add more pedals to the database. Follow the existing pattern and ensure all required fields are populated.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for your own projects.

---

Built with 🎸 by musicians, for musicians.

