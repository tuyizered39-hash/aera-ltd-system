import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('aera_token');
    const storedUser = localStorage.getItem('aera_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('aera_token');
        localStorage.removeItem('aera_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem('aera_token', token);
      localStorage.setItem('aera_user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success(`Welcome ${user.fullName}!`);
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('aera_token');
    localStorage.removeItem('aera_user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.data;
      localStorage.setItem('aera_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
      return null;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isWorker = user?.role === 'WORKER';

  return {
    user,
    loading,
    isAuthenticated,
    token,
    login,
    logout,
    refreshUser,
    changePassword,
    isAdmin,
    isWorker,
  };
};

export default useAuth;