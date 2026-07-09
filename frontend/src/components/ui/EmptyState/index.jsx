import React from "react";
import { FolderOpen } from "lucide-react";

export function EmptyState({
  title = "No data found",
  description = "There are no records matching the criteria.",
  icon = <FolderOpen className="w-6 h-6" />,
  action = null,
  className = "",
  ...props
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-200 border-dashed rounded-2xl font-sans ${className}`}
      {...props}
    >
      <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 mb-4 select-none">
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto mb-4">
        {description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
