import { api, getListData } from "@/services/api";

export type ScenarioRecord = {
  id: number;
  asset: number;
  repair_cost: number;
  replacement_cost: number;
  maintenance_cost: number;
  discount_rate: number;
  npv: number;
  repair_npv: number;
  replacement_npv: number;
  lifecycle_cost: number;
  recommended_option: "Repair" | "Replace";
  horizon_years: number;
};

type ScenarioComputedFields =
  | "npv"
  | "repair_npv"
  | "replacement_npv"
  | "lifecycle_cost"
  | "recommended_option"
  | "horizon_years";

export type ScenarioCreatePayload = Omit<ScenarioRecord, "id" | ScenarioComputedFields>;

export const ScenarioService = {
  list: () =>
    api
      .get<ScenarioRecord[] | { results: ScenarioRecord[] }>("/scenarios/")
      .then((r) => getListData(r.data)),
  get: (id: number | string) => api.get<ScenarioRecord>(`/scenarios/${id}/`).then((r) => r.data),
  create: (payload: ScenarioCreatePayload) =>
    api.post<ScenarioRecord>("/scenarios/", payload).then((r) => r.data),
  update: (id: number | string, payload: Partial<ScenarioCreatePayload>) =>
    api.put<ScenarioRecord>(`/scenarios/${id}/`, payload).then((r) => r.data),
  remove: (id: number | string) => api.delete(`/scenarios/${id}/`).then((r) => r.data),
};
