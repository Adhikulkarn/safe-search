export default function StoragePage() {
  const documents = [
    {
      id: "doc-001",
      time: "2/21/2026, 4:00 PM",
      blob:
        "AES256:7f9a3b2e8c1d4f6a9e2b5c8d3f6a9e2b5c8d3f6a9e2b5c8d3f6a9e2b5c8d3f6a",
      tokens: ["HMAC:a3f2e1d9", "HMAC:b7c4f2a8", "HMAC:e9d3c1f7"],
    },
    {
      id: "doc-002",
      time: "2/21/2026, 5:15 PM",
      blob:
        "AES256:1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
      tokens: ["HMAC:c5e7a2f1", "HMAC:d8f3b9e2", "HMAC:f1a6c4d9"],
    },
    {
      id: "doc-003",
      time: "2/21/2026, 7:50 PM",
      blob:
        "AES256:9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e",
      tokens: ["HMAC:a3f2e1d9", "HMAC:g2h5j8k1", "HMAC:m4n7p0q3"],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-1">Encrypted Storage</h1>
      <p className="text-gray-500 mb-6">
        View encrypted document blobs and inverted index tokens
      </p>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Total Documents</p>
          <p className="text-2xl font-semibold">3</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Encryption Standard</p>
          <p className="text-2xl font-semibold">AES-256-GCM</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Index Tokens</p>
          <p className="text-2xl font-semibold">9</p>
        </div>
      </div>

      {/* DOCUMENT LIST */}
      <div className="space-y-5">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border rounded-xl p-6 shadow-sm"
          >
            {/* TOP ROW */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">Document: {doc.id}</p>
                <p className="text-gray-500 text-sm">Stored: {doc.time}</p>
              </div>

              <span className="text-xs border px-3 py-1 rounded bg-gray-50">
                Encrypted
              </span>
            </div>

            {/* BLOB */}
            <p className="text-sm text-gray-600 mb-2">
              Encrypted Blob (AES-256-GCM)
            </p>

            <div className="bg-slate-900 text-green-400 font-mono text-sm rounded-lg p-4 mb-4 overflow-x-auto">
              {doc.blob}
            </div>

            {/* TOKENS */}
            <p className="text-sm text-gray-600 mb-2">
              Inverted Index Tokens (HMAC-SHA256)
            </p>

            <div className="flex flex-wrap gap-2">
              {doc.tokens.map((t, i) => (
                <span
                  key={i}
                  className="text-xs bg-gray-100 border px-3 py-1 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SECURITY NOTICE */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <p className="font-semibold text-yellow-700 mb-1">
          Security Notice
        </p>
        <p className="text-sm text-yellow-700">
          All documents are encrypted at rest using AES-256-GCM. Plaintext data
          never persists in storage. Index tokens are generated using
          HMAC-SHA256 for secure searchable encryption.
        </p>
      </div>
    </div>
  );
}