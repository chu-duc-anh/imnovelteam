
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', message, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 py-4 ${className}`}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-primary-500 border-t-transparent`}
      ></div>
      {message && <p className="text-sm text-gray-400">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;