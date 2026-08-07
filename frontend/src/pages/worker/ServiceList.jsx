import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { serviceAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ServiceList = () => {
  const { type } = useParams();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentStatus: '',
    district: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const serviceTypes = {
    it: 'IT_MAINTENANCE',
    electrical: 'ELECTRICAL_INSTALLATION',
    construction: 'CONSTRUCTION',
    generator: 'GENERATOR_REPAIR',
    stationary: 'OFFICE_STATIONARY',
    decoration: 'DECORATION_SOUND',
  };

  const serviceTypeLabel = serviceTypes[type] || type;

  useEffect(() => {
    fetchServices();
  }, [type, filters, pagination.page]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {
        serviceType: serviceTypes[type],
        page: pagination.page,
        limit: 10,
        ...filters,
      };
      if (filters.search) params.clientName = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      if (filters.district) params.district = filters.district;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await serviceAPI.getServices(params);
      setServices(response.data.data || []);
      setPagination({
        page: response.data.pagination?.page || 1,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0,
      });
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPagination({ ...pagination, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchServices();
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

  // ✅ Add null checks for all helper functions
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'UNPAID': return 'bg-red-100 text-red-700';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusLabel = (status) => {
    if (!status) return t('common.unknown');
    return t(`common.${status.toLowerCase()}`);
  };

  const getServiceStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'ONGOING': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getServiceStatusLabel = (status) => {
    if (!status) return t('common.unknown');
    return t(`common.${status.toLowerCase()}`);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'RWF 0';
    return `RWF ${amount.toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {t(`services.${serviceTypeLabel.toLowerCase()}`)}
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
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder={t('common.search')}
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <FaFilter /> {t('common.filter')}
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
          >
            Search
          </button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-200">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payment</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partial</option>
            </select>
            <input
              type="text"
              name="district"
              placeholder={t('services.district')}
              value={filters.district}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
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
                    <td className="px-4 py-3 font-medium">{service.clientName || 'Unknown'}</td>
                    <td className="px-4 py-3">{formatCurrency(service.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.paymentStatus)}`}>
                        {getPaymentStatusLabel(service.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getServiceStatusColor(service.status)}`}>
                        {getServiceStatusLabel(service.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{service.district || 'N/A'}</td>
                    <td className="px-4 py-3">{formatDate(service.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/services/${type}/${service.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEye size={16} />
                        </Link>
                        <Link
                          to={`/services/${type}/${service.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <FaEdit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(service.id)}
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
              Showing {services.length} of {pagination.total} results
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="px-3 py-1">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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