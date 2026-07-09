import { useState } from "react";
import api from "../services/api";
import {
  ContentCard,
  TextInput,
  Button,
  Modal,
} from "./ui";

export default function CreateAuditorCard({ onCreated, showToast }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast("Please enter an auditor identity name", "warning");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/auditor/create/", { name });
      const key = res.data?.data?.private_key;

      setPrivateKey(key);
      setName("");
      showToast(`Auditor ${name} created successfully!`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to register new auditor identity", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (privateKey) {
      await navigator.clipboard.writeText(privateKey);
      setCopied(true);
      showToast("Private key copied to clipboard", "success");
    }
  };

  const handleClose = () => {
    setPrivateKey(null);
    setCopied(false);
    if (onCreated) onCreated();
  };

  const modalFooter = (
    <>
      <Button
        variant="secondary"
        onClick={handleCopy}
      >
        {copied ? "Copied ✔" : "Copy to Clipboard"}
      </Button>

      <Button
        variant="primary"
        onClick={handleClose}
        className="bg-emerald-600 hover:bg-emerald-500"
      >
        I Have Stored This Securely
      </Button>
    </>
  );

  return (
    <>
      {/* CREATE CARD */}
      <ContentCard>
        <h3 className="font-bold mb-2 text-base sm:text-lg text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Register New Auditor
        </h3>
        <p className="text-gray-500 text-xs mb-5 font-light">
          Generate an RSA public key directory entry and return a downloadable private credential key.
        </p>

        {/* INPUT AND ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Authority name (e.g. RBI-Auditor, Compliance-Dept)"
            className="flex-grow"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />

          <Button
            onClick={handleCreate}
            loading={loading}
            className="w-full sm:w-auto px-5"
          >
            {loading ? "Registering..." : "Add Auditor"}
          </Button>
        </div>
      </ContentCard>

      {/* PRIVATE KEY MODAL */}
      <Modal
        isOpen={!!privateKey}
        onClose={handleClose}
        title="⚠️ Save This Auditor Private Key"
        footer={modalFooter}
        className="max-w-xl"
      >
        <p className="text-xs text-rose-600 mb-4 font-sans font-semibold">
          This private key is shown ONLY once.
          Please copy and save it securely. It cannot be recovered later.
        </p>

        <textarea
          readOnly
          value={privateKey || ""}
          className="w-full h-44 border border-gray-250 bg-gray-50 p-3 rounded-xl font-mono text-2xs text-gray-800 mb-4 select-all custom-scrollbar focus:outline-none"
        />
      </Modal>
    </>
  );
}