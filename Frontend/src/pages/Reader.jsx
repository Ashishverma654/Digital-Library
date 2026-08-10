import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';

const Reader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [digitalFileUrl, setDigitalFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Hide navbar for distraction-free reading
    const navbar = document.querySelector('nav');
    if (navbar) navbar.style.display = 'none';

    const fetchDigitalContent = async () => {
      try {
        const response = await api.get(`/books/${id}/read`);
        if (response.data.success && response.data.data.digitalFileUrl) {
          setDigitalFileUrl(response.data.data.digitalFileUrl);
        } else {
          setError(true);
          toast.error('Digital content not found');
        }
      } catch (err) {
        setError(true);
        toast.error(err.response?.data?.message || 'Failed to load book content. Make sure you have borrowed it first.');
      } finally {
        setLoading(false);
      }
    };

    fetchDigitalContent();

    // Cleanup: restore navbar on unmount
    return () => {
      if (navbar) navbar.style.display = 'block';
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-full bg-gray-50 dark:bg-gray-900 z-50 fixed top-0 left-0">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="font-label-sm text-gray-500 dark:text-gray-400">Loading your book...</p>
      </div>
    );
  }

  if (error || !digitalFileUrl) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-full bg-gray-50 dark:bg-gray-900 z-50 fixed top-0 left-0 px-4 text-center">
        <div className="glass-panel p-8 rounded-xl max-w-md w-full">
          <span className="material-symbols-outlined text-4xl text-error mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <h2 className="font-headline-sm text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="font-body-md text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load the digital content for this book. If it is a hybrid book, ensure you have an active borrow request that has been issued.
          </p>
          <button 
            onClick={() => navigate(`/books/${id}`)}
            className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-colors"
          >
            Go Back to Book Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-white dark:bg-gray-900 z-[100] flex flex-col">
      {/* Reader Header */}
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-white/10 flex items-center px-4 flex-shrink-0 shadow-sm">
        <button 
          onClick={() => navigate(`/books/${id}`)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-fixed transition-colors font-label-sm px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
        >
          <ArrowLeft size={18} />
          <span>Exit Reader</span>
        </button>
        <div className="mx-auto font-label-sm text-gray-500 dark:text-gray-400 truncate max-w-xs md:max-w-md">
          Digital Reading Portal
        </div>
        <div className="w-24"></div> {/* Spacer to balance header */}
      </header>

      {/* Reader Content - iFrame */}
      <div className="flex-grow w-full bg-gray-100 dark:bg-black overflow-hidden relative">
        <iframe 
          src={`${digitalFileUrl}#toolbar=0`} 
          title="Book Reader"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default Reader;
