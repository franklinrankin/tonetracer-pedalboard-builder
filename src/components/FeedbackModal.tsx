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
      const GOOGLE_SCRIPT_URL = import.meta.env.VITE_FEEDBACK_URL || import.meta.env.VITE_PEDAL_REQUEST_URL;
      
      if (!GOOGLE_SCRIPT_URL) {
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
          className="flex items-center justify-between p-4 bg-board-purple text-white"
          style={{ borderBottom: '4px solid black' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 bg-white flex items-center justify-center"
              style={{ border: '3px solid black' }}
            >
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h2 className="text-lg font-black uppercase">Feedback</h2>
              <p className="text-xs text-white/80 font-bold">Share your thoughts</p>
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
              <p className="text-sm text-black/60 font-bold">Thanks for helping make Boardsie better.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Type
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'bug', label: '🐛 Bug', color: '#F44336' },
                    { id: 'suggestion', label: '✨ Idea', color: '#9C27B0' },
                    { id: 'other', label: '💬 Other', color: '#607D8B' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setType(option.id as FeedbackType)}
                      className={`flex-1 px-3 py-2 text-sm font-bold transition-all ${
                        type === option.id
                          ? 'text-white -translate-y-0.5'
                          : 'bg-white text-black hover:-translate-y-0.5'
                      }`}
                      style={{ 
                        backgroundColor: type === option.id ? option.color : undefined,
                        border: '3px solid black',
                        boxShadow: type === option.id ? '3px 3px 0px black' : '2px 2px 0px black',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Your Feedback
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === 'bug' 
                      ? "Describe the bug..." 
                      : type === 'suggestion'
                        ? "Share your idea..."
                        : "What's on your mind?"
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-white text-black placeholder-black/40 focus:outline-none font-bold resize-none"
                  style={{ border: '3px solid black' }}
                  disabled={loading}
                  autoFocus
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
                disabled={loading || !message.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-board-purple text-white font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
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
