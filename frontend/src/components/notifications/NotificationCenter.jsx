import React, { useState, useEffect } from 'react';
import { FaBell, FaCheckCircle, FaClock, FaExclamationTriangle, FaTrash, FaCheckDouble } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { notificationAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: 20 };
      if (filter === 'unread') params.isRead = false;
      if (filter === 'read') params.isRead = true;

      const response = await notificationAPI.getNotifications(params);
      setNotifications(response.data.data);
      setPagination({
        page: response.data.pagination.page,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SERVICE':
        return <FaCheckCircle className="text-green-500" />;
      case 'ATTENDANCE':
        return <FaClock className="text-blue-500" />;
      case 'REPORT':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'DELIVERY':
        return <FaCheckDouble className="text-purple-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SERVICE':
        return 'bg-green-50 border-green-200';
      case 'ATTENDANCE':
        return 'bg-blue-50 border-blue-200';
      case 'REPORT':
        return 'bg-yellow-50 border-yellow-200';
      case 'DELIVERY':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('notifications.title')}</h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-900 rounded-lg hover:bg-blue-100 transition"
            >
              <FaCheckDouble /> {t('notifications.mark_all_read')}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-sm transition ${
            filter === 'all'
              ? 'bg-blue-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('common.all')} ({pagination.total})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-lg text-sm transition ${
            filter === 'unread'
              ? 'bg-blue-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('notifications.unread')} ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-1.5 rounded-lg text-sm transition ${
            filter === 'read'
              ? 'bg-blue-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('notifications.read')} ({pagination.total - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('notifications.no_notifications')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm p-4 border-l-4 transition hover:shadow-md ${
                notification.isRead ? 'border-gray-300' : 'border-blue-500'
              } ${getTypeColor(notification.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-xl mt-1">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
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
      )}
    </div>
  );
};

export default NotificationCenter;