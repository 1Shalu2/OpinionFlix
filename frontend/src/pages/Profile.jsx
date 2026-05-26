import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/movie/MovieCard';
import { FiUser, FiBookmark, FiHeart, FiLogOut, FiMessageSquare } from 'react-icons/fi';

export default function Profile() {
  const { user, logout, watchlist, favorites, recentlyViewed } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-10 text-center max-w-md">
          <span className="text-6xl block mb-4">🔒</span>
          <h2 className="text-xl font-display font-bold text-white mb-2">Sign in Required</h2>
          <p className="text-white/40 text-sm mb-6">Please sign in to view your profile</p>
          <button onClick={() => navigate('/login')} className="btn-neon px-8 py-3">Sign In</button>
        </div>
      </div>
    );
  }

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen pt-8">
      <div className="section-container">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-display font-bold text-white border-4 border-white/20" style={{ backgroundColor: user.avatarColor }}>
              {user.username[0].toUpperCase()}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-display font-bold text-white">{user.username}</h1>
              <p className="text-white/40 text-sm mt-1">OpinionFlix Member</p>
              <div className="flex flex-wrap gap-4 mt-3 justify-center sm:justify-start">
                <StatBadge icon={<FiBookmark />} label="Watchlist" value={watchlist.length} />
                <StatBadge icon={<FiHeart />} label="Favorites" value={favorites.length} />
                <StatBadge icon={<FiMessageSquare />} label="Viewed" value={recentlyViewed.length} />
              </div>
            </div>
            <button onClick={handleLogout} className="btn-ghost flex items-center gap-2 text-sm text-red-400 border-red-400/20 hover:bg-red-400/10">
              <FiLogOut /> Logout
            </button>
          </div>
        </motion.div>

        {/* Watchlist */}
        <Section title="📌 Watchlist" items={watchlist} emptyText="Your watchlist is empty. Start adding movies!" />

        {/* Favorites */}
        <Section title="❤️ Favorites" items={favorites} emptyText="No favorites yet. Heart some movies!" />

        {/* Recently Viewed */}
        <Section title="⏳ Recently Viewed" items={recentlyViewed} emptyText="No viewing history yet." />
      </div>
    </div>
  );
}

function StatBadge({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
      <span className="text-white/40">{icon}</span>
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}

function Section({ title, items, emptyText }) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
      <h2 className="text-xl font-display font-bold text-white mb-4">{title}</h2>
      {items.length === 0 ? (
        <div className="glass-card p-8 text-center"><p className="text-white/30 text-sm">{emptyText}</p></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.slice(0, 12).map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} />
          ))}
        </div>
      )}
    </motion.section>
  );
}
