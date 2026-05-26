import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('opinionflix-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('opinionflix-watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const saved = localStorage.getItem('opinionflix-recent');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('opinionflix-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('opinionflix-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('opinionflix-user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('opinionflix-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('opinionflix-recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('opinionflix-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const login = (username) => {
    setUser({ username, avatarColor: generateAvatarColor(username) });
  };

  const logout = () => {
    setUser(null);
  };

  const addToWatchlist = (movie) => {
    setWatchlist(prev => {
      if (prev.find(m => m.id === movie.id)) return prev;
      return [movie, ...prev];
    });
  };

  const removeFromWatchlist = (movieId) => {
    setWatchlist(prev => prev.filter(m => m.id !== movieId));
  };

  const isInWatchlist = (movieId) => {
    return watchlist.some(m => m.id === movieId);
  };

  const addToRecentlyViewed = (movie) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(m => m.id !== movie.id);
      return [movie, ...filtered].slice(0, 20);
    });
  };

  const toggleFavorite = (movie) => {
    setFavorites(prev => {
      if (prev.find(m => m.id === movie.id)) {
        return prev.filter(m => m.id !== movie.id);
      }
      return [movie, ...prev];
    });
  };

  const isFavorite = (movieId) => {
    return favorites.some(m => m.id === movieId);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      recentlyViewed,
      addToRecentlyViewed,
      favorites,
      toggleFavorite,
      isFavorite,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

function generateAvatarColor(username) {
  const colors = ['#6366f1', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
