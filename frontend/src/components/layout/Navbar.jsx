import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import { HiSearch, HiMenu, HiX } from 'react-icons/hi';
import { FiUser, FiHeart, FiBookmark, FiLogOut, FiTrendingUp } from 'react-icons/fi';

export default function Navbar() {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowMobile(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'navbar-blur shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-9 h-9 rounded-xl bg-neon-gradient flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">▶</span>
            </motion.div>
            <span className="text-xl md:text-2xl font-display font-bold gradient-text group-hover:opacity-80 transition-opacity">
              OpinionFlix
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/mood">Mood</NavLink>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-48 lg:w-64 pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-neonBlue/50 focus:w-72 transition-all duration-300"
              />
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
            </form>

            <ThemeToggle />

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white/20 hover:border-neonBlue/50 transition-colors"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.username[0].toUpperCase()}
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-glass"
                    >
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="text-sm font-semibold text-white">{user.username}</p>
                        <p className="text-xs text-white/40">OpinionFlix Member</p>
                      </div>
                      <DropdownItem icon={<FiUser />} label="Profile" onClick={() => { navigate('/profile'); setShowMenu(false); }} />
                      <DropdownItem icon={<FiBookmark />} label="Watchlist" onClick={() => { navigate('/profile'); setShowMenu(false); }} />
                      <DropdownItem icon={<FiHeart />} label="Favorites" onClick={() => { navigate('/profile'); setShowMenu(false); }} />
                      <DropdownItem icon={<FiTrendingUp />} label="Dashboard" onClick={() => { navigate('/dashboard'); setShowMenu(false); }} />
                      <div className="border-t border-white/10 mt-1 pt-1">
                        <DropdownItem icon={<FiLogOut />} label="Logout" onClick={handleLogout} danger />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-neon text-sm px-4 py-2">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button onClick={() => setShowMobile(!showMobile)} className="text-white/70 hover:text-white text-2xl">
              {showMobile ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {showMobile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-3 border-t border-white/10">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search movies..."
                    className="input-glass text-sm"
                  />
                  <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
                </form>
                <MobileLink to="/" onClick={() => setShowMobile(false)}>Home</MobileLink>
                <MobileLink to="/dashboard" onClick={() => setShowMobile(false)}>Dashboard</MobileLink>
                <MobileLink to="/mood" onClick={() => setShowMobile(false)}>Mood</MobileLink>
                {user ? (
                  <>
                    <MobileLink to="/profile" onClick={() => setShowMobile(false)}>Profile</MobileLink>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/5 rounded-xl transition-colors">
                      Logout
                    </button>
                  </>
                ) : (
                  <MobileLink to="/login" onClick={() => setShowMobile(false)}>Sign In</MobileLink>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm text-white/60 hover:text-white font-medium transition-colors duration-300 relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-gradient group-hover:w-full transition-all duration-300 rounded-full" />
    </Link>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
    >
      {children}
    </Link>
  );
}

function DropdownItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        danger
          ? 'text-red-400 hover:bg-red-400/10'
          : 'text-white/70 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
