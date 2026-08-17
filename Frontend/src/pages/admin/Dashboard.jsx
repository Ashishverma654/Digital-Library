import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Users, Settings as SettingsIcon, Bell, Plus, Trash2, Edit, BookOpen, Building, BarChart, Download, Search, Upload, Activity, Ban, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  
  // State for Users (All users)
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'STUDENT', studentId: '', department: '', course: '', yearEnrolled: new Date().getFullYear() });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // State for Bulk Import
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [bulkImporting, setBulkImporting] = useState(false);

  // State for Activity Logs
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [userLogs, setUserLogs] = useState([]);
  const [selectedLogUser, setSelectedLogUser] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);

  // State for Departments & Courses
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: '', code: '', description: '' });
  
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', code: '', department: '' });

  // State for Settings
  const [settings, setSettings] = useState({ finePerDay: 10, maxBorrowDays: 15, maxBooksPerStudent: 3, libraryHours: '', waitlistEnabled: true });

  // State for Notices
  const [notices, setNotices] = useState([]);
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', message: '' });

  // State for Analytics
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usrRes, setRes, notRes, deptRes, courseRes, statRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/settings'),
        api.get('/notices'),
        api.get('/admin/departments'),
        api.get('/admin/courses'),
        api.get('/admin/reports/analytics')
      ]);
      setUsers(usrRes.data.data);
      if (setRes.data.data) setSettings(setRes.data.data);
      setNotices(notRes.data.data);
      setDepartments(deptRes.data.data);
      setCourses(courseRes.data.data);
      setAnalytics(statRes.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    }
  };

  // --- User Management Handlers ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      toast.success('User created successfully');
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'STUDENT', studentId: '', department: '', course: '', yearEnrolled: new Date().getFullYear() });
      setShowAddUserModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editingUser };
      if (!payload.password) delete payload.password; // Don't send empty password
      await api.put(`/admin/users/${editingUser._id}`, payload);
      toast.success('User updated successfully');
      setShowEditUserModal(false);
      setEditingUser(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating user');
    }
  };

  const openEditModal = (user) => {
    setEditingUser({
      ...user,
      password: '', // blank password field for edit
      department: user.department?._id || user.department || '',
      course: user.course?._id || user.course || '',
      yearEnrolled: user.yearEnrolled || new Date().getFullYear()
    });
    setShowEditUserModal(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchData();
    } catch (err) {
      toast.error('Error deleting user');
    }
  };

  const handleToggleSuspend = async (id, currentStatus) => {
    const action = currentStatus === 'SUSPENDED' ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await api.put(`/admin/users/${id}/suspend`);
      toast.success(`User ${action}ed successfully`);
      fetchData();
    } catch (err) {
      toast.error(`Error trying to ${action} user`);
    }
  };

  const openLogsModal = async (user) => {
    setSelectedLogUser(user);
    setShowLogsModal(true);
    setLogsLoading(true);
    try {
      const res = await api.get(`/admin/users/${user._id}/logs`);
      setUserLogs(res.data.data);
    } catch (err) {
      toast.error('Error fetching activity logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleBulkImport = (e) => {
    e.preventDefault();
    if (!csvFile) return toast.error('Please select a CSV file');

    setBulkImporting(true);
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Format headers
          const usersToImport = results.data.map(row => ({
            name: row.Name || row.name,
            email: row.Email || row.email,
            phone: row.Phone || row.phone,
            role: (row.Role || row.role || 'STUDENT').toUpperCase(),
            studentId: row.StudentId || row.studentId || row['Student ID'],
            password: row.Password || row.password
          }));

          const res = await api.post('/admin/users/bulk', { users: usersToImport });
          toast.success(`Successfully imported ${res.data.count} users`);
          if (res.data.errors && res.data.errors.length > 0) {
            toast.warn(`${res.data.errors.length} rows failed. See console for details.`);
            console.warn('Bulk import errors:', res.data.errors);
          }
          setShowBulkImportModal(false);
          setCsvFile(null);
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Error importing users');
        } finally {
          setBulkImporting(false);
        }
      },
      error: (err) => {
        toast.error('Error parsing CSV file');
        setBulkImporting(false);
      }
    });
  };

  const downloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Email,Phone,Role,StudentId,Password\nJohn Doe,john@example.com,1234567890,STUDENT,STU001,password123\nJane Smith,jane@example.com,0987654321,LIBRARIAN,,password123";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filter and Sort Users
  const filteredUsers = (users || []).filter(u => {
    const searchStr = String(searchTerm || '').toLowerCase();
    const matchesSearch = String(u?.name || '').toLowerCase().includes(searchStr) || 
                          String(u?.email || '').toLowerCase().includes(searchStr) ||
                          String(u?.studentId || '').toLowerCase().includes(searchStr);
    const matchesRole = roleFilter === 'ALL' || u?.role === roleFilter;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    let aVal = a[sortBy] || '';
    let bVal = b[sortBy] || '';
    if (sortBy === 'department') {
      aVal = a?.department?.name || '';
      bVal = b?.department?.name || '';
    }
    aVal = String(aVal).toLowerCase();
    bVal = String(bVal).toLowerCase();
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, sortBy, sortOrder]);

  // --- Department Handlers ---
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/departments', newDepartment);
      toast.success('Department created');
      setNewDepartment({ name: '', code: '', description: '' });
      setShowAddDepartment(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating department');
    }
  };

  // --- Course Handlers ---
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/courses', newCourse);
      toast.success('Course created');
      setNewCourse({ name: '', code: '', department: '' });
      setShowAddCourse(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating course');
    }
  };

  // --- Settings Handlers ---
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating settings');
    }
  };

  // --- Notice Handlers ---
  const handleAddNotice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notices', newNotice);
      toast.success('Notice created');
      setNewNotice({ title: '', message: '' });
      setShowAddNotice(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating notice');
    }
  };

  const handleDeactivateNotice = async (id) => {
    try {
      await api.put(`/notices/${id}/deactivate`);
      toast.success('Notice deactivated');
      fetchData();
    } catch (err) {
      toast.error('Error deactivating notice');
    }
  };

  const handleExportOverdue = async () => {
    try {
      const response = await api.get('/admin/reports/export/overdue', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'overdue_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error('Error exporting report');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-container-padding-mobile md:px-container-padding-desktop z-10 relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg font-bold text-gray-900 dark:text-on-background">Institution Admin</h1>
          <p className="text-gray-600 dark:text-on-surface-variant mt-2">Manage library staff, students, global policies, and analytics.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shrink-0 ${activeTab === 'users' ? 'bg-primary text-on-primary shadow-lg shadow-primary/30' : 'glass-panel text-gray-700 dark:text-on-surface-variant hover:bg-white/50 dark:hover:bg-black/20'}`}
          >
            <Users size={20} /> Users
          </button>
          <button 
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shrink-0 ${activeTab === 'departments' ? 'bg-primary text-on-primary shadow-lg shadow-primary/30' : 'glass-panel text-gray-700 dark:text-on-surface-variant hover:bg-white/50 dark:hover:bg-black/20'}`}
          >
            <Building size={20} /> Departments
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shrink-0 ${activeTab === 'courses' ? 'bg-primary text-on-primary shadow-lg shadow-primary/30' : 'glass-panel text-gray-700 dark:text-on-surface-variant hover:bg-white/50 dark:hover:bg-black/20'}`}
          >
            <BookOpen size={20} /> Courses
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shrink-0 ${activeTab === 'analytics' ? 'bg-primary text-on-primary shadow-lg shadow-primary/30' : 'glass-panel text-gray-700 dark:text-on-surface-variant hover:bg-white/50 dark:hover:bg-black/20'}`}
          >
            <BarChart size={20} /> Analytics
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shrink-0 ${activeTab === 'settings' ? 'bg-primary text-on-primary shadow-lg shadow-primary/30' : 'glass-panel text-gray-700 dark:text-on-surface-variant hover:bg-white/50 dark:hover:bg-black/20'}`}
          >
            <SettingsIcon size={20} /> Policies
          </button>
          <button 
            onClick={() => setActiveTab('notices')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shrink-0 ${activeTab === 'notices' ? 'bg-primary text-on-primary shadow-lg shadow-primary/30' : 'glass-panel text-gray-700 dark:text-on-surface-variant hover:bg-white/50 dark:hover:bg-black/20'}`}
          >
            <Bell size={20} /> Notices
          </button>
        </div>

        {/* Tab Content */}
        <div className="glass-panel rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
          
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-on-background">Universal User Management</h2>
                <div className="flex gap-3">
                  <button onClick={() => setShowBulkImportModal(true)} className="flex items-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 px-4 py-2 rounded-lg font-semibold transition-colors">
                    <Upload size={20} /> Import CSV
                  </button>
                  <button onClick={() => setShowAddUserModal(true)} className="flex items-center gap-2 bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-lg font-semibold transition-colors">
                    <Plus size={20} /> Add User
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search by Name, Email, or ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 glass-input rounded-lg text-sm"
                  />
                </div>
                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="glass-input px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <option value="ALL" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">All Roles</option>
                  <option value="STUDENT" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Student</option>
                  <option value="LIBRARIAN" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Librarian</option>
                  <option value="ADMIN" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Admin</option>
                </select>
              </div>

              {/* Add User Modal */}
              {showAddUserModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-10 sm:pt-20">
                  <div className="bg-white dark:bg-surface-container rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
                    <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-surface-container/80 backdrop-blur-md z-10">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New User</h2>
                      <button onClick={() => setShowAddUserModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <Trash2 size={20} className="hidden" /> {/* Placeholder for close icon space, actually using text below */}
                        Cancel
                      </button>
                    </div>
                    <form onSubmit={handleAddUser} className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                          <input type="text" required className="glass-input w-full px-4 py-2 rounded-lg" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                          <input type="email" required className="glass-input w-full px-4 py-2 rounded-lg" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                          <input type="tel" required className="glass-input w-full px-4 py-2 rounded-lg" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                          <input type="password" required minLength="6" className="glass-input w-full px-4 py-2 rounded-lg" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                          <select className="glass-input w-full px-4 py-2 rounded-lg text-gray-900 dark:text-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                            <option value="STUDENT" className="bg-white dark:bg-gray-800">Student</option>
                            <option value="LIBRARIAN" className="bg-white dark:bg-gray-800">Librarian</option>
                            <option value="ADMIN" className="bg-white dark:bg-gray-800">Admin</option>
                          </select>
                        </div>
                      </div>

                      {newUser.role === 'STUDENT' && (
                        <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl space-y-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Student Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Student ID (Roll No)</label>
                              <input type="text" required className="glass-input w-full px-4 py-2 rounded-lg" value={newUser.studentId} onChange={e => setNewUser({...newUser, studentId: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Year Enrolled</label>
                              <input type="number" required className="glass-input w-full px-4 py-2 rounded-lg" value={newUser.yearEnrolled} onChange={e => setNewUser({...newUser, yearEnrolled: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                              <select required className="glass-input w-full px-4 py-2 rounded-lg text-gray-900 dark:text-white" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})}>
                                <option value="" className="bg-white dark:bg-gray-800">Select...</option>
                                {(departments || []).map(d => <option key={d._id} value={d._id} className="bg-white dark:bg-gray-800">{d.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Course</label>
                              <select required className="glass-input w-full px-4 py-2 rounded-lg text-gray-900 dark:text-white" value={newUser.course} onChange={e => setNewUser({...newUser, course: e.target.value})}>
                                <option value="" className="bg-white dark:bg-gray-800">Select...</option>
                                {(courses || []).filter(c => c?.department?._id === newUser.department || c?.department === newUser.department).map(c => <option key={c._id} value={c._id} className="bg-white dark:bg-gray-800">{c.name}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:opacity-90">
                        Create User
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit User Modal */}
              {showEditUserModal && editingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-10 sm:pt-20">
                  <div className="bg-white dark:bg-surface-container rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
                    <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-surface-container/80 backdrop-blur-md z-10">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit User</h2>
                      <button onClick={() => {setShowEditUserModal(false); setEditingUser(null);}} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        Cancel
                      </button>
                    </div>
                    <form onSubmit={handleEditUser} className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                          <input type="text" required className="glass-input w-full px-4 py-2 rounded-lg" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                          <input type="email" required className="glass-input w-full px-4 py-2 rounded-lg" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                          <input type="tel" required className="glass-input w-full px-4 py-2 rounded-lg" value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password (Leave blank to keep)</label>
                          <input type="password" minLength="6" className="glass-input w-full px-4 py-2 rounded-lg" value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} placeholder="********" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                          <select className="glass-input w-full px-4 py-2 rounded-lg text-gray-900 dark:text-white" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                            <option value="STUDENT" className="bg-white dark:bg-gray-800">Student</option>
                            <option value="LIBRARIAN" className="bg-white dark:bg-gray-800">Librarian</option>
                            <option value="ADMIN" className="bg-white dark:bg-gray-800">Admin</option>
                          </select>
                        </div>
                      </div>

                      {editingUser.role === 'STUDENT' && (
                        <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl space-y-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Student Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Student ID (Roll No)</label>
                              <input type="text" required className="glass-input w-full px-4 py-2 rounded-lg" value={editingUser.studentId || ''} onChange={e => setEditingUser({...editingUser, studentId: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Year Enrolled</label>
                              <input type="number" required className="glass-input w-full px-4 py-2 rounded-lg" value={editingUser.yearEnrolled || new Date().getFullYear()} onChange={e => setEditingUser({...editingUser, yearEnrolled: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                              <select required className="glass-input w-full px-4 py-2 rounded-lg text-gray-900 dark:text-white" value={editingUser.department} onChange={e => setEditingUser({...editingUser, department: e.target.value})}>
                                <option value="" className="bg-white dark:bg-gray-800">Select...</option>
                                {(departments || []).map(d => <option key={d._id} value={d._id} className="bg-white dark:bg-gray-800">{d.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Course</label>
                              <select required className="glass-input w-full px-4 py-2 rounded-lg text-gray-900 dark:text-white" value={editingUser.course} onChange={e => setEditingUser({...editingUser, course: e.target.value})}>
                                <option value="" className="bg-white dark:bg-gray-800">Select...</option>
                                {(courses || []).filter(c => c?.department?._id === editingUser.department || c?.department === editingUser.department).map(c => <option key={c._id} value={c._id} className="bg-white dark:bg-gray-800">{c.name}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:opacity-90">
                        Update User
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Bulk Import Modal */}
              {showBulkImportModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-surface-container rounded-2xl w-full max-w-md shadow-2xl">
                    <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Import Users</h2>
                      <button onClick={() => {setShowBulkImportModal(false); setCsvFile(null);}} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        Cancel
                      </button>
                    </div>
                    <form onSubmit={handleBulkImport} className="p-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Upload a CSV file containing user details.</p>
                          <button type="button" onClick={downloadCsvTemplate} className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                            <Download size={14} /> Template
                          </button>
                        </div>
                        <input 
                          type="file" 
                          accept=".csv" 
                          required 
                          onChange={(e) => setCsvFile(e.target.files[0])}
                          className="glass-input w-full px-4 py-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </div>
                      <button type="submit" disabled={bulkImporting} className="w-full bg-secondary text-on-secondary py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50">
                        {bulkImporting ? 'Importing...' : 'Upload & Import'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Activity Logs Modal */}
              {showLogsModal && selectedLogUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-surface-container rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-white/80 dark:bg-surface-container/80 backdrop-blur-md">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activity Logs</h2>
                        <p className="text-sm text-gray-500">{selectedLogUser.name} ({selectedLogUser.email})</p>
                      </div>
                      <button onClick={() => {setShowLogsModal(false); setSelectedLogUser(null);}} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        Close
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1">
                      {logsLoading ? (
                        <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                      ) : userLogs.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No recent activity found for this user.</p>
                      ) : (
                        <div className="space-y-4">
                          {userLogs.map(log => (
                            <div key={log._id} className="flex gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-xl">
                              <div className="mt-1">
                                <Activity size={20} className="text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{log.action.replace(/_/g, ' ')}</h4>
                                <p className="text-gray-600 dark:text-on-surface-variant text-sm mt-1">{log.description}</p>
                                <p className="text-xs text-gray-500 mt-2 font-mono">{new Date(log.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-gray-500 dark:text-on-surface-variant">
                      <th className="py-4 px-4 font-semibold w-16">S.No</th>
                      <th className="py-4 px-4 font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('name')}>Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                      <th className="py-4 px-4 font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('role')}>Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                      <th className="py-4 px-4 font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('email')}>Email / ID {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                      <th className="py-4 px-4 font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('department')}>Department / Course {sortBy === 'department' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                      <th className="py-4 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((u, index) => (
                      <tr key={u._id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="py-4 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          {indexOfFirstUser + index + 1}
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-900 dark:text-on-background flex items-center gap-3">
                          <img src={u.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                          <div className="flex flex-col">
                            <span>{u.name}</span>
                            {u.status === 'SUSPENDED' && <span className="text-xs text-error font-semibold tracking-wide">SUSPENDED</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${u.role === 'LIBRARIAN' ? 'bg-blue-100 text-blue-800' : u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-on-surface-variant">
                          <div className="flex flex-col">
                            <span>{u.email}</span>
                            {u.role === 'STUDENT' && <span className="text-xs font-mono">{u.studentId}</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-on-surface-variant">
                          {u.department?.name ? `${u.department.name} - ${u.course?.name || ''}` : '-'}
                        </td>
                        <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                          <button onClick={() => openLogsModal(u)} className="p-2 text-gray-400 hover:text-secondary transition-colors" title="View Activity Logs">
                            <Activity size={18} />
                          </button>
                          <button onClick={() => handleToggleSuspend(u._id, u.status)} className={`p-2 transition-colors ${u.status === 'SUSPENDED' ? 'text-error hover:text-green-500' : 'text-gray-400 hover:text-error'}`} title={u.status === 'SUSPENDED' ? 'Unsuspend User' : 'Suspend User'}>
                            {u.status === 'SUSPENDED' ? <CheckCircle size={18} /> : <Ban size={18} />}
                          </button>
                          <button onClick={() => openEditModal(u)} className="p-2 text-gray-400 hover:text-primary transition-colors" title="Edit User">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-gray-400 hover:text-error transition-colors" title="Delete User">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan="6" className="py-8 text-center text-gray-500">No users match your criteria.</td></tr>
                    )}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-4 border-t border-black/10 dark:border-white/10 gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium hidden sm:flex">
                        <span>Page</span>
                        <input 
                          type="number" 
                          min="1" 
                          max={totalPages}
                          value={currentPage || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              setCurrentPage('');
                              return;
                            }
                            let num = parseInt(val);
                            if (!isNaN(num)) {
                              if (num > totalPages) num = totalPages;
                              setCurrentPage(num);
                            }
                          }}
                          onBlur={() => {
                            if (!currentPage || currentPage < 1) {
                              setCurrentPage(1);
                            }
                          }}
                          className="w-16 px-2 py-1 text-center bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded focus:outline-none focus:border-primary text-gray-900 dark:text-white"
                        />
                        <span>of {totalPages}</span>
                      </div>
                      <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 transition-colors font-medium text-sm text-gray-900 dark:text-white">Previous</button>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 transition-colors font-medium text-sm text-gray-900 dark:text-white">Next</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DEPARTMENTS TAB */}
          {activeTab === 'departments' && (
            <div className="fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-on-background">Departments</h2>
                <button onClick={() => setShowAddDepartment(!showAddDepartment)} className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg font-semibold transition-colors">
                  {showAddDepartment ? 'Cancel' : <><Plus size={20} /> Add Dept</>}
                </button>
              </div>

              {showAddDepartment && (
                <form onSubmit={handleAddDepartment} className="mb-8 p-6 bg-black/5 dark:bg-white/5 rounded-xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Department Name" required className="glass-input w-full px-4 py-3 rounded-lg" value={newDepartment.name} onChange={e => setNewDepartment({...newDepartment, name: e.target.value})} />
                    <input type="text" placeholder="Department Code (e.g., CSE)" required className="glass-input w-full px-4 py-3 rounded-lg" value={newDepartment.code} onChange={e => setNewDepartment({...newDepartment, code: e.target.value})} />
                  </div>
                  <input type="text" placeholder="Description (Optional)" className="glass-input w-full px-4 py-3 rounded-lg" value={newDepartment.description} onChange={e => setNewDepartment({...newDepartment, description: e.target.value})} />
                  <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold hover:opacity-90">Create Department</button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {departments.map(d => (
                  <div key={d._id} className="p-6 bg-white dark:bg-surface-container rounded-xl border border-black/5 dark:border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-on-background">{d.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded font-mono">{d.code}</span>
                    </div>
                    <p className="text-gray-500 text-sm">{d.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COURSES TAB */}
          {activeTab === 'courses' && (
            <div className="fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-on-background">Courses</h2>
                <button onClick={() => setShowAddCourse(!showAddCourse)} className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg font-semibold transition-colors">
                  {showAddCourse ? 'Cancel' : <><Plus size={20} /> Add Course</>}
                </button>
              </div>

              {showAddCourse && (
                <form onSubmit={handleAddCourse} className="mb-8 p-6 bg-black/5 dark:bg-white/5 rounded-xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Course Name" required className="glass-input w-full px-4 py-3 rounded-lg" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} />
                    <input type="text" placeholder="Code (e.g., BTECH)" required className="glass-input w-full px-4 py-3 rounded-lg" value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} />
                    <select required className="glass-input w-full px-4 py-3 rounded-lg" value={newCourse.department} onChange={e => setNewCourse({...newCourse, department: e.target.value})}>
                      <option value="">Select Department...</option>
                      {departments.map(d => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold hover:opacity-90">Create Course</button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map(c => (
                  <div key={c._id} className="p-6 bg-white dark:bg-surface-container rounded-xl border border-black/5 dark:border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-on-background">{c.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded font-mono">{c.code}</span>
                    </div>
                    <p className="text-gray-500 text-sm">Department: {c.department?.name || 'Unknown'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-on-background">System Analytics & Reports</h2>
                <button onClick={handleExportOverdue} className="flex items-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 px-4 py-2 rounded-lg font-semibold transition-colors">
                  <Download size={20} /> Export Overdue Report (CSV)
                </button>
              </div>

              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="p-6 bg-primary/10 rounded-xl border border-primary/20">
                    <h3 className="text-primary font-semibold mb-1">Total Students</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.users.students}</p>
                  </div>
                  <div className="p-6 bg-secondary/10 rounded-xl border border-secondary/20">
                    <h3 className="text-secondary font-semibold mb-1">Inventory</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.inventory.totalBooks} <span className="text-lg font-normal text-gray-500">Titles</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{analytics.inventory.totalBookCopies} Physical Copies</p>
                  </div>
                  <div className="p-6 bg-tertiary/10 rounded-xl border border-tertiary/20">
                    <h3 className="text-tertiary font-semibold mb-1">Active Borrows</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.transactions.activeBorrows}</p>
                  </div>
                  <div className="p-6 bg-error/10 rounded-xl border border-error/20">
                    <h3 className="text-error font-semibold mb-1">Total Fines Collected</h3>
                    <p className="text-3xl font-bold text-error">₹{analytics.finance.totalFines}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="fade-in-up max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-on-background mb-6">Global Library Policies</h2>
              <form onSubmit={handleUpdateSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-on-surface-variant mb-2">Fine Per Day (₹)</label>
                    <input type="number" min="0" required className="glass-input w-full px-4 py-3 rounded-lg" value={settings.finePerDay} onChange={e => setSettings({...settings, finePerDay: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-on-surface-variant mb-2">Max Borrow Days</label>
                    <input type="number" min="1" required className="glass-input w-full px-4 py-3 rounded-lg" value={settings.maxBorrowDays} onChange={e => setSettings({...settings, maxBorrowDays: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-on-surface-variant mb-2">Max Books Per Student</label>
                    <input type="number" min="1" required className="glass-input w-full px-4 py-3 rounded-lg" value={settings.maxBooksPerStudent} onChange={e => setSettings({...settings, maxBooksPerStudent: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-on-surface-variant mb-2">Library Hours</label>
                    <input type="text" placeholder="e.g., 9:00 AM - 5:00 PM" className="glass-input w-full px-4 py-3 rounded-lg" value={settings.libraryHours || ''} onChange={e => setSettings({...settings, libraryHours: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <input type="checkbox" id="waitlist" className="w-5 h-5 rounded" checked={settings.waitlistEnabled} onChange={e => setSettings({...settings, waitlistEnabled: e.target.checked})} />
                    <label htmlFor="waitlist" className="text-sm font-semibold text-gray-700 dark:text-on-surface-variant">Enable Automatic Waitlists for Out-of-Stock Books</label>
                  </div>
                </div>
                <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* NOTICES TAB */}
          {activeTab === 'notices' && (
            <div className="fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-on-background">Digital Notice Board</h2>
                <button onClick={() => setShowAddNotice(!showAddNotice)} className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg font-semibold transition-colors">
                  {showAddNotice ? 'Cancel' : <><Plus size={20} /> Add Notice</>}
                </button>
              </div>

              {showAddNotice && (
                <form onSubmit={handleAddNotice} className="mb-8 p-6 bg-black/5 dark:bg-white/5 rounded-xl space-y-4">
                  <input type="text" placeholder="Notice Title" required className="glass-input w-full px-4 py-3 rounded-lg" value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} />
                  <textarea placeholder="Notice Details..." required rows="4" className="glass-input w-full px-4 py-3 rounded-lg" value={newNotice.message} onChange={e => setNewNotice({...newNotice, message: e.target.value})}></textarea>
                  <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold hover:opacity-90">Publish Notice</button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notices.map(notice => (
                  <div key={notice._id} className="p-6 bg-white dark:bg-surface-container rounded-xl border border-black/5 dark:border-white/5 relative group">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-on-background mb-2 pr-10">{notice.title}</h3>
                    <p className="text-gray-600 dark:text-on-surface-variant text-sm mb-4">{notice.message}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Posted: {new Date(notice.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded-full ${notice.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {notice.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {notice.active && (
                      <button onClick={() => handleDeactivateNotice(notice._id)} className="absolute top-6 right-6 text-gray-400 hover:text-error transition-colors">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
