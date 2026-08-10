import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Check, X } from 'lucide-react';

const LibrarianTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('REQUESTED');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/librarian/transactions');
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await api.put(`/librarian/transactions/${id}/approve`);
      if (response.data.success) {
        toast.success('Request approved successfully');
        fetchTransactions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason (optional):");
    try {
      const response = await api.put(`/librarian/transactions/${id}/reject`, { reason });
      if (response.data.success) {
        toast.success('Request rejected successfully');
        fetchTransactions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleReturn = async (id) => {
    try {
      const response = await api.put(`/librarian/transactions/${id}/return`);
      if (response.data.success) {
        toast.success('Book returned successfully');
        if (response.data.data.fine > 0) {
          toast.warning(`A fine of ₹${response.data.data.fine} was calculated for this overdue return.`);
        }
        fetchTransactions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const response = await api.put(`/librarian/transactions/${id}/fine-paid`);
      if (response.data.success) {
        toast.success('Fine marked as paid');
        fetchTransactions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark fine as paid');
    }
  };

  const filteredTransactions = transactions.filter(t => t.status === activeTab);

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>Transaction Management</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        {['REQUESTED', 'ISSUED', 'OVERDUE', 'RETURNED', 'REJECTED'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1rem',
              fontWeight: 600,
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center mt-4">Loading transactions...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">No transactions found for this status.</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--background)' }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>User</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Book</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Date</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Availability</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{t.user?.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t.user?.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{t.book?.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t.book?.type}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {new Date(t.requestedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {t.book?.availableCopies > 0 ? (
                      <span style={{ color: 'var(--secondary)' }}>Available</span>
                    ) : (
                      <span style={{ color: 'var(--danger)' }}>Unavailable</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {activeTab === 'REQUESTED' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApprove(t._id)}
                          className="btn" 
                          style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', padding: '0.5rem' }}
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleReject(t._id)}
                          className="btn" 
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.5rem' }}
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                    {(activeTab === 'ISSUED' || activeTab === 'OVERDUE') && (
                      <button 
                        onClick={() => handleReturn(t._id)}
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                      >
                        Confirm Return
                      </button>
                    )}
                    {activeTab === 'RETURNED' && t.fineStatus === 'UNPAID' && (
                      <button 
                        onClick={() => handleMarkPaid(t._id)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                      >
                        Mark Fine Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LibrarianTransactions;
