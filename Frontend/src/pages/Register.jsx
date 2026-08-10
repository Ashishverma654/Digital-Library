import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = formData;
    
    if (!name || !email || !phone || !password || !confirmPassword) {
      return toast.error('Please fill in all fields');
    }
    
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setIsSubmitting(true);
    try {
      await register(formData);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register');
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
            <span className="material-symbols-outlined text-4xl text-primary">person_add</span>
          </div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-gray-900 dark:text-on-background font-bold tracking-tight">Join DigitalLib</h1>
          <p className="font-body-md text-body-md text-gray-700 dark:text-on-surface-variant mt-2">Create an account to discover boundless worlds.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-black/10 dark:border-white/10 mb-8 relative z-10">
          <Link to="/login" className="flex-1 pb-4 text-center font-label-sm text-label-sm text-gray-600 dark:text-on-surface-variant hover:text-primary transition-colors duration-300">
            SIGN IN
          </Link>
          <Link to="/register" className="flex-1 pb-4 text-center font-label-sm text-label-sm text-primary border-b-2 border-primary transition-colors duration-300">
            CREATE ACCOUNT
          </Link>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Full Name */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-on-surface-variant/50">person</span>
            <input 
              className="glass-input w-full pl-12 pr-4 py-3 rounded-t-DEFAULT text-gray-900 dark:text-on-background placeholder-transparent peer" 
              id="name" 
              name="name"
              placeholder="Full Name" 
              required
              type="text"
              value={formData.name}
              onChange={handleChange}
            />
            <label className="absolute left-12 -top-2.5 text-xs text-primary bg-white dark:bg-background px-1 transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:text-gray-500 peer-placeholder-shown:dark:text-on-surface-variant/50 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-white peer-focus:dark:bg-background rounded-sm" htmlFor="name">
              Full Name
            </label>
          </div>
          
          {/* Email */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-on-surface-variant/50">mail</span>
            <input 
              className="glass-input w-full pl-12 pr-4 py-3 rounded-t-DEFAULT text-gray-900 dark:text-on-background placeholder-transparent peer" 
              id="email" 
              name="email"
              placeholder="Email Address" 
              required
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <label className="absolute left-12 -top-2.5 text-xs text-primary bg-white dark:bg-background px-1 transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:text-gray-500 peer-placeholder-shown:dark:text-on-surface-variant/50 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-white peer-focus:dark:bg-background rounded-sm" htmlFor="email">
              Email Address
            </label>
          </div>
          
          {/* Phone */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-on-surface-variant/50">phone</span>
            <input 
              className="glass-input w-full pl-12 pr-4 py-3 rounded-t-DEFAULT text-gray-900 dark:text-on-background placeholder-transparent peer" 
              id="phone" 
              name="phone"
              placeholder="Phone Number" 
              required
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
            <label className="absolute left-12 -top-2.5 text-xs text-primary bg-white dark:bg-background px-1 transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:text-gray-500 peer-placeholder-shown:dark:text-on-surface-variant/50 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-white peer-focus:dark:bg-background rounded-sm" htmlFor="phone">
              Phone Number
            </label>
          </div>
          
          {/* Password */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-on-surface-variant/50">lock</span>
            <input 
              className="glass-input w-full pl-12 pr-4 py-3 rounded-t-DEFAULT text-gray-900 dark:text-on-background placeholder-transparent peer" 
              id="password" 
              name="password"
              placeholder="Password" 
              required
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <label className="absolute left-12 -top-2.5 text-xs text-primary bg-white dark:bg-background px-1 transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:text-gray-500 peer-placeholder-shown:dark:text-on-surface-variant/50 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-white peer-focus:dark:bg-background rounded-sm" htmlFor="password">
              Password
            </label>
          </div>
          
          {/* Confirm Password */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-on-surface-variant/50">lock</span>
            <input 
              className="glass-input w-full pl-12 pr-4 py-3 rounded-t-DEFAULT text-gray-900 dark:text-on-background placeholder-transparent peer" 
              id="confirmPassword" 
              name="confirmPassword"
              placeholder="Confirm Password" 
              required
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <label className="absolute left-12 -top-2.5 text-xs text-primary bg-white dark:bg-background px-1 transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:text-gray-500 peer-placeholder-shown:dark:text-on-surface-variant/50 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-white peer-focus:dark:bg-background rounded-sm" htmlFor="confirmPassword">
              Confirm Password
            </label>
          </div>
          
          <button 
            className="w-full py-4 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline-md text-[18px] font-bold shadow-[0_4px_20px_rgba(189,0,255,0.3)] hover:shadow-[0_4px_30px_rgba(189,0,255,0.5)] transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Register;
