import { useState } from "react";
import { uploadDocument } from "../services/uploadService";
import {
  PageHeader,
  SectionCard,
  InputGroup,
  FieldLabel,
  TextInput,
  Textarea,
  Button,
  Terminal,
} from "./ui";

export default function UploadPage({ showToast }) {
  const [mode, setMode] = useState("form");
  const [logs, setLogs] = useState(["Awaiting document submission..."]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: "",
    name: "",
    pan: "",
    aadhaar: "",
    compliance_flag: "",
  });

  const [jsonInput, setJsonInput] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadSample = () => {
    const sample = {
      customer_id: "CUST1001",
      name: "Ravi Kumar",
      pan: "ABCDE1234F",
      aadhaar: "123412341234",
      compliance_flag: "high_risk",
    };

    setFormData(sample);
    setJsonInput(JSON.stringify(sample, null, 2));
    showToast("Loaded sample record fields", "info");
    setLogs((prev) => [...prev, "Sample record loaded into workspace buffer."]);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setLogs(["Preparing document record object..."]);

      let payload;

      if (mode === "json") {
        if (!jsonInput.trim()) {
          showToast("Please enter JSON data", "warning");
          setLogs((prev) => [...prev, "Error: JSON input buffer is empty."]);
          setLoading(false);
          return;
        }
        try {
          payload = JSON.parse(jsonInput);
        } catch (e) {
          showToast("Invalid JSON syntax", "warning");
          setLogs((prev) => [...prev, "Error: Invalid JSON syntax in input buffer."]);
          setLoading(false);
          return;
        }
      } else {
        const filled = Object.values(formData).some((v) => v.trim() !== "");
        if (!filled) {
          showToast("Please fill in at least one record field", "warning");
          setLogs((prev) => [...prev, "Error: Form data contains no values."]);
          setLoading(false);
          return;
        }
        payload = formData;
      }

      setLogs((prev) => [...prev, "Connecting to secure upload endpoint..."]);

      const res = await uploadDocument(payload);

      setLogs((prev) => [
        ...prev,
        "Encrypting document structure using AES-256-GCM...",
        "Generating 96-bit crypto nonces...",
        "Hashing index trapdoors via field-bound HMAC-SHA256...",
        "Adding deterministic public keywords for auditors (SHA-256)...",
        "Writing record reference to inverted search index table...",
        "Stored securely inside vault database ✔",
      ]);

      showToast("Document encrypted and indexed successfully!", "success");

      // reset form
      setFormData({
        customer_id: "",
        name: "",
        pan: "",
        aadhaar: "",
        compliance_flag: "",
      });

      setJsonInput("");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to encrypt and upload document", "error");
      setLogs((prev) => [...prev, `Error occurred: ${err.message || "Upload failure."}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative animate-[fadeIn_0.3s_ease-out]">
      {/* HEADER */}
      <PageHeader
        title="Document Upload"
        description="Submit raw financial records for automated AES-256 GCM encryption and dual index token generation."
      />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT PANEL */}
        <SectionCard
          title="Secure Record Input"
          action={
            <Button variant="secondary" onClick={loadSample}>
              Load Sample
            </Button>
          }
        >
          {/* TOGGLE */}
          <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl mb-6 max-w-max border border-gray-200">
            <button
              onClick={() => setMode("form")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mode === "form"
                  ? "bg-white text-black border border-gray-300 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Form Fields
            </button>

            <button
              onClick={() => setMode("json")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mode === "json"
                  ? "bg-white text-black border border-gray-300 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Raw JSON
            </button>
          </div>

          {/* FORM MODE */}
          {mode === "form" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup>
                  <FieldLabel>Customer ID</FieldLabel>
                  <TextInput
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleChange}
                    placeholder="e.g. CUST1002"
                  />
                </InputGroup>
                <InputGroup>
                  <FieldLabel>Full Name</FieldLabel>
                  <TextInput
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Priyanjali Sen"
                  />
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup>
                  <FieldLabel>PAN Number</FieldLabel>
                  <TextInput
                    name="pan"
                    value={formData.pan}
                    onChange={handleChange}
                    placeholder="10-digit alpha-numeric"
                  />
                </InputGroup>
                <InputGroup>
                  <FieldLabel>Aadhaar ID</FieldLabel>
                  <TextInput
                    name="aadhaar"
                    value={formData.aadhaar}
                    onChange={handleChange}
                    placeholder="12-digit numeric"
                  />
                </InputGroup>
              </div>

              <InputGroup>
                <FieldLabel>Compliance Status Flag</FieldLabel>
                <TextInput
                  name="compliance_flag"
                  value={formData.compliance_flag}
                  onChange={handleChange}
                  placeholder="e.g. normal, high_risk, audited"
                />
              </InputGroup>
            </div>
          )}

          {/* JSON MODE */}
          {mode === "json" && (
            <InputGroup className="animate-[fadeIn_0.2s_ease-out]">
              <FieldLabel>Raw JSON Schema</FieldLabel>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="h-56"
                placeholder={`{\n  "customer_id": "CUST1002",\n  "name": "Jane Doe",\n  "pan": "ABCDE1234X",\n  "aadhaar": "987654321012",\n  "compliance_flag": "clear"\n}`}
              />
            </InputGroup>
          )}

          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            className="mt-6 w-full py-3"
          >
            {loading ? "Vaulting Record (See logs)..." : "Encrypt & Upload"}
          </Button>
        </SectionCard>

        {/* RIGHT PANEL LOGS */}
        <div className="flex flex-col gap-6">
          <Terminal title="crypto_pipeline.py" logs={logs} status={loading ? "active" : "idle"} />

          {/* PIPELINE INFOGRAPHIC */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-blue-900 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Cryptographic Safeguard Pipeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <PipelineStep
                step="1"
                title="AES-256-GCM"
                desc="Record fields are serialized and symmetrically encrypted under a derived AES key with random nonce vectors."
              />
              <PipelineStep
                step="2"
                title="SSE Token Index"
                desc="For each indexed field, an HMAC-SHA256 token is computed. Secure matching runs without decrypting keys."
              />
              <PipelineStep
                step="3"
                title="Verifiable PEKS Hash"
                desc="Normalized search words generate deterministic SHA-256 hashes for auditor signature validation."
              />
              <PipelineStep
                step="4"
                title="Zero-Knowledge Base"
                desc="Only ciphertext maps and cryptographic indexing keys persist. Plaintext values are never saved."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineStep({ step, title, desc }) {
  return (
    <div className="bg-white border border-blue-200/60 rounded-xl p-3 space-y-1 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-mono flex items-center justify-center font-bold">
          {step}
        </span>
        <span className="font-bold text-blue-900 font-mono">{title}</span>
      </div>
      <p className="text-blue-850 text-[11px] leading-relaxed pl-7">{desc}</p>
    </div>
  );
}