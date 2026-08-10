import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: '',
    description: '',
    type: 'digital',
    totalCopies: 0,
    coverImage: '',
    digitalFileUrl: ''
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books');
      if (response.data.success) {
        setBooks(response.data.data);
      }
    } catch (err) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (payload.type === 'digital') {
        payload.totalCopies = 0;
      } else {
        payload.totalCopies = Number(payload.totalCopies);
      }

      const response = await api.post('/books', payload);
      if (response.data.success) {
        toast.success('Book added successfully');
        setShowAddForm(false);
        setFormData({
          title: '', author: '', isbn: '', publisher: '', category: '', description: '', type: 'digital', totalCopies: 0, coverImage: '', digitalFileUrl: ''
        });
        fetchBooks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await api.delete(`/books/${id}`);
        if (response.data.success) {
          toast.success('Book deleted successfully');
          setBooks(books.filter(b => b._id !== id));
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete book');
      }
    }
  };

  if (loading && books.length === 0) {
    return (
      <div className="flex justify-center items-center py-32 z-10 relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop pt-32 pb-24 relative z-10 fade-in-up">
      <Link className="inline-flex items-center space-x-2 text-secondary dark:text-secondary-fixed-dim hover:text-secondary-container transition-colors duration-200 mb-8 font-label-sm text-label-sm group" to="/librarian/dashboard">
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform duration-200">arrow_back</span>
        <span>Back to Dashboard</span>
      </Link>
      
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary dark:text-primary-fixed tracking-tight">
            Manage Catalog
          </h1>
          <p className="font-body-md text-body-md text-gray-600 dark:text-on-surface-variant mt-2 max-w-2xl">
            Add new books, update existing inventory, and manage the digital collection.
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-3 px-6 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-body-md text-body-md font-bold hover:shadow-[0_0_20px_rgba(236,178,255,0.4)] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">{showAddForm ? 'close' : 'add'}</span>
          {showAddForm ? 'Cancel' : 'Add New Book'}
        </button>
      </header>

      {showAddForm && (
        <div className="glass-panel rounded-xl p-8 mb-10 border border-primary/20">
          <h2 className="font-headline-md text-gray-900 dark:text-white mb-6">Add New Book</h2>
          <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="glass-input w-full p-3 rounded-lg text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author *</label>
              <input type="text" name="author" required value={formData.author} onChange={handleInputChange} className="glass-input w-full p-3 rounded-lg text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ISBN *</label>
              <input type="text" name="isbn" required value={formData.isbn} onChange={handleInputChange} className="glass-input w-full p-3 rounded-lg text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select name="category" required value={formData.category} onChange={handleInputChange} className="glass-input w-full p-3 rounded-lg text-gray-900 dark:text-white bg-white/50 dark:bg-black/20">
                <option value="" disabled>Select Category</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science">Science</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Self Help">Self Help</option>
                <option value="Design">Design</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
              <select name="type" required value={formData.type} onChange={handleInputChange} className="glass-input w-full p-3 rounded-lg text-gray-900 dark:text-white bg-white/50 dark:bg-black/20">
                <option value="digital">Digital</option>
                <option value="physical">Physical</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            {formData.type !== 'digital' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Copies *</label>
                <input type="number" name="totalCopies" min="1" required value={formData.totalCopies} onChange={handleInputChange} className="glass-input w-full p-3 rounded-lg text-gray-900 dark:text-white" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Publisher</label>
              <input type="text" name="publisher" value={formData.publisher} onChange={handleInputChange} className="glass-input w-full p-3 rounded-lg text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image URL</label>
              <input type="url" name="coverImage" placeholder="https://..." value={formData.coverImage} onChange={handleInputChange} className="glass-input w-full p-3 rounded-lg text-gray-900 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="glass-input w-full p-3 rounded-lg text-gray-900 dark:text-white"></textarea>
            </div>
            {(formData.type === 'digital' || formData.type === 'hybrid') && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Digital File URL *</label>
                <input type="url" name="digitalFileUrl" required placeholder="https://..." value={formData.digitalFileUrl} onChange={handleInputChange} className="glass-input w-full p-3 rounded-lg text-gray-900 dark:text-white" />
              </div>
            )}
            <div className="md:col-span-2 flex justify-end mt-4">
              <button type="submit" disabled={submitting} className="py-3 px-8 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-colors">
                {submitting ? 'Adding...' : 'Save Book'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Books Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-gray-500 dark:text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider bg-gray-100 dark:bg-black/10">
                <th className="p-4 pl-6 font-semibold">Title</th>
                <th className="p-4 font-semibold">Author</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 pr-6 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-gray-900 dark:text-on-surface divide-y divide-black/5 dark:divide-white/5">
              {books.map(book => (
                <tr key={book._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200">
                  <td className="p-4 pl-6 text-gray-900 dark:text-white font-medium">{book.title}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{book.author}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{book.category}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300 capitalize">{book.type}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {book.type === 'digital' ? '∞' : `${book.availableCopies}/${book.totalCopies}`}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button 
                      onClick={() => handleDeleteBook(book._id)}
                      className="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error hover:text-white transition-all ml-auto" 
                      title="Delete Book"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default ManageBooks;
