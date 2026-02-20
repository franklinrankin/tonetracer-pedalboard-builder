import { useState, useRef, useEffect } from 'react';
import { User, LogOut, FolderOpen, ChevronDown, Lightbulb, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserMenuProps {
  onSignInClick: () => void;
  onSavedBoards?: () => void;
  onPedalRequest?: () => void;
  onFeedback?: () => void;
  mobile?: boolean;
}

export function UserMenu({ onSignInClick, onSavedBoards, onPedalRequest, onFeedback, mobile = false }: UserMenuProps) {
  const { user, signOut, loading, isConfigured } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking/touching outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-board-elevated animate-pulse" />
    );
  }

  // Mobile version - inline buttons instead of dropdown
  if (mobile) {
    if (!isConfigured || !user) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onSignInClick}
            className="flex items-center gap-2 px-4 py-2 bg-board-accent text-white rounded-lg text-sm font-medium"
          >
            <User className="w-4 h-4" />
            Sign In
          </button>
          <button
            onClick={onFeedback}
            className="flex items-center gap-2 px-3 py-2 bg-board-elevated text-zinc-300 rounded-lg text-sm"
          >
            <Lightbulb className="w-4 h-4" />
            Feedback
          </button>
          <button
            onClick={onPedalRequest}
            className="flex items-center gap-2 px-3 py-2 bg-board-elevated text-zinc-300 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Request Pedal
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 px-2 py-1">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-board-accent flex items-center justify-center text-sm font-bold text-white">
              {(user.user_metadata?.username || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white text-sm truncate">
              {user.user_metadata?.username || user.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onSavedBoards}
            className="flex items-center gap-2 px-3 py-2 bg-board-elevated text-zinc-300 rounded-lg text-sm"
          >
            <FolderOpen className="w-4 h-4" />
            Saved
          </button>
          <button
            onClick={onFeedback}
            className="flex items-center gap-2 px-3 py-2 bg-board-elevated text-zinc-300 rounded-lg text-sm"
          >
            <Lightbulb className="w-4 h-4" />
            Feedback
          </button>
          <button
            onClick={async () => {
              await signOut();
            }}
            className="flex items-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-lg text-sm active:bg-red-500/20 cursor-pointer touch-manipulation"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Show sign in button if not configured or not signed in
  if (!isConfigured || !user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-theme-surface text-theme text-sm font-bold hover:bg-yellow-100 transition-colors"
          style={{ border: '3px solid var(--color-board-border)' }}
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Menu</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div 
            className="absolute right-0 top-full mt-2 w-56 bg-theme-surface overflow-hidden z-50"
            style={{ border: '3px solid var(--color-board-border)', boxShadow: '4px 4px 0px black' }}
          >
            <div className="p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignInClick();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-theme font-bold hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            </div>
            <div className="p-2" style={{ borderTop: '2px solid black' }}>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onFeedback?.();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-theme font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                Help Make Boardsie Better
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onPedalRequest?.();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-theme font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Request a Pedal
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Get display name (prefer username)
  const getDisplayName = () => {
    return user.user_metadata?.username || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
  };

  // Get user initials for avatar
  const getInitials = () => {
    const displayName = getDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 bg-theme-surface hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
        style={{ border: '3px solid var(--color-board-border)' }}
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Avatar"
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div 
            className="w-6 h-6 flex items-center justify-center text-xs font-black text-theme bg-yellow-200 dark:bg-yellow-700"
            style={{ border: '2px solid black' }}
          >
            {getInitials()}
          </div>
        )}
        <span className="hidden sm:block text-sm text-theme font-bold max-w-[100px] truncate">
          {getDisplayName()}
        </span>
        <ChevronDown className={`w-4 h-4 text-theme transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-56 bg-theme-surface overflow-hidden z-50"
          style={{ border: '3px solid var(--color-board-border)', boxShadow: '4px 4px 0px black', pointerEvents: 'auto' }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* User Info */}
          <div className="px-4 py-3" style={{ borderBottom: '2px solid black', backgroundColor: '#FFF9C4' }}>
            <p className="font-bold text-theme truncate">
              {getDisplayName()}
            </p>
            <p className="text-xs text-theme-muted truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onSavedBoards?.();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-theme font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              Saved Boards
            </button>
          </div>

          {/* Feedback */}
          <div className="p-2" style={{ borderTop: '2px solid black' }}>
            <button
              onClick={() => {
                setIsOpen(false);
                onFeedback?.();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-theme font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              Help Make Boardsie Better
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onPedalRequest?.();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-theme font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Request a Pedal
            </button>
          </div>

          {/* Sign Out */}
          <div className="p-2" style={{ borderTop: '2px solid black' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 font-bold hover:bg-red-100 active:bg-red-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
