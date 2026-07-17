import { useCallback, useEffect, useState } from "react";
import { RecommendationService, type RecommendationRecord } from "@/services/recommendationService";

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await RecommendationService.list();
      setRecommendations(data);
    } catch (cause) {
      setError((cause as Error).message || "Unable to load recommendations");
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number | string) => {
    await RecommendationService.remove(id);
    setRecommendations((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { recommendations, loading, error, refresh, remove };
}
