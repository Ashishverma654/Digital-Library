import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { BookCardSkeleton } from '../components/SkeletonLoader';
import { toast } from 'react-toastify';
import { BookOpen, Filter } from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [type, setType] = useState('');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category) queryParams.append('category', category);
      if (sort) queryParams.append('sort', sort);
      if (availableOnly) queryParams.append('availability', 'available');
      if (type) queryParams.append('type', type);

      const response = await api.get(`/books?${queryParams.toString()}`);
      if (response.data.success) {
        setBooks(response.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, availableOnly, type]);

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, fetchBooks]);

  return (
    <main className="flex-grow pt-24 pb-20 px-container-padding-mobile md:px-container-padding-desktop max-w-7xl mx-auto w-full flex flex-col gap-8 fade-in-up z-10 relative">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background tracking-tight">Explore Library</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Discover a world of knowledge. Browse our extensive collection of digital volumes, curated for deep focus and aesthetic inspiration.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Advanced Filters Sidebar */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-6">
          <div className="bg-surface border border-outline p-6 sm:p-8 rounded-2xl sticky top-24 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 group">
            <div className="flex items-center gap-3 mb-8 border-b border-outline/30 pb-4">
              <div className="p-2 bg-secondary rounded-lg text-on-secondary group-hover:scale-110 transition-transform duration-300">
                <Filter size={24} />
              </div>
              <h3 className="font-headline-md text-2xl font-bold text-on-background">
                Filters
              </h3>
            </div>

            <div className="space-y-6">
              {/* Search Box */}
              <div className="transform transition-all duration-300 hover:translate-x-1">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Search</label>
                <div className="relative flex items-center glow-effect rounded-xl border border-transparent transition-colors">
                  <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-lg" data-icon="search">search</span>
                  <input 
                    className="glass-input w-full pl-12 pr-4 py-4 text-base rounded-xl font-body-md text-on-background placeholder-on-surface-variant/70 focus:bg-white" 
                    placeholder="Titles, authors..." 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="transform transition-all duration-300 hover:translate-x-1" style={{ transitionDelay: '50ms' }}>
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Sort By</label>
                <select 
                  className="glass-input w-full px-5 py-4 h-14 text-base rounded-xl text-on-background bg-white/50 hover:border-primary/50 transition-colors cursor-pointer"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest" className="text-black">Newest Additions</option>
                  <option value="popular" className="text-black">Most Popular</option>
                </select>
              </div>

              {/* Category */}
              <div className="transform transition-all duration-300 hover:translate-x-1" style={{ transitionDelay: '100ms' }}>
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Category</label>
                <select 
                  className="glass-input w-full px-5 py-4 h-14 text-base rounded-xl text-on-background bg-white/50 hover:border-primary/50 transition-colors cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="" className="text-black">All Categories</option>
                  <option value="Self Help" className="text-black">Self Help</option>
                  <option value="Computer Science" className="text-black">Computer Science</option>
                  <option value="Fiction" className="text-black">Fiction</option>
                  <option value="Science" className="text-black">Science</option>
                  <option value="Technology" className="text-black">Technology</option>
                </select>
              </div>

              {/* Format Type */}
              <div className="transform transition-all duration-300 hover:translate-x-1" style={{ transitionDelay: '150ms' }}>
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Format</label>
                <select 
                  className="glass-input w-full px-5 py-4 h-14 text-base rounded-xl text-on-background bg-white/50 hover:border-primary/50 transition-colors cursor-pointer"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="" className="text-black">Any Format</option>
                  <option value="physical" className="text-black">Physical</option>
                  <option value="digital" className="text-black">Digital</option>
                  <option value="hybrid" className="text-black">Hybrid</option>
                </select>
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center justify-between pt-6 mt-4 border-t border-outline/30 transform transition-all duration-300 hover:scale-[1.02]">
                <span className="text-sm font-bold tracking-wide text-on-background">Available Only</span>
                <button
                  type="button"
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${availableOnly ? 'bg-primary' : 'bg-outline'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${availableOnly ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>

          </div>
        </aside>

        {/* Results Grid */}
        <div className="w-full lg:w-3/4">
          {loading ? (
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full fade-in-up">
              {Array(6).fill(0).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </section>
          ) : books.length === 0 ? (
            <div className="bg-surface border border-outline text-center py-32 rounded-2xl fade-in-up flex flex-col items-center justify-center">
              <BookOpen size={48} className="mb-4 text-outline" />
              <h3 className="font-headline-md text-xl text-on-background mb-2">No books found</h3>
              <p className="font-body-md text-on-surface-variant max-w-sm">Try adjusting your filters or searching for something else.</p>
            </div>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full delay-100 fade-in-up">
              {books.map(book => (
                <BookCard key={book._id} book={book} />
              ))}
            </section>
          )}
        </div>
      </div>
    </main>
  );
};

export default Books;
