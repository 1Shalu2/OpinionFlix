import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchMovieDetails, getBackdropUrl, getPosterUrl, getComments, getSentimentCounts, getEmotionAnalytics, getReviewSummary, submitReview } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SentimentPie from '../components/charts/SentimentPie';
import EmotionBar from '../components/charts/EmotionBar';
import SentimentProgress from '../components/charts/SentimentProgress';
import TrailerModal from '../components/movie/TrailerModal';
import { MovieDetailSkeleton } from '../components/ui/Skeleton';
import { FiPlay, FiBookmark, FiHeart, FiStar, FiCalendar, FiClock, FiSend, FiAlertTriangle } from 'react-icons/fi';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addToRecentlyViewed, addToWatchlist, removeFromWatchlist, isInWatchlist, toggleFavorite, isFavorite } = useAuth();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [positive, setPositive] = useState(0);
  const [negative, setNegative] = useState(0);
  const [emotions, setEmotions] = useState(null);
  const [summary, setSummary] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const m = await fetchMovieDetails(id);
        setMovie(m);
        addToRecentlyViewed({ id: m.id, title: m.title, poster_path: m.poster_path, vote_average: m.vote_average, release_date: m.release_date });
      } catch { /* ignore */ }

      try {
        const [c, s] = await Promise.all([getComments(id), getSentimentCounts(id)]);
        setComments(c || []);
        setPositive(s?.positive_count || 0);
        setNegative(s?.negative_count || 0);
      } catch { /* backend may be offline */ }

      try { const e = await getEmotionAnalytics(id); if (e) setEmotions(e); } catch {}
      try { const s = await getReviewSummary(id); if (s) setSummary(s); } catch {}

      setLoading(false);
    };
    load();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    setSubmitting(true);
    try {
      await submitReview(comment, id, user.username);
      setComment('');
      const [c, s] = await Promise.all([getComments(id), getSentimentCounts(id)]);
      setComments(c || []);
      setPositive(s?.positive_count || 0);
      setNegative(s?.negative_count || 0);
      try { const e = await getEmotionAnalytics(id); if (e) setEmotions(e); } catch {}
      try { const sm = await getReviewSummary(id); if (sm) setSummary(sm); } catch {}
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="section-container pt-8"><MovieDetailSkeleton /></div>;
  if (!movie) return <div className="section-container pt-8 text-center py-20"><p className="text-white/40 text-lg">Movie not found</p></div>;

  const trailerKey = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key;
  const backdrop = getBackdropUrl(movie.backdrop_path);
  const poster = getPosterUrl(movie.poster_path);
  const inWatchlist = isInWatchlist(movie.id);
  const fav = isFavorite(movie.id);
  const rating = positive + negative > 0 ? Math.round((positive / (positive + negative)) * 100) : null;

  return (
    <div className="min-h-screen">
      {/* Hero Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {backdrop && <img src={backdrop} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="section-container -mt-48 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Poster */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1">
            <div className="relative rounded-2xl overflow-hidden shadow-glass border border-white/10">
              {poster ? <img src={poster} alt={movie.title} className="w-full" /> : <div className="aspect-[2/3] bg-surface-light flex items-center justify-center text-6xl">🎬</div>}
            </div>
            {/* Actions */}
            <div className="flex gap-3 mt-4">
              {trailerKey && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowTrailer(true)} className="btn-neon flex-1 flex items-center justify-center gap-2 text-sm">
                  <FiPlay /> Trailer
                </motion.button>
              )}
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => inWatchlist ? removeFromWatchlist(movie.id) : addToWatchlist(movie)} className={`flex-1 flex items-center justify-center gap-2 text-sm rounded-xl py-3 font-semibold transition-all ${inWatchlist ? 'bg-neonBlue/20 text-neonBlue border border-neonBlue/30' : 'btn-ghost'}`}>
                <FiBookmark /> {inWatchlist ? 'Saved' : 'Watchlist'}
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toggleFavorite(movie)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${fav ? 'bg-crimson text-white' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'}`}>
                <FiHeart fill={fav ? 'currentColor' : 'none'} />
              </motion.button>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-3">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
                {movie.vote_average > 0 && <span className="flex items-center gap-1"><FiStar className="text-yellow-400" /> {movie.vote_average.toFixed(1)}</span>}
                {movie.release_date && <span className="flex items-center gap-1"><FiCalendar /> {movie.release_date}</span>}
                {movie.runtime > 0 && <span className="flex items-center gap-1"><FiClock /> {movie.runtime} min</span>}
              </div>
              {movie.genres && <div className="flex flex-wrap gap-2 mt-3">{movie.genres.map(g => <span key={g.id} className="px-3 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-white/60">{g.name}</span>)}</div>}
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">Overview</h3>
              <p className="text-white/70 leading-relaxed text-sm">{movie.overview}</p>
            </div>

            {/* OpinionFlix Rating */}
            {rating !== null && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">OpinionFlix Rating</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-display font-black gradient-text">{rating}%</div>
                  <div className="flex-1"><SentimentProgress positive={positive} negative={negative} label="Audience Sentiment" /></div>
                </div>
              </div>
            )}

            {/* AI Summary */}
            {summary?.summary && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 border-l-4 border-neonPurple">
                <h3 className="text-sm font-semibold text-neonPurple mb-2 flex items-center gap-2">🤖 AI Review Summary</h3>
                <p className="text-white/70 text-sm italic">"{summary.summary}"</p>
              </motion.div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SentimentPie positive={positive} negative={negative} />
              <EmotionBar emotions={emotions} />
            </div>

            {/* Post Review */}
            {user ? (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="flex gap-3">
                  <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts..." className="input-glass flex-1" required />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={submitting} className="btn-neon flex items-center gap-2 px-5">
                    <FiSend /> {submitting ? '...' : 'Post'}
                  </motion.button>
                </form>
              </div>
            ) : (
              <div className="glass-card p-5 text-center">
                <p className="text-white/40 text-sm mb-3">Sign in to write a review</p>
                <button onClick={() => navigate('/login')} className="btn-neon text-sm px-6 py-2">Sign In</button>
              </div>
            )}

            {/* Comments */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Reviews ({comments.length})</h3>
              {comments.length === 0 && <p className="text-white/30 text-sm">No reviews yet. Be the first!</p>}
              {comments.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`glass-card p-4 border-l-4 ${c.prediction ? 'border-emerald-500' : 'border-red-500'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-neonPurple/30 flex items-center justify-center text-xs font-bold text-white">{c.username?.[0]?.toUpperCase() || '?'}</div>
                      <span className="text-sm font-medium text-white/80">{c.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.emotion && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50">{c.emotion}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.prediction ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {c.prediction ? '👍 Positive' : '👎 Negative'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-white/60">{c.content}</p>
                  {c.is_fake && (
                    <div className="flex items-center gap-1 mt-2 text-amber-400 text-xs">
                      <FiAlertTriangle size={12} /> This review appears suspicious
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} videoKey={trailerKey} title={movie.title} />
    </div>
  );
}
