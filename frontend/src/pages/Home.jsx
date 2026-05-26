import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/movie/HeroSection';
import MovieGrid from '../components/movie/MovieGrid';
import MovieCard from '../components/movie/MovieCard';
import { fetchTrending, fetchPopular, fetchTopRated } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MOOD_OPTIONS = [
  { mood: 'happy', emoji: '😊', label: 'Happy', gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/20' },
  { mood: 'sad', emoji: '😢', label: 'Sad', gradient: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/20' },
  { mood: 'motivated', emoji: '💪', label: 'Motivated', gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/20' },
  { mood: 'romantic', emoji: '❤️', label: 'Romantic', gradient: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/20' },
  { mood: 'thrilled', emoji: '🤯', label: 'Thrilled', gradient: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/20' },
];

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const { recentlyViewed } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [t, p, tr] = await Promise.all([
          fetchTrending(),
          fetchPopular(),
          fetchTopRated(),
        ]);
        setTrending(t || []);
        setPopular(p || []);
        setTopRated(tr || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Mood Quick Access */}
      <section className="section-container py-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-display font-bold text-white mb-2"
        >
          How are you feeling?
        </motion.h2>
        <p className="text-white/40 text-sm mb-6">Pick a mood and discover perfect movies</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {MOOD_OPTIONS.map((item, i) => (
            <motion.div
              key={item.mood}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/mood?selected=${item.mood}`)}
              className={`mood-card bg-gradient-to-br ${item.gradient} border ${item.border}`}
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-sm font-medium text-white/80">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="section-container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">🔥 Trending This Week</h2>
            <p className="text-white/40 text-sm mt-1">The most talked about movies right now</p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-w-[180px]">
                  <div className="skeleton aspect-[2/3] rounded-2xl" />
                </div>
              ))
            : trending.slice(0, 10).map((movie, i) => (
                <div key={movie.id} className="min-w-[180px]">
                  <MovieCard movie={movie} index={i} />
                </div>
              ))
          }
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="section-container py-8">
          <h2 className="text-2xl font-display font-bold text-white mb-2">⏳ Recently Viewed</h2>
          <p className="text-white/40 text-sm mb-6">Continue where you left off</p>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {recentlyViewed.slice(0, 10).map((movie, i) => (
              <div key={movie.id} className="min-w-[180px]">
                <MovieCard movie={movie} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popular */}
      <MovieGrid
        movies={popular}
        loading={loading}
        title="🍿 Popular Now"
        subtitle="Fan favorites everyone's watching"
      />

      {/* Top Rated */}
      <MovieGrid
        movies={topRated}
        loading={loading}
        title="⭐ Top Rated"
        subtitle="Critically acclaimed masterpieces"
      />
    </div>
  );
}
