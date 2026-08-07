import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';
import SendReport from './pages/worker/SendReport';
import AdminReports from './pages/admin/AdminReports';
// Context
import { LanguageProvider } from './context/LanguageContext';
import LoadingRedirect from './pages/LoadingRedirect';
// Components
import Layout from './components/common/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Unauthorized } from './components/auth/Unauthorized';
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';
import WorkerSettings from './pages/worker/WorkerSettings';
// ✅ ONLY ONE IMPORT for TestTranslation


// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkerManagement from './pages/admin/WorkerManagement';
import Settings from './pages/admin/Settings';
import MonthlyReport from './pages/admin/MonthlyReport';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import ServiceList from './pages/worker/ServiceList';
import ServiceForm from './pages/worker/ServiceForm';
import ServiceDetails from './pages/worker/ServiceDetails';
import Reports from './pages/worker/Reports';
import Notifications from './pages/worker/Notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* ✅ Test Route - Remove after testing */}
        

            {/* Public Routes */}
            <Route path="/loading" element={<LoadingRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes with Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route
  path="/admin/reports"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminReports />
    </ProtectedRoute>
  }
/>
              {/* Worker Routes */}

              <Route path="/dashboard" element={<WorkerDashboard />} />
              <Route path="/services/:type" element={<ServiceList />} />
              <Route path="/services/:type/new" element={<ServiceForm />} />
              <Route path="/services/:type/:id" element={<ServiceDetails />} />
              <Route path="/services/:type/:id/edit" element={<ServiceForm />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<WorkerSettings />} />
              <Route path="/send-report" element={<SendReport />} />
              

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/workers"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <WorkerManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports/monthly"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <MonthlyReport />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#22c55e',
                  color: '#fff',
                },
                icon: '✅',
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
                icon: '❌',
              },
            }}
          />
        </Router>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;