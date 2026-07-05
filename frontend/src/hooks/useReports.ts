import { useCallback, useEffect, useState } from "react";
import { ReportService, type ReportSummary } from "@/services/reportService";

export function useReports() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ReportService.list();
      setReports(data);
    } catch (cause) {
      setError((cause as Error).message || "Unable to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    reports,
    loading,
    error,
    refresh,
  };
}
