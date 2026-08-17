import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial state from HTML tag or localStorage
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/40 dark:bg-gray-900/40 backdrop-blur-[50px] border-b border-white/40 dark:border-white/10 shadow-[0_0_20px_rgba(236,178,255,0.1)] transition-colors duration-500">
      <div className="flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop py-4 max-w-full mx-auto">
        {/* Logo area */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-DEFAULT overflow-hidden flex-shrink-0 border border-white/40 dark:border-white/10 group-hover:border-primary/50 transition-colors bg-white/50 dark:bg-surface-container-high flex justify-center items-center">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">local_library</span>
          </div>
          <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim tracking-tight hidden md:block">
            DigitalLib
          </span>
        </Link>
        
        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="nav-link relative font-body-md text-body-md text-gray-800 dark:text-on-surface-variant hover:text-primary transition-colors pb-1">Home</Link>
          <Link to="/books" className="nav-link relative font-body-md text-body-md text-gray-800 dark:text-on-surface-variant hover:text-primary transition-colors pb-1">Browse Books</Link>
          
          {user && (
            <Link to={user.role === 'ADMIN' ? "/admin/dashboard" : user.role === 'LIBRARIAN' ? "/librarian/dashboard" : "/dashboard"} className="nav-link relative font-body-md text-body-md text-gray-800 dark:text-on-surface-variant hover:text-primary transition-colors pb-1">
              Dashboard
            </Link>
          )}
        </div>
        
        {/* Trailing Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-800 dark:text-on-surface-variant flex items-center justify-center"
            title="Toggle Theme"
          >
            <span className="material-symbols-outlined">{isDark ? 'dark_mode' : 'light_mode'}</span>
          </button>
          
          {user ? (
            <>
              <NotificationsPanel />
              <div className="flex items-center gap-2 border-l border-black/10 dark:border-white/20 pl-4">
                <Link to="/profile" className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-gray-800 dark:text-on-surface-variant text-sm hidden md:block group-hover:text-primary transition-colors">{user.name}</span>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-white/50 dark:bg-surface-container-high flex justify-center items-center border border-white/40 dark:border-white/20 group-hover:border-primary transition-colors">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-sm text-primary">person</span>
                    )}
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-gray-800 dark:text-on-surface-variant hover:text-error transition-colors ml-2 p-1" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3 ml-2 border-l border-black/10 dark:border-white/20 pl-4">
              <Link to="/login" className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold hover:shadow-[0_0_15px_rgba(189,0,255,0.3)] transition-all">Login</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
