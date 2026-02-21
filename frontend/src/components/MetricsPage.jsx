export default function MetricsPage({ role }) {
  const isInternal = role === "internal";

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-1">System Metrics</h1>
      <p className="text-gray-500 mb-6">
        Performance and operational statistics
      </p>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Total Documents</p>
          <p className="text-2xl font-semibold">3</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Index Size</p>
          <p className="text-2xl font-semibold">7.2 KB</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Avg Search Time</p>
          <p className="text-2xl font-semibold">
            {isInternal ? "41.9ms" : "31.6ms"}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Encryption</p>
          <p className="text-2xl font-semibold">AES-256-GCM</p>
        </div>
      </div>

      {/* TWO COLUMN SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SYSTEM INFO */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold mb-4">System Information</h3>

          <div className="space-y-3 text-sm">
            <Row label="Encryption Standard" value="AES-256-GCM" />
            <Row label="Index Type" value="Inverted" />
            <Row label="Search Protocol" value={isInternal ? "SSE" : "PEKS"} />
            <Row label="HMAC Algorithm" value="SHA-256" />
            <Row label="Last Index Update" value="2/21/2026, 3:56 PM" />
          </div>
        </div>

        {/* ACCESS LEVEL */}
        <div
          className={`border rounded-xl p-6 ${
            isInternal
              ? "bg-blue-50 border-blue-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <h3 className="font-semibold mb-2">Access Level</h3>
          <p className="text-sm mb-4 text-gray-600">
            Current role permissions and capabilities
          </p>

          <div className="mb-4">
            <p className="font-semibold">
              {isInternal ? "Internal Analyst" : "External Auditor"}
            </p>
            <p className="text-sm text-gray-500">
              {isInternal ? "Full System Access" : "Limited Read Access"}
            </p>
          </div>

          <ul className="space-y-2 text-sm">
            {isInternal ? (
              <>
                <li className="text-green-600">● Upload encrypted documents</li>
                <li className="text-green-600">● View encrypted storage</li>
                <li className="text-green-600">● Search with decryption</li>
                <li className="text-green-600">● Access all metrics</li>
              </>
            ) : (
              <>
                <li className="text-gray-400">● Upload encrypted documents</li>
                <li className="text-gray-400">● View encrypted storage</li>
                <li className="text-yellow-700">
                  ● Search without decryption (PEKS)
                </li>
                <li className="text-yellow-700">● Limited metrics</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* PERFORMANCE */}
      <div className="bg-white border rounded-xl p-6 mt-6">
        <h3 className="font-semibold mb-1">Performance Overview</h3>
        <p className="text-gray-500 text-sm mb-6">
          System efficiency and search latency metrics
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 text-center gap-4">
          <div>
            <p className="text-green-600 text-2xl font-semibold">99.8%</p>
            <p className="text-gray-500 text-sm">Uptime</p>
          </div>

          <div>
            <p className="text-blue-600 text-2xl font-semibold">41.9ms</p>
            <p className="text-gray-500 text-sm">Avg Search</p>
          </div>

          <div>
            <p className="text-purple-600 text-2xl font-semibold">100%</p>
            <p className="text-gray-500 text-sm">Security</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b py-2">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}