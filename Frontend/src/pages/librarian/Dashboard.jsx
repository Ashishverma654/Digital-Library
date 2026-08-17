import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const LibrarianDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    pendingRequests: 0,
    activeIssued: 0,
    overdueCount: 0,
    totalFinesCollected: 0,
    totalUnpaidFines: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, transRes] = await Promise.all([
          api.get('/librarian/stats'),
          api.get('/librarian/transactions')
        ]);
        
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        
        if (transRes.data.success) {
          // Filter to only pending requests, take top 5
          const pending = transRes.data.data
            .filter(t => t.status === 'REQUESTED')
            .slice(0, 5);
          setRecentRequests(pending);
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = async (transactionId, action) => {
    try {
      const response = await api.put(`/librarian/transactions/${transactionId}/${action}`);
      if (response.data.success) {
        toast.success(`Transaction ${action}ed successfully`);
        // Remove from list
        setRecentRequests(prev => prev.filter(t => t._id !== transactionId));
        // Update pending stats count
        setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests - 1 }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} transaction`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 z-10 relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop pt-32 pb-24 relative z-10 fade-in-up">
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary dark:text-primary-fixed tracking-tight">
            Librarian Command Center
          </h1>
          <p className="font-body-md text-body-md text-gray-600 dark:text-on-surface-variant mt-2 max-w-2xl">
            Overview of digital library performance, active loans, and pending requests. Manage your collection and user activity from one centralized hub.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/librarian/students"
            className="py-3 px-6 rounded-lg bg-gradient-to-r from-tertiary to-primary text-white font-body-md text-body-md font-bold hover:shadow-[0_0_20px_rgba(255,180,171,0.4)] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px]">school</span>
            Manage Students
          </Link>
          <Link 
            to="/librarian/books"
            className="py-3 px-6 rounded-lg bg-gradient-to-r from-secondary to-tertiary text-white font-body-md text-body-md font-bold hover:shadow-[0_0_20px_rgba(255,217,224,0.4)] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px]">library_add</span>
            Manage Books
          </Link>
          <Link 
            to="/librarian/transactions"
            className="py-3 px-6 rounded-lg bg-gradient-to-r from-primary to-secondary-container text-white dark:text-background font-body-md text-body-md font-bold hover:shadow-[0_0_20px_rgba(236,178,255,0.4)] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px]">manage_search</span>
            Manage Transactions
          </Link>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {/* Stat Cards */}
        {[
          { label: 'Total Books', value: stats.totalBooks, icon: 'library_books', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Available Copies', value: stats.availableCopies, icon: 'inventory_2', color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Issued Books', value: stats.activeIssued, icon: 'menu_book', color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Overdue Books', value: stats.overdueCount, icon: 'alarm_on', color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'Reservations', value: stats.pendingRequests, icon: 'bookmark', color: 'text-tertiary', bg: 'bg-tertiary/10' },
          { label: 'Registered Members', value: stats.totalUsers, icon: 'groups', color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Fines Collected', value: `₹${stats.totalFinesCollected}`, icon: 'payments', color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Outstanding Fines', value: `₹${stats.totalUnpaidFines}`, icon: 'warning', color: 'text-error', bg: 'bg-error/10' },
        ].map((s, i) => (
          <div key={i} className="glass-panel glass-panel-hover rounded-xl p-5 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none">
            <div className={`absolute -right-4 -top-4 w-20 h-20 ${s.bg} rounded-full blur-2xl transition-all`}></div>
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className={`p-2 rounded-lg ${s.bg} ${s.color} border border-white/20`}>
                <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
              </div>
            </div>
            <div className="relative z-10">
              <p className="font-label-sm text-xs text-gray-500 dark:text-on-surface-variant uppercase tracking-wider mb-1">{s.label}</p>
              <h3 className="font-headline-sm text-2xl font-bold text-gray-900 dark:text-white">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Table Section */}
      <div className="glass-panel rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none">
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/[0.02]">
          <h3 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed text-[20px]">Recent Requests</h3>
          <Link to="/librarian/transactions" className="text-secondary dark:text-secondary-fixed text-sm hover:text-secondary-hover dark:hover:text-white transition-colors flex items-center gap-1">
            View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {recentRequests.length === 0 ? (
            <p className="text-gray-500 dark:text-on-surface-variant p-6 text-center">No pending requests at this time.</p>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-gray-500 dark:text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider bg-gray-100 dark:bg-black/10">
                  <th className="p-4 pl-6 font-semibold">User Name</th>
                  <th className="p-4 font-semibold">Book Title</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 pr-6 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-gray-900 dark:text-on-surface divide-y divide-black/5 dark:divide-white/5">
                {recentRequests.map(req => (
                  <tr key={req._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-black/10 dark:border-white/20 shadow-sm bg-primary/10 flex items-center justify-center text-primary dark:text-primary-fixed font-bold text-xs uppercase">
                          {req.user?.name ? req.user.name.substring(0, 2) : 'U'}
                        </div>
                        <span className="group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">
                          {req.user?.name || 'Unknown User'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-on-surface-variant group-hover:text-gray-900 dark:group-hover:text-on-surface transition-colors">
                      {req.book?.title || 'Unknown Book'}
                    </td>
                    <td className="p-4 text-gray-500 dark:text-on-surface-variant/70">
                      {new Date(req.requestDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tertiary/10 dark:bg-tertiary-fixed/10 text-tertiary dark:text-tertiary-fixed border border-tertiary/20 dark:border-tertiary-fixed/20 backdrop-blur-sm">
                        Pending
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-70 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleAction(req._id, 'approve')}
                          className="w-8 h-8 rounded-full bg-secondary/10 dark:bg-gradient-to-br from-secondary-container/20 to-secondary-container/10 border border-secondary/30 dark:border-secondary-container/30 text-secondary dark:text-secondary-container flex items-center justify-center hover:scale-110 hover:bg-secondary hover:text-white dark:hover:bg-secondary-container dark:hover:text-on-secondary-container transition-all shadow-[0_0_10px_rgba(0,224,255,0)] hover:shadow-[0_0_10px_rgba(0,224,255,0.4)]" 
                          title="Approve"
                        >
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        </button>
                        <button 
                          onClick={() => handleAction(req._id, 'reject')}
                          className="w-8 h-8 rounded-full bg-error/10 dark:bg-gradient-to-br from-error/20 to-error/10 border border-error/30 dark:border-error/30 text-error flex items-center justify-center hover:scale-110 hover:bg-error hover:text-white dark:hover:bg-error dark:hover:text-on-error transition-all shadow-[0_0_10px_rgba(255,180,171,0)] hover:shadow-[0_0_10px_rgba(255,180,171,0.4)]" 
                          title="Reject"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
};

export default LibrarianDashboard;
