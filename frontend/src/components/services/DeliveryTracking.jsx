import React, { useState, useEffect } from 'react';
import { FaTruck, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const DeliveryTracking = ({ serviceId, deliveries = [] }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'RETURNED':
        return <FaCheckCircle className="text-green-500" />;
      case 'PENDING':
        return <FaClock className="text-yellow-500" />;
      case 'OVERDUE':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaTruck className="text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RETURNED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'OVERDUE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <FaTruck className="text-3xl mx-auto mb-2 text-gray-300" />
        <p>No deliveries recorded for this service</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deliveries.map((delivery, index) => (
        <div
          key={delivery.id || index}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xl">{getStatusIcon(delivery.returnStatus)}</div>
              <div>
                <p className="font-medium text-gray-800">
                  Delivery #{index + 1}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(delivery.deliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                delivery.returnStatus
              )}`}
            >
              {delivery.returnStatus}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <p>
              <span className="font-medium text-gray-600">Address:</span>{' '}
              {delivery.deliveryAddress}
            </p>
            <p>
              <span className="font-medium text-gray-600">Expected Return:</span>{' '}
              {new Date(delivery.expectedReturn).toLocaleDateString()}
            </p>
            {delivery.actualReturn && (
              <p>
                <span className="font-medium text-gray-600">Actual Return:</span>{' '}
                {new Date(delivery.actualReturn).toLocaleDateString()}
              </p>
            )}
            {delivery.notes && (
              <p className="md:col-span-2">
                <span className="font-medium text-gray-600">Notes:</span>{' '}
                {delivery.notes}
              </p>
            )}
          </div>

          {/* Items Delivered */}
          {delivery.itemsDelivered && delivery.itemsDelivered.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Items:</p>
              <div className="flex flex-wrap gap-2">
                {delivery.itemsDelivered.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                  >
                    {item.name} × {item.quantity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DeliveryTracking;