import { useCallback, useEffect, useState } from "react";
import { ProjectService, type ProjectRecord } from "@/services/projectService";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProjectService.list();
      setProjects(data);
    } catch (cause) {
      setError((cause as Error).message || "Unable to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Omit<ProjectRecord, "id">) => {
    setLoading(true);
    try {
      const created = await ProjectService.create(payload);
      setProjects((prev) => [created, ...prev]);
      return created;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: number | string, payload: Partial<Omit<ProjectRecord, "id">>) => {
      setLoading(true);
      try {
        const updated = await ProjectService.update(id, payload);
        setProjects((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
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
      await ProjectService.remove(id);
      setProjects((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    projects,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
