import React from "react";
import { Eye, Edit2, Ban, Trash2 } from "lucide-react";
import { TableRow, TableCell, Badge, StatusBadge, Button } from "../ui";

export default function IdentityRow({ identity, onView, onEdit, onToggleDisable, onDelete }) {
  const getInitials = (name) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleVariant = (role) => {
    switch (role) {
      case "Administrator":
        return "amber";
      case "Internal Analyst":
        return "blue";
      case "Compliance Officer":
        return "indigo";
      case "External Auditor":
        return "emerald";
      case "Read Only Analyst":
        return "slate";
      default:
        return "gray";
    }
  };

  return (
    <TableRow>
      {/* Identity (Full Name & Avatar) */}
      <TableCell isFirst>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm shadow-xs font-mono select-none">
            {getInitials(identity.fullName)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {identity.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-xs">
              {identity.email || "No email registered"}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Username */}
      <TableCell className="font-mono text-xs">
        {identity.username}
      </TableCell>

      {/* Assigned Role */}
      <TableCell>
        <Badge variant={getRoleVariant(identity.role)}>
          {identity.role}
        </Badge>
        {identity.role === "External Auditor" && identity.organization && (
          <p className="text-[10px] text-gray-400 font-medium mt-1">
            {identity.organization}
          </p>
        )}
      </TableCell>

      {/* Status */}
      <TableCell>
        <StatusBadge status={identity.status} />
      </TableCell>

      {/* Last Login */}
      <TableCell className="text-xs text-gray-500">
        {identity.lastLogin}
      </TableCell>

      {/* Created */}
      <TableCell className="text-xs text-gray-500 font-mono">
        {identity.created}
      </TableCell>

      {/* Actions */}
      <TableCell isLast>
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="icon"
            onClick={() => onView(identity)}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          {identity.role !== "Administrator" && (
            <>
              <Button
                variant="icon"
                onClick={() => onEdit(identity)}
                title="Edit Identity"
              >
                <Edit2 className="w-4 h-4" />
              </Button>

              <Button
                variant="icon"
                onClick={() => onToggleDisable(identity)}
                className={
                  identity.status === "Active"
                    ? "text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    : "text-emerald-600 hover:bg-emerald-50"
                }
                title={identity.status === "Active" ? "Disable Identity" : "Enable Identity"}
              >
                <Ban className="w-4 h-4" />
              </Button>

              <Button
                variant="icon"
                onClick={() => onDelete(identity)}
                className="text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                title="Delete Identity"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
