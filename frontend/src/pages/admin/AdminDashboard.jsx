import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaMoneyBillWave, FaClock, FaBell, FaFileAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { dashboardAPI, reportAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [reportNotifications, setReportNotifications] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchOverview();
    fetchReportNotifications();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getAdminOverview();
      setOverview(response.data.data);
    } catch (error) {
      console.error('Failed to fetch admin overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportNotifications = async () => {
    try {
      const response = await reportAPI.getReportNotifications();
      const notifications = response.data.data || [];
      setReportNotifications(notifications);
    } catch (error) {
      console.error('Failed to fetch report notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await reportAPI.markReportNotificationRead(id);
      setReportNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await reportAPI.markAllReportNotificationsRead();
      setReportNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  // ✅ NEW: View report details
  const viewReport = (notification) => {
    const reportData = notification.data;
    if (reportData) {
      setSelectedReport({
        workerName: reportData.workerName || 'Unknown Worker',
        totalServices: reportData.totalServices || 0,
        totalAmount: reportData.totalAmount || 0,
        reportDate: reportData.reportDate || notification.createdAt,
        notes: reportData.notes || '',
      });
      setShowReportModal(true);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {t('common.dashboard')}
        </h1>
        <Link
          to="/admin/reports/monthly"
          className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          {t('reports.monthly')}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <FaUsers />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Workers</p>
              <p className="text-xl font-bold text-gray-800">
                {overview?.totalWorkers || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <FaUsers />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Today</p>
              <p className="text-xl font-bold text-gray-800">
                {overview?.activeWorkersToday || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
              <FaClipboardList />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Services</p>
              <p className="text-xl font-bold text-gray-800">
                {overview?.totalServices || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white">
              <FaMoneyBillWave />
            </div>
            <div>
              <p className="text-xs text-gray-500">Monthly Revenue</p>
              <p className="text-xl font-bold text-yellow-600">
                RWF {(overview?.monthlyRevenue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white">
              <FaClock />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending Payments</p>
              <p className="text-xl font-bold text-red-600">
                {overview?.pendingPayments || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Report Notifications Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaBell className="text-blue-900 text-xl" />
            <h2 className="text-lg font-semibold text-gray-800">
              Report Notifications
            </h2>
            {reportNotifications.filter(n => !n.isRead).length > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {reportNotifications.filter(n => !n.isRead).length} new
              </span>
            )}
          </div>
          {reportNotifications.filter(n => !n.isRead).length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-900 hover:text-blue-700 transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {reportNotifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No report notifications</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {reportNotifications.slice(0, 10).map((notification) => {
              const workerName = notification.data?.workerName || 'Unknown Worker';
              const totalServices = notification.data?.totalServices || 0;
              const totalAmount = notification.data?.totalAmount || 0;

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:shadow-md transition ${
                    notification.isRead
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => viewReport(notification)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg"></span>
                      <p className={`font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{workerName}</span> submitted a report with{' '}
                      <span className="font-semibold">{totalServices}</span> services totaling{' '}
                      <span className="font-semibold text-green-600">
                        RWF {totalAmount.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Report Details
                </h2>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setSelectedReport(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Worker</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedReport.workerName}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total Services</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedReport.totalServices}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-lg font-semibold text-green-600">
                      RWF {selectedReport.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Report Date</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(selectedReport.reportDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedReport.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-700">{selectedReport.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setSelectedReport(null);
                  }}
                  className="w-full bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;