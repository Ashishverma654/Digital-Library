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
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [onWaitlist, setOnWaitlist] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBookAndReviews = async () => {
      try {
        const promises = [
          api.get(`/books/${id}`),
          api.get(`/books/${id}/reviews`)
        ];
        
        if (user && user.role === 'STUDENT') {
          promises.push(api.get('/transactions/my'));
        }

        const results = await Promise.all(promises);
        const bookRes = results[0];
        const reviewsRes = results[1];
        
        if (bookRes.data.success) {
          setBook(bookRes.data.data);
          if (user && bookRes.data.data.waitlist?.includes(user.id)) {
            setOnWaitlist(true);
          }
        }
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data);
        }
        
        if (user && user.role === 'STUDENT' && results[2]) {
          const transRes = results[2];
          if (transRes.data.success) {
            const active = transRes.data.data.find(t => 
              t.book._id === id && ['REQUESTED', 'ISSUED', 'OVERDUE'].includes(t.status)
            );
            setActiveTransaction(active);
          }
        }
      } catch (err) {
        toast.error('Failed to fetch book details');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndReviews();
  }, [id, navigate, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating || !comment) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/books/${id}/reviews`, { rating, comment });
      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setComment('');
        setRating(5);
        // Refetch reviews
        const reviewsRes = await api.get(`/books/${id}/reviews`);
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

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
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleJoinWaitlist = async () => {
    try {
      const response = await api.post(`/books/${id}/waitlist`);
      if (response.data.success) {
        toast.success('Successfully joined the waitlist!');
        setOnWaitlist(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join waitlist');
    }
  };

  const coverImage = (book.coverImage && book.coverImage !== 'default-cover.jpg') 
    ? book.coverImage 
    : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop";

  return (
    <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-32 relative z-10 fade-in-up">
      {/* Back Action */}
      <Link className="inline-flex items-center space-x-2 text-secondary dark:text-secondary-fixed-dim hover:text-primary transition-colors duration-200 mb-8 font-label-sm text-label-sm group" to="/books">
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
              <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Synopsis</h3>
              <p className="font-body-md text-body-md text-gray-800 dark:text-on-surface-variant max-w-3xl whitespace-pre-wrap">
                {book.description || 'No description available for this book.'}
              </p>
            </div>
            
            {/* Meta Data */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 bg-white/30 dark:bg-black/20 rounded-lg">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">ISBN</p>
                <p className="font-body-md text-gray-900 dark:text-on-surface">{book.isbn}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Publisher</p>
                <p className="font-body-md text-gray-900 dark:text-on-surface">{book.publisher || 'N/A'}</p>
              </div>
              {book.type !== 'digital' && (
                <>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Total Copies</p>
                    <p className="font-body-md text-gray-900 dark:text-on-surface">{book.totalCopies}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Available</p>
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
              
              {/* Render action buttons based on book type and availability */}
              
              {!user ? (
                <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 text-center">
                  Login to Access
                </Link>
              ) : user.role === 'LIBRARIAN' ? (
                <p className="text-gray-500 dark:text-on-surface-variant flex items-center gap-2">
                  <Clock size={18} /> Librarians cannot borrow or read books.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  
                  {/* Read Now Button (For Digital and Hybrid) */}
                  {(book.type === 'digital' || book.type === 'hybrid') && (
                    <Link 
                      to={`/books/${id}/read`}
                      className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 text-center flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">menu_book</span>
                      Read Now
                    </Link>
                  )}

                  {/* Borrow Button (For Physical and Hybrid) */}
                  {(book.type === 'physical' || book.type === 'hybrid') && (
                    activeTransaction ? (
                      <button 
                        className="w-full sm:w-auto px-8 py-4 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded-lg cursor-not-allowed border border-outline flex items-center justify-center gap-2"
                        disabled
                      >
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        {activeTransaction.status === 'REQUESTED' ? 'Request Pending' : 'Already Borrowed'}
                      </button>
                    ) : isAvailable ? (
                      <button 
                        onClick={handleRequestBorrow} 
                        className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">library_books</span>
                        Request Physical Copy
                      </button>
                    ) : onWaitlist ? (
                      <button 
                        className="w-full sm:w-auto px-8 py-4 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded-lg cursor-not-allowed border border-outline flex items-center justify-center gap-2"
                        disabled
                      >
                        <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
                        On Waitlist
                      </button>
                    ) : (
                      <button 
                        onClick={handleJoinWaitlist}
                        className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Join Waitlist
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
      {/* Reviews Section */}
      <div className="mt-12 glass-panel rounded-xl p-glass-padding md:p-12">
        <h2 className="font-headline-md text-headline-md text-gray-900 dark:text-primary-fixed mb-6">Reviews & Ratings</h2>
        
        {/* Review Form (Only if logged in and not a librarian, though ideally backend checks if borrowed) */}
        {user && user.role === 'STUDENT' && (
          <form onSubmit={handleSubmitReview} className="mb-10 bg-white/30 dark:bg-black/20 p-6 rounded-lg border border-black/5 dark:border-white/5">
            <h3 className="font-headline-sm text-headline-sm text-gray-900 dark:text-on-surface mb-4">Leave a Review</h3>
            <div className="flex items-center gap-4 mb-4">
              <label className="font-label-sm text-gray-700 dark:text-on-surface-variant">Rating:</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`material-symbols-outlined text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-600'}`}
                    style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="glass-input w-full p-4 rounded-lg font-body-md text-gray-900 dark:text-on-background mb-4"
              rows="3"
              placeholder="Share your thoughts about this book..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-6 py-2 bg-primary/20 hover:bg-primary/30 text-primary dark:text-primary-fixed border border-primary/30 rounded-lg font-label-sm transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Review List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500 dark:text-on-surface-variant italic">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="border-b border-black/5 dark:border-white/5 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm font-semibold text-gray-900 dark:text-on-surface">{review.user?.name || 'Anonymous'}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        className={`material-symbols-outlined text-sm ${star <= review.rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-700'}`}
                        style={{ fontVariationSettings: star <= review.rating ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>
                <p className="font-body-md text-gray-700 dark:text-on-surface-variant">{review.comment}</p>
                <p className="font-label-sm text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default BookDetails;
