import React from "react";

export function Toolbar({ children, className = "", ...props }) {
  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl mb-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function ToolbarGroup({ children, className = "", ...props }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 w-full sm:w-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Toolbar;
