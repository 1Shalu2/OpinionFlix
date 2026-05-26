const BACKEND_URL = import.meta.env.VITE_BACKEND_SITE || 'http://localhost:8080';
const TMDB_KEY = import.meta.env.VITE_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

// ─── TMDB API ──────────────────────────────────────────────

export async function fetchTrending() {
  const res = await fetch(`${TMDB_BASE}/trending/movie/week?api_key=${TMDB_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch trending movies');
  const data = await res.json();
  return data.results;
}

export async function fetchPopular() {
  const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch popular movies');
  const data = await res.json();
  return data.results;
}

export async function fetchTopRated() {
  const res = await fetch(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch top rated movies');
  const data = await res.json();
  return data.results;
}

export async function searchMovies(query) {
  const res = await fetch(`${TMDB_BASE}/search/movie?query=${encodeURIComponent(query)}&api_key=${TMDB_KEY}`);
  if (!res.ok) throw new Error('Failed to search movies');
  const data = await res.json();
  return data.results;
}

export async function fetchMovieDetails(id) {
  const res = await fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&append_to_response=videos,credits`);
  if (!res.ok) throw new Error('Failed to fetch movie details');
  return res.json();
}

export async function fetchMoviesByGenre(genreId) {
  const res = await fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=${genreId}&sort_by=popularity.desc`);
  if (!res.ok) throw new Error('Failed to fetch movies by genre');
  const data = await res.json();
  return data.results;
}

export async function fetchGenres() {
  const res = await fetch(`${TMDB_BASE}/genre/movie/list?api_key=${TMDB_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch genres');
  const data = await res.json();
  return data.genres;
}

export function getPosterUrl(path, size = 'w500') {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
}

export function getBackdropUrl(path, size = 'original') {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
}

// ─── Backend API ──────────────────────────────────────────────

export async function loginUser(username, password) {
  const res = await fetch(`${BACKEND_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function registerUser(username, email, password) {
  const res = await fetch(`${BACKEND_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return res.json();
}

export async function submitReview(comment, movieId, username) {
  const res = await fetch(`${BACKEND_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment, movie_id: Number(movieId), username }),
  });
  return res.json();
}

export async function getComments(movieId) {
  const res = await fetch(`${BACKEND_URL}/comments?movie_id=${movieId}`);
  const data = await res.json();
  return data.comments || [];
}

export async function getSentimentCounts(movieId) {
  const res = await fetch(`${BACKEND_URL}/comments/counts?movie_id=${movieId}`);
  return res.json();
}

export async function getEmotionAnalytics(movieId) {
  try {
    const res = await fetch(`${BACKEND_URL}/emotions?movie_id=${movieId}`);
    return res.json();
  } catch {
    return null;
  }
}

export async function getReviewSummary(movieId) {
  try {
    const res = await fetch(`${BACKEND_URL}/reviews/summary?movie_id=${movieId}`);
    return res.json();
  } catch {
    return null;
  }
}

export async function getDashboardData() {
  try {
    const res = await fetch(`${BACKEND_URL}/dashboard/trending`);
    return res.json();
  } catch {
    return null;
  }
}

export async function getAllComments() {
  const res = await fetch(`${BACKEND_URL}/comment`);
  return res.json();
}

// ─── Mood to Genre Mapping ──────────────────────────────────

const MOOD_GENRES = {
  happy: 35,      // Comedy
  sad: 18,        // Drama
  motivated: 12,  // Adventure
  romantic: 10749, // Romance
  thrilled: 53,   // Thriller
};

export async function getMoodRecommendations(mood) {
  const genreId = MOOD_GENRES[mood.toLowerCase()];
  if (!genreId) return [];
  return fetchMoviesByGenre(genreId);
}
