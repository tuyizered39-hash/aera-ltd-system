import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';



const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});


// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aera_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401) {
      localStorage.removeItem('aera_token');
      localStorage.removeItem('aera_user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }

    if (status === 403) {
      toast.error('You do not have permission to perform this action.');
    }

    if (status === 404) {
      toast.error('Resource not found.');
    }

    if (status === 422) {
      const errors = data.errors || [];
      errors.forEach(err => {
        toast.error(`${err.field}: ${err.message}`);
      });
    }

    if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ============================================
// USER API
// ============================================
export const userAPI = {
  getWorkers: (params) => api.get('/users/workers', { params }),
  createWorker: (data) => api.post('/users/workers', data),
  updateWorker: (id, data) => api.patch(`/users/workers/${id}`, data),
  deleteWorker: (id) => api.delete(`/users/workers/${id}`),
  updateProfile: (data) => api.patch('/users/profile', data),
  uploadProfilePicture: (formData) => {
    return api.post('/users/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============================================
// SERVICE API
// ============================================
export const serviceAPI = {
  getServices: (params) => api.get('/services', { params }),
  getServiceById: (id) => api.get(`/services/${id}`),
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.patch(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),
  getDashboardStats: () => api.get('/services/dashboard/stats'),
};


// ============================================
// REPORT API - ✅ COMBINED (NO DUPLICATE)
// ============================================
export const reportAPI = {
  // Generate report
  generateReport: (data) => api.post('/reports/generate', data),
  getReports: (params) => api.get('/reports', { params }),
  getReportById: (id) => api.get(`/reports/${id}`),
  downloadReport: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  deleteReport: (id) => api.delete(`/reports/${id}`),
  
  // ✅ Send daily report to admin
  sendDailyReport: (data) => api.post('/reports/daily', data),
  
  // ✅ Get report notifications (admin only)
  getReportNotifications: () => api.get('/reports/notifications'),
  
  // ✅ Mark report notification as read
  markReportNotificationRead: (id) => api.patch(`/reports/notifications/${id}/read`),
  
  // ✅ Mark all report notifications as read
  markAllReportNotificationsRead: () => api.patch('/reports/notifications/read-all'),
};

// ============================================
// NOTIFICATION API
// ============================================
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// ============================================
// DASHBOARD API
// ============================================
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getMonthlyReport: (params) => api.get('/dashboard/monthly', { params }),
  getDailyReport: (params) => api.get('/dashboard/daily', { params }),
  getAdminOverview: () => api.get('/dashboard/admin/overview'),
};

export default api;
