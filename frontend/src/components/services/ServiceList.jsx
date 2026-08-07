import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { serviceAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const ServiceList = ({ type, serviceType }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    district: '',
  });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  useEffect(() => {
    fetchServices();
  }, [pagination.page, filters, search]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {
        serviceType,
        page: pagination.page,
        limit: 10,
        clientName: search || undefined,
        ...filters,
      };
      const response = await serviceAPI.getServices(params);
      setServices(response.data.data);
      setPagination({
        page: response.data.pagination.page,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      });
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await serviceAPI.deleteService(id);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {t(`services.${serviceType.toLowerCase()}`)}
        </h1>
        <Link
          to={`/services/${type}/new`}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          <FaPlus /> {t('common.new')}
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Payment</option>
            <option value="PAID">{t('common.paid')}</option>
            <option value="UNPAID">{t('common.unpaid')}</option>
            <option value="PARTIAL">{t('common.partial')}</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="ONGOING">{t('common.ongoing')}</option>
            <option value="COMPLETED">{t('common.completed')}</option>
            <option value="CANCELLED">{t('common.cancelled')}</option>
          </select>
          <input
            type="text"
            placeholder={t('services.district')}
            value={filters.district}
            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3">{t('common.client')}</th>
                <th className="px-4 py-3">{t('common.amount')}</th>
                <th className="px-4 py-3">{t('common.payment')}</th>
                <th className="px-4 py-3">{t('common.status')}</th>
                <th className="px-4 py-3">{t('common.location')}</th>
                <th className="px-4 py-3">{t('common.date')}</th>
                <th className="px-4 py-3">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    {t('common.no_data')}
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{service.clientName}</td>
                    <td className="px-4 py-3">RWF {service.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.paymentStatus)}`}>
                        {t(`common.${service.paymentStatus.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getServiceStatusColor(service.status)}`}>
                        {t(`common.${service.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{service.district}</td>
                    <td className="px-4 py-3">{new Date(service.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/services/${type}/${service.id}`} className="text-blue-600 hover:text-blue-800">
                          <FaEye size={16} />
                        </Link>
                        <Link to={`/services/${type}/${service.id}/edit`} className="text-yellow-600 hover:text-yellow-800">
                          <FaEdit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-800">
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
              Showing {services.length} of {pagination.total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1">{pagination.page} / {pagination.pages}</span>
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

export default ServiceList;