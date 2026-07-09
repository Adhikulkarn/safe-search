import React, { useState } from "react";
import { Plus } from "lucide-react";
import useIdentity from "../../hooks/useIdentity";
import IdentitySearch from "../../components/iam/IdentitySearch";
import IdentityFilters from "../../components/iam/IdentityFilters";
import IdentityTable from "../../components/iam/IdentityTable";
import IdentityModal from "../../components/iam/IdentityModal";
import DisableIdentityDialog from "../../components/iam/DisableIdentityDialog";
import DeleteIdentityDialog from "../../components/iam/DeleteIdentityDialog";
import {
  PageHeader,
  ContentCard,
  Toolbar,
  ToolbarGroup,
  EmptyState,
  LoadingSkeleton,
  Button,
} from "../../components/ui";

export default function IAM({ showToast }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const {
    identities,
    loading,
    createIdentity,
    updateIdentity,
    disableIdentity,
    deleteIdentity,
  } = useIdentity(searchQuery, selectedRole, selectedStatus, showToast);

  // Modals & Dialogs State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, view
  const [selectedIdentity, setSelectedIdentity] = useState(null);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSaveIdentity = async (payload) => {
    try {
      if (modalMode === "create") {
        await createIdentity(payload);
      } else if (modalMode === "edit") {
        await updateIdentity(selectedIdentity.id, payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisableConfirm = async (id, newStatus) => {
    try {
      await disableIdentity(id, newStatus);
      setDisableDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteIdentity(id);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFilters = () => {
    setSelectedRole("");
    setSelectedStatus("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Identity & Access Management"
        description="Manage SecureMatch identities, assigned roles and platform access."
      />

      <ContentCard>
        <Toolbar>
          <IdentitySearch value={searchQuery} onChange={setSearchQuery} />
          <ToolbarGroup>
            <IdentityFilters
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              onReset={handleResetFilters}
            />
            <Button
              variant="primary"
              onClick={() => {
                setModalMode("create");
                setSelectedIdentity(null);
                setModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Create Identity
            </Button>
          </ToolbarGroup>
        </Toolbar>

        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : identities.length === 0 ? (
          <EmptyState
            title="No identities found"
            description="Create your first identity to begin managing SecureMatch access."
            className="border-dashed"
          />
        ) : (
          <IdentityTable
            identities={identities}
            onView={(identity) => {
              setModalMode("view");
              setSelectedIdentity(identity);
              setModalOpen(true);
            }}
            onEdit={(identity) => {
              setModalMode("edit");
              setSelectedIdentity(identity);
              setModalOpen(true);
            }}
            onToggleDisable={(identity) => {
              setSelectedIdentity(identity);
              setDisableDialogOpen(true);
            }}
            onDelete={(identity) => {
              setSelectedIdentity(identity);
              setDeleteDialogOpen(true);
            }}
          />
        )}
      </ContentCard>

      {/* Identity Configuration Modal */}
      <IdentityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveIdentity}
        identity={selectedIdentity}
        mode={modalMode}
      />

      {/* Disable confirmation dialog */}
      <DisableIdentityDialog
        isOpen={disableDialogOpen}
        onClose={() => setDisableDialogOpen(false)}
        onConfirm={handleDisableConfirm}
        identity={selectedIdentity}
      />

      {/* Delete confirmation dialog */}
      <DeleteIdentityDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        identity={selectedIdentity}
      />
    </div>
  );
}
