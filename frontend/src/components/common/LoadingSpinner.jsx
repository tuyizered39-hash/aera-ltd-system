import React from 'react';
import { useNetworkSpeed } from '../../hooks/useNetworkSpeed';

const LoadingSpinner = ({ text = 'please wait' }) => {
  const { isOnline } = useNetworkSpeed();

  if (!isOnline) {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center w-full text-center p-6 pl-16 md:pl-24">
        <h3 className="text-lg font-semibold text-gray-800">
          No Internet Connection
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          Please check your internet connection and try again.
        </p>
      </div>
    );
  }

  return (
    
       
  
     
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pl-24 md:pl-40">
      {text && (
        <p className="text-lg md:text-1xl font-medium text-yellow-500 mt-4 mb-4">{text}</p>
      )}
      <div className="flex items-center gap-5 ">
        <span
          className="w-6 h-5 md:w-6 md:h-6 bg-yellow-500 rounded-full animate-bounce"
          style={{ animationDelay: '0s' }}
        ></span>
        <span
          className="w-6 h-5 md:w-6 md:h-6 bg-yellow-500 rounded-full animate-bounce"
          style={{ animationDelay: '0.15s' }}
        ></span>
        <span
          className="w-6 h-5 md:w-6 md:h-6 bg-yellow-500 rounded-full animate-bounce"
          style={{ animationDelay: '0.3s' }}
        ></span>
      </div>

    
    </div>
    
  );
};

export default LoadingSpinner;