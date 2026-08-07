import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue',
  showText = true,
  text = 'Loading...'
}) => {
  // Size configurations
  const sizeClasses = {
    sm: {
      spinner: 'w-8 h-8 border-2',
      text: 'text-sm',
      container: 'min-h-[100px]'
    },
    md: {
      spinner: 'w-12 h-12 border-3',
      text: 'text-base',
      container: 'min-h-[200px]'
    },
    lg: {
      spinner: 'w-16 h-16 border-4',
      text: 'text-lg',
      container: 'min-h-[300px]'
    },
    xl: {
      spinner: 'w-24 h-24 border-4',
      text: 'text-xl',
      container: 'min-h-[400px]'
    }
  };

  // Color configurations
  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
    yellow: 'border-yellow-200 border-t-yellow-600',
    green: 'border-green-200 border-t-green-600',
    red: 'border-red-200 border-t-red-600',
    purple: 'border-purple-200 border-t-purple-600'
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`flex flex-col items-center justify-center ${selectedSize.container} w-full`}>
      <div className="relative">
        {/* Main spinner */}
        <div className={`${selectedSize.spinner} ${selectedColor} rounded-full animate-spin`}></div>
        
        {/* Pulsing ring effect */}
        <div className={`absolute inset-0 ${selectedSize.spinner} border-2 border-transparent rounded-full animate-pulse`}></div>
      </div>
      
      {/* Text */}
      {showText && (
        <div className="mt-4 flex flex-col items-center gap-1">
          <p className={`${selectedSize.text} text-gray-600 font-medium animate-pulse`}>
            {text}
          </p>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Google-style loading spinner with logo
export const GoogleStyleSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
        
        {/* Animated spinner */}
        <div className="absolute inset-0 w-20 h-20">
          <div className="w-full h-full border-4 border-blue-600 rounded-full animate-spin" style={{ 
            clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%, 0% 100%)',
            borderTop: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderBottom: '4px solid #2563eb',
            borderLeft: '4px solid #2563eb',
          }}></div>
        </div>
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-gray-600 font-medium animate-pulse">{text}</p>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

// ✅ Full screen loader
export const FullScreenLoader = ({ text = 'Wait secs...' }) => {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <GoogleStyleSpinner text={text} />
    </div>
  );
};

export default LoadingSpinner;