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
      const GOOGLE_SCRIPT_URL = import.meta.env.VITE_PEDAL_REQUEST_URL;
      
      if (!GOOGLE_SCRIPT_URL) {
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

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand: brand.trim(),
          model: model.trim(),
          timestamp: new Date().toISOString(),
        }),
      });

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
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={handleClose}
      />
      
      <div 
        className="relative bg-white w-full max-w-md overflow-hidden"
        style={{ border: '4px solid black', boxShadow: '8px 8px 0px black' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 bg-board-teal text-white"
          style={{ borderBottom: '4px solid black' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 bg-white flex items-center justify-center font-black text-black"
              style={{ border: '3px solid black' }}
            >
              +
            </div>
            <div>
              <h2 className="text-lg font-black uppercase">Request Pedal</h2>
              <p className="text-xs text-white/80 font-bold">We'll add it!</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-white text-black hover:bg-gray-100"
            style={{ border: '2px solid black' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div 
                className="w-16 h-16 bg-board-success flex items-center justify-center mb-4"
                style={{ border: '3px solid black' }}
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-black text-black mb-2 uppercase">Submitted!</h3>
              <p className="text-sm text-black/60 font-bold">Thanks for the suggestion.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Boss, Strymon, JHS..."
                  className="w-full px-4 py-3 bg-white text-black placeholder-black/40 focus:outline-none font-bold"
                  style={{ border: '3px solid black' }}
                  disabled={loading}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g., DD-8, Timeline, Morning Glory..."
                  className="w-full px-4 py-3 bg-white text-black placeholder-black/40 focus:outline-none font-bold"
                  style={{ border: '3px solid black' }}
                  disabled={loading}
                />
              </div>

              {error && (
                <div 
                  className="flex items-center gap-2 p-3 bg-red-100 text-red-700 text-sm font-bold"
                  style={{ border: '2px solid black' }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !brand.trim() || !model.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-board-teal text-white font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                style={{ border: '3px solid black', boxShadow: '4px 4px 0px black' }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit
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
