import React, { useEffect } from 'react';


const LoadingRedirect = () => {
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      window.location.href = `${window.location.origin}/login`;
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, []);

  return (
    // The container with the blue background (full screen)
    <div className="flex h-screen w-screen items-center justify-center bg-[#0d579b]">
      
      {/* The actual spinning circle */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-transparent border-t-white border-b-white"></div>
      
    </div>
  );
};

export default LoadingRedirect;