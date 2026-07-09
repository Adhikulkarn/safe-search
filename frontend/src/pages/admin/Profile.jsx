import React from "react";
import { User } from "lucide-react";
import { PageHeader, EmptyState } from "../../components/ui";

export default function Profile() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Admin Profile"
        description="Manage your account profile settings, cryptographic credentials, and session logs."
      />
      <EmptyState
        title="Coming Soon"
        description="The Profile settings portal is currently under development. In the next phase, you will be able to edit your profile details, reset password, and review security logs."
        icon={<User className="w-6 h-6 text-gray-400" />}
        className="py-16"
      />
    </div>
  );
}
