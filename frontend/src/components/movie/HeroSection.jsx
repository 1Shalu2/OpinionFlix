import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchTrending, getBackdropUrl } from '../../utils/api';
import { FiPlay, FiInfo } from 'react-icons/fi';

export default function HeroSection() {
  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrending().then(data => setMovies(data?.slice(0, 5) || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % movies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [movies]);

  if (movies.length === 0) {
    return (
      <div className="relative h-[70vh] md:h-[85vh] bg-hero-gradient flex items-center justify-center">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-display font-black gradient-text mb-4"
          >
            OpinionFlix
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg md:text-xl font-light"
          >
            Where Audience Emotion Shapes Cinema
          </motion.p>
        </div>
      </div>
    );
  }

  const movie = movies[current];
  const backdrop = getBackdropUrl(movie.backdrop_path);

  return (
    <div className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          {backdrop && (
            <img
              src={backdrop}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-midnight/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="section-container pb-16 md:pb-24 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 mb-3"
              >
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-neonBlue/20 text-neonBlue border border-neonBlue/30">
                  🔥 Trending Now
                </span>
                {movie.vote_average > 0 && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    ⭐ {movie.vote_average.toFixed(1)}
                  </span>
                )}
              </motion.div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-white mb-4 leading-tight">
                {movie.title}
              </h1>

              <p className="text-white/60 text-sm md:text-base line-clamp-3 mb-6 max-w-lg leading-relaxed">
                {movie.overview}
              </p>

              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="btn-neon flex items-center gap-2"
                >
                  <FiPlay size={18} />
                  Explore
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="btn-ghost flex items-center gap-2"
                >
                  <FiInfo size={18} />
                  More Info
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 mt-8">
            {movies.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === current ? 'w-8 bg-neonBlue' : 'w-3 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
