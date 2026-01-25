import { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'bug' | 'suggestion' | 'other';

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter your feedback');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Google Apps Script Web App URL (same as pedal requests)
      const GOOGLE_SCRIPT_URL = import.meta.env.VITE_FEEDBACK_URL || import.meta.env.VITE_PEDAL_REQUEST_URL;
      
      if (!GOOGLE_SCRIPT_URL) {
        // Fallback: just show success (for development)
        console.log('Feedback:', { type, message: message.trim() });
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setMessage('');
          setType('suggestion');
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
          feedbackType: type,
          feedback: message.trim(),
          timestamp: new Date().toISOString(),
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setMessage('');
        setType('suggestion');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    }

    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setMessage('');
      setType('suggestion');
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Help Make Boardsie Better</h2>
              <p className="text-xs text-zinc-400">Share your feedback with us</p>
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
              <h3 className="text-lg font-semibold text-white mb-2">Feedback Submitted!</h3>
              <p className="text-sm text-zinc-400">Thanks for helping make Boardsie better.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  What type of feedback?
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'bug', label: '🐛 Bug', color: 'red' },
                    { id: 'suggestion', label: '✨ Suggestion', color: 'violet' },
                    { id: 'other', label: '💬 Other', color: 'zinc' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setType(option.id as FeedbackType)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        type === option.id
                          ? option.color === 'red'
                            ? 'bg-red-500/20 border-red-500/50 text-red-300 border'
                            : option.color === 'violet'
                              ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 border'
                              : 'bg-zinc-500/20 border-zinc-500/50 text-zinc-300 border'
                          : 'bg-board-elevated border border-board-border text-zinc-400 hover:text-white hover:border-zinc-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Your feedback
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === 'bug' 
                      ? "Describe the bug you found..." 
                      : type === 'suggestion'
                        ? "Share your idea or suggestion..."
                        : "What's on your mind?"
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-board-elevated border border-board-border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
                  disabled={loading}
                  autoFocus
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
                disabled={loading || !message.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Feedback
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
