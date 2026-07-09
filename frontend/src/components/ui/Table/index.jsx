import React from "react";

export function Table({ children, className = "", ...props }) {
  return (
    <div className={`border border-gray-200 rounded-2xl overflow-hidden bg-white font-sans ${className}`} {...props}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHeader({ headers = [], className = "", children, ...props }) {
  return (
    <thead className={`border-b border-gray-200 bg-gray-50/75 text-gray-400 font-medium font-mono text-[10px] tracking-wider uppercase ${className}`} {...props}>
      {children ? children : (
        <tr>
          {headers.map((header, idx) => {
            const isLast = idx === headers.length - 1;
            return (
              <th
                key={idx}
                className={`py-3.5 ${idx === 0 ? "pl-4" : ""} ${isLast ? "pr-4 text-right" : ""}`}
              >
                {header}
              </th>
            );
          })}
        </tr>
      )}
    </thead>
  );
}

export function TableBody({ children, className = "", ...props }) {
  return (
    <tbody className={`divide-y divide-gray-150 ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "", ...props }) {
  return (
    <tr
      className={`hover:bg-slate-50/50 transition border-b border-gray-100/60 font-sans ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "", isFirst = false, isLast = false, ...props }) {
  return (
    <td
      className={`py-4 text-gray-700 ${isFirst ? "pl-4" : ""} ${isLast ? "pr-4 text-right" : ""} ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
