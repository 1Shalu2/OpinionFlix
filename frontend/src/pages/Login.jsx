import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../utils/api';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      if (data.invalid === 'username' || data.invalid === 'password') {
        setError(`Invalid ${data.invalid}`);
      } else {
        login(username);
        navigate('/');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neonPurple/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neonBlue/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass-card w-full max-w-md p-8 md:p-10 relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center">
              <span className="text-white font-bold text-lg">▶</span>
            </div>
            <span className="text-2xl font-display font-bold gradient-text">OpinionFlix</span>
          </Link>
          <h1 className="text-xl font-display font-bold text-white mt-4">Welcome Back</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to continue your experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Username</label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username" className="input-glass pl-11" required id="login-username" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password" className="input-glass pl-11" required id="login-password" />
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-neon w-full flex items-center justify-center gap-2 py-4"
            id="login-submit"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><FiLogIn /> Sign In</>
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-neonBlue hover:text-neonBlue/80 font-medium transition-colors">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
