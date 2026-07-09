import React, { useState } from "react";
import { Search, Eye, EyeOff } from "lucide-react";

export function FieldLabel({ children, className = "", ...props }) {
  return (
    <label
      className={`text-xs font-bold text-gray-500 uppercase font-mono tracking-wider block mb-1.5 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

export function InputGroup({ children, className = "", ...props }) {
  return (
    <div className={`space-y-1.5 flex-1 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ValidationMessage({ children, className = "", ...props }) {
  if (!children) return null;
  return (
    <p className={`text-xs text-rose-600 mt-1 font-medium ${className}`} {...props}>
      {children}
    </p>
  );
}

export const TextInput = React.forwardRef(
  ({ error, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full border border-gray-250 bg-white rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none text-gray-800 transition placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 ${
          error ? "border-rose-300 focus:border-rose-500" : ""
        } ${className}`}
        {...props}
      />
    );
  }
);

TextInput.displayName = "TextInput";

export const PasswordInput = React.forwardRef(
  ({ error, className = "", ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={show ? "text" : "password"}
          className={`w-full border border-gray-250 bg-white rounded-xl pl-4 pr-10 py-2.5 text-sm focus:border-blue-500 focus:outline-none text-gray-800 transition placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 ${
            error ? "border-rose-300 focus:border-rose-500" : ""
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export const SearchInput = React.forwardRef(
  ({ className = "", ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type="text"
          className={`w-full border border-gray-250 bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none text-gray-800 transition placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
          {...props}
        />
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export const SelectInput = React.forwardRef(
  ({ options = [], error, className = "", ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full border border-gray-250 bg-white rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none text-gray-800 transition disabled:bg-gray-50 disabled:text-gray-500 ${
          error ? "border-rose-300 focus:border-rose-500" : ""
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

SelectInput.displayName = "SelectInput";

export const Textarea = React.forwardRef(
  ({ error, className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full border border-gray-250 bg-white rounded-xl p-4 font-mono text-xs text-gray-800 focus:border-blue-500 focus:outline-none custom-scrollbar ${
          error ? "border-rose-300 focus:border-rose-500" : ""
        } ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
