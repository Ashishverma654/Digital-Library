import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Tilt from 'react-parallax-tilt';

const BookCard = ({ book }) => {
  const isAvailable = book.type === 'digital' || book.availableCopies > 0;
  
  // High quality fallback image for aesthetics
  const coverImage = (book.coverImage && book.coverImage !== 'default-cover.jpg') 
    ? book.coverImage 
    : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop";

  return (
    <Tilt 
      glareEnable={true} 
      glareMaxOpacity={0.3} 
      glareColor="#ffffff" 
      glarePosition="bottom" 
      glareBorderRadius="12px"
      scale={1.03}
      transitionSpeed={400}
      className="h-full"
    >
      <article className="bg-surface border border-outline/30 rounded-xl overflow-hidden flex flex-col transition-all duration-300 h-full hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10">
        <div className="h-64 w-full bg-surface-container relative overflow-hidden group">
          <img 
            src={coverImage}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105 transform" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-black/40 backdrop-blur-md text-white font-label-sm text-[10px] uppercase tracking-wider border border-white/20 shadow-sm">
              {book.category}
            </span>
          </div>
        </div>
        
        <div className="p-6 flex flex-col flex-grow gap-4 relative z-10 bg-surface">
          <div className="flex-grow">
            <h3 className="font-headline-md text-headline-md text-on-background line-clamp-2 mb-1">{book.title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1">{book.author}</p>
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline/30">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-label-sm text-label-sm ${isAvailable ? 'bg-success/10 text-success border-success/30' : 'bg-error/10 text-error border-error/30'}`}>
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-success' : 'bg-error'}`}></span> 
              {isAvailable ? 'Available' : 'Waitlist'}
            </span>
            
            <Link to={`/books/${book._id}`} className="bg-primary hover:bg-primary-hover text-on-primary px-5 py-2 rounded-lg font-body-md text-body-md transition-all shadow-sm">
              View
            </Link>
          </div>
        </div>
      </article>
    </Tilt>
  );
};

BookCard.propTypes = {
  book: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    coverImage: PropTypes.string,
    availableCopies: PropTypes.number,
    totalCopies: PropTypes.number,
  }).isRequired,
};

export default BookCard;
