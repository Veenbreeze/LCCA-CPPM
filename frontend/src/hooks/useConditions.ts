import { useCallback, useEffect, useState } from "react";
import { ConditionService, type ConditionRecord } from "@/services/conditionService";

export function useConditions() {
  const [conditions, setConditions] = useState<ConditionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ConditionService.list();
      setConditions(data);
    } catch (cause) {
      setError((cause as Error).message || "Unable to load conditions");
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Omit<ConditionRecord, "id" | "asset_name">) => {
    setLoading(true);
    try {
      const created = await ConditionService.create(payload);
      setConditions((prev) => [created, ...prev]);
      return created;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: number | string, payload: Partial<Omit<ConditionRecord, "id" | "asset_name">>) => {
      setLoading(true);
      try {
        const updated = await ConditionService.update(id, payload);
        setConditions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
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
      await ConditionService.remove(id);
      setConditions((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    conditions,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
