import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Book, Clock, AlertTriangle, IndianRupee, Search, History, Bell } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    borrowed: 0,
    dueSoon: 0,
    overdue: 0,
    fines: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [payingFine, setPayingFine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('BORROWED'); // BORROWED, DUE_SOON, OVERDUE

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [transRes, profileRes, notifRes] = await Promise.all([
          api.get('/transactions/my'),
          api.get('/auth/me'),
          api.get('/notifications')
        ]);
        
        if (profileRes.data.success) {
          setProfile(profileRes.data.data);
        }

        if (notifRes.data.success) {
          setNotifications(notifRes.data.data.slice(0, 5));
        }

        if (transRes.data.success) {
          const trans = transRes.data.data;
          setTransactions(trans);

          let borrowed = 0;
          let dueSoon = 0;
          let overdue = 0;
          let unpaidFines = 0;

          const now = new Date();
          const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

          trans.forEach(t => {
            if (t.status === 'ISSUED') {
              borrowed++;
              const dueDate = new Date(t.dueDate);
              if (dueDate < now) {
                overdue++;
                borrowed--; // It's overdue, not just borrowed
              } else if (dueDate <= threeDaysFromNow) {
                dueSoon++;
              }
            }
            if (t.status === 'OVERDUE') overdue++;
            if (t.fineStatus === 'UNPAID') unpaidFines += t.fine;
          });

          setStats({ borrowed, dueSoon, overdue, fines: unpaidFines });
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRenew = async (transactionId) => {
    try {
      const res = await api.put(`/transactions/${transactionId}/renew`);
      if (res.data.success) {
        toast.success('Book renewed successfully');
        setTransactions(transactions.map(t => t._id === transactionId ? res.data.data : t));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to renew book');
    }
  };

  const handleReturn = async (transactionId) => {
    try {
      const res = await api.put(`/transactions/${transactionId}/return`);
      if (res.data.success) {
        toast.success('Book returned successfully');
        setTransactions(transactions.filter(t => t._id !== transactionId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
    }
  };

  const handlePayFines = async () => {
    setPayingFine(true);
    try {
      const unpaidTrans = transactions.filter(t => t.fineStatus === 'UNPAID');
      for (const t of unpaidTrans) {
        await api.put(`/transactions/${t._id}/pay-fine`);
      }
      toast.success('Fines paid successfully!');
      
      // Update local state
      const updatedTrans = transactions.map(t => {
        if (t.fineStatus === 'UNPAID') return { ...t, fineStatus: 'PAID', fine: 0 };
        return t;
      });
      setTransactions(updatedTrans);
      setStats({ ...stats, fines: 0 });
    } catch (err) {
      toast.error('Failed to process payment');
    } finally {
      setPayingFine(false);
    }
  };

  const activeBooks = transactions.filter(t => {
    if (t.status !== 'ISSUED' && t.status !== 'OVERDUE') return false;
    
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const dueDate = new Date(t.dueDate);
    const isOverdue = t.status === 'OVERDUE' || dueDate < now;
    const isDueSoon = dueDate >= now && dueDate <= threeDaysFromNow;

    if (filter === 'OVERDUE') return isOverdue;
    if (filter === 'DUE_SOON') return isDueSoon && !isOverdue;
    return true; // BORROWED (shows all active)
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 z-10 relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-container-padding-mobile md:px-container-padding-desktop z-10 relative">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-primary flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student'}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">ID: {profile?.studentId || 'N/A'} • {profile?.course?.name || profile?.course || 'N/A'}</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <Link to="/books" className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary/20 transition-colors">
              <Search size={18} /> Search Books
            </Link>
            <Link to="/dashboard/history" className="flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-lg font-semibold hover:bg-secondary/20 transition-colors">
              <History size={18} /> My History
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Stats Sidebar */}
          <div className="md:col-span-4 space-y-4">
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-black/10 dark:border-white/10 pb-4">Overview</h2>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Book className="text-blue-500" size={20} />
                    <span className="font-medium">Borrowed Books</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{stats.borrowed}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Clock className="text-orange-500" size={20} />
                    <span className="font-medium">Due Soon</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{stats.dueSoon}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <AlertTriangle className="text-red-500" size={20} />
                    <span className="font-medium">Overdue</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{stats.overdue}</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <IndianRupee className="text-red-500" size={20} />
                    <span className="font-medium">Outstanding Fine</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-red-500">₹{stats.fines}</span>
                    {stats.fines > 0 && (
                      <button 
                        onClick={handlePayFines}
                        disabled={payingFine}
                        className="mt-2 text-xs bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full transition-colors"
                      >
                        {payingFine ? 'Processing...' : 'Pay Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4 border-b border-black/10 dark:border-white/10 pb-4">
                <Bell size={20} className="text-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Alerts</h2>
              </div>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500">No new notifications.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'WARNING' || n.type === 'ERROR' ? 'bg-red-500' : 'bg-primary'}`}></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Active Books List */}
          <div className="md:col-span-8">
            <div className="glass-panel p-6 rounded-2xl min-h-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-black/10 dark:border-white/10 pb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Books</h2>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setFilter('BORROWED')} 
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${filter === 'BORROWED' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    Borrowed
                  </button>
                  <button 
                    onClick={() => setFilter('DUE_SOON')} 
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${filter === 'DUE_SOON' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    Due Soon
                  </button>
                  <button 
                    onClick={() => setFilter('OVERDUE')} 
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${filter === 'OVERDUE' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    Overdue
                  </button>
                </div>
              </div>
              
              {activeBooks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Book size={48} className="mx-auto mb-4 opacity-20" />
                  <p>
                    {filter === 'OVERDUE' ? 'You have no overdue books. Great job!' : 
                     filter === 'DUE_SOON' ? 'You have no books due soon.' : 
                     'You have no active borrowed books.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBooks.map(t => {
                    const isOverdue = t.status === 'OVERDUE' || (t.status === 'ISSUED' && new Date() > new Date(t.dueDate));
                    
                    return (
                      <div key={t._id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border gap-4 ${isOverdue ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50' : 'border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20'}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                            <Book className="text-gray-400" size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1">{t.book?.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Author: {t.book?.author}</p>
                          </div>
                        </div>
                        
                        <div className="text-right flex flex-col items-start sm:items-end gap-2">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                              Due: {new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            {isOverdue && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold uppercase inline-block">Overdue</span>}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                            {(t.book?.type === 'digital' || t.book?.type === 'hybrid') && (
                              <Link to={`/reader/${t.book._id}`} className="text-xs bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover font-semibold transition-colors shadow-sm">
                                Read Book
                              </Link>
                            )}
                            <button 
                              onClick={() => handleRenew(t._id)}
                              disabled={isOverdue || t.renewalsCount >= 1}
                              className={`text-xs px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm ${
                                isOverdue || t.renewalsCount >= 1 
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 shadow-none' 
                                  : 'bg-secondary text-white hover:bg-secondary-hover'
                              }`}
                            >
                              Renew
                            </button>
                            <button 
                              onClick={() => handleReturn(t._id)}
                              className="text-xs px-4 py-2 rounded-lg font-semibold transition-colors bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 shadow-sm"
                            >
                              Return
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
