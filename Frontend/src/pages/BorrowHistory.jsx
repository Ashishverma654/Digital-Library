import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const BorrowHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/transactions/my');
        if (response.data.success) {
          setTransactions(response.data.data);
        }
      } catch (err) {
        toast.error('Failed to load borrowing history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ISSUED': return 'var(--primary)';
      case 'OVERDUE': return 'var(--danger)';
      case 'RETURNED': return 'var(--secondary)';
      case 'REJECTED': return 'var(--danger)';
      default: return 'var(--warning)';
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>Borrowing History</h2>

      {loading ? (
        <div className="text-center mt-4">Loading history...</div>
      ) : transactions.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">You haven't requested or borrowed any books yet.</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--background)' }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Book</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Dates</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Fine</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{t.book?.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t.book?.author}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <div>Requested: {new Date(t.requestedAt).toLocaleDateString()}</div>
                    {t.issuedAt && <div>Issued: {new Date(t.issuedAt).toLocaleDateString()}</div>}
                    {t.returnedAt && <div>Returned: {new Date(t.returnedAt).toLocaleDateString()}</div>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {t.fine > 0 ? (
                      <span style={{ color: t.fineStatus === 'UNPAID' ? 'var(--danger)' : 'var(--secondary)', fontWeight: 500 }}>
                        ₹{t.fine} ({t.fineStatus})
                      </span>
                    ) : (
                      <span className="text-muted">₹0</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      color: getStatusColor(t.status), 
                      backgroundColor: `${getStatusColor(t.status)}15`,
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      {t.status}
                    </span>
                    {t.status === 'REJECTED' && t.rejectionReason && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.5rem' }}>
                        Reason: {t.rejectionReason}
                      </div>
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

export default BorrowHistory;
