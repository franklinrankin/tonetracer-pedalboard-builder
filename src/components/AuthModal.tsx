import { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'signin' | 'signup' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { signIn, signUp, resetPassword, isConfigured } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        if (username.length < 3) {
          setError('Username must be at least 3 characters');
          setLoading(false);
          return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          setError('Username can only contain letters, numbers, and underscores');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          setError(error.message);
        } else {
          // Account created and auto-signed in (email confirmation disabled)
          onClose();
        }
      } else if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Check your email for a password reset link!');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  if (!isConfigured) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-theme-surface max-w-md w-full p-6"
          style={{ border: '4px solid black', boxShadow: '8px 8px 0px black' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-theme uppercase">Authentication</h2>
            <button 
              onClick={onClose} 
              className="p-2 bg-theme-surface text-theme hover:bg-gray-100"
              style={{ border: '2px solid black' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-board-warning mx-auto mb-4" />
            <p className="text-theme-muted font-bold">
              Authentication is not configured. Please set up Supabase credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-theme-surface max-w-md w-full overflow-hidden"
        style={{ border: '4px solid black', boxShadow: '8px 8px 0px black' }}
      >
        {/* Header */}
        <div className="p-6 bg-board-accent text-white" style={{ borderBottom: '4px solid black' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 bg-theme-surface text-theme hover:bg-gray-100"
              style={{ border: '2px solid black' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-white/80 mt-1 font-bold">
            {mode === 'signin' && 'Sign in to save your boards'}
            {mode === 'signup' && 'Join to save and share your pedalboards'}
            {mode === 'forgot' && "We'll send you a reset link"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error/Success Messages */}
          {error && (
            <div 
              className="mb-4 p-3 bg-red-100 flex items-start gap-2"
              style={{ border: '2px solid black' }}
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-bold">{error}</p>
            </div>
          )}
          {success && (
            <div 
              className="mb-4 p-3 bg-green-100"
              style={{ border: '2px solid black' }}
            >
              <p className="text-sm text-green-700 font-bold">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-bold text-theme mb-1.5 uppercase">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="your_username"
                    className="w-full pl-11 pr-4 py-3 bg-theme-surface text-theme placeholder-black/40 focus:outline-none font-bold"
                    style={{ border: '3px solid var(--color-board-border)' }}
                  />
                </div>
                <p className="text-xs text-theme-muted mt-1 font-bold">Letters, numbers, and underscores only</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-theme mb-1.5 uppercase">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-theme-surface text-theme placeholder-black/40 focus:outline-none font-bold"
                  style={{ border: '3px solid var(--color-board-border)' }}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-bold text-theme mb-1.5 uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-theme-surface text-theme placeholder-black/40 focus:outline-none font-bold"
                    style={{ border: '3px solid var(--color-board-border)' }}
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-bold text-theme mb-1.5 uppercase">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-theme-surface text-theme placeholder-black/40 focus:outline-none font-bold"
                    style={{ border: '3px solid var(--color-board-border)' }}
                  />
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-board-accent font-bold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-board-accent text-white font-black uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:-translate-y-0.5"
              style={{ border: '3px solid var(--color-board-border)', boxShadow: '4px 4px 0px black' }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Send Reset Link'}
            </button>
          </form>

          {/* Mode Switch */}
          <div className="mt-6 text-center text-sm">
            {mode === 'signin' && (
              <p className="text-theme-muted font-bold">
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-board-accent hover:underline">
                  Sign up
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-theme-muted font-bold">
                Already have an account?{' '}
                <button onClick={() => setMode('signin')} className="text-board-accent hover:underline">
                  Sign in
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <p className="text-theme-muted font-bold">
                Remember your password?{' '}
                <button onClick={() => setMode('signin')} className="text-board-accent hover:underline">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
