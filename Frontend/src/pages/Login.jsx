import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      return toast.error('Please fill in all fields');
    }
    
    setIsSubmitting(true);
    try {
      const user = await login(identifier, password);
      toast.success('Logged in successfully!');
      
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'LIBRARIAN') {
        navigate('/librarian/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center relative z-10 px-container-padding-mobile md:px-container-padding-desktop py-20 min-h-[80vh]">
      <div className="glass-panel w-full max-w-md rounded-xl p-glass-padding shadow-[0_0_40px_rgba(236,178,255,0.05)] relative overflow-hidden fade-in-up">
        {/* Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[60px] pointer-events-none"></div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="h-16 w-16 mx-auto mb-4 bg-surface-container-high rounded-full flex justify-center items-center">
            <span className="material-symbols-outlined text-4xl text-primary">local_library</span>
          </div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-gray-900 dark:text-on-background font-bold tracking-tight">Welcome Back</h1>
          <p className="font-body-md text-body-md text-gray-700 dark:text-on-surface-variant mt-2">Enter your details to access your sanctuary of knowledge.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-black/10 dark:border-white/10 mb-8 relative z-10">
          <div className="flex-1 pb-4 text-center font-label-sm text-label-sm text-primary border-b-2 border-primary transition-colors duration-300">
            SIGN IN
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-on-surface-variant/50">person</span>
            <input 
              className="glass-input w-full pl-12 pr-4 py-3 rounded-t-DEFAULT text-gray-900 dark:text-on-background placeholder-transparent peer" 
              id="identifier" 
              placeholder="Email or Roll Number" 
              required
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <label className="absolute left-12 -top-2.5 text-xs text-primary bg-white dark:bg-background px-1 transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:text-gray-500 peer-placeholder-shown:dark:text-on-surface-variant/50 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-white peer-focus:dark:bg-background rounded-sm" htmlFor="identifier">
              Email or Roll Number
            </label>
          </div>
          
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-on-surface-variant/50">lock</span>
            <input 
              className="glass-input w-full pl-12 pr-4 py-3 rounded-t-DEFAULT text-gray-900 dark:text-on-background placeholder-transparent peer" 
              id="password" 
              placeholder="Password" 
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className="absolute left-12 -top-2.5 text-xs text-primary bg-white dark:bg-background px-1 transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:text-gray-500 peer-placeholder-shown:dark:text-on-surface-variant/50 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-white peer-focus:dark:bg-background rounded-sm" htmlFor="password">
              Password
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div className="w-4 h-4 rounded-[4px] border border-black/20 dark:border-white/20 bg-black/5 dark:bg-black/30 flex items-center justify-center group-hover:border-primary transition-colors">
                <input className="opacity-0 absolute w-0 h-0 peer" type="checkbox" />
                <span className="material-symbols-outlined text-[12px] text-transparent peer-checked:text-primary">check</span>
              </div>
              <span className="font-label-sm text-label-sm text-gray-700 dark:text-on-surface-variant group-hover:text-gray-900 dark:group-hover:text-on-background transition-colors">Remember me</span>
            </label>
            <a className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors" href="#">Forgot Password?</a>
          </div>
          
          <button 
            className="w-full py-4 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline-md text-[18px] font-bold shadow-[0_4px_20px_rgba(189,0,255,0.3)] hover:shadow-[0_4px_30px_rgba(189,0,255,0.5)] transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Login;
