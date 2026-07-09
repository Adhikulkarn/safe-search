import React, { useCallback, useEffect, useState } from "react";
import CreateAuditorCard from "../../components/CreateAuditorCard";
import { rotateAuditorKey } from "../../services/auditorService";
import api from "../../services/api";
import {
  PageHeader,
  ContentCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Badge,
  EmptyState,
} from "../../components/ui";
import { Spinner } from "../../components/Loader";

export default function Auditors({ showToast }) {
  const [auditors, setAuditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotatingId, setRotatingId] = useState(null);

  const fetchAuditors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/metrics/internal/");
      setAuditors(res.data?.data?.auditors || []);
    } catch (err) {
      console.error(err);
      showToast?.("Failed to load auditor directory", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAuditors();
  }, [fetchAuditors]);

  const handleRotateKey = async (auditorId) => {
    try {
      setRotatingId(auditorId);
      await rotateAuditorKey(auditorId);
      showToast?.("Auditor key rotated successfully", "success");
      fetchAuditors();
    } catch (err) {
      console.error(err);
      showToast?.("Failed to rotate auditor key", "error");
    } finally {
      setRotatingId(null);
    }
  };

  const tableHeaders = [
    "Auditor",
    "Organization",
    "Key Information",
    "Actions",
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Auditor Management"
        description="Register external auditors, authorize credentials, and manage PEKS public/private key pairs."
      />

      <CreateAuditorCard onCreated={fetchAuditors} showToast={showToast} />

      <ContentCard>
        <div className="pb-5 border-b border-gray-100 mb-5">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Registered Auditors</h2>
          <p className="text-xs text-gray-500 mt-1 font-light">
            Organization details, active key versions, and credential actions.
          </p>
        </div>

        {loading ? (
          <div className="py-10 flex items-center justify-center">
            <Spinner text="Loading auditors..." />
          </div>
        ) : auditors.length === 0 ? (
          <EmptyState
            title="No auditors registered"
            description="Register a new auditor above to generate credential keys and directory listing."
            className="border-dashed"
          />
        ) : (
          <Table>
            <TableHeader headers={tableHeaders} />
            <TableBody>
              {auditors.map((auditor) => (
                <TableRow key={auditor.auditor_id}>
                  <TableCell isFirst>
                    <p className="text-sm font-semibold text-gray-900">{auditor.name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {auditor.auditor_id}</p>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {auditor.organization || "External authority"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="blue">
                      Key Version {auditor.active_key_version || 1}
                    </Badge>
                  </TableCell>
                  <TableCell isLast>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleRotateKey(auditor.auditor_id)}
                        disabled={rotatingId === auditor.auditor_id}
                        className="text-xs text-blue-600 font-semibold"
                      >
                        {rotatingId === auditor.auditor_id ? "Rotating..." : "Rotate Key"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ContentCard>
    </div>
  );
}
