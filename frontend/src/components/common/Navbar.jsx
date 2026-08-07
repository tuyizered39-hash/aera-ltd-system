import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import useAuth from '../../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import { notificationAPI } from '../../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  return (
    <nav className="bg-blue-900 text-white px-4 py-3 shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-white text-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <FaBars />
          </button>
          <Link to="/dashboard" className="text-2xl font-bold">
            AERA <span className="text-yellow-400">LTD</span>
          </Link>
          <span className="text-sm text-blue-300 hidden md:inline">
            | {t('common.dashboard')}
          </span>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* ✅ Language Switcher - Globe Icon */}
          <LanguageSwitcher />

          {/* Notifications */}
          <button
            className="relative hover:text-yellow-400 transition-colors"
            onClick={() => navigate('/notifications')}
          >
            <FaBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <span className="hidden md:inline text-sm">{user?.fullName}</span>
          </div>

          
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-blue-800">
          <Link
            to="/dashboard"
            className="block py-2 hover:text-yellow-400"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('common.dashboard')}
          </Link>
          <Link
            to="/services/it"
            className="block py-2 hover:text-yellow-400"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('services.it_maintenance')}
          </Link>
          <Link
            to="/reports"
            className="block py-2 hover:text-yellow-400"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('common.reports')}
          </Link>
          {user?.role === 'ADMIN' && (
            <>
              <Link
                to="/admin/workers"
                className="block py-2 hover:text-yellow-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.workers')}
              </Link>
              <Link
                to="/admin/settings"
                className="block py-2 hover:text-yellow-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.settings')}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;