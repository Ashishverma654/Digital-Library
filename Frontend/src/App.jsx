import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import ShaderBackground from './components/ShaderBackground';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';
import Chatbot from './components/Chatbot/Chatbot';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <ShaderBackground />
            <Navbar />
            <main className="main-content">
              <AppRoutes />
            </main>
            <Chatbot />
            {/* Footer will go here */}
          </div>
          <ToastContainer position="bottom-right" theme="dark" />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
