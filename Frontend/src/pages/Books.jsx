import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { toast } from 'react-toastify';
import { BookOpen } from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category) queryParams.append('category', category);
      if (availableOnly) queryParams.append('availability', 'available');

      const response = await api.get(`/books?${queryParams.toString()}`);
      if (response.data.success) {
        setBooks(response.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, [search, category, availableOnly]);

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
      
      {/* Search & Filter Bar (Floating Glass) */}
      <section className="glass-panel rounded-xl p-glass-padding flex flex-col md:flex-row gap-6 items-center justify-between z-20 w-full sticky top-24 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="relative w-full md:w-1/2 flex items-center glow-effect rounded-lg">
          <span className="material-symbols-outlined absolute left-4 text-gray-500 dark:text-on-surface-variant z-10" data-icon="search">search</span>
          <input 
            className="glass-input w-full pl-12 pr-4 py-3 rounded-lg font-body-md text-body-md text-gray-900 dark:text-on-background placeholder-gray-500 placeholder-dark:on-surface-variant/50" 
            placeholder="Search titles, authors, or ISBN..." 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-between md:justify-end">
          {/* Category Dropdown */}
          <div className="relative group">
            <select 
              className="glass-input px-4 py-2 rounded-lg font-body-md text-body-md text-gray-900 dark:text-on-background appearance-none pr-10 cursor-pointer bg-white/50 dark:bg-black/20"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" className="text-black">All Categories</option>
              <option value="Self Help" className="text-black">Self Help</option>
              <option value="Computer Science" className="text-black">Computer Science</option>
              <option value="Fiction" className="text-black">Fiction</option>
              <option value="Science" className="text-black">Science</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-white/70 pointer-events-none" data-icon="expand_more">expand_more</span>
          </div>
          
          {/* Toggle */}
          <div className="flex items-center gap-3">
            <span className="font-body-md text-body-md text-gray-700 dark:text-on-surface-variant">Available Only</span>
            <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
              <input 
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out border-gray-300 dark:border-outline-variant checked:right-0 checked:border-primary-container z-10 top-0 left-0" 
                id="available-toggle" 
                type="checkbox"
              />
              <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-200 dark:bg-surface-container-high cursor-pointer transition-colors duration-300 ease-in-out" htmlFor="available-toggle"></label>
            </div>
          </div>
        </div>
      </section>
      
      {/* Results Section */}
      {loading ? (
        <div className="flex justify-center items-center py-20 fade-in-up">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="glass-panel text-center py-20 rounded-xl fade-in-up">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-400 dark:text-white/20" />
          <h3 className="font-headline-md text-headline-md text-gray-900 dark:text-on-background mb-2">No books found</h3>
          <p className="font-body-md text-body-md text-gray-600 dark:text-on-surface-variant">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter w-full delay-100 fade-in-up">
          {books.map(book => (
            <BookCard key={book._id} book={book} />
          ))}
        </section>
      )}
    </main>
  );
};

export default Books;
