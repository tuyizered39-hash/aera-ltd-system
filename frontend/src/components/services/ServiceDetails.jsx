import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaArrowLeft, FaPrint, FaDownload } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { serviceAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const ServiceDetails = ({ serviceId, type }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getServiceById(serviceId);
      setService(response.data.data);
    } catch (error) {
      toast.error('Failed to load service details');
      navigate(`/services/${type}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'UNPAID': return 'bg-red-100 text-red-700';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getServiceStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'ONGOING': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!service) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/services/${type}`)}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t('services.service_details')}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/services/${type}/${serviceId}/edit`}
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            <FaEdit /> {t('common.edit')}
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            <FaPrint /> {t('common.print')}
          </button>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Client Information</h3>
              <div className="mt-3 space-y-2">
                <p><span className="font-medium">Name:</span> {service.clientName}</p>
                {service.clientPhone && (
                  <p><span className="font-medium">Phone:</span> {service.clientPhone}</p>
                )}
                {service.clientEmail && (
                  <p><span className="font-medium">Email:</span> {service.clientEmail}</p>
                )}
                <p><span className="font-medium">Location:</span> {service.location}</p>
                <p><span className="font-medium">District:</span> {service.district}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Service Details</h3>
              <div className="mt-3 space-y-2">
                <p><span className="font-medium">Type:</span> {t(`services.${service.serviceType.toLowerCase()}`)}</p>
                <p><span className="font-medium">Amount:</span> RWF {service.amount.toLocaleString()}</p>
                <p><span className="font-medium">Amount Paid:</span> RWF {(service.amountPaid || 0).toLocaleString()}</p>
                <p><span className="font-medium">Payment Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(service.paymentStatus)}`}>
                    {t(`common.${service.paymentStatus.toLowerCase()}`)}
                  </span>
                </p>
                <p><span className="font-medium">Service Status:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getServiceStatusColor(service.status)}`}>
                    {t(`common.${service.status.toLowerCase()}`)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Dates</h3>
              <div className="mt-3 space-y-2">
                <p><span className="font-medium">Start Date:</span> {new Date(service.startDate).toLocaleDateString()}</p>
                {service.endDate && (
                  <p><span className="font-medium">End Date:</span> {new Date(service.endDate).toLocaleDateString()}</p>
                )}
                <p><span className="font-medium">Created:</span> {new Date(service.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Additional Info</h3>
              <div className="mt-3 space-y-2">
                {service.paymentMode && (
                  <p><span className="font-medium">Payment Mode:</span> {service.paymentMode}</p>
                )}
                {service.tentQuantity > 0 && (
                  <p><span className="font-medium">Tent Quantity:</span> {service.tentQuantity}</p>
                )}
                {service.decorationItems?.length > 0 && (
                  <p><span className="font-medium">Decoration Items:</span> {service.decorationItems.length} items</p>
                )}
                {service.description && (
                  <p><span className="font-medium">Description:</span> {service.description}</p>
                )}
                {service.notes && (
                  <p><span className="font-medium">Notes:</span> {service.notes}</p>
                )}
              </div>
            </div>
          </div>

          {service.decorationItems?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Decoration Items</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500">
                      <th className="pb-2">Item</th>
                      <th className="pb-2">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.decorationItems.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;