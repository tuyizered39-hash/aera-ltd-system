import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar — NOT blurred */}
      <Navbar />

      {/* Body: Sidebar + Main — both siblings in the flex row */}
      <div className="flex flex-1 min-w-0">
        {/* Sidebar — NOT blurred */}
        <Sidebar />

        {/*
          Main content — the ONLY blurrable area.
          The three critical classes:
          - relative  → scopes absolute children to <main>
          - isolate   → new stacking context; backdrop-filter cannot sample Sidebar
          - min-w-0   → prevents flex overflow on mobile
        */}
        <main className="relative isolate flex-1 min-w-0 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Footer — NOT blurred */}
      <Footer />
    </div>
  );
};

export default Layout;