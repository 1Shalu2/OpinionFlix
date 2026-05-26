import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import MovieGrid from '../components/movie/MovieGrid';
import { getMoodRecommendations } from '../utils/api';

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy', desc: 'Light-hearted comedies', gradient: 'from-emerald-500 to-teal-500', bg: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/30' },
  { id: 'sad', emoji: '😢', label: 'Sad', desc: 'Emotional dramas', gradient: 'from-indigo-500 to-purple-500', bg: 'from-indigo-500/10 to-purple-500/10', border: 'border-indigo-500/30' },
  { id: 'motivated', emoji: '💪', label: 'Motivated', desc: 'Epic adventures', gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/30' },
  { id: 'romantic', emoji: '❤️', label: 'Romantic', desc: 'Love stories', gradient: 'from-pink-500 to-rose-500', bg: 'from-pink-500/10 to-rose-500/10', border: 'border-pink-500/30' },
  { id: 'thrilled', emoji: '🤯', label: 'Thrilled', desc: 'Edge-of-seat thrillers', gradient: 'from-red-500 to-orange-500', bg: 'from-red-500/10 to-orange-500/10', border: 'border-red-500/30' },
];

export default function MoodPicker() {
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('selected');
  const [selected, setSelected] = useState(preselected || null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preselected) handleSelect(preselected);
  }, [preselected]);

  const handleSelect = async (mood) => {
    setSelected(mood);
    setLoading(true);
    try {
      const results = await getMoodRecommendations(mood);
      setMovies(results || []);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedMood = MOODS.find(m => m.id === selected);

  return (
    <div className="min-h-screen pt-8">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-display font-black text-white mb-3">🎭 What's Your Mood?</h1>
          <p className="text-white/40 text-lg">Select how you're feeling and we'll find the perfect movie</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 max-w-4xl mx-auto mb-12">
          {MOODS.map((mood, i) => (
            <motion.button key={mood.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(mood.id)}
              className={`relative p-6 rounded-2xl text-center transition-all duration-500 border ${
                selected === mood.id
                  ? `bg-gradient-to-br ${mood.bg} ${mood.border} shadow-neon`
                  : 'bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <span className="text-4xl md:text-5xl block mb-3">{mood.emoji}</span>
              <span className="text-sm font-semibold text-white block">{mood.label}</span>
              <span className="text-xs text-white/40 block mt-1">{mood.desc}</span>
              {selected === mood.id && (
                <motion.div layoutId="mood-indicator" className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-to-r ${mood.gradient}`} />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {selected && (
        <MovieGrid
          movies={movies}
          loading={loading}
          title={`${selectedMood?.emoji} ${selectedMood?.label} Picks`}
          subtitle={`Movies to match your ${selectedMood?.label?.toLowerCase()} mood`}
        />
      )}
    </div>
  );
}
