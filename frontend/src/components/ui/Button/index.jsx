import React from "react";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
  loading = false,
  className = "",
  icon = null,
  ...props
}) {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold rounded-xl transition duration-150 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-black hover:bg-gray-900 text-white border border-transparent py-2.5 px-4 shadow-sm",
    secondary: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-2.5 px-4 shadow-sm",
    danger: "bg-rose-600 hover:bg-rose-700 text-white border border-transparent py-2.5 px-4 shadow-sm focus:ring-rose-500",
    ghost: "text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent py-2 px-3",
    icon: "p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 border border-transparent transition cursor-pointer flex items-center justify-center",
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${selectedVariant} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />}
      {!loading && icon}
      {children}
    </button>
  );
}

export default Button;
