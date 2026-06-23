import { useCallback, useEffect, useState } from "react";
import { RiskService, type RiskRecord } from "@/services/riskService";

export function useRisk() {
  const [risks, setRisks] = useState<RiskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await RiskService.list();
      setRisks(data);
    } catch (cause) {
      setError((cause as Error).message || "Unable to load risk data");
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: number | string, payload: Partial<Omit<RiskRecord, "id">>) => {
      setLoading(true);
      try {
        const updated = await RiskService.update(id, payload);
        setRisks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        return updated;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const remove = useCallback(async (id: number | string) => {
    setLoading(true);
    try {
      await RiskService.remove(id);
      setRisks((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    risks,
    loading,
    error,
    refresh,
    update,
    remove,
  };
}
