import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Books from '../pages/Books';
import BookDetails from '../pages/BookDetails';
import LibrarianTransactions from '../pages/librarian/Transactions';
import LibrarianDashboard from '../pages/librarian/Dashboard';
import ManageBooks from '../pages/librarian/ManageBooks';
import BorrowHistory from '../pages/BorrowHistory';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Reader from '../pages/Reader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/books" element={<Books />} />
      <Route path="/books/:id" element={<BookDetails />} />
      <Route path="/books/:id/read" element={
        <ProtectedRoute allowedRoles={['USER', 'LIBRARIAN']}>
          <Reader />
        </ProtectedRoute>
      } />
      
      {/* User Routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute allowedRoles={['USER', 'LIBRARIAN']}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="history" element={<BorrowHistory />} />
          </Routes>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['USER', 'LIBRARIAN']}>
          <Profile />
        </ProtectedRoute>
      } />

      {/* Librarian Routes */}
      <Route path="/librarian/*" element={
        <ProtectedRoute allowedRoles={['LIBRARIAN']}>
          <Routes>
            <Route path="dashboard" element={<LibrarianDashboard />} />
            <Route path="transactions" element={<LibrarianTransactions />} />
            <Route path="books" element={<ManageBooks />} />
          </Routes>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
