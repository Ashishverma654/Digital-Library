import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isDashboardActive = () => {
    return location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/librarian');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-[50px] border-b border-outline/30 shadow-sm transition-colors duration-500">
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
          <Link to="/" className={`group relative font-headline-sm text-base lg:text-lg font-bold tracking-wide pb-1 transition-colors ${isActive('/') ? 'text-primary' : 'text-on-surface hover:text-primary'}`}>
            Home
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          <Link to="/books" className={`group relative font-headline-sm text-base lg:text-lg font-bold tracking-wide pb-1 transition-colors ${isActive('/books') ? 'text-primary' : 'text-on-surface hover:text-primary'}`}>
            Browse Books
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${isActive('/books') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          
          {user && (
            <Link to={user.role === 'ADMIN' ? "/admin/dashboard" : user.role === 'LIBRARIAN' ? "/librarian/dashboard" : "/dashboard"} className={`group relative font-headline-sm text-base lg:text-lg font-bold tracking-wide pb-1 transition-colors ${isDashboardActive() ? 'text-primary' : 'text-on-surface hover:text-primary'}`}>
              Dashboard
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${isDashboardActive() ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
          )}
        </div>
        
        {/* Trailing Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationsPanel />
              <div className="flex items-center gap-2 border-l border-outline/30 pl-4">
                <Link to="/profile" className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-on-surface text-sm hidden md:block group-hover:text-primary transition-colors">{user.name}</span>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-container flex justify-center items-center border border-outline group-hover:border-primary transition-colors">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-sm text-primary">person</span>
                    )}
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-on-surface hover:text-error transition-colors ml-2 p-1" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3 ml-2 border-l border-outline/30 pl-4">
              <Link to="/login" className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:bg-primary-hover shadow-sm transition-all">Login</Link>
            </div>
          )}
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 ml-1 text-on-surface hover:bg-surface-container rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-outline/30 shadow-lg px-container-padding-mobile py-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="font-body-md text-on-surface hover:text-primary transition-colors py-2 border-b border-outline/10">Home</Link>
          <Link to="/books" onClick={() => setIsMobileMenuOpen(false)} className="font-body-md text-on-surface hover:text-primary transition-colors py-2 border-b border-outline/10">Browse Books</Link>
          {user && (
            <Link 
              to={user.role === 'ADMIN' ? "/admin/dashboard" : user.role === 'LIBRARIAN' ? "/librarian/dashboard" : "/dashboard"} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="font-body-md text-on-surface hover:text-primary transition-colors py-2"
            >
              Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
