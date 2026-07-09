import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal, Button } from "../ui";

export default function DisableIdentityDialog({ isOpen, onClose, onConfirm, identity }) {
  if (!identity) return null;

  const isCurrentlyActive = identity.status === "Active";
  const actionText = isCurrentlyActive ? "Disable" : "Enable";
  const newStatus = isCurrentlyActive ? "Disabled" : "Active";

  const footer = (
    <>
      <Button
        variant="secondary"
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button
        variant={isCurrentlyActive ? "danger" : "primary"}
        onClick={() => onConfirm(identity.id, newStatus)}
        className={!isCurrentlyActive ? "bg-emerald-600 hover:bg-emerald-700" : ""}
      >
        Confirm
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${actionText} User Identity?`}
      footer={footer}
      className="max-w-md"
    >
      <div className="flex items-start gap-4 pt-2">
        <div className={`p-3 rounded-xl border shrink-0 ${
          isCurrentlyActive 
            ? "bg-rose-50 border-rose-100 text-rose-600" 
            : "bg-emerald-50 border-emerald-100 text-emerald-600"
        }`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 flex-1">
          <p className="text-sm text-gray-500">
            Are you sure you want to {actionText.toLowerCase()} access for{" "}
            <span className="font-semibold text-gray-800">{identity.fullName}</span> (
            <span className="font-mono text-xs">{identity.username}</span>)?
          </p>
          {isCurrentlyActive && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl mt-3 font-medium">
              🔒 Access will be immediately revoked. The user won't be able to log in until re-enabled.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
