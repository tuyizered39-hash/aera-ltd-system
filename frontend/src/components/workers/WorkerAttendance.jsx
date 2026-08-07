import React, { useState, useEffect } from 'react';
import { FaUserCheck, FaUserTimes, FaClock, FaCalendar } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const WorkerAttendance = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
  });

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getWorkers({ limit: 100 });
      const workerData = response.data.data;
      setWorkers(workerData);

      const present = workerData.filter(w => w.isPresentToday).length;
      setStats({
        total: workerData.length,
        present,
        absent: workerData.length - present,
        late: 0,
      });
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Worker Attendance</h1>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchAttendance}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500">Total Workers</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500">Present</p>
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500">Absent</p>
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500">Attendance Rate</p>
          <p className="text-2xl font-bold text-blue-600">
            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Workers List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3">{t('workers.name')}</th>
                <th className="px-4 py-3">{t('workers.email')}</th>
                <th className="px-4 py-3">{t('workers.phone')}</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Check In</th>
              </tr>
            </thead>
            <tbody>
              {workers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    {t('common.no_data')}
                  </td>
                </tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{worker.fullName}</td>
                    <td className="px-4 py-3">{worker.email}</td>
                    <td className="px-4 py-3">{worker.phone || '-'}</td>
                    <td className="px-4 py-3">
                      {worker.isPresentToday ? (
                        <span className="flex items-center gap-2 text-green-600">
                          <FaUserCheck className="w-4 h-4" />
                          Present
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-600">
                          <FaUserTimes className="w-4 h-4" />
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {worker.isPresentToday ? (
                        <span className="text-sm text-gray-500">
                          <FaClock className="inline mr-1" />
                          {new Date().toLocaleTimeString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerAttendance;