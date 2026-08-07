import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaCamera, FaSave, FaSignOutAlt, FaUserEdit, FaKey } from 'react-icons/fa';
import { userAPI, authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useAuth from '../../hooks/useAuth';

const WorkerSettings = () => {
  const { user, refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || '',
      });
      
      // Set the profile picture URL
      if (user.profilePicture) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const baseWithoutApi = baseUrl.replace('/api', '');
        setPreviewUrl(`${baseWithoutApi}${user.profilePicture}`);
      } else {
        setPreviewUrl('');
      }
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await userAPI.updateProfile(profileForm);
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const uploadProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 2MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, or WEBP image.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await userAPI.uploadProfilePicture(formData);
      const updatedUser = response.data.data;
      
      localStorage.setItem('aera_user', JSON.stringify(updatedUser));
      
      if (updatedUser.profilePicture) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const baseWithoutApi = baseUrl.replace('/api', '');
        setPreviewUrl(`${baseWithoutApi}${updatedUser.profilePicture}`);
      }
      
      await refreshUser();
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      setSaving(false);
      return;
    }

    if (!passwordForm.currentPassword) {
      toast.error('Current password is required');
      setSaving(false);
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Profile Picture */}
            <div className="p-4 text-center border-b border-gray-100">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mx-auto">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-3xl text-gray-400">${user.fullName?.charAt(0) || 'U'}</div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                      <FaUser />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-900 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-800 transition text-xs">
                  <FaCamera size={12} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={uploadProfilePicture} 
                  />
                </label>
              </div>
              <p className="text-sm font-medium text-gray-800 mt-2">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>

            {/* Navigation Links */}
            <nav className="p-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-900'
                }`}
              >
                <FaUserEdit size={16} />
                <span>Profile Information</span>
              </button>

              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                  activeTab === 'password'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-900'
                }`}
              >
                <FaKey size={16} />
                <span>Change Password</span>
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <FaSignOutAlt size={16} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h2>
                <form onSubmit={updateProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileForm.fullName}
                        onChange={handleProfileChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={profileForm.username}
                        onChange={handleProfileChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
                    >
                      <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>
                <form onSubmit={updatePassword}>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password *
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {passwordForm.newPassword && passwordForm.confirmPassword && (
                      <div className={`text-sm ${
                        passwordForm.newPassword === passwordForm.confirmPassword
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {passwordForm.newPassword === passwordForm.confirmPassword
                          ? ' Passwords match'
                          : ' Passwords do not match'}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
                    >
                      <FaLock /> {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerSettings;