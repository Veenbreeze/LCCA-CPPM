import { api, getListData } from "@/services/api";

export type ScenarioRecord = {
  id: number;
  asset: number;
  repair_cost: number;
  replacement_cost: number;
  maintenance_cost: number;
  discount_rate: number;
  npv: number;
};

export const ScenarioService = {
  list: () => api.get<ScenarioRecord[] | { results: ScenarioRecord[] }>("/scenarios/").then((r) => getListData(r.data)),
  get: (id: number | string) => api.get<ScenarioRecord>(`/scenarios/${id}/`).then((r) => r.data),
  create: (payload: Omit<ScenarioRecord, "id" | "npv">) =>
    api.post<ScenarioRecord>("/scenarios/", payload).then((r) => r.data),
  update: (id: number | string, payload: Partial<Omit<ScenarioRecord, "id" | "npv">>) =>
    api.put<ScenarioRecord>(`/scenarios/${id}/`, payload).then((r) => r.data),
  remove: (id: number | string) => api.delete(`/scenarios/${id}/`).then((r) => r.data),
};
