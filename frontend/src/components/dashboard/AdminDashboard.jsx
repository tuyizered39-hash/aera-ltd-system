import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaMoneyBillWave, FaClock } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { dashboardAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import useMinLoadingTime from '../../hooks/useMinLoadingTime';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { loading, runWithMinTime } = useMinLoadingTime(2000);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOverview = async () => {
    await runWithMinTime(async () => {
      try {
        const response = await dashboardAPI.getAdminOverview();
        setOverview(response.data.data);
      } catch (error) {
        console.error('Failed to fetch admin overview:', error);
      }
    });
  };

  const stats = [
    {
      icon: FaUsers,
      label: 'Total Workers',
      value: overview?.totalWorkers || 0,
      color: 'bg-blue-500',
      link: '/admin/workers',
    },
    {
      icon: FaUsers,
      label: 'Active Today',
      value: overview?.activeWorkersToday || 0,
      color: 'bg-green-500',
    },
    {
      icon: FaClipboardList,
      label: 'Total Services',
      value: overview?.totalServices || 0,
      color: 'bg-purple-500',
      link: '/services/it',
    },
    {
      icon: FaMoneyBillWave,
      label: 'Monthly Revenue',
      value: `RWF ${(overview?.monthlyRevenue || 0).toLocaleString()}`,
      color: 'bg-yellow-500',
    },
    {
      icon: FaClock,
      label: 'Pending Payments',
      value: overview?.pendingPayments || 0,
      color: 'bg-red-500',
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <Link
          to="/admin/reports/monthly"
          className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          View Monthly Report
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const content = (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                  <Icon />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            </div>
          );

          return stat.link ? (
            <Link key={index} to={stat.link}>
              {content}
            </Link>
          ) : (
            content
          );
        })}
      </div>

      {/* Services by Type */}
      {overview?.servicesByType && overview.servicesByType.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Services by Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {overview.servicesByType.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium">
                  {t(`services.${item.type.toLowerCase()}`)}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{item.count} services</span>
                  <span className="text-sm font-semibold text-blue-900">
                    RWF {item.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;