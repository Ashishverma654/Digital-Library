import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { BookCardSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { Quote, BookOpen, Compass, Bookmark } from 'lucide-react';

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

  const CountUp = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }, [end, duration]);
    return <span>{count.toLocaleString()}+</span>;
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-white">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary-container rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 -z-10"></div>
      
      {/* Main Content Area */}
      <main className="pt-24 px-container-padding-mobile md:px-container-padding-desktop pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Earthy Elegant Hero Section (Pinterest Inspired) */}
          <header className="relative min-h-[80vh] flex flex-col md:flex-row items-center justify-between mb-24 fade-in-up">
            
            {/* Left Decor Column (Vertical Text) */}
            <div className="hidden md:flex flex-col items-center justify-between h-[600px] border-r border-outline-variant pr-8 mr-12 opacity-80">
              <div className="flex flex-col items-center gap-6 text-primary">
                <BookOpen size={24} />
                <Compass size={24} />
                <Bookmark size={24} />
              </div>
              <div className="writing-vertical-rl rotate-180 text-sm font-bold tracking-[0.3em] uppercase text-on-background whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
                Discover • Learn • Grow
              </div>
            </div>

            {/* Main Center Content */}
            <div className="flex-1 z-20 relative">
              <Quote size={80} className="text-primary opacity-20 mb-[-30px] ml-[-20px]" />
              <h1 className="font-headline-xl text-6xl md:text-8xl text-on-background font-bold mb-6 leading-[1.1] tracking-tight">
                Boundless<br/>Worlds
              </h1>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-12 h-1 bg-primary mt-3 shrink-0 hidden md:block rounded-full"></div>
                <p className="font-body-lg text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
                  Step into a sanctuary of curated knowledge. Explore our vast archives illuminated by classic elegance and modern design. How extraordinary to hold the wisdom of centuries at your fingertips.
                </p>
              </div>
              
              <div className="flex items-center gap-6 mt-12">
                <Link to="/books" className="bg-primary hover:bg-primary-hover text-on-primary px-10 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1 tracking-wide">
                  Browse Library
                </Link>
                {!user ? (
                  <Link to="/login" className="text-on-background font-bold px-6 py-4 rounded-xl hover:bg-secondary-container transition-all flex items-center gap-2">
                    Login <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                ) : (
                  <Link to="/dashboard" className="text-on-background font-bold px-6 py-4 rounded-xl hover:bg-secondary-container transition-all flex items-center gap-2">
                    Dashboard <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Side 3D Image */}
            <div className="flex-1 flex justify-center md:justify-end mt-16 md:mt-0 z-10 relative">
              <div className="absolute inset-0 bg-secondary rounded-full blur-[100px] opacity-20 transform scale-150"></div>
              <img 
                src="/3d_books.png" 
                alt="Colorful 3D Books" 
                className="w-[90%] md:w-[120%] max-w-[600px] object-contain drop-shadow-2xl relative z-10 animate-[float_6s_ease-in-out_infinite]"
              />
            </div>
            
          </header>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 fade-in-up delay-100 mb-24">
            {[
              { label: 'Total Titles', value: 15000 },
              { label: 'Active Users', value: 4500 },
              { label: 'Digital Archives', value: 2000 },
              { label: 'Daily Checkouts', value: 800 }
            ].map((stat, idx) => (
              <div key={idx} className="bg-surface border border-outline-variant text-center p-8 rounded-2xl hover:-translate-y-2 transition-transform shadow-sm hover:shadow-xl hover:shadow-primary/5">
                <h3 className="text-4xl font-bold text-on-background mb-2 font-headline-md">
                  <CountUp end={stat.value} duration={2500} />
                </h3>
                <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Trending Books */}
          <section className="fade-in-up delay-200">
            <div className="flex justify-between items-end mb-10 border-b border-outline-variant pb-4">
              <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-background">Trending Now</h2>
              <Link to="/books" className="text-primary hover:text-primary-hover font-bold flex items-center gap-1 mb-1 transition-colors">
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
