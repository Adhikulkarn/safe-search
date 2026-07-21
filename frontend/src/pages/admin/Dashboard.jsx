import React from "react";
import { AlertTriangle, ChevronRight, FileUp, Search, Shield, UserPlus } from "lucide-react";
import useDashboard from "../../hooks/useDashboard";
import {
  PageHeader,
  ContentCard,
  StatusBadge,
  Button,
} from "../../components/ui";
import { Spinner } from "../../components/Loader";

export default function AdminDashboard({ navigate }) {
  const {
    activities,
    identityActivities,
    auditorActivities,
    keyRotationActivities,
    healthChecks,
    loading,
  } = useDashboard();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner text="Loading Control Center..." />
      </div>
    );
  }

  const securityActivity = activities.slice(0, 4);
  const identityCreations = identityActivities.slice(0, 4);
  const auditorRegistrations = auditorActivities.slice(0, 4);
  const keyRotations = keyRotationActivities.slice(0, 4);

  const statusRows = healthChecks.length
    ? healthChecks
    : [
        { name: "Database", status: "Healthy" },
        { name: "JWT Authentication", status: "Healthy" },
        { name: "Encryption Engine", status: "Healthy" },
        { name: "Search Engine", status: "Healthy" },
        { name: "API Status", status: "Healthy" },
      ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="SecureMatch Control Center"
        description="Operational overview for identities, auditors, keys, and encrypted search activity."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SecurityFeedPanel title="Recent Security Activity" items={securityActivity} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivityPanel title="Recent Identity Creations" items={identityCreations} empty="No recent identity changes." />
            <ActivityPanel title="Recent Auditor Registrations" items={auditorRegistrations} empty="No recent auditor registrations." />
          </div>
          <ActivityPanel title="Pending Key Rotations" items={keyRotations} empty="No pending key rotation activity." />
        </div>

        <div className="space-y-6">
          <ContentCard>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight pb-4 border-b border-gray-100 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <ActionRow icon={UserPlus} label="Create Identity" onClick={() => navigate("/admin/iam")} />
              <ActionRow icon={Shield} label="Register Auditor" onClick={() => navigate("/admin/auditors")} />
              <ActionRow icon={FileUp} label="Upload Document" onClick={() => navigate("/admin/documents")} />
              <ActionRow icon={Search} label="Run Search" onClick={() => navigate("/admin/search")} />
            </div>
          </ContentCard>
        </div>
      </div>

      <ContentCard>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight pb-4 border-b border-gray-100 mb-2">
          System Status
        </h2>
        <div className="divide-y divide-gray-100">
          {statusRows.map((check) => (
            <div key={check.name} className="flex items-center justify-between py-3 gap-4">
              <span className="text-sm font-medium text-gray-700">{check.name}</span>
              <StatusBadge status={check.status} />
            </div>
          ))}
        </div>
      </ContentCard>
    </div>
  );
}

function ActivityPanel({ title, items, empty = "No recent activity." }) {
  return (
    <ContentCard>
      <h2 className="text-lg font-bold text-gray-900 tracking-tight pb-4 border-b border-gray-100 mb-2">
        {title}
      </h2>
      <div className="divide-y divide-gray-100">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">{empty}</p>
        ) : (
          items.map((item) => (
            <div key={`${title}-${item.id}`} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.details}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                  {item.timestamp}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </ContentCard>
  );
}

function SecurityFeedPanel({ title, items }) {
  return (
    <ContentCard className="overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
          <p className="text-xs text-gray-500 mt-1">Live backend audit events from the security log stream.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-rose-700">Live Feed</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 py-10 px-6 text-center">
          <p className="text-sm font-medium text-gray-600">No recent security events.</p>
          <p className="text-xs text-gray-400 mt-1">New warnings, denials, and elevated actions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={`security-${item.id}`}
              className={`rounded-2xl border p-4 shadow-sm transition ${
                item.severity === "CRITICAL"
                  ? "border-rose-200 bg-gradient-to-r from-rose-50 to-white"
                  : item.severity === "HIGH"
                    ? "border-amber-200 bg-gradient-to-r from-amber-50 to-white"
                    : "border-blue-200 bg-gradient-to-r from-blue-50 to-white"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${
                      item.severity === "CRITICAL"
                        ? "bg-rose-500"
                        : item.severity === "HIGH"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    }`}></span>
                    <p className="text-sm font-bold text-gray-900">{item.action}</p>
                    <SeverityPill severity={item.severity} />
                    <StatusBadge status={item.status || "Healthy"} />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.details}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[11px] text-gray-500 font-medium">
                    <span>User: {item.user || "System"}</span>
                    <span>Endpoint: {item.endpoint || "/api/"}</span>
                    <span>IP: {item.ip_address || "127.0.0.1"}</span>
                  </div>
                </div>
                <span className="text-[11px] text-gray-500 font-mono whitespace-nowrap">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </ContentCard>
  );
}

function SeverityPill({ severity }) {
  const classes =
    severity === "CRITICAL"
      ? "bg-rose-100 text-rose-700 border-rose-200"
      : severity === "HIGH"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-blue-100 text-blue-700 border-blue-200";

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${classes}`}>
      {severity || "INFO"}
    </span>
  );
}

function formatTimestamp(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function ActionRow({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 border border-gray-100 hover:border-gray-200 hover:bg-gray-50 rounded-xl text-left transition cursor-pointer text-gray-700"
      type="button"
    >
      <span className="flex items-center gap-2.5">
        {React.createElement(Icon, { className: "w-4 h-4 text-blue-600" })}
        <span className="text-sm font-semibold text-gray-900">{label}</span>
      </span>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );
}
