import { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Users, Grid3X3, Music, MessageSquare, Plus, Send, ChevronLeft, Clock, MessageCircle, ImagePlus, X, Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PEDALS } from '../data/pedals';
import { CATEGORY_INFO } from '../data/categories';
import { PedalImage } from '../components/PedalImage';
import { Pedal } from '../types';

export interface PublicBoard {
  id: string;
  user_id: string;
  board_id: string;
  username: string;
  name: string;
  genres: string[];
  board_data: {
    slots: { pedal: Pedal }[];
  };
  likes_count: number;
  created_at: string;
}

export interface PublicCollection {
  id: string;
  user_id: string;
  username: string;
  pedal_ids: string[];
  updated_at: string;
}

interface ForumPost {
  id: string;
  user_id: string;
  username: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  replies_count: number;
  created_at: string;
}

interface ForumReply {
  id: string;
  post_id: string;
  user_id: string;
  username: string;
  content: string;
  image_url?: string;
  created_at: string;
}

const FORUM_CATEGORIES = [
  { id: 'general', name: 'General Discussion', color: '#6366f1' },
  { id: 'gear', name: 'Gear Talk', color: '#f59e0b' },
  { id: 'builds', name: 'Board Builds', color: '#10b981' },
  { id: 'reviews', name: 'Pedal Reviews', color: '#ec4899' },
  { id: 'help', name: 'Help & Questions', color: '#3b82f6' },
];

interface CommunityPageProps {
  onBack: () => void;
  onViewBoard?: (board: PublicBoard) => void;
  onViewCollection?: (collection: PublicCollection) => void;
  onSignInClick?: () => void;
  initialForumPostId?: string;
}

export function CommunityPage({ onBack, onViewBoard, onViewCollection, onSignInClick, initialForumPostId }: CommunityPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'boards' | 'collections' | 'forum'>(initialForumPostId ? 'forum' : 'boards');
  const [publicBoards, setPublicBoards] = useState<PublicBoard[]>([]);
  const [publicCollections, setPublicCollections] = useState<PublicCollection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Forum state
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [postReplies, setPostReplies] = useState<ForumReply[]>([]);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('general');
  const [newReplyContent, setNewReplyContent] = useState('');
  const [forumFilter, setForumFilter] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Search and filter state
  const [boardSearch, setBoardSearch] = useState('');
  const [boardGenreFilter, setBoardGenreFilter] = useState<string>('all');
  const [boardSizeFilter, setBoardSizeFilter] = useState<string>('all');
  const [boardBudgetMin, setBoardBudgetMin] = useState<number>(0);
  const [boardBudgetMax, setBoardBudgetMax] = useState<number>(10000);
  const [showBoardFilters, setShowBoardFilters] = useState(false);
  const [collectionSearch, setCollectionSearch] = useState('');
  const [forumSearch, setForumSearch] = useState('');

  useEffect(() => {
    loadCommunityData();
  }, []);

  useEffect(() => {
    if (activeTab === 'forum') {
      loadForumPosts();
    }
  }, [activeTab, forumFilter]);

  // Load initial forum post if provided
  useEffect(() => {
    const loadInitialPost = async () => {
      if (!initialForumPostId || !supabase) return;
      
      try {
        const { data } = await supabase
          .from('forum_posts')
          .select('*')
          .eq('id', initialForumPostId)
          .single();
        
        if (data) {
          setSelectedPost(data);
          await loadPostReplies(data.id);
        }
      } catch (e) {
        console.warn('Failed to load forum post:', e);
      }
    };
    loadInitialPost();
  }, [initialForumPostId]);

  const loadCommunityData = async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      // Load public boards
      const { data: boards } = await supabase
        .from('public_boards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (boards) setPublicBoards(boards);

      // Load public collections
      const { data: collections } = await supabase
        .from('public_collections')
        .select('*')
        .eq('is_public', true)
        .order('updated_at', { ascending: false });
      
      if (collections) setPublicCollections(collections);
    } catch (error) {
      console.error('Error loading community data:', error);
    }

    setLoading(false);
  };

  const loadForumPosts = async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      let query = supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (forumFilter !== 'all') {
        query = query.eq('category', forumFilter);
      }

      const { data } = await query;
      if (data) setForumPosts(data);
    } catch (error) {
      console.error('Error loading forum posts:', error);
    }

    setLoading(false);
  };

  const loadPostReplies = async (postId: string) => {
    if (!supabase) return;

    try {
      const { data } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (data) setPostReplies(data);
    } catch (e) {
      console.warn('Failed to load replies:', e);
    }
  };

  const handleViewPost = async (post: ForumPost) => {
    setSelectedPost(post);
    await loadPostReplies(post.id);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!supabase || !user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `forum-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('public-uploads')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('public-uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleCreatePost = async () => {
    if (!user || !supabase || !newPostTitle.trim() || !newPostContent.trim()) return;
    
    setSubmitting(true);
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous';

    try {
      let imageUrl: string | null = null;
      
      // Upload image if selected
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const { error } = await supabase.from('forum_posts').insert({
        user_id: user.id,
        username,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        category: newPostCategory,
        image_url: imageUrl,
      });

      if (!error) {
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostCategory('general');
        setSelectedImage(null);
        setImagePreview(null);
        setShowNewPostForm(false);
        loadForumPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }

    setSubmitting(false);
  };

  const handleReplyImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setReplyImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReplyImage = () => {
    setReplyImage(null);
    setReplyImagePreview(null);
    if (replyFileInputRef.current) {
      replyFileInputRef.current.value = '';
    }
  };

  const handleCreateReply = async () => {
    if (!user || !supabase || !selectedPost || !newReplyContent.trim()) return;
    
    setSubmitting(true);
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous';

    try {
      let imageUrl: string | null = null;
      
      // Upload image if selected
      if (replyImage) {
        imageUrl = await uploadImage(replyImage);
      }

      const { error } = await supabase.from('forum_replies').insert({
        post_id: selectedPost.id,
        user_id: user.id,
        username,
        content: newReplyContent.trim(),
        image_url: imageUrl,
      });

      if (!error) {
        setNewReplyContent('');
        setReplyImage(null);
        setReplyImagePreview(null);
        loadPostReplies(selectedPost.id);
        // Update replies count locally
        setSelectedPost(prev => prev ? { ...prev, replies_count: prev.replies_count + 1 } : null);
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    }

    setSubmitting(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getPedalById = (id: string) => PEDALS.find(p => p.id === id);

  // Get unique genres from all boards
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    publicBoards.forEach(board => {
      board.genres.forEach(g => genres.add(g));
    });
    return Array.from(genres).sort();
  }, [publicBoards]);

  // Filter boards
  const filteredBoards = useMemo(() => {
    return publicBoards.filter(board => {
      // Safety check for board data
      if (!board.board_data?.slots) return false;
      
      // Search filter - search pedal names and brands
      if (boardSearch) {
        const searchLower = boardSearch.toLowerCase();
        const pedals = board.board_data.slots.map(s => s.pedal).filter(Boolean);
        const matchesPedal = pedals.some(p => 
          p && (
            (p.brand || '').toLowerCase().includes(searchLower) ||
            (p.model || '').toLowerCase().includes(searchLower)
          )
        );
        const matchesName = (board.name || '').toLowerCase().includes(searchLower);
        const matchesUser = (board.username || '').toLowerCase().includes(searchLower);
        if (!matchesPedal && !matchesName && !matchesUser) return false;
      }

      // Genre filter
      if (boardGenreFilter !== 'all' && !board.genres?.includes(boardGenreFilter)) {
        return false;
      }

      // Size filter (based on pedal count)
      if (boardSizeFilter !== 'all') {
        const pedalCount = board.board_data.slots.length;
        if (boardSizeFilter === 'small' && pedalCount > 5) return false;
        if (boardSizeFilter === 'medium' && (pedalCount < 6 || pedalCount > 10)) return false;
        if (boardSizeFilter === 'large' && pedalCount < 11) return false;
      }

      // Budget filter
      const totalCost = board.board_data.slots.reduce((sum, s) => sum + (s.pedal?.reverbPrice || 0), 0);
      if (totalCost < boardBudgetMin || totalCost > boardBudgetMax) {
        return false;
      }

      return true;
    });
  }, [publicBoards, boardSearch, boardGenreFilter, boardSizeFilter, boardBudgetMin, boardBudgetMax]);

  // Filter collections
  const filteredCollections = useMemo(() => {
    if (!collectionSearch) return publicCollections;
    
    const searchLower = collectionSearch.toLowerCase();
    return publicCollections.filter(collection => {
      if (!collection.pedal_ids) return false;
      const pedals = collection.pedal_ids.map(id => getPedalById(id)).filter(Boolean);
      const matchesPedal = pedals.some(p => 
        p && (
          (p.brand || '').toLowerCase().includes(searchLower) ||
          (p.model || '').toLowerCase().includes(searchLower)
        )
      );
      const matchesUser = (collection.username || '').toLowerCase().includes(searchLower);
      return matchesPedal || matchesUser;
    });
  }, [publicCollections, collectionSearch]);

  // Filter forum posts (search in title, content, and we'll need to check replies too)
  const filteredForumPosts = useMemo(() => {
    let posts = forumPosts;
    
    // Category filter
    if (forumFilter !== 'all') {
      posts = posts.filter(p => p.category === forumFilter);
    }
    
    // Search filter
    if (forumSearch) {
      const searchLower = forumSearch.toLowerCase();
      posts = posts.filter(post => 
        (post.title || '').toLowerCase().includes(searchLower) ||
        (post.content || '').toLowerCase().includes(searchLower) ||
        (post.username || '').toLowerCase().includes(searchLower)
      );
    }
    
    return posts;
  }, [forumPosts, forumFilter, forumSearch]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFBEB' }}>
      {/* Header */}
      <div className="bg-theme-surface border-b-4 brutal-border p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-yellow-100 transition-colors"
            style={{ border: '3px solid var(--color-board-border)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <h1 className="text-2xl font-black uppercase">Community</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('boards')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-black uppercase transition-colors text-sm sm:text-base ${
              activeTab === 'boards' 
                ? 'bg-black text-white' 
                : 'bg-theme-surface text-theme hover:bg-yellow-100'
            }`}
            style={{ border: '3px solid var(--color-board-border)' }}
          >
            <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
            Boards
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-black uppercase transition-colors text-sm sm:text-base ${
              activeTab === 'collections' 
                ? 'bg-black text-white' 
                : 'bg-theme-surface text-theme hover:bg-yellow-100'
            }`}
            style={{ border: '3px solid var(--color-board-border)' }}
          >
            <Music className="w-4 h-4 sm:w-5 sm:h-5" />
            Collections
          </button>
          <button
            onClick={() => setActiveTab('forum')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-black uppercase transition-colors text-sm sm:text-base ${
              activeTab === 'forum' 
                ? 'bg-black text-white' 
                : 'bg-theme-surface text-theme hover:bg-yellow-100'
            }`}
            style={{ border: '3px solid var(--color-board-border)' }}
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            Forum
          </button>
        </div>

        {loading && activeTab !== 'forum' ? (
          <div className="text-center py-12">
            <div className="text-xl font-bold">Loading...</div>
          </div>
        ) : activeTab === 'boards' ? (
          /* Boards Tab */
          <div>
            {/* Search and Filters */}
            <div className="mb-4 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={boardSearch}
                    onChange={(e) => setBoardSearch(e.target.value)}
                    placeholder="Search boards by pedal, brand, or username..."
                    className="w-full pl-10 pr-4 py-2 font-medium bg-black text-white placeholder-gray-500"
                    style={{ border: '3px solid var(--color-board-border)' }}
                  />
                </div>
                <button
                  onClick={() => setShowBoardFilters(!showBoardFilters)}
                  className={`px-4 py-2 font-bold flex items-center gap-2 transition-colors ${
                    showBoardFilters ? 'bg-black text-white' : 'bg-theme-surface text-theme hover:bg-gray-100'
                  }`}
                  style={{ border: '3px solid var(--color-board-border)' }}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
              </div>
              
              {showBoardFilters && (
                <div 
                  className="p-4 bg-theme-surface space-y-3"
                  style={{ border: '3px solid var(--color-board-border)' }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Genre Filter */}
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Genre</label>
                      <select
                        value={boardGenreFilter}
                        onChange={(e) => setBoardGenreFilter(e.target.value)}
                        className="w-full px-3 py-2 font-medium"
                        style={{ border: '2px solid var(--color-board-border)' }}
                      >
                        <option value="all">All Genres</option>
                        {allGenres.map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Size Filter */}
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Board Size</label>
                      <select
                        value={boardSizeFilter}
                        onChange={(e) => setBoardSizeFilter(e.target.value)}
                        className="w-full px-3 py-2 font-medium"
                        style={{ border: '2px solid var(--color-board-border)' }}
                      >
                        <option value="all">All Sizes</option>
                        <option value="small">Small (1-5 pedals)</option>
                        <option value="medium">Medium (6-10 pedals)</option>
                        <option value="large">Large (11+ pedals)</option>
                      </select>
                    </div>
                    
                    {/* Budget Range */}
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Budget Range</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={boardBudgetMin}
                          onChange={(e) => setBoardBudgetMin(Number(e.target.value))}
                          placeholder="Min"
                          className="w-full px-2 py-2 font-medium text-sm"
                          style={{ border: '2px solid var(--color-board-border)' }}
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          value={boardBudgetMax}
                          onChange={(e) => setBoardBudgetMax(Number(e.target.value))}
                          placeholder="Max"
                          className="w-full px-2 py-2 font-medium text-sm"
                          style={{ border: '2px solid var(--color-board-border)' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setBoardSearch('');
                      setBoardGenreFilter('all');
                      setBoardSizeFilter('all');
                      setBoardBudgetMin(0);
                      setBoardBudgetMax(10000);
                    }}
                    className="text-sm font-bold text-gray-500 hover:text-theme"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {filteredBoards.length === 0 ? (
              <div 
                className="bg-theme-surface p-8 text-center"
                style={{ border: '4px solid var(--color-board-border)', boxShadow: '6px 6px 0 var(--color-board-shadow)' }}
              >
                <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-black mb-2">
                  {publicBoards.length === 0 ? 'No Boards Shared Yet' : 'No Boards Match Your Search'}
                </h3>
                <p className="text-gray-600">
                  {publicBoards.length === 0 
                    ? 'Be the first to share your pedalboard with the community!'
                    : 'Try adjusting your search or filters.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBoards.map(board => (
                  <div 
                    key={board.id}
                    onClick={() => onViewBoard?.(board)}
                    className="bg-theme-surface p-4 hover:translate-x-1 hover:-translate-y-1 transition-transform cursor-pointer"
                    style={{ border: '4px solid var(--color-board-border)', boxShadow: '6px 6px 0 var(--color-board-shadow)' }}
                  >
                    {/* User info */}
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-black">
                      <div 
                        className="w-8 h-8 flex items-center justify-center bg-yellow-200 font-black"
                        style={{ border: '2px solid var(--color-board-border)' }}
                      >
                        {board.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold">{board.username}</span>
                    </div>
                    
                    {/* Board name */}
                    <h3 className="font-black text-lg mb-2">{board.name}</h3>
                    
                    {/* Genres */}
                    {board.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {board.genres.slice(0, 2).map(genre => (
                          <span 
                            key={genre}
                            className="px-2 py-0.5 text-xs font-bold bg-gray-100"
                            style={{ border: '2px solid var(--color-board-border)' }}
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Pedal preview */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {board.board_data.slots.slice(0, 6).map((slot, i) => {
                        const catInfo = CATEGORY_INFO[slot.pedal.category];
                        return (
                          <div 
                            key={i}
                            className="w-10 h-10 flex items-center justify-center"
                            style={{ backgroundColor: `${catInfo.color}30`, border: '2px solid var(--color-board-border)' }}
                          >
                            <PedalImage pedalId={slot.pedal.id} category={slot.pedal.category} size="sm" />
                          </div>
                        );
                      })}
                      {board.board_data.slots.length > 6 && (
                        <div 
                          className="w-10 h-10 flex items-center justify-center bg-gray-100 font-bold text-xs"
                          style={{ border: '2px solid var(--color-board-border)' }}
                        >
                          +{board.board_data.slots.length - 6}
                        </div>
                      )}
                    </div>
                    
                    {/* Stats */}
                    <div className="text-sm text-gray-600 font-medium">
                      {board.board_data.slots.length} pedals
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'collections' ? (
          /* Collections Tab */
          <div>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={collectionSearch}
                  onChange={(e) => setCollectionSearch(e.target.value)}
                  placeholder="Search collections by pedal, brand, or username..."
                  className="w-full pl-10 pr-4 py-2 font-medium bg-black text-white placeholder-gray-500"
                  style={{ border: '3px solid var(--color-board-border)' }}
                />
              </div>
            </div>

            {filteredCollections.length === 0 ? (
              <div 
                className="bg-theme-surface p-8 text-center"
                style={{ border: '4px solid var(--color-board-border)', boxShadow: '6px 6px 0 var(--color-board-shadow)' }}
              >
                <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-black mb-2">
                  {publicCollections.length === 0 ? 'No Public Collections Yet' : 'No Collections Match Your Search'}
                </h3>
                <p className="text-gray-600">
                  {publicCollections.length === 0 
                    ? 'Make your collection public to share it with the community!'
                    : 'Try a different search term.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCollections.map(collection => {
                  const pedals = collection.pedal_ids
                    .map(id => getPedalById(id))
                    .filter((p): p is Pedal => p !== undefined);
                  
                  // Get category breakdown
                  const categories = pedals.reduce((acc, p) => {
                    acc[p.category] = (acc[p.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  return (
                    <div 
                      key={collection.id}
                      onClick={() => onViewCollection?.(collection)}
                      className="bg-theme-surface p-4 hover:translate-x-1 hover:-translate-y-1 transition-transform cursor-pointer"
                      style={{ border: '4px solid var(--color-board-border)', boxShadow: '6px 6px 0 var(--color-board-shadow)' }}
                    >
                      {/* User info */}
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-black">
                        <div 
                          className="w-8 h-8 flex items-center justify-center bg-purple-200 font-black"
                          style={{ border: '2px solid var(--color-board-border)' }}
                        >
                          {collection.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold">{collection.username}'s Collection</span>
                      </div>
                      
                      {/* Stats */}
                      <div className="mb-3">
                        <span className="text-2xl font-black">{pedals.length}</span>
                        <span className="text-gray-600 ml-2">pedals</span>
                      </div>
                      
                      {/* Category breakdown */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {Object.entries(categories).slice(0, 4).map(([cat, count]) => {
                          const catInfo = CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO];
                          return (
                            <span 
                              key={cat}
                              className="px-2 py-0.5 text-xs font-bold text-white"
                              style={{ backgroundColor: catInfo?.color || '#666', border: '2px solid var(--color-board-border)' }}
                            >
                              {count} {catInfo?.displayName || cat}
                            </span>
                          );
                        })}
                      </div>
                      
                      {/* Pedal preview */}
                      <div className="flex flex-wrap gap-1">
                        {pedals.slice(0, 8).map((pedal, i) => (
                          <div 
                            key={i}
                            className="w-8 h-8 overflow-hidden"
                            style={{ border: '2px solid var(--color-board-border)' }}
                          >
                            <PedalImage pedalId={pedal.id} category={pedal.category} size="sm" />
                          </div>
                        ))}
                        {pedals.length > 8 && (
                          <div 
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 font-bold text-xs"
                            style={{ border: '2px solid var(--color-board-border)' }}
                          >
                            +{pedals.length - 8}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'forum' ? (
          /* Forum Tab */
          <div>
            {/* Forum Header */}
            {!selectedPost && !showNewPostForm && (
              <div className="space-y-3 mb-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={forumSearch}
                    onChange={(e) => setForumSearch(e.target.value)}
                    placeholder="Search posts by title, content, or username..."
                    className="w-full pl-10 pr-4 py-2 font-medium bg-black text-white placeholder-gray-500"
                    style={{ border: '3px solid var(--color-board-border)' }}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 flex-1">
                  <button
                    onClick={() => setForumFilter('all')}
                    className={`px-3 py-2 text-sm font-bold uppercase transition-colors ${
                      forumFilter === 'all' ? 'bg-black text-white' : 'bg-theme-surface text-theme hover:bg-gray-100'
                    }`}
                    style={{ border: '2px solid var(--color-board-border)' }}
                  >
                    All
                  </button>
                  {FORUM_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setForumFilter(cat.id)}
                      className={`px-3 py-2 text-sm font-bold uppercase transition-colors ${
                        forumFilter === cat.id ? 'text-white' : 'bg-theme-surface text-theme hover:opacity-80'
                      }`}
                      style={{ 
                        border: '2px solid var(--color-board-border)',
                        backgroundColor: forumFilter === cat.id ? cat.color : undefined
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                
                {/* New Post Button */}
                <button
                  onClick={() => {
                    if (!user) {
                      onSignInClick?.();
                    } else {
                      setShowNewPostForm(true);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-400 text-black font-black uppercase hover:bg-green-500 transition-colors"
                  style={{ border: '3px solid var(--color-board-border)', boxShadow: '3px 3px 0 var(--color-board-shadow)' }}
                >
                  <Plus className="w-5 h-5" />
                  New Post
                </button>
                </div>
              </div>
            )}

            {/* New Post Form */}
            {showNewPostForm && (
              <div 
                className="bg-theme-surface p-6 mb-6"
                style={{ border: '4px solid var(--color-board-border)', boxShadow: '6px 6px 0 var(--color-board-shadow)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black uppercase">Create New Post</h3>
                  <button
                    onClick={() => setShowNewPostForm(false)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    style={{ border: '2px solid var(--color-board-border)' }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Category Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-bold uppercase mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {FORUM_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setNewPostCategory(cat.id)}
                        className={`px-3 py-1.5 text-sm font-bold transition-colors ${
                          newPostCategory === cat.id ? 'text-white' : 'bg-theme-surface text-theme'
                        }`}
                        style={{ 
                          border: '2px solid var(--color-board-border)',
                          backgroundColor: newPostCategory === cat.id ? cat.color : undefined
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-bold uppercase mb-2">Title</label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full px-4 py-3 text-lg font-bold"
                    style={{ border: '3px solid var(--color-board-border)' }}
                  />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <label className="block text-sm font-bold uppercase mb-2">Content</label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={6}
                    className="w-full px-4 py-3 font-medium resize-none"
                    style={{ border: '3px solid var(--color-board-border)' }}
                  />
                </div>

                {/* Image Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-bold uppercase mb-2">Photo (Optional)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-xs max-h-48 object-cover"
                        style={{ border: '3px solid var(--color-board-border)' }}
                      />
                      <button
                        onClick={removeSelectedImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        style={{ border: '2px solid var(--color-board-border)' }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors font-bold"
                      style={{ border: '3px solid var(--color-board-border)' }}
                    >
                      <ImagePlus className="w-5 h-5" />
                      Add Photo
                    </button>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Max 5MB. JPG, PNG, GIF supported.</p>
                </div>

                {/* Submit */}
                <button
                  onClick={handleCreatePost}
                  disabled={submitting || !newPostTitle.trim() || !newPostContent.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-green-400 text-black font-black uppercase hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ border: '3px solid var(--color-board-border)', boxShadow: '3px 3px 0 var(--color-board-shadow)' }}
                >
                  <Send className="w-5 h-5" />
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            )}

            {/* Selected Post View */}
            {selectedPost && (
              <div>
                {/* Back Button */}
                <button
                  onClick={() => {
                    setSelectedPost(null);
                    setPostReplies([]);
                  }}
                  className="flex items-center gap-2 mb-4 px-4 py-2 bg-theme-surface font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  style={{ border: '3px solid var(--color-board-border)' }}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back to Forum
                </button>

                {/* Post Content */}
                <div 
                  className="bg-theme-surface p-6 mb-6"
                  style={{ border: '4px solid var(--color-board-border)', boxShadow: '6px 6px 0 var(--color-board-shadow)' }}
                >
                  {/* Category Badge */}
                  {(() => {
                    const cat = FORUM_CATEGORIES.find(c => c.id === selectedPost.category);
                    return cat ? (
                      <span 
                        className="inline-block px-3 py-1 text-xs font-bold text-white uppercase mb-3"
                        style={{ backgroundColor: cat.color, border: '2px solid var(--color-board-border)' }}
                      >
                        {cat.name}
                      </span>
                    ) : null;
                  })()}
                  
                  <h2 className="text-2xl font-black mb-4">{selectedPost.title}</h2>
                  
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-black">
                    <div 
                      className="w-10 h-10 flex items-center justify-center bg-blue-200 font-black"
                      style={{ border: '2px solid var(--color-board-border)' }}
                    >
                      {selectedPost.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold">{selectedPost.username}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(selectedPost.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-lg max-w-none whitespace-pre-wrap">
                    {selectedPost.content}
                  </div>

                  {/* Post Image */}
                  {selectedPost.image_url && (
                    <div className="mt-4 pt-4 border-t-2 border-black">
                      <img 
                        src={selectedPost.image_url} 
                        alt="Post image" 
                        className="w-24 h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ border: '2px solid var(--color-board-border)' }}
                        onClick={() => setLightboxImage(selectedPost.image_url!)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Click to view full size</p>
                    </div>
                  )}
                </div>

                {/* Replies Section */}
                <div 
                  className="bg-theme-surface p-6"
                  style={{ border: '4px solid var(--color-board-border)', boxShadow: '6px 6px 0 var(--color-board-shadow)' }}
                >
                  <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Replies ({selectedPost.replies_count})
                  </h3>

                  {/* Reply Form */}
                  {user ? (
                    <div className="mb-6 pb-6 border-b-2 border-black">
                      <textarea
                        value={newReplyContent}
                        onChange={(e) => setNewReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        rows={3}
                        className="w-full px-4 py-3 font-medium resize-none mb-3"
                        style={{ border: '3px solid var(--color-board-border)' }}
                      />
                      
                      {/* Reply Image Upload */}
                      <input
                        type="file"
                        ref={replyFileInputRef}
                        accept="image/*"
                        onChange={handleReplyImageSelect}
                        className="hidden"
                      />
                      
                      {replyImagePreview ? (
                        <div className="relative inline-block mb-3">
                          <img 
                            src={replyImagePreview} 
                            alt="Preview" 
                            className="max-w-xs max-h-32 object-cover"
                            style={{ border: '2px solid var(--color-board-border)' }}
                          />
                          <button
                            onClick={removeReplyImage}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                            style={{ border: '2px solid var(--color-board-border)' }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null}
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => replyFileInputRef.current?.click()}
                          className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors font-bold text-sm"
                          style={{ border: '2px solid var(--color-board-border)' }}
                        >
                          <ImagePlus className="w-4 h-4" />
                          Photo
                        </button>
                        <button
                          onClick={handleCreateReply}
                          disabled={submitting || !newReplyContent.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-theme font-bold uppercase hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ border: '2px solid var(--color-board-border)' }}
                        >
                          <Send className="w-4 h-4" />
                          {submitting ? 'Sending...' : 'Reply'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 pb-6 border-b-2 border-black">
                      <button
                        onClick={onSignInClick}
                        className="px-4 py-2 bg-yellow-300 text-theme font-bold hover:bg-yellow-400 transition-colors"
                        style={{ border: '2px solid var(--color-board-border)' }}
                      >
                        Sign in to reply
                      </button>
                    </div>
                  )}

                  {/* Replies List */}
                  <div className="space-y-4">
                    {postReplies.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No replies yet. Be the first to reply!</p>
                    ) : (
postReplies.map(reply => (
                                        <div 
                                          key={reply.id}
                                          className="p-4 bg-gray-50"
                                          style={{ border: '2px solid var(--color-board-border)' }}
                                        >
                                          <div className="flex items-center gap-2 mb-2">
                                            <div 
                                              className="w-8 h-8 flex items-center justify-center bg-purple-200 font-bold text-sm"
                                              style={{ border: '2px solid var(--color-board-border)' }}
                                            >
                                              {reply.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold">{reply.username}</span>
                                            <span className="text-sm text-gray-500">• {formatTimeAgo(reply.created_at)}</span>
                                          </div>
                                          <p className="whitespace-pre-wrap">{reply.content}</p>
                                          {reply.image_url && (
                                            <img 
                                              src={reply.image_url} 
                                              alt="Reply image" 
                                              className="mt-3 w-20 h-20 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                              style={{ border: '2px solid var(--color-board-border)' }}
                                              onClick={() => setLightboxImage(reply.image_url!)}
                                            />
                                          )}
                                        </div>
                                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Posts List */}
            {!selectedPost && !showNewPostForm && (
              <div>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-xl font-bold">Loading...</div>
                  </div>
                ) : filteredForumPosts.length === 0 ? (
                  <div 
                    className="bg-theme-surface p-8 text-center"
                    style={{ border: '4px solid var(--color-board-border)', boxShadow: '6px 6px 0 var(--color-board-shadow)' }}
                  >
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-black mb-2">
                      {forumPosts.length === 0 ? 'No Posts Yet' : 'No Posts Match Your Search'}
                    </h3>
                    <p className="text-gray-600">
                      {forumPosts.length === 0 
                        ? 'Start the conversation by creating the first post!'
                        : 'Try a different search term or category.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredForumPosts.map(post => {
                      const cat = FORUM_CATEGORIES.find(c => c.id === post.category);
                      return (
                        <div 
                          key={post.id}
                          onClick={() => handleViewPost(post)}
                          className="bg-theme-surface p-4 hover:translate-x-1 hover:-translate-y-1 transition-transform cursor-pointer"
                          style={{ border: '4px solid var(--color-board-border)', boxShadow: '4px 4px 0 var(--color-board-shadow)' }}
                        >
<div className="flex items-start gap-4">
                                            {/* User Avatar */}
                                            <div 
                                              className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-200 font-black"
                                              style={{ border: '2px solid var(--color-board-border)' }}
                                            >
                                              {post.username.charAt(0).toUpperCase()}
                                            </div>
                                            
                                            {/* Post Content */}
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                {cat && (
                                                  <span 
                                                    className="px-2 py-0.5 text-xs font-bold text-white uppercase"
                                                    style={{ backgroundColor: cat.color, border: '1px solid black' }}
                                                  >
                                                    {cat.name}
                                                  </span>
                                                )}
                                                <span className="font-bold text-sm">{post.username}</span>
                                                <span className="text-sm text-gray-500">• {formatTimeAgo(post.created_at)}</span>
                                              </div>
                                              
                                              <h3 className="font-black text-lg mb-1 truncate">{post.title}</h3>
                                              <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>
                                              
                                              {/* Stats */}
                                              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                  <MessageCircle className="w-4 h-4" />
                                                  {post.replies_count} {post.replies_count === 1 ? 'reply' : 'replies'}
                                                </span>
                                              </div>
                                            </div>
                                            
                                            {/* Post Thumbnail */}
                                            {post.image_url && (
                                              <div 
                                                className="w-20 h-20 flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                                style={{ border: '2px solid var(--color-board-border)' }}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setLightboxImage(post.image_url!);
                                                }}
                                              >
                                                <img 
                                                  src={post.image_url} 
                                                  alt="" 
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>
                                            )}
                                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={lightboxImage} 
              alt="Full size" 
              className="max-w-full max-h-[85vh] object-contain"
              style={{ border: '4px solid white' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
