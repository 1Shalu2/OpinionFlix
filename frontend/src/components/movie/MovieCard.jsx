import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiHeart } from 'react-icons/fi';
import { getPosterUrl } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function MovieCard({ movie, index = 0 }) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useAuth();
  const posterUrl = getPosterUrl(movie.poster_path);
  const fav = isFavorite(movie.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/movie/${movie.id}`)}
      className="group cursor-pointer relative"
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface-light border border-white/5 hover:border-neonBlue/30 transition-all duration-500 hover:shadow-neon">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-surface-lighter flex items-center justify-center">
              <span className="text-white/20 text-4xl">🎬</span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn-neon text-sm py-2 px-4 text-center"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/movie/${movie.id}`);
              }}
            >
              View Details
            </motion.button>
          </div>

          {/* Rating Badge */}
          {movie.vote_average > 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-semibold">
              <FiStar className="text-yellow-400" size={12} />
              <span className="text-white">{movie.vote_average.toFixed(1)}</span>
            </div>
          )}

          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(movie);
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              fav ? 'bg-crimson text-white' : 'bg-black/60 backdrop-blur-sm text-white/60 hover:text-white'
            }`}
          >
            <FiHeart size={14} fill={fav ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-neonBlue transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-white/40 mt-1">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
