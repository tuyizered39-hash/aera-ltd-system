import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { serviceAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ButtonSpinner from '../common/LoadingSpinner.jsx';
import toast from 'react-hot-toast';

const ServiceForm = ({ type, serviceType, serviceId = null }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    location: '',
    district: '',
    amount: '',
    amountPaid: '',
    paymentStatus: 'UNPAID',
    paymentMode: 'CASH',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    tentQuantity: '',
    decorationItems: [],
    notes: '',
  });

  const isEdit = !!serviceId;

  useEffect(() => {
    if (isEdit) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getServiceById(serviceId);
      const data = response.data.data;
      setFormData({
        ...data,
        amount: data.amount.toString(),
        amountPaid: data.amountPaid?.toString() || '',
        startDate: new Date(data.startDate).toISOString().split('T')[0],
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
        tentQuantity: data.tentQuantity?.toString() || '',
      });
    } catch (error) {
      toast.error('Failed to load service');
      navigate(`/services/${type}`);
    } finally {
      setLoading(false);
    }
  };

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
      const data = {
        ...formData,
        serviceType,
        amount: parseFloat(formData.amount),
        amountPaid: formData.amountPaid ? parseFloat(formData.amountPaid) : null,
        tentQuantity: formData.tentQuantity ? parseInt(formData.tentQuantity) : null,
      };

      if (isEdit) {
        await serviceAPI.updateService(serviceId, data);
        toast.success('Service updated successfully');
      } else {
        await serviceAPI.createService(data);
        toast.success('Service created successfully');
      }
      navigate(`/services/${type}`);
    } catch (error) {
      toast.error(isEdit ? 'Failed to update service' : 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? t('common.edit') : t('common.new')} {t(`services.${serviceType.toLowerCase()}`)}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('services.client_name')} *
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Client Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('services.client_phone')}
            </label>
            <input
              type="text"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Client Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('services.client_email')}
            </label>
            <input
              type="email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('services.location')} *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('services.district')} *
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('services.amount')} *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('services.amount_paid')}
            </label>
            <input
              type="number"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleChange}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('services.payment_status')}
            </label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="PAID">{t('common.paid')}</option>
              <option value="UNPAID">{t('common.unpaid')}</option>
              <option value="PARTIAL">{t('common.partial')}</option>
            </select>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('services.payment_mode')}
            </label>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="CASH">Cash</option>
              <option value="MTN">MTN</option>
              <option value="BANK">Bank</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('services.start_date')} *
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
              {t('services.end_date')}
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tent Quantity (Decoration only) */}
          {serviceType === 'DECORATION_SOUND' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('services.tent_quantity')}
              </label>
              <input
                type="number"
                name="tentQuantity"
                value={formData.tentQuantity}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('services.description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('services.notes')}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-blue-900 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed min-w-[140px]"
          >
            {submitting ? (
              <>
                <ButtonSpinner size={16} color="white" />
                <span>{t('common.loading')}</span>
              </>
            ) : (
              <span>{isEdit ? t('common.save') : t('common.submit')}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/services/${type}`)}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;