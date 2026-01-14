import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Calendar, Music, Pencil, FolderOpen, MoreHorizontal, Trash2 } from 'lucide-react';
import { SavedBoard } from '../types';
import { useAuth } from '../context/AuthContext';

interface SavedBoardsPageProps {
  onBack: () => void;
  onOpenBoard: (board: SavedBoard) => void;
  savedBoards: SavedBoard[];
  onRenameBoard: (boardId: string, newName: string) => void;
  onDeleteBoard: (boardId: string) => void;
}

export function SavedBoardsPage({ 
  onBack, 
  onOpenBoard, 
  savedBoards, 
  onRenameBoard,
  onDeleteBoard 
}: SavedBoardsPageProps) {
  const { user } = useAuth();
  const [hoveredBoardId, setHoveredBoardId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when renaming
  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingId]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRename = (boardId: string) => {
    const board = savedBoards.find(b => b.id === boardId);
    if (board) {
      setRenamingId(boardId);
      setRenameValue(board.name);
      setMenuOpenId(null);
    }
  };

  const submitRename = (boardId: string) => {
    if (renameValue.trim()) {
      onRenameBoard(boardId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleDelete = (boardId: string) => {
    if (confirm('Are you sure you want to delete this board?')) {
      onDeleteBoard(boardId);
    }
    setMenuOpenId(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-board-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view saved boards</h2>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-board-accent text-white rounded-lg hover:bg-board-accent-dim transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-board-bg">
      {/* Header */}
      <div className="bg-board-surface border-b border-board-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-white">Saved Boards</h1>
          <p className="text-zinc-500 mt-1">
            {savedBoards.length} {savedBoards.length === 1 ? 'board' : 'boards'} saved
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {savedBoards.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-board-elevated rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No saved boards yet</h3>
            <p className="text-zinc-500 mb-6">
              Build a pedalboard and save it to see it here
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-board-accent text-white rounded-lg hover:bg-board-accent-dim transition-colors"
            >
              Build a Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedBoards.map((savedBoard) => (
              <div
                key={savedBoard.id}
                className="relative bg-board-elevated border border-board-border rounded-xl overflow-hidden hover:border-board-accent/50 transition-colors"
                onMouseEnter={() => setHoveredBoardId(savedBoard.id)}
                onMouseLeave={() => {
                  setHoveredBoardId(null);
                  if (menuOpenId === savedBoard.id) setMenuOpenId(null);
                }}
              >
                {/* Board Card Content */}
                <div className="p-5">
                  {/* Name */}
                  {renamingId === savedBoard.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => submitRename(savedBoard.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitRename(savedBoard.id);
                        if (e.key === 'Escape') {
                          setRenamingId(null);
                          setRenameValue('');
                        }
                      }}
                      className="text-lg font-semibold text-white bg-board-bg border border-board-accent rounded px-2 py-1 w-full focus:outline-none"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-white mb-3 truncate">
                      {savedBoard.name}
                    </h3>
                  )}

                  {/* Metadata */}
                  <div className="space-y-2">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(savedBoard.createdAt)}</span>
                    </div>

                    {/* Genre or Created Board */}
                    <div className="flex items-center gap-2 text-sm">
                      <Music className="w-4 h-4 text-zinc-400" />
                      {savedBoard.genres.length > 0 ? (
                        <span className="text-board-accent">
                          {savedBoard.genres.join(' / ')}
                        </span>
                      ) : (
                        <span className="text-zinc-500 italic">Created Board</span>
                      )}
                    </div>

                    {/* Pedal count */}
                    <div className="text-sm text-zinc-500">
                      {savedBoard.board.slots.length} pedals • ${savedBoard.board.slots.reduce((sum, s) => sum + s.pedal.reverbPrice, 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Hover Overlay with Actions */}
                {hoveredBoardId === savedBoard.id && !renamingId && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3">
                    <button
                      onClick={() => onOpenBoard(savedBoard)}
                      className="flex items-center gap-2 px-4 py-2 bg-board-accent text-white rounded-lg hover:bg-board-accent-dim transition-colors"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Open
                    </button>
                    <button
                      onClick={() => handleRename(savedBoard.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-board-elevated text-white rounded-lg hover:bg-board-border transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(savedBoard.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Delete board"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
