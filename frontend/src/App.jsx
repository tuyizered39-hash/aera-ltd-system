import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Context
import { LanguageProvider } from './context/LanguageContext';

// Shell
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Auth & Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Unauthorized } from './components/auth/Unauthorized';

// Public Pages
import LoadingRedirect from './pages/LoadingRedirect';
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import ServiceList from './pages/worker/ServiceList';
import ServiceForm from './pages/worker/ServiceForm';
import ServiceDetails from './pages/worker/ServiceDetails';
import Reports from './pages/worker/Reports';
import Notifications from './pages/worker/Notifications';
import SendReport from './pages/worker/SendReport';
import WorkerSettings from './pages/worker/WorkerSettings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkerManagement from './pages/admin/WorkerManagement';
import Settings from './pages/admin/Settings';
import MonthlyReport from './pages/admin/MonthlyReport';
import AdminReports from './pages/admin/AdminReports';

// ---------- React Query ----------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// ============================================================
// ProtectedLayout — the responsive app shell
// Owns sidebar open/close state so Navbar & Sidebar stay in sync
// ============================================================
function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top navbar — passes hamburger handler */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 min-w-0">
        {/* Off-canvas drawer on < lg, persistent on ≥ lg */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <main className="flex-1 min-w-0 p-3 sm:p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ============================================================
// App
// ============================================================
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* ---------- Public Routes ---------- */}
            <Route path="/loading" element={<LoadingRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* ---------- Protected Routes (wrapped in responsive shell) ---------- */}
            <Route
              element={
                <ProtectedRoute>
                  <ProtectedLayout />
                </ProtectedRoute>
              }
            >
              {/* ---- Worker Routes ---- */}
              <Route path="/dashboard" element={<WorkerDashboard />} />
              <Route path="/services/:type" element={<ServiceList />} />
              <Route path="/services/:type/new" element={<ServiceForm />} />
              <Route path="/services/:type/:id" element={<ServiceDetails />} />
              <Route path="/services/:type/:id/edit" element={<ServiceForm />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<WorkerSettings />} />
              <Route path="/send-report" element={<SendReport />} />

              {/* ---- Admin Routes ---- */}
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
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminReports />
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

            {/* ---------- 404 ---------- */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* ---------- Toasts (mobile-friendly) ---------- */}
          <Toaster
            position="top-center"
            containerStyle={{
              top: 12,
              left: 12,
              right: 12,
            }}
            toastOptions={{
              duration: 4000,
              className: 'text-sm sm:text-base',
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                maxWidth: 'min(420px, calc(100vw - 24px))',
                padding: '10px 14px',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#22c55e',
                  color: '#fff',
                },
                icon: '',
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
                icon: '',
              },
            }}
          />
        </Router>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;