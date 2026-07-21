import { useState, useEffect } from "react";
import api from "../services/api";

export default function useDashboard() {
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [identityActivities, setIdentityActivities] = useState([]);
  const [auditorActivities, setAuditorActivities] = useState([]);
  const [keyRotationActivities, setKeyRotationActivities] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const res = await api.get("/api/metrics/internal/");
        const data = res.data?.data || {};

        if (!mounted) {
          return;
        }

        setStats(data.system_metrics || {});
        setActivities(data.recent_security_activity || []);
        setIdentityActivities(data.recent_identity_activity || []);
        setAuditorActivities(data.recent_auditor_activity || []);
        setKeyRotationActivities(data.recent_key_rotation_activity || []);
        setHealthChecks(data.health_checks || []);
      } catch (error) {
        console.error("Failed to load admin dashboard data", error);
        if (!mounted) {
          return;
        }
        setStats({});
        setActivities([]);
        setIdentityActivities([]);
        setAuditorActivities([]);
        setKeyRotationActivities([]);
        setHealthChecks([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    stats,
    activities,
    identityActivities,
    auditorActivities,
    keyRotationActivities,
    healthChecks,
    loading,
  };
}
