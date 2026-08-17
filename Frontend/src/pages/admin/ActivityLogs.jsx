import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Clock, User as UserIcon, Activity, AlertCircle } from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/logs?page=${page}&limit=20`);
      setLogs(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('LOGIN')) return 'text-green-500 bg-green-500/10';
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('LOST')) return 'text-red-500 bg-red-500/10';
    if (action.includes('CREATE') || action.includes('APPROVE') || action.includes('ADD')) return 'text-blue-500 bg-blue-500/10';
    return 'text-gray-400 bg-gray-500/10';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            System Audit Trail
          </h1>
          <p className="text-on-surface/60 mt-2">Comprehensive history of all user and administrative actions.</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-xl border border-white/10 p-1">
        {loading && logs.length === 0 ? (
          <div className="p-8 text-center text-on-surface/60">Loading logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-on-surface">
              <thead className="bg-surface/50 text-xs uppercase text-on-surface/60 border-b border-white/5">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">User</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Action</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Description</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <UserIcon size={16} />
                        </div>
                        <div>
                          <p className="font-medium">{log.user?.name || 'Unknown User'}</p>
                          <p className="text-xs text-on-surface/60">{log.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{log.description}</p>
                      {log.ipAddress && (
                        <p className="text-xs text-on-surface/40 mt-1">IP: {log.ipAddress}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-on-surface/60">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button 
            className="btn btn-outline px-4 py-2 text-sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span className="text-on-surface/60 text-sm">
            Page {page} of {totalPages}
          </span>
          <button 
            className="btn btn-outline px-4 py-2 text-sm"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
