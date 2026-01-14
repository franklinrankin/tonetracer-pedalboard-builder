import { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface PedalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PedalRequestModal({ isOpen, onClose }: PedalRequestModalProps) {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand.trim() || !model.trim()) {
      setError('Please enter both brand and model');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Google Apps Script Web App URL
      const GOOGLE_SCRIPT_URL = import.meta.env.VITE_PEDAL_REQUEST_URL;
      
      if (!GOOGLE_SCRIPT_URL) {
        // Fallback: just show success (for development)
        console.log('Pedal Request:', { brand: brand.trim(), model: model.trim() });
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setBrand('');
          setModel('');
        }, 2000);
        setLoading(false);
        return;
      }

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script requires no-cors
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand: brand.trim(),
          model: model.trim(),
          timestamp: new Date().toISOString(),
        }),
      });

      // With no-cors, we can't read the response, so assume success
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setBrand('');
        setModel('');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit pedal request:', err);
      setError('Failed to submit request. Please try again.');
    }

    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setBrand('');
      setModel('');
      setError(null);
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-board-surface border border-board-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-board-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-xl">🎸</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Request a Pedal</h2>
              <p className="text-xs text-zinc-400">We'll add it to Boardsie!</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-board-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Request Submitted!</h3>
              <p className="text-sm text-zinc-400">Thanks for helping make Boardsie better.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Boss, Strymon, JHS..."
                  className="w-full px-4 py-3 bg-board-elevated border border-board-border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  disabled={loading}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Model Name
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g., DD-8, Timeline, Morning Glory..."
                  className="w-full px-4 py-3 bg-board-elevated border border-board-border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !brand.trim() || !model.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
