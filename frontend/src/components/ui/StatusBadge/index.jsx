import React from "react";

export function StatusBadge({ status, className = "", ...props }) {
  const baseStyle =
    "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border uppercase font-mono tracking-wider select-none";

  const getStatusStyle = (val) => {
    if (!val) return "bg-gray-50 border-gray-200 text-gray-700";
    
    const formatted = val.toLowerCase().replace(/_/g, " ");
    switch (formatted) {
      case "active":
      case "success":
      case "healthy":
      case "encrypted":
      case "clear":
      case "audited":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "disabled":
      case "failed":
      case "error":
      case "high risk":
      case "critical":
        return "bg-rose-50 border-rose-200 text-rose-700";
      case "locked":
      case "warning":
      case "medium risk":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "pending":
      case "normal":
      case "info":
      case "low risk":
        return "bg-blue-50 border-blue-200 text-blue-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <span className={`${baseStyle} ${getStatusStyle(status)} ${className}`} {...props}>
      {status}
    </span>
  );
}

export default StatusBadge;
