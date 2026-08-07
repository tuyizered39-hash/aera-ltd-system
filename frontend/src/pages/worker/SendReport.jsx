import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaCalendar, FaMoneyBillWave, FaUsers } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { reportAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const SendReport = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [reportPreview, setReportPreview] = useState(null);

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
    setSubmitting(true);

    try {
      const response = await reportAPI.sendDailyReport(formData);
      toast.success('Report sent to admin successfully!');
      setReportPreview(response.data);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 5000);

    } catch (error) {
      console.error('❌ Send report error:', error);
      toast.error(error.response?.data?.message || 'Failed to send report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Send Daily Report
      </h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service Type */}
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

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information for the admin..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex items-center gap-2 bg-blue-900 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
          >
            <FaPaperPlane />
            {submitting ? 'Sending...' : 'Send Report to Admin'}
          </button>
        </form>

        {/* Report Preview */}
        {reportPreview && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
               Report Sent Successfully!
            </h2>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Services</p>
                  <p className="text-xl font-bold text-gray-800">
                    {reportPreview.summary?.totalServices || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    RWF {reportPreview.summary?.totalAmount?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Clients</p>
                  <p className="text-xl font-bold text-blue-600">
                    {reportPreview.summary?.totalClients || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Notifications sent to {reportPreview.notifications} admin(s)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendReport;