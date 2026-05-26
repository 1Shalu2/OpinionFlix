import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Gradient border top */}
      <div className="h-px bg-gradient-to-r from-transparent via-neonBlue/50 to-transparent" />

      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-neon-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm">▶</span>
              </div>
              <span className="text-xl font-display font-bold gradient-text">OpinionFlix</span>
            </div>
            <p className="text-white/40 text-sm max-w-md leading-relaxed mb-4">
              Where Audience Emotion Shapes Cinema. An AI-powered movie analytics platform
              that transforms viewer sentiments into meaningful insights.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/Acepatil/Movie_Opinion" target="_blank" rel="noreferrer"
                className="text-white/30 hover:text-neonBlue transition-colors">
                <FiGithub size={20} />
              </a>
              <a href="#" className="text-white/30 hover:text-neonBlue transition-colors">
                <FiTwitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/dashboard">Dashboard</FooterLink>
              <FooterLink to="/mood">Mood Picks</FooterLink>
              <FooterLink to="/search">Search</FooterLink>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2">
              <FooterLink to="/login">Sign In</FooterLink>
              <FooterLink to="/register">Register</FooterLink>
              <FooterLink to="/profile">Profile</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} OpinionFlix. All rights reserved.
          </p>
          <p className="text-white/30 text-xs flex items-center gap-1">
            Made with <FiHeart className="text-crimson" size={12} /> by OpinionFlix Team
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="text-sm text-white/30 hover:text-white/70 transition-colors duration-300">
        {children}
      </Link>
    </li>
  );
}
