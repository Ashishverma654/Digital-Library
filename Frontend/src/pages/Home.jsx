import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { BookCardSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get('/books?sort=popular');
        if (res.data.success) {
          setTrendingBooks(res.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load trending books');
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="bg-transparent text-on-background font-body-md min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Main Content Area */}
      <main className="pt-24 px-container-padding-mobile md:px-container-padding-desktop pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-gutter">
          {/* Hero Section */}
          <header className="text-center py-12 md:py-20 fade-in-up">
            <h1 className="font-headline-xl text-headline-xl text-gray-900 dark:text-primary-fixed mb-4">Discover Boundless Worlds</h1>
            <p className="font-body-lg text-body-lg text-gray-700 dark:text-on-surface-variant max-w-2xl mx-auto mb-8">
              Step into a sanctuary of curated knowledge. Explore our vast archives illuminated by advanced glassmorphism and modern design.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/books" className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-3 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(189,0,255,0.4)] transition-all">
                Browse Library
              </Link>
              {!user ? (
                <Link to="/login" className="glass-panel text-primary font-bold px-8 py-3 rounded-lg hover:bg-white/20 transition-all">
                  Login
                </Link>
              ) : (
                <Link to="/dashboard" className="glass-panel text-primary font-bold px-8 py-3 rounded-lg hover:bg-white/20 transition-all">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </header>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in-up delay-100 mb-12">
            {[
              { label: 'Total Titles', value: '15,000+' },
              { label: 'Active Users', value: '4,500+' },
              { label: 'Digital Archives', value: '2,000+' },
              { label: 'Daily Checkouts', value: '800+' }
            ].map((stat, idx) => (
              <div key={idx} className="glass-panel text-center p-6 rounded-xl hover:-translate-y-1 transition-transform border border-white/10 dark:border-white/5">
                <h3 className="text-3xl font-bold text-primary dark:text-primary-fixed mb-1">{stat.value}</h3>
                <p className="text-sm font-semibold text-gray-600 dark:text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Trending Books */}
          <section className="fade-in-up delay-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline-lg text-2xl font-bold text-gray-900 dark:text-on-background">Trending Now</h2>
              <Link to="/books" className="text-primary hover:text-primary-hover font-semibold flex items-center gap-1">
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading 
                ? Array(4).fill(0).map((_, i) => <BookCardSkeleton key={i} />)
                : trendingBooks.map(book => <BookCard key={book._id} book={book} />)
              }
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Home;
