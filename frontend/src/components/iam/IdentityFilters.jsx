import React from "react";
import { SelectInput, Button } from "../ui";

export default function IdentityFilters({
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onReset,
}) {
  const roles = [
    { value: "", label: "All Roles" },
    { value: "Internal Analyst", label: "Internal Analyst" },
    { value: "Compliance Officer", label: "Compliance Officer" },
    { value: "External Auditor", label: "External Auditor" },
    { value: "Read Only Analyst", label: "Read Only Analyst" },
  ];

  const statuses = [
    { value: "", label: "All Statuses" },
    { value: "Active", label: "Active" },
    { value: "Disabled", label: "Disabled" },
    { value: "Locked", label: "Locked" },
  ];

  const hasActiveFilters = selectedRole !== "" || selectedStatus !== "";

  return (
    <div className="flex flex-wrap items-center gap-4 font-sans">
      {/* Role Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Role</span>
        <SelectInput
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          options={roles}
          className="py-1.5 px-3 text-xs w-40"
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Status</span>
        <SelectInput
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          options={statuses}
          className="py-1.5 px-3 text-xs w-36"
        />
      </div>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={onReset}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
