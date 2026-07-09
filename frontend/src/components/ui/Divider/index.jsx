import React from "react";

export function Divider({ className = "", ...props }) {
  return (
    <hr
      className={`border-t border-gray-200/80 my-6 ${className}`}
      {...props}
    />
  );
}

export default Divider;
