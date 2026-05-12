import { useCallback, useEffect, useState } from "react";
import { AssetService, type AssetRecord } from "@/services/assetService";

export function useAssets() {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AssetService.list();
      setAssets(data);
    } catch (cause) {
      setError((cause as Error).message || "Unable to load assets");
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Omit<AssetRecord, "id">) => {
    setLoading(true);
    try {
      const created = await AssetService.create(payload);
      setAssets((prev) => [created, ...prev]);
      return created;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number | string, payload: Partial<Omit<AssetRecord, "id">>) => {
    setLoading(true);
    try {
      const updated = await AssetService.update(id, payload);
      setAssets((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      return updated;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number | string) => {
    setLoading(true);
    try {
      await AssetService.remove(id);
      setAssets((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    assets,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
