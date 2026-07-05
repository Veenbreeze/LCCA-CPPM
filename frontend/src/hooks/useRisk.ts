import { useCallback, useEffect, useState } from "react";
import {
  RiskService,
  type RiskCreatePayload,
  type RiskRecord,
} from "@/services/riskService";

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

  const create = useCallback(async (payload: RiskCreatePayload) => {
    const created = await RiskService.create(payload);
    setRisks((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(
    async (id: number | string, payload: Partial<RiskCreatePayload>) => {
      const updated = await RiskService.update(id, payload);
      setRisks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      return updated;
    },
    [],
  );

  const remove = useCallback(async (id: number | string) => {
    await RiskService.remove(id);
    setRisks((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    risks,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
