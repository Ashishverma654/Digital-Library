import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    activeBooks: 0,
    overdueBooks: 0,
    totalFines: 0,
    historyCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/transactions/my');
        if (response.data.success) {
          const trans = response.data.data;
          setTransactions(trans);
          
          let active = 0;
          let overdue = 0;
          let unpaidFines = 0;
          
          trans.forEach(t => {
            if (t.status === 'ISSUED') active++;
            if (t.status === 'OVERDUE') overdue++;
            if (t.fineStatus === 'UNPAID') unpaidFines += t.fine;
            
            // Dynamic check for overdue if status is ISSUED but date passed
            if (t.status === 'ISSUED' && new Date() > new Date(t.dueDate)) {
              overdue++;
              active--; // Move from active to overdue for stats display
            }
          });

          setStats({
            activeBooks: active,
            overdueBooks: overdue,
            totalFines: unpaidFines,
            historyCount: trans.length
          });
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeTransactions = transactions.filter(t => t.status === 'ISSUED' || t.status === 'OVERDUE');

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 z-10 relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop pt-32 pb-24 relative z-10 fade-in-up">
      <header className="mb-8">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-gray-900 dark:text-on-surface mb-2">
          Welcome back, {user?.name || 'Reader'}.
        </h1>
        <p className="font-body-lg text-body-lg text-gray-600 dark:text-on-surface-variant">
          Here is your library activity overview.
        </p>
      </header>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
        {/* Card 1 */}
        <div className="glass-panel p-glass-padding rounded-xl hover:-translate-y-1 transition-transform duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary-container/20 dark:bg-secondary-container/10 rounded-lg border border-secondary-container/30">
              <span className="material-symbols-outlined text-secondary dark:text-secondary-fixed-dim" data-icon="menu_book">menu_book</span>
            </div>
            <span className="font-label-sm text-label-sm bg-primary/10 dark:bg-primary-container/20 text-primary dark:text-primary-fixed-dim px-2 py-1 rounded-full border border-primary/20">
              Active
            </span>
          </div>
          <h3 className="font-headline-xl text-headline-xl text-gray-900 dark:text-on-surface">{stats.activeBooks}</h3>
          <p className="font-body-md text-body-md text-gray-600 dark:text-on-surface-variant mt-1">Active Borrows</p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-glass-padding rounded-xl hover:-translate-y-1 transition-transform duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary/20 dark:bg-tertiary-container/10 rounded-lg border border-tertiary/30">
              <span className="material-symbols-outlined text-tertiary dark:text-tertiary-fixed-dim" data-icon="schedule">schedule</span>
            </div>
          </div>
          <h3 className="font-headline-xl text-headline-xl text-gray-900 dark:text-on-surface">{stats.overdueBooks}</h3>
          <p className="font-body-md text-body-md text-gray-600 dark:text-on-surface-variant mt-1">Overdue Books</p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-glass-padding rounded-xl hover:-translate-y-1 transition-transform duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-error/20 dark:bg-error-container/10 rounded-lg border border-error/30">
              <span className="material-symbols-outlined text-error dark:text-error" data-icon="error">error</span>
            </div>
          </div>
          <h3 className="font-headline-xl text-headline-xl text-error dark:text-error-container">
            ₹{stats.totalFines}
          </h3>
          <p className="font-body-md text-body-md text-gray-600 dark:text-on-surface-variant mt-1">Total Fines</p>
        </div>
      </section>

      {/* Active Books Table Area */}
      <section className="glass-panel p-glass-padding rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-md text-headline-md text-gray-900 dark:text-on-surface">Current Borrows</h2>
          <Link to="/dashboard/history" className="text-primary hover:text-primary-hover dark:text-primary-fixed-dim font-label-sm text-label-sm uppercase tracking-wider">
            View All History
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {activeTransactions.length === 0 ? (
            <p className="text-gray-500 dark:text-on-surface-variant py-4">You have no active borrows.</p>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-4 px-4 font-label-sm text-label-sm text-gray-500 dark:text-on-surface-variant uppercase tracking-wider">Title</th>
                  <th className="py-4 px-4 font-label-sm text-label-sm text-gray-500 dark:text-on-surface-variant uppercase tracking-wider">Issued Date</th>
                  <th className="py-4 px-4 font-label-sm text-label-sm text-gray-500 dark:text-on-surface-variant uppercase tracking-wider">Due Date</th>
                  <th className="py-4 px-4 font-label-sm text-label-sm text-gray-500 dark:text-on-surface-variant uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {activeTransactions.map(t => {
                  const isOverdue = t.status === 'OVERDUE' || (t.status === 'ISSUED' && new Date() > new Date(t.dueDate));
                  
                  return (
                    <tr 
                      key={t._id} 
                      className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                        isOverdue ? 'bg-error/5 dark:bg-error-container/5 shadow-[inset_0_0_15px_rgba(255,180,171,0.1)]' : ''
                      }`}
                    >
                      <td className="py-4 px-4 flex items-center gap-4">
                        <div className="w-10 h-14 bg-gray-200 dark:bg-surface-variant/20 rounded border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-gray-400 dark:text-on-surface-variant text-sm" data-icon="image">image</span>
                        </div>
                        <span className="font-body-lg text-body-lg text-gray-900 dark:text-on-surface font-semibold">
                          {t.book?.title || 'Unknown Book'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-body-md text-body-md text-gray-600 dark:text-on-surface-variant">
                        {t.issueDate ? new Date(t.issueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className={`py-4 px-4 font-body-md text-body-md ${isOverdue ? 'text-error dark:text-error-container font-semibold' : 'text-gray-600 dark:text-on-surface-variant'}`}>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm border ${
                          isOverdue 
                            ? 'bg-error/10 dark:bg-error-container/20 text-error dark:text-error-container border-error/20' 
                            : 'bg-secondary/10 dark:bg-secondary-container/20 text-secondary dark:text-secondary-fixed border-secondary/20'
                        }`}>
                          {isOverdue ? 'Overdue' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
