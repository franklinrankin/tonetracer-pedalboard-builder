import { BoardProvider } from './context/BoardContext';
import { Header } from './components/Header';
import { ConstraintsPanel } from './components/ConstraintsPanel';
import { BoardStats } from './components/BoardStats';
import { BoardBuilder } from './components/BoardBuilder';
import { SectionScores } from './components/SectionScores';
import { PedalCatalog } from './components/PedalCatalog';
import { EducationalTips } from './components/EducationalTips';
import { Recommendations } from './components/Recommendations';

function App() {
  return (
    <BoardProvider>
      <div className="min-h-screen bg-board-dark">
        {/* Noise overlay for texture */}
        <div className="noise-overlay" />
        
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-board-accent/5 via-transparent to-board-highlight/5 pointer-events-none" />
        
        <Header />
        
        <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12 animate-slideIn">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Build Your Dream</span>
                <br />
                <span className="text-white">Pedalboard</span>
              </h1>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                Plan, visualize, and optimize your guitar pedalboard with real-world constraints.
                See what fits, stay on budget, and learn along the way.
              </p>
            </div>
            
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar - Constraints & Stats */}
              <div className="lg:col-span-3 space-y-6 stagger-children">
                <ConstraintsPanel />
                <BoardStats />
                <EducationalTips />
              </div>
              
              {/* Main Content - Board Builder & Catalog */}
              <div className="lg:col-span-6 space-y-6 stagger-children">
                <BoardBuilder />
                <div id="catalog">
                  <PedalCatalog />
                </div>
              </div>
              
              {/* Right Sidebar - Scores & Recommendations */}
              <div className="lg:col-span-3 space-y-6 stagger-children">
                <SectionScores />
                <Recommendations />
              </div>
            </div>
            
            {/* Footer Info */}
            <footer className="mt-16 text-center text-sm text-board-muted">
              <p className="mb-2">
                ToneTracer helps you build pedalboards that actually fit your space and budget.
              </p>
              <p>
                Prices reflect typical Reverb.com market values. Actual prices may vary.
              </p>
            </footer>
          </div>
        </main>
      </div>
    </BoardProvider>
  );
}

export default App;

