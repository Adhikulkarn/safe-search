import React from "react";
import { SearchInput } from "../ui";

export default function IdentitySearch({ value, onChange }) {
  return (
    <div className="flex-grow font-sans">
      <SearchInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search identities (name, username, org, role)..."
      />
    </div>
  );
}
