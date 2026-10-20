import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaTools,
  FaBolt,
  FaBuilding,
  FaWrench,
  FaPencilAlt,
  FaMusic,
  FaFileAlt,      
  FaUsers,
  FaCog,
  FaBell,
  FaPaperPlane,
} from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import useAuth from '../../hooks/useAuth';

const Sidebar = () => {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();

  const serviceLinks = [
    { path: '/services/it', icon: FaTools, label: 'services.it_maintenance' },
    { path: '/services/electrical', icon: FaBolt, label: 'services.electrical_installation' },
    { path: '/services/construction', icon: FaBuilding, label: 'services.construction' },
    { path: '/services/generator', icon: FaWrench, label: 'services.generator_repair' },
    { path: '/services/stationary', icon: FaPencilAlt, label: 'services.office_stationary' },
    { path: '/services/decoration', icon: FaMusic, label: 'services.decoration_sound' },
  ];

  // Get user initials for profile
  const getInitials = () => {
    if (!user?.fullName) return 'U';
    const nameParts = user.fullName.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-blue-900 border-r border-blue-800 min-h-[calc(100vh-72px)] sticky top-[72px] hidden md:flex md:flex-col overflow-y-auto overflow-x-hidden">
      {/* User Profile Section */}
      <div className="p-4 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-lg">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {user?.fullName || 'User'}
            </p>
            <p className="text-blue-300 text-xs">
              {user?.role === 'ADMIN' ? 'Administrator' : 'Worker'}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4">
        <p className="text-blue-300 text-xs uppercase tracking-wider mb-3 cursor-pointer">
          {t('common.menu')}
        </p>

        <nav className="space-y-1">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-yellow-400 text-blue-800 text-lg font-bold '
                  : 'text-white hover:bg-blue-800 hover:text-blue-100'
              }`
            }
          >
            <FaTachometerAlt size={18} />
            <span className="text-sm">{t('common.dashboard')}</span>
          </NavLink>

          {/* Services */}
          {serviceLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-yellow-400 text-blue-800 font-bold text-lg'
                      : 'text-white hover:bg-blue-700 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span className="text-sm">{t(link.label)}</span>
              </NavLink>
            );
          })}

          {/* Reports */}
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-yellow-400 text-blue-800 font-bold text-lg'
                  : 'text-white hover:bg-blue-700 hover:text-white'
              }`
            }
          >
            <FaFileAlt size={18} />
            <span className="text-sm">{t('common.reports')}</span>
          </NavLink>

          {/* Send Report (Worker only) */}
          {!isAdmin && (
            <NavLink
              to="/send-report"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-yellow-400 text-blue-800 font-bold text-lg'
                    : 'text-white hover:bg-blue-700 hover:text-white'
                }`
              }
            >
              <FaPaperPlane size={18} />
              <span className="text-sm">Send Report</span>
            </NavLink>
          )}

          {/* Notifications */}
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-yellow-400 text-blue-800 font-bold text-lg'
                  : 'text-white hover:bg-blue-700 hover:text-white'
              }`
            }
          >
            <FaBell size={18} />
            <span className="text-sm">{t('common.notifications')}</span>
          </NavLink>

          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-yellow-400 text-blue-800 font-bold text-lg'
                  : 'text-white hover:bg-blue-700 hover:text-white'
              }`
            }
          >
            <FaCog size={18} />
            <span className="text-sm">{t('common.settings')}</span>
          </NavLink>

          {/* Admin Only - Workers Management */}
          {isAdmin && (
            <>
              <div className="border-t border-blue-800 my-3"></div>
              <NavLink
                to="/admin/workers"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-yellow-400 text-blue-800 font-bold text-lg'
                      : 'text-white hover:bg-blue-700 hover:text-white'
                  }`
                }
              >
                <FaUsers size={18} />
                <span className="text-sm">{t('common.workers')}</span>
              </NavLink>

              {/* Admin Reports - Worker Reports */}
              <NavLink
                to="/admin/reports"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-yellow-400 text-blue-800 text-lg font-bold'
                      : 'text-white hover:bg-blue-700 hover:text-white'
                  }`
                }
              >
                <FaFileAlt size={18} />
                <span className="text-sm">Worker Reports</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Bottom Section - Version */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
        
      </div>
    </aside>
  );
};

export default Sidebar;