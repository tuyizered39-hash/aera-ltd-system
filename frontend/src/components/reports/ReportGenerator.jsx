import React, { useState } from 'react';
import { FaFilePdf, FaFileExcel, FaDownload } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { reportAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ReportGenerator = ({ onGenerate, onCancel }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'daily',
    serviceType: '',
    startDate: '',
    endDate: '',
    format: 'pdf',
  });

  const serviceTypes = [
    { value: '', label: 'All Services' },
    { value: 'IT_MAINTENANCE', label: 'IT Maintenance & Repair' },
    { value: 'ELECTRICAL_INSTALLATION', label: 'Electrical Installation' },
    { value: 'CONSTRUCTION', label: 'Construction' },
    { value: 'GENERATOR_REPAIR', label: 'Generator Repair' },
    { value: 'OFFICE_STATIONARY', label: 'Office Stationary' },
    { value: 'DECORATION_SOUND', label: 'Decoration & Sound' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await reportAPI.generateReport(formData);
      toast.success('Report generated successfully');
      if (onGenerate) onGenerate(response.data);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('reports.generate')}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">{t('reports.daily')}</option>
              <option value="monthly">{t('reports.monthly')}</option>
              <option value="service_summary">{t('reports.service_summary')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {serviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              name="format"
              value={formData.format}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">
                <FaFilePdf className="inline mr-1" /> PDF
              </option>
              <option value="excel">
                <FaFileExcel className="inline mr-1" /> Excel
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading ? t('common.loading') : (
                <>
                  <FaDownload className="inline mr-2" />
                  {t('reports.generate')}
                </>
              )}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReportGenerator;