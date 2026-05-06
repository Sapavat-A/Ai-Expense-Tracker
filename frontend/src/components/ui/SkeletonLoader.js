import React from 'react';

const SkeletonLoader = ({ 
  type = 'text', 
  className = '', 
  width = 'w-full', 
  height = 'h-4',
  lines = 1 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  if (type === 'text') {
    return (
      <div className={`${width} ${height} ${baseClasses} ${className}`}>
        <div className="h-2 bg-gray-300 rounded w-3/4"></div>
      </div>
    );
  }
  
  if (type === 'card') {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (type === 'stats') {
    return (
      <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-4 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-md">
            <div className="space-y-3">
              <div className="h-2 bg-gray-200 rounded w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
              <div className="h-2 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (type === 'chart') {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-lg ${className}`}>
        <div className="space-y-4">
          <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="flex justify-between mt-4">
            <div className="h-2 bg-gray-200 rounded w-1/6"></div>
            <div className="h-2 bg-gray-200 rounded w-1/6"></div>
            <div className="h-2 bg-gray-200 rounded w-1/6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${baseClasses} ${width} ${height} ${className}`}></div>
  );
};

export default SkeletonLoader;
