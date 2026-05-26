import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAllComments, fetchMovieDetails } from '../utils/api';
import SentimentPie from '../components/charts/SentimentPie';
import { FiTrendingUp, FiThumbsUp, FiThumbsDown, FiAward, FiUsers } from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalPositive, setTotalPositive] = useState(0);
  const [totalNegative, setTotalNegative] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const allComments = await getAllComments();
        if (!Array.isArray(allComments) || allComments.length === 0) {
          setLoading(false);
          return;
        }

        // Aggregate stats
        const movieMap = {};
        const userMap = {};
        let pos = 0, neg = 0;

        allComments.forEach(c => {
          if (!movieMap[c.movie_id]) movieMap[c.movie_id] = { positive: 0, negative: 0, total: 0 };
          movieMap[c.movie_id].total++;
          if (c.prediction === 1) { movieMap[c.movie_id].positive++; pos++; }
          else { movieMap[c.movie_id].negative++; neg++; }

          if (!userMap[c.username]) userMap[c.username] = 0;
          userMap[c.username]++;
        });

        setTotalPositive(pos);
        setTotalNegative(neg);

        // Find most loved/hated
        const movieIds = Object.keys(movieMap);
        let mostLoved = null, mostHated = null, mostReviewed = null;
        let bestRatio = -1, worstRatio = 2, maxReviews = 0;

        movieIds.forEach(id => {
          const m = movieMap[id];
          const ratio = m.total > 0 ? m.positive / m.total : 0;
          if (ratio > bestRatio && m.total >= 2) { bestRatio = ratio; mostLoved = id; }
          if (ratio < worstRatio && m.total >= 2) { worstRatio = ratio; mostHated = id; }
          if (m.total > maxReviews) { maxReviews = m.total; mostReviewed = id; }
        });

        // Fetch movie details for top movies
        const detailPromises = [];
        const ids = [mostLoved, mostHated, mostReviewed].filter(Boolean);
        const uniqueIds = [...new Set(ids)];

        const movieDetails = {};
        for (const mid of uniqueIds.slice(0, 3)) {
          try {
            const d = await fetchMovieDetails(mid);
            movieDetails[mid] = d;
          } catch { /* ignore */ }
        }

        setStats({
          totalReviews: allComments.length,
          mostLoved: mostLoved ? { id: mostLoved, ...movieDetails[mostLoved], stats: movieMap[mostLoved] } : null,
          mostHated: mostHated ? { id: mostHated, ...movieDetails[mostHated], stats: movieMap[mostHated] } : null,
          mostReviewed: mostReviewed ? { id: mostReviewed, ...movieDetails[mostReviewed], stats: movieMap[mostReviewed] } : null,
        });

        // Leaderboard
        const sorted = Object.entries(userMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
        setLeaderboard(sorted.map(([username, count], i) => ({ rank: i + 1, username, count })));

      } catch { /* backend offline */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const cards = [
    { title: 'Total Reviews', value: stats?.totalReviews || 0, icon: <FiUsers />, color: 'from-neonBlue/20 to-neonPurple/20', border: 'border-neonBlue/20' },
    { title: 'Most Loved', value: stats?.mostLoved?.title || 'N/A', icon: <FiThumbsUp />, color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/20', sub: stats?.mostLoved?.stats ? `${Math.round((stats.mostLoved.stats.positive / stats.mostLoved.stats.total) * 100)}% positive` : '', clickId: stats?.mostLoved?.id },
    { title: 'Most Hated', value: stats?.mostHated?.title || 'N/A', icon: <FiThumbsDown />, color: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/20', sub: stats?.mostHated?.stats ? `${Math.round((stats.mostHated.stats.negative / stats.mostHated.stats.total) * 100)}% negative` : '', clickId: stats?.mostHated?.id },
    { title: 'Trending', value: stats?.mostReviewed?.title || 'N/A', icon: <FiTrendingUp />, color: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/20', sub: stats?.mostReviewed?.stats ? `${stats.mostReviewed.stats.total} reviews` : '', clickId: stats?.mostReviewed?.id },
  ];

  return (
    <div className="min-h-screen pt-8">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-2">📊 Analytics Dashboard</h1>
          <p className="text-white/40 mb-8">Real-time sentiment analytics across OpinionFlix</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {cards.map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }} onClick={() => card.clickId && navigate(`/movie/${card.clickId}`)}
                  className={`glass-card p-5 bg-gradient-to-br ${card.color} border ${card.border} ${card.clickId ? 'cursor-pointer' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/40 text-sm font-medium">{card.title}</span>
                    <span className="text-white/30 text-xl">{card.icon}</span>
                  </div>
                  <p className="text-white font-display font-bold text-lg truncate">{card.value}</p>
                  {card.sub && <p className="text-white/40 text-xs mt-1">{card.sub}</p>}
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <SentimentPie positive={totalPositive} negative={totalNegative} />
              {/* Leaderboard */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2"><FiAward className="text-yellow-400" /> Top Reviewers</h3>
                {leaderboard.length === 0 ? (
                  <p className="text-white/30 text-sm">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((u) => (
                      <div key={u.username} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${u.rank <= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-white/30'}`}>{u.rank}</span>
                        <span className="text-sm text-white/70 flex-1">{u.username}</span>
                        <span className="text-xs text-white/40">{u.count} reviews</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
