import React, { useState, useEffect } from "react";
import { User, Shield, Briefcase, Mail, Key } from "lucide-react";
import {
  Modal,
  TextInput,
  SelectInput,
  Button,
  FieldLabel,
  InputGroup,
} from "../ui";

export default function IdentityModal({ isOpen, onClose, onSave, identity, mode }) {
  const isView = mode === "view";
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Internal Analyst");
  const [organization, setOrganization] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [status, setStatus] = useState("Active");
  const [error, setError] = useState("");

  useEffect(() => {
    if (identity && (isEdit || isView)) {
      setFullName(identity.fullName || "");
      setUsername(identity.username || "");
      setEmail(identity.email || "");
      setRole(identity.role || "Internal Analyst");
      setOrganization(identity.organization || "");
      setOrgCode(identity.orgCode || "");
      setStatus(identity.status || "Active");
    } else {
      setFullName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("Internal Analyst");
      setOrganization("");
      setOrgCode("");
      setStatus("Active");
    }
    setError("");
  }, [identity, mode, isOpen]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError("");

    if (isView) {
      onClose();
      return;
    }

    if (!fullName.trim()) return setError("Full Name is required");
    if (isCreate && !username.trim()) return setError("Username is required");
    if (isCreate && !password) return setError("Temporary Password is required");
    if (isCreate && password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (role === "External Auditor" && !organization.trim()) {
      return setError("Organization Name is required for External Auditors");
    }

    const payload = {
      fullName,
      email,
      role,
      status,
    };

    if (isCreate) {
      payload.username = username;
      payload.password = password;
    }

    if (role === "External Auditor") {
      payload.organization = organization;
      payload.orgCode = orgCode;
    } else {
      payload.organization = "";
      payload.orgCode = "";
    }

    onSave(payload);
  };

  const roleOptions = [
    { value: "Internal Analyst", label: "Internal Analyst" },
    { value: "Compliance Officer", label: "Compliance Officer" },
    { value: "External Auditor", label: "External Auditor" },
    { value: "Read Only Analyst", label: "Read Only Analyst" },
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Disabled", label: "Disabled" },
    { value: "Locked", label: "Locked" },
  ];

  const modalFooter = (
    <>
      <Button
        variant="secondary"
        onClick={onClose}
      >
        {isView ? "Close" : "Cancel"}
      </Button>
      {!isView && (
        <Button
          variant="primary"
          onClick={handleSubmit}
        >
          {isCreate ? "Create Identity" : "Save Changes"}
        </Button>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isView ? "Identity Profile" : isCreate ? "Create New Identity" : "Edit Identity Configuration"}
      footer={modalFooter}
      className="max-w-lg"
    >
      <div className="space-y-4 pt-2">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

        {/* Full Name */}
        <InputGroup>
          <FieldLabel className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-gray-450" /> Full Name
          </FieldLabel>
          <TextInput
            disabled={isView}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. John Doe"
          />
        </InputGroup>

        {/* Username */}
        <InputGroup>
          <FieldLabel>Username</FieldLabel>
          <TextInput
            disabled={isView || isEdit}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="font-mono"
            placeholder="e.g. john.doe"
          />
          {isEdit && (
            <p className="text-[10px] text-gray-400 font-medium">
              Username identity codes are immutable.
            </p>
          )}
        </InputGroup>

        {/* Email */}
        <InputGroup>
          <FieldLabel className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-gray-450" /> Email Address (Optional)
          </FieldLabel>
          <TextInput
            type="email"
            disabled={isView}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. john@securematch.io"
          />
        </InputGroup>

        {/* Role selection */}
        <InputGroup>
          <FieldLabel className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-gray-450" /> Assigned Role
          </FieldLabel>
          <SelectInput
            disabled={isView}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={roleOptions}
          />
        </InputGroup>

        {/* External Auditor specific organization fields */}
        {role === "External Auditor" && (
          <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl space-y-4 animate-[fadeIn_0.2s_ease-out]">
            <InputGroup>
              <FieldLabel className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" /> Organization Name
              </FieldLabel>
              <TextInput
                disabled={isView}
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. PricewaterhouseCoopers"
              />
            </InputGroup>

            <InputGroup>
              <FieldLabel>Organization Code (Optional)</FieldLabel>
              <TextInput
                disabled={isView}
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value)}
                className="font-mono"
                placeholder="e.g. PWC-01"
              />
            </InputGroup>
          </div>
        )}

        {/* Password fields (Create mode only) */}
        {isCreate && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup>
              <FieldLabel className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-gray-405" /> Temp Password
              </FieldLabel>
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </InputGroup>

            <InputGroup>
              <FieldLabel>Confirm Password</FieldLabel>
              <TextInput
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </InputGroup>
          </div>
        )}

        {/* Status selection (Edit / View modes only) */}
        {(isEdit || isView) && (
          <InputGroup>
            <FieldLabel>Access Status</FieldLabel>
            <SelectInput
              disabled={isView}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
            />
          </InputGroup>
        )}
      </div>
    </Modal>
  );
}
