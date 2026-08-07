import React, { useState, useEffect } from 'react';
import { FaDownload, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { dashboardAPI, reportAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const MonthlyReport = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  useEffect(() => {
    fetchMonthlyReport();
  }, [year, month]);

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getMonthlyReport({ year, month });
      setReport(response.data.data);
    } catch (error) {
      console.error('Failed to fetch monthly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      setGenerating(true);
      const response = await reportAPI.generateReport({
        type: 'monthly',
        startDate: new Date(year, month, 1).toISOString().split('T')[0],
        endDate: new Date(year, month + 1, 0).toISOString().split('T')[0],
        format: 'pdf',
      });
      toast.success('Report generated successfully');
      fetchMonthlyReport();
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Monthly Report</h1>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <button
            onClick={downloadReport}
            disabled={generating}
            className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
          >
            <FaDownload /> {generating ? t('common.loading') : 'Download Report'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Total Services</p>
              <p className="text-2xl font-bold text-gray-800">{report.totalServices}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">
                RWF {report.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-blue-600">
                RWF {report.totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Total Unpaid</p>
              <p className="text-2xl font-bold text-red-600">
                RWF {report.totalUnpaid.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-800 p-4 border-b">Services</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Service Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {report.services?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-500">
                        No services found for this month
                      </td>
                    </tr>
                  ) : (
                    report.services?.map((service) => (
                      <tr key={service.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{service.clientName}</td>
                        <td className="px-4 py-3">
                          {t(`services.${service.serviceType.toLowerCase()}`)}
                        </td>
                        <td className="px-4 py-3">RWF {service.amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          RWF {(service.amountPaid || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              service.paymentStatus === 'PAID'
                                ? 'bg-green-100 text-green-700'
                                : service.paymentStatus === 'PARTIAL'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {t(`common.${service.paymentStatus.toLowerCase()}`)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {new Date(service.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyReport;