import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { reportAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  FaFileAlt, 
  FaEye, 
  FaUser, 
  FaMoneyBillWave, 
  FaCalendar, 
  FaSearch, 
  FaFilter,
  FaFileExcel,
  FaDownload,
  FaTimes,
  FaPrint
} from 'react-icons/fa';
import * as XLSX from 'xlsx';

const AdminReports = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorker, setFilterWorker] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, filter, searchTerm, filterWorker, filterDateFrom, filterDateTo, filterMinAmount, filterMaxAmount]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const response = await reportAPI.getReportNotifications();
      const notificationsData = response.data.data || [];
      
      const reportData = notificationsData.map(notification => ({
        id: notification.id,
        workerName: notification.data?.workerName || 'Unknown Worker',
        totalServices: notification.data?.totalServices || 0,
        totalAmount: notification.data?.totalAmount || 0,
        totalPaid: notification.data?.totalPaid || 0,
        totalUnpaid: notification.data?.totalUnpaid || 0,
        reportDate: notification.data?.reportDate || notification.createdAt,
        notes: notification.data?.notes || '',
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        title: notification.title,
        message: notification.message,
        notificationId: notification.id,
      }));

      setReports(reportData);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...reports];

    // Filter by read/unread status
    if (filter === 'read') {
      result = result.filter(r => r.isRead);
    } else if (filter === 'unread') {
      result = result.filter(r => !r.isRead);
    }

    // Search by worker name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(r => 
        r.workerName.toLowerCase().includes(term)
      );
    }

    // Filter by worker name (exact)
    if (filterWorker.trim()) {
      const term = filterWorker.toLowerCase().trim();
      result = result.filter(r => 
        r.workerName.toLowerCase().includes(term)
      );
    }

    // Filter by date range
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(r => {
        const reportDate = new Date(r.reportDate);
        return reportDate >= fromDate;
      });
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(r => {
        const reportDate = new Date(r.reportDate);
        return reportDate <= toDate;
      });
    }

    // Filter by amount range
    if (filterMinAmount) {
      const min = parseFloat(filterMinAmount);
      if (!isNaN(min)) {
        result = result.filter(r => r.totalAmount >= min);
      }
    }

    if (filterMaxAmount) {
      const max = parseFloat(filterMaxAmount);
      if (!isNaN(max)) {
        result = result.filter(r => r.totalAmount <= max);
      }
    }

    setFilteredReports(result);
  };

  const markAsRead = async (notificationId) => {
    try {
      await reportAPI.markReportNotificationRead(notificationId);
      setReports(prev =>
        prev.map(r => 
          r.notificationId === notificationId ? { ...r, isRead: true } : r
        )
      );
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
    if (!report.isRead) {
      markAsRead(report.notificationId);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterWorker('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterMinAmount('');
    setFilterMaxAmount('');
    setFilter('all');
    setShowFilters(false);
  };

  const formatCurrency = (amount) => {
    return `RWF ${(amount || 0).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  // ✅ Export to Excel
  const exportToExcel = () => {
    if (filteredReports.length === 0) {
      toast.error('No reports to export');
      return;
    }

    const exportData = filteredReports.map(report => ({
      'Worker Name': report.workerName,
      'Total Services': report.totalServices,
      'Total Amount (RWF)': report.totalAmount,
      'Total Paid (RWF)': report.totalPaid,
      'Total Unpaid (RWF)': report.totalUnpaid,
      'Report Date': formatDate(report.reportDate),
      'Status': report.isRead ? 'Read' : 'Unread',
      'Notes': report.notes || '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Worker Reports');
    
    // Auto-size columns
    const colWidths = [
      { wch: 25 }, // Worker Name
      { wch: 15 }, // Total Services
      { wch: 20 }, // Total Amount
      { wch: 20 }, // Total Paid
      { wch: 20 }, // Total Unpaid
      { wch: 20 }, // Report Date
      { wch: 12 }, // Status
      { wch: 30 }, // Notes
    ];
    ws['!cols'] = colWidths;

    const fileName = `worker_reports_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success(`Exported ${filteredReports.length} reports to Excel`);
  };

  // ✅ Print reports
  const printReports = () => {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    let tableRows = '';
    filteredReports.forEach(report => {
      tableRows += `
        <tr>
          <td style="border:1px solid #ddd;padding:8px;">${report.workerName}</td>
          <td style="border:1px solid #ddd;padding:8px;text-align:center;">${report.totalServices}</td>
          <td style="border:1px solid #ddd;padding:8px;text-align:right;">${formatCurrency(report.totalAmount)}</td>
          <td style="border:1px solid #ddd;padding:8px;text-align:right;">${formatCurrency(report.totalPaid)}</td>
          <td style="border:1px solid #ddd;padding:8px;text-align:right;">${formatCurrency(report.totalUnpaid)}</td>
          <td style="border:1px solid #ddd;padding:8px;">${formatDate(report.reportDate)}</td>
          <td style="border:1px solid #ddd;padding:8px;text-align:center;">${report.isRead ? 'Read' : 'Unread'}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Worker Reports</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1a365d; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #1a365d; color: white; padding: 10px; border: 1px solid #1a365d; }
            td { padding: 8px; border: 1px solid #ddd; }
            tr:nth-child(even) { background: #f9f9f9; }
            .summary { margin-top: 20px; padding: 15px; background: #f0f4ff; border-radius: 8px; }
            .summary span { font-weight: bold; }
            .print-date { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1> Worker Reports</h1>
          <p class="print-date">Generated: ${new Date().toLocaleString()}</p>
          <div class="summary">
            <span>Total Reports: ${filteredReports.length}</span> |
            <span>Total Services: ${filteredReports.reduce((sum, r) => sum + r.totalServices, 0)}</span> |
            <span>Total Amount: ${formatCurrency(filteredReports.reduce((sum, r) => sum + r.totalAmount, 0))}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Services</th>
                <th>Total Amount</th>
                <th>Paid</th>
                <th>Unpaid</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <p style="margin-top:20px;color:#666;font-size:12px;">Printed from AERA LTD System</p>
          <script>
            window.onload = function() { window.print(); }
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return <LoadingSpinner />;

  const unreadCount = reports.filter(r => !r.isRead).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Daily Reports From Workers
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500">
            {unreadCount} unread
          </span>
          {filteredReports.length > 0 && (
            <>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
              >
                <FaFileExcel /> Export Excel
              </button>
              <button
                onClick={printReports}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <FaPrint /> Print
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by worker name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <FaFilter /> Filters
            {(filterWorker || filterDateFrom || filterDateTo || filterMinAmount || filterMaxAmount) && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <FaTimes /> Clear
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Worker Name</label>
              <input
                type="text"
                placeholder="Filter by worker..."
                value={filterWorker}
                onChange={(e) => setFilterWorker(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Min Amount</label>
              <input
                type="number"
                placeholder="0"
                value={filterMinAmount}
                onChange={(e) => setFilterMinAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Amount</label>
              <input
                type="number"
                placeholder="999999"
                value={filterMaxAmount}
                onChange={(e) => setFilterMaxAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            filter === 'all'
              ? 'bg-blue-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({reports.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            filter === 'unread'
              ? 'bg-blue-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            filter === 'read'
              ? 'bg-blue-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Read ({reports.length - unreadCount})
        </button>
        <span className="ml-auto text-sm text-gray-400">
          {filteredReports.length} of {reports.length} shown
        </span>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No reports found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => viewReportDetails(report)}
              className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer border-l-4 ${
                report.isRead ? 'border-gray-300' : 'border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">
                      {report.workerName}
                    </h3>
                    {!report.isRead && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {report.totalServices} services
                  </p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    {formatCurrency(report.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <FaCalendar size={12} />
                    {formatDate(report.reportDate)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {!report.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                  <FaEye className="text-gray-400 hover:text-blue-600 transition" size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Details Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                   Report Details
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedReport(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Worker Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedReport.workerName?.charAt(0) || 'W'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {selectedReport.workerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted on {formatDate(selectedReport.reportDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Services</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedReport.totalServices}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedReport.totalAmount)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Paid</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedReport.totalPaid)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Unpaid</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(selectedReport.totalUnpaid)}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedReport.notes && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-700">{selectedReport.notes}</p>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedReport.isRead
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedReport.isRead ? '✅ Read' : '🆕 New'}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedReport(null);
                  }}
                  className="w-full bg-blue-900 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition"
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

export default AdminReports;