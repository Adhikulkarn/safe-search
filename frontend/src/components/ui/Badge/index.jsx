import React from "react";

export function Badge({ children, variant = "gray", className = "", ...props }) {
  const baseStyle =
    "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border select-none transition duration-150";

  const variants = {
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };

  const selectedVariant = variants[variant] || variants.gray;

  return (
    <span className={`${baseStyle} ${selectedVariant} ${className}`} {...props}>
      {children}
    </span>
  );
}

export default Badge;
