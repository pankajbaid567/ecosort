import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-eco-bg">
      <div className="text-center">
        <div className="loading-spinner text-eco-green mb-4 w-12 h-12"></div>
        <p className="text-eco-light">Loading EcoSort...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
