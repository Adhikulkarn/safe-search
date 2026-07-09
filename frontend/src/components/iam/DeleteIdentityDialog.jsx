import React from "react";
import { Trash2, AlertOctagon } from "lucide-react";
import { Modal, Button } from "../ui";

export default function DeleteIdentityDialog({ isOpen, onClose, onConfirm, identity }) {
  if (!identity) return null;

  const footer = (
    <>
      <Button
        variant="secondary"
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={() => onConfirm(identity.id)}
        icon={<Trash2 className="w-4 h-4" />}
      >
        Delete Identity
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Permanent Identity Deletion"
      footer={footer}
      className="max-w-md"
    >
      <div className="flex items-start gap-4 pt-2">
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl shrink-0">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 flex-1">
          <p className="text-sm text-gray-500">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-gray-800">{identity.fullName}</span> (
            <span className="font-mono text-xs">{identity.username}</span>)?
          </p>
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2.5 rounded-xl mt-3 font-medium">
            ⚠️ Warning: This action is destructive and cannot be undone. All audit histories tied to this username will lose access associations.
          </p>
        </div>
      </div>
    </Modal>
  );
}
