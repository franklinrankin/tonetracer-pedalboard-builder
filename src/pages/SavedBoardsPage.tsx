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
      <div className="min-h-screen bg-[#FFFEF0] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-black uppercase tracking-tight mb-4">Sign in to view saved boards</h2>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-orange-400 text-black font-bold uppercase border-3 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFEF0]">
      {/* Header */}
      <div className="bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-black hover:text-gray-700 font-bold uppercase transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-3xl font-extrabold text-black uppercase tracking-tight">Saved Boards</h1>
          <p className="text-gray-700 mt-1 font-medium">
            {savedBoards.length} {savedBoards.length === 1 ? 'board' : 'boards'} saved
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {savedBoards.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-yellow-300 border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0_0_#000]">
              <FolderOpen className="w-10 h-10 text-black" />
            </div>
            <h3 className="text-xl font-extrabold text-black uppercase mb-2">No saved boards yet</h3>
            <p className="text-gray-700 mb-6 font-medium">
              Build a pedalboard and save it to see it here
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-teal-400 text-black font-bold uppercase border-3 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              Build a Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedBoards.map((savedBoard) => (
              <div
                key={savedBoard.id}
                className="relative bg-white border-4 border-black overflow-hidden shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
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
                      className="text-lg font-bold text-black bg-yellow-100 border-2 border-black px-2 py-1 w-full focus:outline-none"
                    />
                  ) : (
                    <h3 className="text-lg font-extrabold text-black uppercase mb-3 truncate">
                      {savedBoard.name}
                    </h3>
                  )}

                  {/* Metadata */}
                  <div className="space-y-2">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(savedBoard.createdAt)}</span>
                    </div>

                    {/* Genre or Created Board */}
                    <div className="flex items-center gap-2 text-sm">
                      <Music className="w-4 h-4 text-gray-700" />
                      {savedBoard.genres.length > 0 ? (
                        <span className="text-teal-600 font-bold">
                          {savedBoard.genres.join(' / ')}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">Created Board</span>
                      )}
                    </div>

                    {/* Pedal count */}
                    <div className="text-sm text-gray-600 font-medium">
                      {savedBoard.board.slots.length} pedals • ${savedBoard.board.slots.reduce((sum, s) => sum + s.pedal.reverbPrice, 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Hover Overlay with Actions */}
                {hoveredBoardId === savedBoard.id && !renamingId && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-3">
                    <button
                      onClick={() => onOpenBoard(savedBoard)}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-400 text-black font-bold uppercase border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Open
                    </button>
                    <button
                      onClick={() => handleRename(savedBoard.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-300 text-black font-bold uppercase border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(savedBoard.id)}
                      className="p-2 bg-red-400 text-black border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
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
