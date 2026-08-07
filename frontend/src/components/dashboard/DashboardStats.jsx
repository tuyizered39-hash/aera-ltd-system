import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const DashboardStats = ({ stats, loading }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: t('dashboard.today_services'),
      value: stats?.todayServices || 0,
      color: 'text-blue-600',
    },
    {
      label: t('dashboard.monthly_income'),
      value: `RWF ${(stats?.monthlyIncome || 0).toLocaleString()}`,
      color: 'text-green-600',
    },
    {
      label: t('dashboard.active_clients'),
      value: stats?.activeClients || 0,
      color: 'text-purple-600',
    },
    {
      label: t('dashboard.pending_tasks'),
      value: stats?.pendingTasks || 0,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <p className="text-sm text-gray-500">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;