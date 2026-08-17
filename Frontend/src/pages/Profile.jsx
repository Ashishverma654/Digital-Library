import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: ''
  });
  const [extraInfo, setExtraInfo] = useState({
    email: '',
    role: '',
    studentId: '',
    course: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          const profileData = response.data.data;
          setFormData({
            name: profileData.name || '',
            phone: profileData.phone || '',
            avatar: profileData.avatar || ''
          });
          setExtraInfo({
            email: profileData.email || '',
            role: profileData.role || '',
            studentId: profileData.studentId || '',
            course: profileData.course?.name || profileData.course || ''
          });
        }
      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.put('/auth/profile', formData);
      if (response.data.success) {
        toast.success('Profile updated successfully');
        // Update user context so the avatar reflects in the navbar
        const updatedUser = { ...user, name: formData.name, avatar: formData.avatar };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 z-10 relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-container-padding-mobile md:px-container-padding-desktop pt-32 pb-24 relative z-10 fade-in-up">
      <header className="mb-10 text-center">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary dark:text-primary-fixed tracking-tight">
          Your Profile
        </h1>
        <p className="font-body-md text-body-md text-gray-600 dark:text-on-surface-variant mt-2">
          Manage your personal information.
        </p>
      </header>

      <div className="glass-panel rounded-xl p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-lg mb-4">
            <img 
              src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=random`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleInputChange} 
                className="glass-input w-full p-3 rounded-lg text-gray-900 dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                required 
                value={formData.phone} 
                onChange={handleInputChange} 
                className="glass-input w-full p-3 rounded-lg text-gray-900 dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input 
                type="email" 
                value={extraInfo.email} 
                disabled 
                className="glass-input w-full p-3 rounded-lg text-gray-500 bg-black/5 dark:bg-white/5 cursor-not-allowed" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Role</label>
              <input 
                type="text" 
                value={extraInfo.role} 
                disabled 
                className="glass-input w-full p-3 rounded-lg text-gray-500 bg-black/5 dark:bg-white/5 cursor-not-allowed uppercase" 
              />
            </div>
            {extraInfo.role === 'STUDENT' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number</label>
                  <input 
                    type="text" 
                    value={extraInfo.studentId} 
                    disabled 
                    className="glass-input w-full p-3 rounded-lg text-gray-500 bg-black/5 dark:bg-white/5 cursor-not-allowed" 
                  />
                </div>
                {extraInfo.course && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                    <input 
                      type="text" 
                      value={typeof extraInfo.course === 'object' ? extraInfo.course.name : extraInfo.course} 
                      disabled 
                      className="glass-input w-full p-3 rounded-lg text-gray-500 bg-black/5 dark:bg-white/5 cursor-not-allowed" 
                    />
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={submitting} 
              className="py-3 px-8 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-colors w-full sm:w-auto"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Profile;
