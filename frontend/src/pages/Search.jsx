import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import MovieGrid from '../components/movie/MovieGrid';
import { searchMovies, fetchGenres, fetchMoviesByGenre } from '../utils/api';
import { HiSearch } from 'react-icons/hi';

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => { fetchGenres().then(setGenres).catch(() => {}); }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); performSearch(q); }
  }, [searchParams]);

  const performSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true); setSelectedGenre(null);
    try { const r = await searchMovies(q); setMovies(r || []); }
    catch { setMovies([]); }
    finally { setLoading(false); }
  };

  const fetchSugg = useCallback(debounce(async (q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try { const r = await searchMovies(q); setSuggestions(r?.slice(0, 5) || []); }
    catch { setSuggestions([]); }
  }, 300), []);

  const handleSubmit = (e) => {
    e.preventDefault(); setShowSuggestions(false);
    if (query.trim()) setSearchParams({ q: query.trim() });
  };

  const handleGenreSelect = async (genre) => {
    setSelectedGenre(genre.id); setLoading(true); setQuery(''); setSearchParams({});
    try { const r = await fetchMoviesByGenre(genre.id); setMovies(r || []); }
    catch { setMovies([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-8">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mb-8 relative">
          <form onSubmit={handleSubmit} className="relative">
            <input type="text" value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); fetchSugg(e.target.value); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search for movies..."
              className="input-glass text-lg pl-12 pr-6 py-4" id="search-input" />
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xl" />
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full mt-2 w-full glass-card p-2 z-50">
              {suggestions.map(m => (
                <button key={m.id} onClick={() => { setQuery(m.title); setShowSuggestions(false); setSearchParams({ q: m.title }); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-white/5 transition-colors">
                  {m.poster_path && <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt="" className="w-8 h-12 rounded object-cover" />}
                  <div><p className="text-sm text-white">{m.title}</p>
                  <p className="text-xs text-white/40">{m.release_date ? new Date(m.release_date).getFullYear() : 'N/A'}</p></div>
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {genres.slice(0, 16).map(g => (
            <button key={g.id} onClick={() => handleGenreSelect(g)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${selectedGenre === g.id ? 'bg-neonBlue text-white shadow-neon' : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/5'}`}>
              {g.name}
            </button>
          ))}
        </div>
      </div>
      <MovieGrid movies={movies} loading={loading}
        title={query ? `Results for "${query}"` : selectedGenre ? 'Genre Results' : 'Explore Movies'}
        subtitle={movies.length > 0 ? `${movies.length} movies found` : undefined} />
    </div>
  );
}
