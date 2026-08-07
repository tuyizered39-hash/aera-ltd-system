import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { serviceAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ServiceForm = () => {
  const { type, id } = useParams();
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

  // ✅ Map URL types to service types
  const serviceTypes = {
    it: 'IT_MAINTENANCE',
    electrical: 'ELECTRICAL_INSTALLATION',
    construction: 'CONSTRUCTION',
    generator: 'GENERATOR_REPAIR',
    stationary: 'OFFICE_STATIONARY',
    decoration: 'DECORATION_SOUND',
  };

  // ✅ Get the service type from the URL param
  const serviceType = serviceTypes[type];

  const isEdit = !!id;

  // ✅ Check if serviceType exists, if not redirect
  useEffect(() => {
    if (!serviceType) {
      toast.error('Invalid service type');
      navigate('/dashboard');
    }
  }, [serviceType, navigate]);

  useEffect(() => {
    if (isEdit && serviceType) {
      fetchService();
    }
  }, [id, serviceType]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getServiceById(id);
      const data = response.data.data;
      setFormData({
        clientName: data.clientName || '',
        clientPhone: data.clientPhone || '',
        clientEmail: data.clientEmail || '',
        location: data.location || '',
        district: data.district || '',
        amount: data.amount?.toString() || '',
        amountPaid: data.amountPaid?.toString() || '',
        paymentStatus: data.paymentStatus || 'UNPAID',
        paymentMode: data.paymentMode || 'CASH',
        description: data.description || '',
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
        tentQuantity: data.tentQuantity?.toString() || '',
        decorationItems: data.decorationItems || [],
        notes: data.notes || '',
      });
    } catch (error) {
      toast.error('Failed to load service');
      navigate(`/services/${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === '' ? '' : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        setSubmitting(false);
        return;
      }

      const data = {
        serviceType: serviceType,
        clientName: formData.clientName.trim(),
        clientPhone: formData.clientPhone?.trim() || null,
        clientEmail: formData.clientEmail?.trim() || null,
        location: formData.location.trim(),
        district: formData.district.trim(),
        amount: amount,
        amountPaid: formData.amountPaid ? parseFloat(formData.amountPaid) : null,
        paymentStatus: formData.paymentStatus || 'UNPAID',
        paymentMode: formData.paymentMode || 'CASH',
        description: formData.description?.trim() || null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        tentQuantity: formData.tentQuantity && formData.tentQuantity !== '' 
          ? parseInt(formData.tentQuantity) 
          : null,
        decorationItems: formData.decorationItems || null,
        notes: formData.notes?.trim() || null,
      };

      console.log('📤 Sending service data:', data);

      if (isEdit) {
        await serviceAPI.updateService(id, data);
        toast.success('Service updated successfully');
      } else {
        await serviceAPI.createService(data);
        toast.success('Service created successfully');
      }
      navigate(`/services/${type}`);
    } catch (error) {
      console.error('❌ Service error:', error.response?.data || error.message);
      
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((errorItem) => {
          toast.error(`${errorItem.field}: ${errorItem.message}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to create service');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Show loading spinner while fetching
  if (loading) return <LoadingSpinner />;

  // ✅ If serviceType is invalid, don't render
  if (!serviceType) return null;

  // ✅ Get the display name for the service type
  const getServiceTypeDisplay = () => {
    const key = `services.${serviceType.toLowerCase()}`;
    return t(key);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? t('common.edit') : t('common.new')} {getServiceTypeDisplay()}
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
              min="0"
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
              min="0"
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
              value={formData.description || ''}
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
              value={formData.notes || ''}
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
            className="bg-blue-900 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
          >
            {submitting ? t('common.loading') : isEdit ? t('common.save') : t('common.submit')}
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