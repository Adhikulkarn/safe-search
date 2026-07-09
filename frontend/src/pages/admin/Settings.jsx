import React from "react";
import { Settings } from "lucide-react";
import { PageHeader, EmptyState } from "../../components/ui";

export default function SettingsPlaceholder() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="System Settings"
        description="Configure cryptographic parameters and global identity policies."
      />
      <EmptyState
        title="Coming Soon"
        description="The security settings console is currently under development. In the next phase, you will be able to manage key rotation policies, lock intervals, and token expirations."
        icon={<Settings className="w-6 h-6 text-gray-400" />}
        className="py-16"
      />
    </div>
  );
}
