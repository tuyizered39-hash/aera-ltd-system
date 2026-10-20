import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaClipboardList,
  FaMoneyBillWave,
  FaClock,
  FaBell,
  FaFileAlt,
  FaEye,
  FaTimes,
  FaCalendarAlt,
} from 'react-icons/fa';
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
      setReportNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await reportAPI.markAllReportNotificationsRead();
      setReportNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  // ✅ Open the report summary modal
  const viewReport = (notification) => {
    const data = notification.data || {};

    const totalAmount = parseFloat(data.totalAmount) || 0;
    const totalPaid = parseFloat(data.totalPaid) || 0;
    const totalUnpaid =
      parseFloat(data.totalUnpaid) || totalAmount - totalPaid;

    // Get services list from the linked report if available
    let services = [];
    if (
      notification.report &&
      notification.report.data &&
      Array.isArray(notification.report.data.services)
    ) {
      services = notification.report.data.services;
    } else if (Array.isArray(data.services)) {
      services = data.services;
    }

    setSelectedReport({
      id: notification.id,
      workerName: data.workerName || 'Unknown Worker',
      totalServices: data.totalServices || 0,
      totalAmount,
      totalPaid,
      totalUnpaid,
      totalClients: data.totalClients || 0,
      reportDate: data.reportDate || notification.createdAt,
      notes: data.notes || '',
      services,
      isRead: notification.isRead,
    });

    setShowReportModal(true);

    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const closeModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  const unreadCount = reportNotifications.filter((n) => !n.isRead).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {t('common.dashboard')}
        </h1>
        <Link
          to="/admin/reports"
          className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm"
        >
          All Reports
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

      {/* Report Notifications Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaBell className="text-blue-900 text-xl" />
            <h2 className="text-lg font-semibold text-gray-800">
              Report Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-900 hover:text-blue-700 transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {reportNotifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No report notifications
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {reportNotifications.slice(0, 10).map((notification) => {
              const workerName =
                notification.data?.workerName || 'Unknown Worker';
              const totalServices = notification.data?.totalServices || 0;
              const totalAmount =
                parseFloat(notification.data?.totalAmount) || 0;
              const totalPaid =
                parseFloat(notification.data?.totalPaid) || 0;
              const totalUnpaid =
                parseFloat(notification.data?.totalUnpaid) || 0;

              return (
                <div
                  key={notification.id}
                  onClick={() => viewReport(notification)}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:shadow-md transition ${
                    notification.isRead
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FaFileAlt className="text-blue-900" />
                      <p
                        className={`font-semibold ${
                          notification.isRead
                            ? 'text-gray-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mt-1">
                      <strong>{workerName}</strong> submitted a report
                    </p>

                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <span className="text-gray-600">
                        Services:{' '}
                        <strong className="text-gray-900">
                          {totalServices}
                        </strong>
                      </span>
                      <span className="text-blue-700">
                        Total:{' '}
                        <strong>RWF {totalAmount.toLocaleString()}</strong>
                      </span>
                      <span className="text-green-600">
                        Paid:{' '}
                        <strong>RWF {totalPaid.toLocaleString()}</strong>
                      </span>
                      <span className="text-red-600">
                        Unpaid:{' '}
                        <strong>RWF {totalUnpaid.toLocaleString()}</strong>
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <FaEye
                      className="text-gray-400 hover:text-blue-600"
                      size={16}
                    />
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs whitespace-nowrap"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Summary Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-blue-900 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Report Summary</h2>
                  <p className="text-blue-200 text-sm mt-1">
                    Submitted by{' '}
                    <strong className="text-yellow-400">
                      {selectedReport.workerName}
                    </strong>
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-yellow-400 transition text-2xl"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Services
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedReport.totalServices}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    RWF {selectedReport.totalAmount.toLocaleString()}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase mb-1">Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    RWF {selectedReport.totalPaid.toLocaleString()}
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Unpaid
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    RWF {selectedReport.totalUnpaid.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Report Meta */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-900" />
                    <span className="text-gray-600">Report Date:</span>
                    <strong className="text-gray-900">
                      {new Date(selectedReport.reportDate).toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-blue-900" />
                    <span className="text-gray-600">Clients:</span>
                    <strong className="text-gray-900">
                      {selectedReport.totalClients}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Services Table */}
              {selectedReport.services &&
                selectedReport.services.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Services Included
                    </h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full">
                        <thead className="bg-blue-900 text-white">
                          <tr className="text-left text-xs font-semibold">
                            <th className="px-3 py-2 w-10">#</th>
                            <th className="px-3 py-2">Client</th>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2 w-32 text-right">
                              Amount
                            </th>
                            <th className="px-3 py-2 w-24 text-center">
                              Status
                            </th>
                            <th className="px-3 py-2 w-28">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.services.map((service, idx) => {
                            const isEven = idx % 2 === 0;
                            return (
                              <tr
                                key={service.id || idx}
                                className={`border-t border-gray-200 ${
                                  isEven ? 'bg-white' : 'bg-gray-50'
                                }`}
                              >
                                <td className="px-3 py-2 text-xs text-gray-500">
                                  {idx + 1}
                                </td>
                                <td className="px-3 py-2 text-sm font-medium text-gray-800">
                                  {service.clientName || '-'}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-600">
                                  {(service.serviceType || '').replace(
                                    /_/g,
                                    ' '
                                  )}
                                </td>
                                <td className="px-3 py-2 text-sm font-bold text-blue-900 text-right">
                                  RWF{' '}
                                  {(
                                    parseFloat(service.amount) || 0
                                  ).toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span
                                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                      service.paymentStatus === 'PAID'
                                        ? 'bg-green-100 text-green-700'
                                        : service.paymentStatus === 'PARTIAL'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {service.paymentStatus || 'UNPAID'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-600">
                                  {new Date(
                                    service.createdAt
                                  ).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-blue-50 border-t-2 border-blue-900">
                          <tr>
                            <td
                              colSpan="3"
                              className="px-3 py-3 text-right font-bold text-gray-700"
                            >
                              TOTAL:
                            </td>
                            <td className="px-3 py-3 text-right text-lg font-extrabold text-blue-900">
                              RWF{' '}
                              {selectedReport.totalAmount.toLocaleString()}
                            </td>
                            <td colSpan="2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

              {/* Notes */}
              {selectedReport.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-xs font-semibold text-yellow-800 uppercase mb-1">
                    Worker Notes
                  </p>
                  <p className="text-sm text-gray-700 italic">
                    {selectedReport.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Close
                </button>
                <Link
                  to="/admin/reports"
                  className="flex-1 bg-blue-900 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium text-center"
                >
                  View All Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;