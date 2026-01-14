import { useState, useRef, useEffect } from 'react';
import { User, LogOut, FolderOpen, ChevronDown, UserCircle, Lightbulb, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserMenuProps {
  onSignInClick: () => void;
  onSavedBoards?: () => void;
  onProfile?: () => void;
  onPedalRequest?: () => void;
}

export function UserMenu({ onSignInClick, onSavedBoards, onProfile, onPedalRequest }: UserMenuProps) {
  const { user, signOut, loading, isConfigured } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-board-elevated animate-pulse" />
    );
  }

  // Show sign in button if not configured or not signed in
  if (!isConfigured || !user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-board-elevated border border-board-border rounded-lg text-sm text-white hover:bg-board-border transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Menu</span>
          <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-board-elevated border border-board-border rounded-xl shadow-xl overflow-hidden z-50">
            <div className="p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignInClick();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-board-border rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            </div>
            <div className="p-2 border-t border-board-border">
              <a
                href="mailto:feedback@boardsie.com?subject=Boardsie Feedback&body=Hi Boardsie team,%0A%0A[Please describe your bug or suggestion here]%0A%0AThanks!"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-board-border rounded-lg transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                Help Make Boardsie Better
              </a>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onPedalRequest?.();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-board-border rounded-lg transition-colors"
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
        className="flex items-center gap-2 px-2 py-1.5 bg-board-elevated border border-board-border rounded-lg hover:bg-board-border transition-colors"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Avatar"
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-board-accent flex items-center justify-center text-xs font-bold text-white">
            {getInitials()}
          </div>
        )}
        <span className="hidden sm:block text-sm text-white max-w-[100px] truncate">
          {getDisplayName()}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-board-elevated border border-board-border rounded-xl shadow-xl overflow-hidden z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-board-border">
            <p className="font-medium text-white truncate">
              {getDisplayName()}
            </p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onProfile?.();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-board-border rounded-lg transition-colors"
            >
              <UserCircle className="w-4 h-4" />
              My Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onSavedBoards?.();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-board-border rounded-lg transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              Saved Boards
            </button>
          </div>

          {/* Feedback */}
          <div className="p-2 border-t border-board-border">
            <a
              href="mailto:feedback@boardsie.com?subject=Boardsie Feedback&body=Hi Boardsie team,%0A%0A[Please describe your bug or suggestion here]%0A%0AThanks!"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-board-border rounded-lg transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              Help Make Boardsie Better
            </a>
            <button
              onClick={() => {
                setIsOpen(false);
                onPedalRequest?.();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-board-border rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Request a Pedal
            </button>
          </div>

          {/* Sign Out */}
          <div className="p-2 border-t border-board-border">
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
