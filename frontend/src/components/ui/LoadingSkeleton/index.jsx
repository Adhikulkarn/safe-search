import React from "react";

export function LoadingSkeleton({ rows = 5, className = "", ...props }) {
  return (
    <div className={`space-y-4 w-full animate-pulse font-sans ${className}`} {...props}>
      <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center gap-3 w-1/3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-150 rounded-md w-1/6"></div>
            <div className="h-4 bg-gray-150 rounded-md w-1/12"></div>
            <div className="h-8 bg-gray-100 rounded-xl w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;
