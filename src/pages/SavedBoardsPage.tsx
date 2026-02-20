import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Calendar, Music, Pencil, FolderOpen, MoreHorizontal, Trash2, Share2, Check, Bookmark, User } from 'lucide-react';
import { SavedBoard } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface BookmarkedBoard {
  id: string;
  board_id: string;
  username: string;
  name: string;
  bookmarkedAt: Date;
}

interface SavedBoardsPageProps {
  onBack: () => void;
  onOpenBoard: (board: SavedBoard) => void;
  savedBoards: SavedBoard[];
  onRenameBoard: (boardId: string, newName: string) => void;
  onDeleteBoard: (boardId: string) => void;
  bookmarks?: BookmarkedBoard[];
  onOpenBookmark?: (bookmark: BookmarkedBoard) => void;
  onRemoveBookmark?: (boardId: string) => void;
}

export function SavedBoardsPage({ 
  onBack, 
  onOpenBoard, 
  savedBoards, 
  onRenameBoard,
  onDeleteBoard,
  bookmarks = [],
  onOpenBookmark,
  onRemoveBookmark
}: SavedBoardsPageProps) {
  const { user } = useAuth();
  const [hoveredBoardId, setHoveredBoardId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [postedBoards, setPostedBoards] = useState<Set<string>>(new Set());
  const [postingId, setPostingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load which boards are already posted
  useEffect(() => {
    const loadPostedBoards = async () => {
      if (!user || !supabase) return;
      const { data } = await supabase
        .from('public_boards')
        .select('board_id')
        .eq('user_id', user.id);
      if (data) {
        setPostedBoards(new Set(data.map(b => b.board_id)));
      }
    };
    loadPostedBoards();
  }, [user]);

  const handlePost = async (board: SavedBoard) => {
    if (!user || !supabase) return;
    
    setPostingId(board.id);
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous';
    
    try {
      if (postedBoards.has(board.id)) {
        // Unpost - delete from public_boards
        await supabase
          .from('public_boards')
          .delete()
          .eq('user_id', user.id)
          .eq('board_id', board.id);
        setPostedBoards(prev => {
          const next = new Set(prev);
          next.delete(board.id);
          return next;
        });
      } else {
        // Post - insert into public_boards
        await supabase
          .from('public_boards')
          .upsert({
            user_id: user.id,
            board_id: board.id,
            username,
            name: board.name,
            genres: board.genres,
            board_data: board.board,
          }, { onConflict: 'user_id,board_id' });
        setPostedBoards(prev => new Set([...prev, board.id]));
      }
    } catch (error) {
      console.error('Error posting board:', error);
    }
    setPostingId(null);
  };

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
          <h2 className="text-2xl font-extrabold text-theme uppercase tracking-tight mb-4">Sign in to view saved boards</h2>
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
      <div className="bg-theme-surface border-b-4 brutal-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-theme hover:text-theme-muted font-bold uppercase transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-3xl font-extrabold text-theme uppercase tracking-tight">Saved Boards</h1>
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
              <FolderOpen className="w-10 h-10 text-theme" />
            </div>
            <h3 className="text-xl font-extrabold text-theme uppercase mb-2">No saved boards yet</h3>
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
                className="relative bg-theme-surface border-4 brutal-border overflow-hidden brutal-shadow-md hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
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
                      className="text-lg font-bold text-theme bg-yellow-100 dark:bg-yellow-900/30 border-2 brutal-border px-2 py-1 w-full focus:outline-none"
                    />
                  ) : (
                    <h3 className="text-lg font-extrabold text-theme uppercase mb-3 truncate">
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
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2 flex-wrap p-4">
                    <button
                      onClick={() => onOpenBoard(savedBoard)}
                      className="flex items-center gap-2 px-3 py-2 bg-teal-400 text-black font-bold uppercase text-sm border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Open
                    </button>
                    <button
                      onClick={() => handlePost(savedBoard)}
                      disabled={postingId === savedBoard.id}
                      className={`flex items-center gap-2 px-3 py-2 font-bold uppercase text-sm border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all ${
                        postedBoards.has(savedBoard.id) 
                          ? 'bg-green-400 text-black' 
                          : 'bg-purple-400 text-black'
                      }`}
                    >
                      {postedBoards.has(savedBoard.id) ? (
                        <>
                          <Check className="w-4 h-4" />
                          Posted
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          Post
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleRename(savedBoard.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-yellow-300 text-black font-bold uppercase text-sm border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
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

        {/* Bookmarked Community Boards Section */}
        {bookmarks.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-300 border-4 border-black flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-theme" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-theme uppercase">Bookmarked Boards</h2>
                <p className="text-sm text-gray-600 font-medium">
                  {bookmarks.length} community {bookmarks.length === 1 ? 'board' : 'boards'} bookmarked
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.board_id}
                  className="relative bg-theme-surface border-4 brutal-border overflow-hidden brutal-shadow-md hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                  onClick={() => onOpenBookmark?.(bookmark)}
                >
                  {/* Bookmark Badge */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-yellow-400 border-2 border-black flex items-center justify-center">
                    <Bookmark className="w-4 h-4 fill-current" />
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-extrabold text-theme uppercase mb-2 truncate pr-10">
                      {bookmark.name}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <User className="w-4 h-4" />
                        <span>by {bookmark.username}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Calendar className="w-4 h-4" />
                        <span>Bookmarked {formatDate(bookmark.bookmarkedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenBookmark?.(bookmark);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-400 text-black font-bold uppercase text-sm border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                      >
                        <FolderOpen className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveBookmark?.(bookmark.board_id);
                        }}
                        className="p-2 bg-red-400 text-black border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
