import { api, getListData } from "@/services/api";

export type RiskRecord = {
  id: number;
  asset: number;
  probability_of_failure: number;
  consequence_of_failure: number;
  computed_risk_score: number;
};

export const RiskService = {
  list: () => api.get<RiskRecord[] | { results: RiskRecord[] }>("/risks/").then((r) => getListData(r.data)),
  get: (id: number | string) => api.get<RiskRecord>(`/risks/${id}/`).then((r) => r.data),
  create: (payload: Omit<RiskRecord, "id">) => api.post<RiskRecord>("/risks/", payload).then((r) => r.data),
  update: (id: number | string, payload: Partial<Omit<RiskRecord, "id">>) =>
    api.put<RiskRecord>(`/risks/${id}/`, payload).then((r) => r.data),
  remove: (id: number | string) => api.delete(`/risks/${id}/`).then((r) => r.data),
};
