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
    <main className="flex-grow pt-32 pb-24 px-container-padding-mobile md:px-container-padding-desktop max-w-7xl mx-auto w-full flex flex-col gap-8 fade-in-up z-10 relative">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary dark:text-primary-fixed-dim">Explore Library</h1>
        <p className="font-body-lg text-body-lg text-gray-700 dark:text-on-surface-variant max-w-2xl">
          Discover a world of knowledge. Browse our extensive collection of digital volumes, curated for deep focus and aesthetic inspiration.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Advanced Filters Sidebar */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-xl sticky top-24">
            <h3 className="flex items-center gap-2 font-headline-sm mb-6 text-gray-900 dark:text-primary-fixed">
              <Filter size={20} /> Filters
            </h3>

            {/* Search Box */}
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 block">Search</label>
              <div className="relative flex items-center glow-effect rounded-lg">
                <span className="material-symbols-outlined absolute left-3 text-gray-400 text-sm" data-icon="search">search</span>
                <input 
                  className="glass-input w-full pl-10 pr-3 py-2 text-sm rounded-lg font-body-md text-gray-900 dark:text-white placeholder-gray-500" 
                  placeholder="Titles, authors..." 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Sort */}
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 block">Sort By</label>
              <select 
                className="glass-input w-full px-3 py-2 text-sm rounded-lg text-gray-900 dark:text-white bg-white/50 dark:bg-black/20"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest" className="text-black">Newest Additions</option>
                <option value="popular" className="text-black">Most Popular</option>
              </select>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 block">Category</label>
              <select 
                className="glass-input w-full px-3 py-2 text-sm rounded-lg text-gray-900 dark:text-white bg-white/50 dark:bg-black/20"
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
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 block">Format</label>
              <select 
                className="glass-input w-full px-3 py-2 text-sm rounded-lg text-gray-900 dark:text-white bg-white/50 dark:bg-black/20"
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
            <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/10">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Available Only</span>
              <div className="relative inline-block w-10 align-middle select-none">
                <input 
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out border-gray-300 dark:border-gray-600 checked:right-0 checked:border-primary z-10 top-0 left-0" 
                  type="checkbox"
                />
                <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer transition-colors duration-300 ease-in-out"></label>
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
            <div className="glass-panel text-center py-32 rounded-xl fade-in-up flex flex-col items-center justify-center">
              <BookOpen size={48} className="mb-4 text-gray-400 dark:text-white/20" />
              <h3 className="font-headline-md text-xl text-gray-900 dark:text-on-background mb-2">No books found</h3>
              <p className="font-body-md text-gray-600 dark:text-on-surface-variant max-w-sm">Try adjusting your filters or searching for something else.</p>
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
