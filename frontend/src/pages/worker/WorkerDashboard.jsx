import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaMoneyBillWave, FaUsers, FaClock, FaEye } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { dashboardAPI, serviceAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const WorkerDashboard = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayServices: 0,
    monthlyIncome: 0,
    activeClients: 0,
    pendingTasks: 0,
    totalServices: 0,
  });
  const [recentServices, setRecentServices] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await dashboardAPI.getStats();
      setStats(statsRes.data.data);

      const servicesRes = await serviceAPI.getServices({ limit: 5 });
      setRecentServices(servicesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statItems = [
    {
      icon: FaClipboardList,
      label: t('dashboard.today_services'),
      value: stats.todayServices,
      color: 'bg-blue-500',
    },
    {
      icon: FaMoneyBillWave,
      label: t('dashboard.monthly_income'),
      value: `RWF ${(stats.monthlyIncome || 0).toLocaleString()}`,
      color: 'bg-green-500',
    },
    {
      icon: FaUsers,
      label: t('dashboard.active_clients'),
      value: stats.activeClients,
      color: 'bg-purple-500',
    },
    {
      icon: FaClock,
      label: t('dashboard.pending_tasks'),
      value: stats.pendingTasks,
      color: 'bg-orange-500',
    },
  ];

  // ✅ FIXED: Add null check for service type
  const getServiceTypeLabel = (type) => {
    if (!type) return 'Unknown Service';
    const key = `services.${type.toLowerCase()}`;
    return t(key);
  };

  const getPaymentStatusLabel = (status) => {
    if (!status) return t('common.unknown');
    return t(`common.${status.toLowerCase()}`);
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'UNPAID': return 'bg-red-100 text-red-700';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t('common.dashboard')}
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statItems.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                  <Icon />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Services */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('dashboard.recent_services')}
          </h2>
          <Link
            to="/services/it"
            className="text-sm text-blue-900 hover:text-yellow-500 transition-colors"
          >
            {t('common.view')} All →
          </Link>
        </div>

        {recentServices.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{t('common.no_data')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-2">{t('common.client')}</th>
                  <th className="pb-2">{t('common.services')}</th>
                  <th className="pb-2">{t('common.amount')}</th>
                  <th className="pb-2">{t('common.status')}</th>
                  <th className="pb-2">{t('common.date')}</th>
                  <th className="pb-2">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {recentServices.map((service) => (
                  <tr key={service.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 text-sm font-medium">{service.clientName || 'Unknown'}</td>
                    <td className="py-3 text-sm">
                      {getServiceTypeLabel(service.serviceType)}
                    </td>
                    <td className="py-3 text-sm">RWF {(service.amount || 0).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.paymentStatus)}`}>
                        {getPaymentStatusLabel(service.paymentStatus)}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3">
                      <Link
                        to={`/services/${service.serviceType?.toLowerCase() || 'unknown'}/${service.id}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <FaEye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;