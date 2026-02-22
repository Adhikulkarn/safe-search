import { useEffect, useState } from "react";
import api from "../services/api";
import CreateAuditorCard from "./CreateAuditorCard";

export default function MetricsPage({ role }) {
  const resolvedRole = role?.toLowerCase() || "internal";
  const isInternal = resolvedRole === "internal";

  const [internalData, setInternalData] = useState(null);
  const [externalData, setExternalData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      if (isInternal) {
        const res = await api.get("/api/metrics/internal/");
        setInternalData(res.data?.data || {});
      } else {
        const res = await api.get("/api/metrics/external/");
        setExternalData(res.data?.data || {});
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [resolvedRole]);

  const handleDeleteAuditor = async (auditorId) => {
    try {
      await api.delete(`/api/auditor/${auditorId}/delete/`);
      fetchMetrics();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete auditor");
    }
  };

  if (loading)
    return <div className="p-4 sm:p-6">Loading metrics...</div>;

  if (error)
    return <div className="p-4 sm:p-6 text-red-600">{error}</div>;

  const safe = (val, fallback = 0) =>
    val !== undefined && val !== null ? val : fallback;

  const safeDate = (date) =>
    date ? new Date(date).toLocaleString() : "No data";

  /* =========================
     EXTERNAL VIEW
  ========================= */
  if (!isInternal) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold mb-1">
          System Metrics
        </h1>
        <p className="text-gray-500 mb-6 text-sm sm:text-base">
          External view (restricted)
        </p>

        <div className="bg-white border rounded-xl p-5 sm:p-6 w-full sm:max-w-sm">
          <p className="text-gray-500 text-sm mb-2">
            Total Documents
          </p>
          <p className="text-xl sm:text-3xl font-semibold break-words">
            {safe(externalData?.total_documents)}
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     INTERNAL VIEW
  ========================= */

  const systemMetrics = internalData?.system_metrics || {};
  const auditors = internalData?.auditors || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

      <h1 className="text-xl sm:text-2xl font-semibold mb-1">
        System Metrics
      </h1>
      <p className="text-gray-500 mb-6 text-sm sm:text-base">
        Real-time performance and security analytics
      </p>

      {/* CREATE AUDITOR */}
      <div className="mb-6">
        <CreateAuditorCard onCreated={fetchMetrics} />
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Documents"
          value={safe(systemMetrics.total_documents)}
        />
        <StatCard
          label="Total Tokens"
          value={safe(systemMetrics.total_tokens)}
        />
        <StatCard
          label="Avg External Search"
          value={`${safe(systemMetrics.avg_external_search_ms)} ms`}
        />
        <StatCard
          label="External Searches (24h)"
          value={safe(systemMetrics.external_searches_last_24h)}
        />
      </div>

      {/* AUDITOR OVERVIEW */}
      <div className="bg-white border rounded-xl p-5 sm:p-6 mb-6">
        <h3 className="font-semibold mb-4 text-base sm:text-lg">
          Auditor Key Overview
        </h3>

        {auditors.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No auditors registered.
          </p>
        ) : (
          <div className="space-y-4">
            {auditors.map((auditor) => (
              <div
                key={auditor.auditor_id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3 gap-2"
              >
                <div>
                  <p className="text-gray-700 text-sm sm:text-base break-words">
                    {auditor.name} (ID: {auditor.auditor_id})
                  </p>
                  <p className="text-xs text-gray-400">
                    Active Key v{safe(auditor.active_key_version, 1)}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleDeleteAuditor(auditor.auditor_id)
                  }
                  className="text-red-600 text-xs hover:underline self-start sm:self-auto"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECURITY OVERVIEW */}
      <div className="bg-white border rounded-xl p-5 sm:p-6 mb-6">
        <h3 className="font-semibold mb-4 text-base sm:text-lg">
          Security Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
          <MetricBox
            label="Failed Signature Verifications (24h)"
            value={safe(systemMetrics.failed_external_searches_last_24h)}
            danger={
              safe(systemMetrics.failed_external_searches_last_24h) > 0
            }
          />
          <MetricBox
            label="External Token Entries"
            value={safe(systemMetrics.external_tokens)}
          />
          <MetricBox
            label="Avg External Search Time"
            value={`${safe(systemMetrics.avg_external_search_ms)} ms`}
          />
        </div>
      </div>

      {/* INDEX HEALTH */}
      <div className="bg-white border rounded-xl p-5 sm:p-6">
        <h3 className="font-semibold mb-4 text-base sm:text-lg">
          Index Health
        </h3>

        <div className="space-y-4 text-sm">
          <Row
            label="Last Index Update"
            value={safeDate(systemMetrics.last_index_update)}
          />
          <Row
            label="Total Token Entries"
            value={safe(systemMetrics.total_tokens)}
          />
          <Row
            label="External Token Entries"
            value={safe(systemMetrics.external_tokens)}
          />
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-xl p-4 sm:p-5">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-xl sm:text-2xl font-semibold break-words">
        {value}
      </p>
    </div>
  );
}

function MetricBox({ label, value, danger }) {
  return (
    <div>
      <p
        className={`text-xl sm:text-2xl font-semibold break-words ${
          danger ? "text-red-600" : "text-blue-600"
        }`}
      >
        {value}
      </p>
      <p className="text-gray-500 text-sm mt-1">
        {label}
      </p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-3 gap-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium break-words">{value}</span>
    </div>
  );
}