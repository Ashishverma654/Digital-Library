import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Clock } from 'lucide-react';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${id}`);
        if (response.data.success) {
          setBook(response.data.data);
        }
      } catch (err) {
        toast.error('Failed to fetch book details');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 z-10 relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!book) return null;

  const isAvailable = book.type === 'digital' || book.availableCopies > 0;

  const handleRequestBorrow = async () => {
    try {
      const response = await api.post('/transactions/request', { bookId: id });
      if (response.data.success) {
        toast.success('Borrow request submitted successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const coverImage = (book.coverImage && book.coverImage !== 'default-cover.jpg') 
    ? book.coverImage 
    : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop";

  return (
    <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-32 relative z-10 fade-in-up">
      {/* Back Action */}
      <Link className="inline-flex items-center space-x-2 text-secondary dark:text-secondary-fixed-dim hover:text-secondary-container transition-colors duration-200 mb-8 font-label-sm text-label-sm group" to="/books">
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform duration-200">arrow_back</span>
        <span>Back to Catalog</span>
      </Link>
      
      {/* Central Frosted Container */}
      <div className="glass-panel rounded-xl p-glass-padding md:p-12 relative overflow-hidden">
        {/* Subtle internal glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Left Column: Book Cover */}
          <div className="md:col-span-4 lg:col-span-3 flex justify-center md:justify-start">
            <div className="relative w-48 md:w-full max-w-[280px] aspect-[2/3] rounded-lg overflow-hidden book-glow transition-transform duration-500 hover:scale-105">
              <img 
                className="w-full h-full object-cover rounded-lg" 
                alt={`Cover of ${book.title}`}
                src={coverImage}
              />
              {/* Decorative spine highlight */}
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-white/30 to-transparent"></div>
            </div>
          </div>
          
          {/* Right Column: Details */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-start">
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-secondary/10 dark:bg-secondary-container/10 border border-secondary/20 rounded-full font-label-sm text-label-sm text-secondary dark:text-secondary-fixed-dim">
                {book.category}
              </span>
              <span className="px-3 py-1 bg-primary/10 dark:bg-primary-container/10 border border-primary/20 rounded-full font-label-sm text-label-sm text-primary dark:text-primary-fixed-dim">
                {book.type}
              </span>
            </div>
            
            {/* Title & Author */}
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-gray-900 dark:text-on-surface mb-2">
              {book.title}
            </h1>
            <p className="font-body-lg text-body-lg text-gray-600 dark:text-outline mb-6">
              by {book.author}
            </p>
            
            {/* Synopsis */}
            <div className="mb-8">
              <h3 className="font-label-sm text-label-sm text-gray-500 dark:text-on-surface-variant mb-2 uppercase tracking-wider">Synopsis</h3>
              <p className="font-body-md text-body-md text-gray-700 dark:text-on-surface-variant max-w-3xl whitespace-pre-wrap">
                {book.description || 'No description available for this book.'}
              </p>
            </div>
            
            {/* Meta Data */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 bg-white/30 dark:bg-black/20 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 dark:text-on-surface-variant uppercase tracking-wider mb-1">ISBN</p>
                <p className="font-body-md text-gray-900 dark:text-on-surface">{book.isbn}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-on-surface-variant uppercase tracking-wider mb-1">Publisher</p>
                <p className="font-body-md text-gray-900 dark:text-on-surface">{book.publisher || 'N/A'}</p>
              </div>
              {book.type !== 'digital' && (
                <>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-on-surface-variant uppercase tracking-wider mb-1">Total Copies</p>
                    <p className="font-body-md text-gray-900 dark:text-on-surface">{book.totalCopies}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-on-surface-variant uppercase tracking-wider mb-1">Available</p>
                    <p className={`font-body-md ${isAvailable ? 'text-secondary dark:text-secondary-fixed' : 'text-error dark:text-error'}`}>
                      {book.availableCopies}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {/* Inventory & Action */}
            <div className="mt-auto flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-black/10 dark:border-white/10">
              {book.type !== 'digital' && (
                <div className={`flex items-center space-x-2 ${isAvailable ? 'text-tertiary dark:text-tertiary' : 'text-error dark:text-error'}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isAvailable ? 'inventory_2' : 'inventory_2'}
                  </span>
                  <span className="font-label-sm text-label-sm">
                    {isAvailable ? `${book.availableCopies} copies available` : 'Currently out of stock'}
                  </span>
                </div>
              )}
              
              {isAvailable ? (
                !user ? (
                  <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-container to-secondary-container text-white dark:text-on-primary-container font-label-sm text-label-sm rounded-lg shadow-[0_0_20px_rgba(189,0,255,0.3)] hover:shadow-[0_0_30px_rgba(0,224,255,0.4)] transition-shadow duration-300 transform hover:-translate-y-1 text-center">
                    Login to Borrow
                  </Link>
                ) : user.role === 'USER' ? (
                  <button 
                    onClick={handleRequestBorrow} 
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-container to-secondary-container text-white dark:text-on-primary-container font-label-sm text-label-sm rounded-lg shadow-[0_0_20px_rgba(189,0,255,0.3)] hover:shadow-[0_0_30px_rgba(0,224,255,0.4)] transition-shadow duration-300 transform hover:-translate-y-1"
                  >
                    Request to Borrow
                  </button>
                ) : (
                  <p className="text-gray-500 dark:text-on-surface-variant flex items-center gap-2">
                    <Clock size={18} /> Librarians cannot borrow books.
                  </p>
                )
              ) : (
                <button 
                  className="w-full sm:w-auto px-8 py-4 bg-gray-300 dark:bg-surface-variant text-gray-500 dark:text-on-surface-variant font-label-sm text-label-sm rounded-lg cursor-not-allowed"
                  disabled
                >
                  Join Waitlist
                </button>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookDetails;
