import React from "react";

export function ContentCard({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionCard({ children, title, subtitle, action, className = "", ...props }) {
  return (
    <ContentCard className={className} {...props}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && (
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-500 text-xs mt-1 font-light">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </ContentCard>
  );
}

export function InfoCard({ title, value, icon, description, className = "", ...props }) {
  return (
    <ContentCard className={`flex flex-col justify-between ${className}`} {...props}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-gray-500 uppercase font-mono tracking-wider">
            {title}
          </span>
          {icon && (
            <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-500">
              {icon}
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-gray-900 font-sans tracking-tight">
          {value}
        </div>
      </div>
      {description && (
        <p className="text-xs text-gray-400 mt-2 font-medium">
          {description}
        </p>
      )}
    </ContentCard>
  );
}

export function StatusCard({ title, status, description, icon, badgeColor = "bg-blue-50 border-blue-200 text-blue-700", className = "", ...props }) {
  return (
    <ContentCard className={`flex items-start gap-4 ${className}`} {...props}>
      {icon && (
        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 shrink-0">
          {icon}
        </div>
      )}
      <div className="space-y-1 flex-grow">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="font-bold text-sm text-gray-900">{title}</h4>
          {status && (
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase font-mono tracking-wider ${badgeColor}`}>
              {status}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 leading-relaxed font-light">
            {description}
          </p>
        )}
      </div>
    </ContentCard>
  );
}
