import React, { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const ServiceFilters = ({ onFilter, initialFilters = {} }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: initialFilters.status || '',
    paymentStatus: initialFilters.paymentStatus || '',
    district: initialFilters.district || '',
    startDate: initialFilters.startDate || '',
    endDate: initialFilters.endDate || '',
    minAmount: initialFilters.minAmount || '',
    maxAmount: initialFilters.maxAmount || '',
  });

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleApply = () => {
    onFilter(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const emptyFilters = {
      status: '',
      paymentStatus: '',
      district: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    };
    setFilters(emptyFilters);
    onFilter(emptyFilters);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
      >
        <FaFilter /> {t('common.filter')}
        {Object.values(filters).some(v => v) && (
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{t('common.filter')}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t('common.status')}
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All</option>
                <option value="ONGOING">{t('common.ongoing')}</option>
                <option value="COMPLETED">{t('common.completed')}</option>
                <option value="CANCELLED">{t('common.cancelled')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t('common.payment')}
              </label>
              <select
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All</option>
                <option value="PAID">{t('common.paid')}</option>
                <option value="UNPAID">{t('common.unpaid')}</option>
                <option value="PARTIAL">{t('common.partial')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t('services.district')}
              </label>
              <input
                type="text"
                name="district"
                value={filters.district}
                onChange={handleChange}
                placeholder="Enter district"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Min Amount
                </label>
                <input
                  type="number"
                  name="minAmount"
                  value={filters.minAmount}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Max Amount
                </label>
                <input
                  type="number"
                  name="maxAmount"
                  value={filters.maxAmount}
                  onChange={handleChange}
                  placeholder="999999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleApply}
              className="flex-1 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              Apply
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceFilters;