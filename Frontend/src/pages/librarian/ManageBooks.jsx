import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Plus, X, Search, BookOpen, Trash2 } from 'lucide-react';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', publisher: '', category: '', type: 'physical', edition: '', publicationYear: '', language: 'English'
  });

  // Copies State
  const [selectedBook, setSelectedBook] = useState(null);
  const [copies, setCopies] = useState([]);
  const [showAddCopy, setShowAddCopy] = useState(false);
  const [copyData, setCopyData] = useState({ accessionNumber: '', barcode: '', condition: 'NEW', shelfLocation: '' });

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

  const handleAddBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/books', formData);
      if (response.data.success) {
        toast.success('Book created successfully');
        setShowAddForm(false);
        setFormData({ title: '', author: '', isbn: '', publisher: '', category: '', type: 'physical', edition: '', publicationYear: '', language: 'English' });
        fetchBooks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectBook = async (book) => {
    setSelectedBook(book);
    try {
      const res = await api.get(`/books/${book._id}/copies`);
      setCopies(res.data.data);
    } catch (err) {
      toast.error('Failed to load book copies');
    }
  };

  const handleAddCopy = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/books/${selectedBook._id}/copies`, copyData);
      toast.success('Copy added successfully');
      setCopies([...copies, res.data.data]);
      setShowAddCopy(false);
      setCopyData({ accessionNumber: '', barcode: '', condition: 'NEW', shelfLocation: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add copy');
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.isbn.includes(search));

  return (
    <div className="min-h-screen pt-24 pb-12 px-container-padding-mobile md:px-container-padding-desktop z-10 relative">
      <div className="max-w-7xl mx-auto">
        <Link className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors mb-6 font-semibold" to="/librarian/dashboard">
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-gray-900 dark:text-on-background">Inventory Management</h1>
            <p className="text-gray-600 dark:text-on-surface-variant mt-2">Manage library titles and their physical copies.</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:opacity-90">
            {showAddForm ? 'Cancel' : <><Plus size={20} /> Add New Title</>}
          </button>
        </div>

        {showAddForm && (
          <div className="glass-panel p-8 rounded-2xl mb-8 fade-in-up border border-primary/20">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-on-background">Create New Book Title</h2>
            <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="text" placeholder="Title *" required className="glass-input px-4 py-3 rounded-lg w-full" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <input type="text" placeholder="Author *" required className="glass-input px-4 py-3 rounded-lg w-full" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
              <input type="text" placeholder="ISBN *" required className="glass-input px-4 py-3 rounded-lg w-full" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} />
              <input type="text" placeholder="Category *" required className="glass-input px-4 py-3 rounded-lg w-full" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              <input type="text" placeholder="Publisher" className="glass-input px-4 py-3 rounded-lg w-full" value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} />
              <input type="text" placeholder="Edition (e.g. 3rd)" className="glass-input px-4 py-3 rounded-lg w-full" value={formData.edition} onChange={e => setFormData({...formData, edition: e.target.value})} />
              <input type="number" placeholder="Publication Year" className="glass-input px-4 py-3 rounded-lg w-full" value={formData.publicationYear} onChange={e => setFormData({...formData, publicationYear: e.target.value})} />
              <input type="text" placeholder="Language" className="glass-input px-4 py-3 rounded-lg w-full" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} />
              
              <div className="md:col-span-3">
                <button type="submit" disabled={submitting} className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold hover:opacity-90">Save Title</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Books List */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-black/10 dark:border-white/10">
              <Search className="text-gray-400" />
              <input type="text" placeholder="Search by title or ISBN..." className="bg-transparent border-none outline-none w-full text-gray-900 dark:text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            
            <div className="space-y-4">
              {filteredBooks.map(book => (
                <div key={book._id} onClick={() => handleSelectBook(book)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedBook?._id === book._id ? 'border-primary bg-primary/5' : 'border-black/10 dark:border-white/10 hover:border-primary/50 bg-white dark:bg-surface-container'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{book.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{book.author} • ISBN: {book.isbn}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded font-semibold text-gray-600 dark:text-gray-300">{book.category}</span>
                  </div>
                </div>
              ))}
              {filteredBooks.length === 0 && <p className="text-center text-gray-500 py-8">No books found.</p>}
            </div>
          </div>

          {/* Copies Management Sidebar */}
          <div className="lg:col-span-1">
            {selectedBook ? (
              <div className="glass-panel p-6 rounded-2xl sticky top-24">
                <div className="mb-6 pb-6 border-b border-black/10 dark:border-white/10">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedBook.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage Physical Copies</p>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Copies ({copies.length})</h3>
                  <button onClick={() => setShowAddCopy(!showAddCopy)} className="text-primary hover:text-primary/80 font-semibold text-sm flex items-center gap-1">
                    <Plus size={16} /> Add Copy
                  </button>
                </div>

                {showAddCopy && (
                  <form onSubmit={handleAddCopy} className="mb-6 p-4 bg-black/5 dark:bg-white/5 rounded-lg space-y-3 border border-black/10 dark:border-white/10">
                    <input type="text" placeholder="Accession Number (e.g. COPY-001) *" required className="glass-input w-full p-2 text-sm rounded" value={copyData.accessionNumber} onChange={e => setCopyData({...copyData, accessionNumber: e.target.value})} />
                    <input type="text" placeholder="Barcode" className="glass-input w-full p-2 text-sm rounded" value={copyData.barcode} onChange={e => setCopyData({...copyData, barcode: e.target.value})} />
                    <input type="text" placeholder="Shelf Location" className="glass-input w-full p-2 text-sm rounded" value={copyData.shelfLocation} onChange={e => setCopyData({...copyData, shelfLocation: e.target.value})} />
                    <select className="glass-input w-full p-2 text-sm rounded" value={copyData.condition} onChange={e => setCopyData({...copyData, condition: e.target.value})}>
                      <option value="NEW">New</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                    </select>
                    <button type="submit" className="w-full bg-primary text-on-primary py-2 rounded text-sm font-semibold">Save</button>
                  </form>
                )}

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {copies.map(copy => (
                    <div key={copy._id} className="p-3 bg-white dark:bg-black/20 rounded-lg border border-black/5 dark:border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">{copy.accessionNumber}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${copy.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {copy.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>Shelf: {copy.shelfLocation || 'N/A'}</span>
                        <span>Cond: {copy.condition}</span>
                      </div>
                      {copy.currentBorrower && (
                        <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 text-xs">
                          <span className="text-gray-400">Issued to: </span>
                          <span className="text-primary font-medium">{copy.currentBorrower.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {copies.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No copies exist for this book.</p>}
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl h-full flex flex-col items-center justify-center text-center text-gray-500 border-dashed border-2 border-black/10 dark:border-white/10">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p>Select a book from the list<br/>to manage its physical copies.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBooks;
