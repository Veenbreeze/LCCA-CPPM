import { api, getListData } from "@/services/api";

export type ConditionRecord = {
  id: number;
  asset: number;
  inspection_date: string;
  condition_score: number;
  notes: string;
  asset_name?: string;
};

export const ConditionService = {
  list: () => api.get<ConditionRecord[] | { results: ConditionRecord[] }>("/conditions/").then((r) => getListData(r.data)),
  get: (id: number | string) => api.get<ConditionRecord>(`/conditions/${id}/`).then((r) => r.data),
  create: (payload: Omit<ConditionRecord, "id" | "asset_name">) =>
    api.post<ConditionRecord>("/conditions/", payload).then((r) => r.data),
  update: (id: number | string, payload: Partial<Omit<ConditionRecord, "id" | "asset_name">>) =>
    api.put<ConditionRecord>(`/conditions/${id}/`, payload).then((r) => r.data),
  remove: (id: number | string) => api.delete(`/conditions/${id}/`).then((r) => r.data),
};
