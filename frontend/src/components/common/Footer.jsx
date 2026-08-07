import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} AERA LTD. All rights reserved.</p>
        <p>Version 1.0.0</p>
      </div>
    </footer>
  );
};

export default Footer;