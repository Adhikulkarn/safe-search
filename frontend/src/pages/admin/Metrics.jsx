import React from "react";
import { mockAnalyticsData } from "../../mock/analytics";
import { mockRecentActivities } from "../../mock/dashboard";
import {
  PageHeader,
  ContentCard,
  StatusBadge,
} from "../../components/ui";

export default function Metrics() {
  const maxThroughput = Math.max(...mockAnalyticsData.encryptionThroughput.map((item) => item.value));
  const maxLatency = Math.max(...mockAnalyticsData.searchLatency.map((item) => item.latencyMs));

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Security Analytics"
        description="Review cryptographic performance, search operations, and recent system logs."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPanel
          title="Encryption Throughput"
          description="Indexed records processed by checkpoint."
          rows={mockAnalyticsData.encryptionThroughput}
          max={maxThroughput}
          valueKey="value"
          suffix=" records"
        />
        <ChartPanel
          title="Search Latency"
          description="SSE/PEKS query response time by checkpoint."
          rows={mockAnalyticsData.searchLatency}
          max={maxLatency}
          valueKey="latencyMs"
          suffix=" ms"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContentCard>
            <div className="pb-5 border-b border-gray-100 mb-2">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Operations</h2>
              <p className="text-xs text-gray-500 mt-1 font-light">Security events and cryptographic workflow activity.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {mockRecentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1 font-light">{activity.details}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                    {activity.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </ContentCard>
        </div>

        <div>
          <ContentCard>
            <div className="pb-5 border-b border-gray-100 mb-2">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Security Logs</h2>
              <p className="text-xs text-gray-500 mt-1 font-light">Current subsystem checks.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {["JWT validation", "Database writes", "AES-GCM engine", "SSE token index", "API gateway"].map((label) => (
                <div key={label} className="py-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700 font-medium">{label}</span>
                  <StatusBadge status="success" />
                </div>
              ))}
            </div>
          </ContentCard>
        </div>
      </div>
    </div>
  );
}

function ChartPanel({ title, description, rows, max, valueKey, suffix }) {
  return (
    <ContentCard>
      <div className="pb-5 border-b border-gray-100 mb-5">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
        <p className="text-xs text-gray-500 mt-1 font-light">{description}</p>
      </div>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.timestamp} className="grid grid-cols-[3rem_1fr_5rem] items-center gap-3">
            <span className="text-xs text-gray-500 font-mono">{row.timestamp}</span>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${Math.max((row[valueKey] / max) * 100, 6)}%` }}
              />
            </div>
            <span className="text-xs text-gray-750 font-mono text-right font-semibold">
              {row[valueKey]}{suffix}
            </span>
          </div>
        ))}
      </div>
    </ContentCard>
  );
}
