import React from "react";
import IdentityRow from "./IdentityRow";
import { Table, TableHeader, TableBody } from "../ui";

export default function IdentityTable({
  identities,
  onView,
  onEdit,
  onToggleDisable,
  onDelete,
}) {
  const headers = [
    "Identity",
    "Username",
    "Assigned Role",
    "Status",
    "Last Login",
    "Created",
    "Actions",
  ];

  return (
    <Table>
      <TableHeader headers={headers} />
      <TableBody>
        {identities.map((identity) => (
          <IdentityRow
            key={identity.id}
            identity={identity}
            onView={onView}
            onEdit={onEdit}
            onToggleDisable={onToggleDisable}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
}
