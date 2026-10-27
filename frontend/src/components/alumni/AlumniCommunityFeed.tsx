import React, { useState, useEffect } from 'react';
import {
  Users2,
  Send,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Award,
  Briefcase,
  Smile,
  Clock,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';

interface AlumniCommunityFeedProps {
  session: any;
}

export const AlumniCommunityFeed: React.FC<AlumniCommunityFeedProps> = ({ session }) => {
  const userEmail = session?.email || '';
  const userName = session?.name || 'Alumnus';

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [postCategory, setPostCategory] = useState<'GENERAL' | 'ACHIEVEMENT' | 'OPPORTUNITY'>('GENERAL');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/connections/posts');
      const data = await res.json();
      if (data.status === 'success') {
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setPublishing(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/connections/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorEmail: userEmail,
          authorName: userName,
          content: newPostText,
          category: postCategory,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNewPostText('');
        fetchPosts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Users2 className="w-5 h-5 text-indigo-500" />
          Alumni Community & Campus Social Stream
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Share industry milestones, celebrate student achievements, and converse with the wider NEXUS ecosystem.
        </p>
      </div>

      {/* Create Post Box */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 space-y-2">
            <textarea
              rows={3}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder={`What's on your mind, ${userName}? Share an update, advice, or achievement...`}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPostCategory('GENERAL')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    postCategory === 'GENERAL'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  General
                </button>
                <button
                  type="button"
                  onClick={() => setPostCategory('ACHIEVEMENT')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    postCategory === 'ACHIEVEMENT'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Achievement
                </button>
                <button
                  type="button"
                  onClick={() => setPostCategory('OPPORTUNITY')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    postCategory === 'OPPORTUNITY'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Opportunity
                </button>
              </div>

              <button
                onClick={handleCreatePost}
                disabled={publishing || !newPostText.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{publishing ? 'Publishing...' : 'Publish Update'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading community feed...</div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <Users2 className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">No community posts yet. Be the first to share an update!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                    {(post.author_name || post.authorName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {post.author_name || post.authorName || 'Campus Community Member'}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>

                {post.category && (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                    {post.category}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {post.content || post.text}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-6 text-xs text-slate-500">
                <button className="flex items-center gap-1.5 hover:text-rose-600 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes_count || 0} Likes</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>Comments</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
