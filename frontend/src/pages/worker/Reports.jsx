import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaFileExcel, FaDownload, FaTrash, FaEye } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { reportAPI, serviceAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Reports = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    type: 'daily',
    serviceType: '',
    startDate: '',
    endDate: '',
    format: 'pdf',
  });
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchReports();
    fetchServices();
  }, [pagination.page]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getReports({ page: pagination.page, limit: 10 });
      setReports(response.data.data);
      setPagination({
        page: response.data.pagination.page,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getServices({ limit: 100 });
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const generateReport = async (e) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const response = await reportAPI.generateReport(formData);
      toast.success('Report generated successfully');
      fetchReports();
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (id) => {
    try {
      const response = await reportAPI.downloadReport(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const deleteReport = async (id) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportAPI.deleteReport(id);
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  if (loading) return <LoadingSpinner />;

  const serviceTypes = [
    'IT_MAINTENANCE',
    'ELECTRICAL_INSTALLATION',
    'CONSTRUCTION',
    'GENERATOR_REPAIR',
    'OFFICE_STATIONARY',
    'DECORATION_SOUND',
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('reports.title')}</h1>

      {/* Generate Report Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('reports.generate')}</h2>
        <form onSubmit={generateReport} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">{t('reports.daily')}</option>
              <option value="monthly">{t('reports.monthly')}</option>
              <option value="service_summary">{t('reports.service_summary')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Services</option>
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {t(`services.${type.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
            >
              {generating ? t('common.loading') : t('reports.generate')}
            </button>
          </div>
        </form>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-800 p-4 border-b">Generated Reports</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Service Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    {t('common.no_data')}
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 capitalize">{report.reportType.toLowerCase()}</td>
                    <td className="px-4 py-3">
                      {report.serviceType
                        ? t(`services.${report.serviceType.toLowerCase()}`)
                        : 'All'}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(report.generatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {report.fileUrl?.endsWith('.pdf') ? (
                        <span className="flex items-center gap-1 text-red-500">
                          <FaFilePdf /> PDF
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-500">
                          <FaFileExcel /> Excel
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadReport(report.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title={t('reports.download_pdf')}
                        >
                          <FaDownload size={16} />
                        </button>
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Showing {reports.length} of {pagination.total} reports
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
    </div>
  );
};

export default Reports;