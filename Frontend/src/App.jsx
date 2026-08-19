import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';
import Chatbot from './components/Chatbot/Chatbot';
import Footer from './components/Footer';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app-container min-h-screen flex flex-col">
            <Navbar />
            <main className="main-content flex-grow">
              <AppRoutes />
            </main>
            <Chatbot />
            <Footer />
          </div>
          <ToastContainer position="bottom-right" theme="dark" />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
