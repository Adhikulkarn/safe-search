import { useState } from "react";
import api from "../services/api";
import {
  normalizeKeyword,
  sha256Hex,
  signHashHex
} from "../utils/crypto";

export default function SearchPage({ role, auditor, privateKey }) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("pan");
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [logs, setLogs] = useState(["Awaiting search query..."]);
  const [loading, setLoading] = useState(false);

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const handleSearch = async () => {
    if (!query) return;

    try {
      setLoading(true);
      setResults([]);
      setMeta(null);
      setLogs(["Preparing search..."]);

      // =========================
      // INTERNAL SEARCH
      // =========================
      if (role === "internal") {
        await delay(300);
        setLogs(prev => [...prev, "Generating HMAC trapdoor..."]);

        const payload = { [field]: query };

        await delay(300);
        setLogs(prev => [...prev, "Sending request to /api/search/internal/"]);

        const res = await api.post("/api/search/internal/", payload);

        setResults(res.data.data?.results || []);
        setMeta(res.data.meta);
        setLogs(prev => [...prev, "Internal search complete ✔"]);
      }

      // =========================
      // EXTERNAL SEARCH
      // =========================
      if (role === "external") {

        if (!privateKey) {
          setLogs(prev => [...prev, "No auditor private key found"]);
          setLoading(false);
          return;
        }

        if (!auditor) {
          setLogs(prev => [...prev, "No auditor identity found"]);
          setLoading(false);
          return;
        }

        await delay(300);
        setLogs(prev => [...prev, "Normalizing keyword..."]);

        const normalized = normalizeKeyword(query);

        await delay(300);
        setLogs(prev => [...prev, "Hashing keyword (SHA256)..."]);

        const keywordHash = await sha256Hex(normalized);

        await delay(300);
        setLogs(prev => [...prev, "Signing hash with RSA private key..."]);

        const signature = await signHashHex(keywordHash, privateKey);

        const payload = {
          auditor_id: auditor.auditor_id,
          keyword_hash: keywordHash,
          signature: signature
        };

        await delay(300);
        setLogs(prev => [...prev, "Sending request to /api/search/external/"]);

        const res = await api.post("/api/search/external/", payload);

        setResults(res.data.data?.results || []);
        setMeta(res.data.meta);
        setLogs(prev => [...prev, "Encrypted results received ✔"]);
      }

    } catch (err) {
      console.error(err);

      if (err.response?.data?.error) {
        setLogs(prev => [
          ...prev,
          `Error: ${err.response.data.error.code}`
        ]);
      } else {
        setLogs(prev => [...prev, "Unknown error occurred"]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

      {/* HEADER */}
      <h1 className="text-xl sm:text-2xl font-semibold mb-2">
        Encrypted Search
      </h1>

      <p className="text-gray-500 mb-6 text-sm sm:text-base">
        {role === "internal"
          ? "Internal SSE Search"
          : "External Public-Key Audit Verification"}
      </p>

      {/* ================= SEARCH CARD ================= */}
      <div className="bg-white border rounded-xl p-4 sm:p-6 mb-6">

        <div className="flex flex-col sm:flex-row gap-3">

          {/* Internal Dropdown */}
          {role === "internal" && (
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="border rounded px-3 py-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <option value="pan">PAN</option>
              <option value="customer_id">Customer ID</option>
              <option value="aadhaar">Aadhaar</option>
              <option value="name">Name</option>
              <option value="compliance_flag">Compliance Flag</option>
            </select>
          )}

          {/* Search Input */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search value..."
            className="w-full sm:flex-1 border rounded px-4 py-2 text-sm sm:text-base"
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-black text-white px-5 py-2 rounded w-full sm:w-auto text-sm sm:text-base transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Search"}
          </button>

        </div>
      </div>

      {/* ================= INTERNAL RESULTS ================= */}
      {role === "internal" && (
        <div className="bg-white border rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="font-semibold mb-4 text-base sm:text-lg">
            Decrypted Results
          </h2>

          {results.length === 0 ? (
            <p className="text-gray-500 text-sm">No results</p>
          ) : (
            <div className="space-y-3">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="bg-gray-50 border rounded p-3 font-mono text-xs sm:text-sm overflow-x-auto"
                >
                  {JSON.stringify(r, null, 2)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= EXTERNAL RESULTS ================= */}
      {role === "external" && meta && (
        <div className="bg-white border rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="font-semibold mb-4 text-base sm:text-lg">
            Audit Verification Result
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base">

            <Info label="Query" value={query} />

            <Info
              label="Match Exists"
              value={meta.total_matches > 0 ? "YES ✔" : "NO"}
              highlight={
                meta.total_matches > 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            />

            <Info label="Result Set Size" value={meta.total_matches} />

            <Info
              label="Response Padding"
              value="Fixed-size protected response"
            />

            <Info
              label="Execution Time"
              value={`${meta.execution_time_ms} ms`}
            />

            <Info
              label="Data Visibility"
              value="Encrypted (Auditor-level access)"
              highlight="text-blue-600"
            />

          </div>
        </div>
      )}

      {/* ================= LOGS ================= */}
      <div className="bg-white border rounded-xl p-4 sm:p-6">
        <h2 className="font-semibold mb-4 text-base sm:text-lg">
          Search Logs
        </h2>

        <div className="bg-gray-50 rounded p-4 h-56 sm:h-64 overflow-y-auto font-mono text-xs sm:text-sm">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ================= HELPER COMPONENT ================= */

function Info({ label, value, highlight }) {
  return (
    <div>
      <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
      <p className={`font-medium break-words ${highlight || ""}`}>
        {value}
      </p>
    </div>
  );
}