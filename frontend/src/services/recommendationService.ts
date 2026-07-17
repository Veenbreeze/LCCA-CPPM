import { api, getListData } from "@/services/api";

export type RecommendationRecord = {
  id: number;
  project: number;
  engineer_name: string;
  work_done: string;
  recommendation: string;
  submitted_at: string;
};

export const RecommendationService = {
  list: (project?: number | string) =>
    api
      .get<RecommendationRecord[] | { results: RecommendationRecord[] }>("/recommendations/", {
        params: project ? { project } : undefined,
      })
      .then((r) => getListData(r.data)),
  remove: (id: number | string) => api.delete(`/recommendations/${id}/`).then((r) => r.data),
};
