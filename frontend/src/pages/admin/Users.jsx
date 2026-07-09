import React from "react";
import { Users as UsersIcon } from "lucide-react";
import { PageHeader, EmptyState } from "../../components/ui";

export default function Users() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="User Management"
        description="Configure internal analysts and administrators access controls."
      />
      <EmptyState
        title="Coming Soon"
        description="The User Management module is currently under development. In the next phase, you will be able to invite, update, and manage analyst roles."
        icon={<UsersIcon className="w-6 h-6 text-gray-400" />}
        className="py-16"
      />
    </div>
  );
}
