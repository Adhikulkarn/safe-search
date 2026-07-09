import React from "react";

export function Section({ children, title, subtitle, className = "", ...props }) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {title && (
        <div className="pb-3">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-500 text-xs mt-1 font-light">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export default Section;
