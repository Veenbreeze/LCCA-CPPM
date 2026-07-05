import { useCallback, useEffect, useState } from "react";
import { ScenarioService, type ScenarioRecord } from "@/services/scenarioService";

export function useScenarios() {
  const [scenarios, setScenarios] = useState<ScenarioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ScenarioService.list();
      setScenarios(data);
    } catch (cause) {
      setError((cause as Error).message || "Unable to load scenario analysis");
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Omit<ScenarioRecord, "id" | "npv">) => {
    setLoading(true);
    try {
      const created = await ScenarioService.create(payload);
      setScenarios((prev) => [created, ...prev]);
      return created;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: number | string, payload: Partial<Omit<ScenarioRecord, "id" | "npv">>) => {
      setLoading(true);
      try {
        const updated = await ScenarioService.update(id, payload);
        setScenarios((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
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
      await ScenarioService.remove(id);
      setScenarios((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    scenarios,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
