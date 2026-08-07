import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaUserCheck, FaUserTimes, FaSearch, 
  FaKey, FaSave, FaTimes, FaLock 
} from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const WorkerManagement = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [passwordWorker, setPasswordWorker] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchWorkers();
  }, [pagination.page, search]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getWorkers({
        page: pagination.page,
        limit: 10,
        search,
      });
      setWorkers(response.data.data);
      setPagination({
        page: response.data.pagination.page,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      });
    } catch (error) {
      console.error('Failed to fetch workers:', error);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        await userAPI.updateWorker(editingWorker.id, {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        });
        toast.success('Worker updated successfully');
      } else {
        await userAPI.createWorker(formData);
        toast.success('Worker created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchWorkers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await userAPI.updateWorker(passwordWorker.id, {
        fullName: passwordWorker.fullName,
        email: passwordWorker.email,
        phone: passwordWorker.phone || '',
        isActive: passwordWorker.isActive,
        password: passwordData.newPassword,
      });
      toast.success(`Password updated for ${passwordWorker.fullName}`);
      setShowPasswordModal(false);
      setPasswordData({
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordWorker(null);
      fetchWorkers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this worker?')) return;
    try {
      await userAPI.deleteWorker(id);
      toast.success('Worker deleted successfully');
      fetchWorkers();
    } catch (error) {
      toast.error('Failed to delete worker');
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      username: worker.username,
      email: worker.email,
      password: '',
      fullName: worker.fullName,
      phone: worker.phone || '',
    });
    setShowModal(true);
  };

  const handlePasswordClick = (worker) => {
    setPasswordWorker(worker);
    setPasswordData({
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswordModal(true);
  };

  const resetForm = () => {
    setEditingWorker(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
    });
  };

  // ✅ Secure Password Status - Only shows status, NOT the actual password
  const getPasswordStatus = (lastPasswordUpdate) => {
    if (!lastPasswordUpdate) {
      return { 
        label: 'Not Set', 
        color: 'bg-red-100 text-red-700',
        icon: '🔴'
      };
    }
    
    const days = Math.floor((Date.now() - new Date(lastPasswordUpdate)) / (1000 * 60 * 60 * 24));
    
    if (days > 90) {
      return { 
        label: 'Expired', 
        color: 'bg-red-100 text-red-700',
        icon: '🔴'
      };
    }
    if (days > 60) {
      return { 
        label: 'Expiring Soon', 
        color: 'bg-yellow-100 text-yellow-700',
        icon: '🟡'
      };
    }
    if (days > 30) {
      return { 
        label: 'Active', 
        color: 'bg-green-100 text-green-700',
        icon: '🟢'
      };
    }
    return { 
      label: 'Recently Updated', 
      color: 'bg-blue-100 text-blue-700',
      icon: '🔵'
    };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('workers.title')}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          <FaPlus /> {t('workers.add_worker')}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3">{t('workers.name')}</th>
                <th className="px-4 py-3">{t('workers.username')}</th>
                <th className="px-4 py-3">{t('workers.email')}</th>
                <th className="px-4 py-3">{t('workers.phone')}</th>
                <th className="px-4 py-3">{t('workers.status')}</th>
                <th className="px-4 py-3">Password Status</th>
                <th className="px-4 py-3">{t('workers.attendance')}</th>
                <th className="px-4 py-3">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {workers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    {t('common.no_data')}
                  </td>
                </tr>
              ) : (
                workers.map((worker) => {
                  const passwordStatus = getPasswordStatus(worker.lastPasswordUpdate);
                  
                  return (
                    <tr key={worker.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{worker.fullName}</td>
                      <td className="px-4 py-3">{worker.username}</td>
                      <td className="px-4 py-3">{worker.email}</td>
                      <td className="px-4 py-3">{worker.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          worker.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {worker.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${passwordStatus.color}`}>
                            <span className="mr-1">{passwordStatus.icon}</span>
                            {passwordStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {worker.isPresentToday ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <FaUserCheck className="w-4 h-4" />
                            {t('workers.present_today')}
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400">
                            <FaUserTimes className="w-4 h-4" />
                            {t('workers.absent_today')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(worker)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Edit Worker"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handlePasswordClick(worker)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Reset Password"
                          >
                            <FaKey size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(worker.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Worker"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Showing {workers.length} of {pagination.total} workers
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Worker Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingWorker ? t('common.edit') : t('workers.add_worker')}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('workers.name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('workers.username')} *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      disabled={!!editingWorker}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('workers.email')} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('workers.phone')}
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {!editingWorker && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('common.password')} *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition flex items-center gap-2"
                  >
                    <FaSave /> {editingWorker ? t('common.save') : t('common.submit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Password Modal */}
      {showPasswordModal && passwordWorker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  <FaLock className="inline mr-2 text-blue-900" />
                  Reset Password for <span className="text-blue-900">{passwordWorker.fullName}</span>
                </h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordWorker(null);
                    setPasswordData({ newPassword: '', confirmPassword: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Enter a new password for <strong>{passwordWorker.username}</strong>
              </p>

              <form onSubmit={handlePasswordUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                {passwordData.newPassword && passwordData.confirmPassword && (
                  <div className={`mt-2 text-sm ${
                    passwordData.newPassword === passwordData.confirmPassword
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {passwordData.newPassword === passwordData.confirmPassword
                      ? '✅ Passwords match'
                      : '❌ Passwords do not match'}
                  </div>
                )}

                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition flex items-center gap-2"
                    disabled={passwordData.newPassword !== passwordData.confirmPassword || passwordData.newPassword.length < 6}
                  >
                    <FaKey /> Reset Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordWorker(null);
                      setPasswordData({ newPassword: '', confirmPassword: '' });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerManagement;