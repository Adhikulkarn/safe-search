import { useState } from "react";
import { internalSearch } from "../services/internalSearchService";
import { externalSearch } from "../services/externalSearchService";

export default function SearchPage({ role }) {
  const [query, setQuery] = useState("");
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

      if (role === "internal") {
        // INTERNAL SEARCH
        const payload = { keyword: query };

        await delay(400);
        setLogs(prev => [...prev, "Generating HMAC trapdoor..."]);

        await delay(500);
        setLogs(prev => [...prev, "Sending to SSE engine..."]);

        const res = await internalSearch(payload);

        await delay(500);
        setLogs(prev => [...prev, "Decrypting records..."]);

        setResults(res.data.results || []);
        setMeta(res.meta);

        setLogs(prev => [...prev, "Internal search complete ✔"]);
      }

      if (role === "external") {
        // EXTERNAL SEARCH
        const privateKey = localStorage.getItem("auditor_private_key");

        if (!privateKey) {
          setLogs(prev => [...prev, "No auditor key found"]);
          return;
        }

        await delay(400);
        setLogs(prev => [...prev, "Hashing keyword (SHA256)..."]);

        await delay(500);
        setLogs(prev => [...prev, "Signing hash (RSA)..."]);

        const res = await externalSearch(query, privateKey);

        await delay(500);
        setLogs(prev => [...prev, "Matching encrypted index..."]);

        setResults(res.data.results || []);
        setMeta(res.meta);

        setLogs(prev => [...prev, "External search complete ✔"]);
      }

    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, `Error: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      <h1 className="text-2xl font-semibold mb-2">Encrypted Search</h1>
      <p className="text-gray-500 mb-6">
        {role === "internal"
          ? "Internal SSE Search"
          : "External Public-Key Search"}
      </p>

      {/* SEARCH INPUT */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search query..."
            className="flex-1 border rounded px-4 py-2"
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-black text-white px-5 py-2 rounded"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* RESULTS */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Results</h2>

          {results.length === 0 ? (
            <p className="text-gray-500 text-sm">No results yet</p>
          ) : (
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={i} className="bg-gray-50 border rounded p-3 font-mono text-sm">
                  {JSON.stringify(r, null, 2)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LOGS */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Search Logs</h2>

          <div className="bg-gray-50 rounded p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      </div>

      {/* METRICS */}
      {meta && (
        <div className="mt-6 bg-blue-50 border rounded-xl p-6">
          <h3 className="font-semibold mb-3">Metrics</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-semibold">Matches</p>
              <p>{meta.total_matches}</p>
            </div>
            <div>
              <p className="font-semibold">Returned</p>
              <p>{meta.returned_count}</p>
            </div>
            <div>
              <p className="font-semibold">Time</p>
              <p>{meta.execution_time_ms} ms</p>
            </div>
            <div>
              <p className="font-semibold">Truncated</p>
              <p>{meta.truncated ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}