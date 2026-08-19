import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setIsOpen(false);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'SUCCESS': return 'var(--secondary)';
      case 'WARNING': return 'var(--warning)';
      case 'ERROR': return 'var(--danger)';
      default: return 'var(--primary)';
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn" 
        style={{ padding: '0.4rem', position: 'relative', backgroundColor: 'transparent', color: 'var(--text-main)', border: 'none' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            backgroundColor: 'var(--danger)',
            color: 'white',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            fontSize: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="card"
          style={{
            position: 'absolute',
            top: '120%',
            right: '0',
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}
        >
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="btn" 
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: 'transparent', color: 'var(--primary)' }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id} 
                  style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: notification.isRead ? 'transparent' : 'rgba(79, 70, 229, 0.05)',
                    cursor: notification.isRead ? 'default' : 'pointer',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: notification.isRead ? 'transparent' : getNotificationColor(notification.type),
                    marginTop: '0.4rem'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{notification.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notification.message}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
