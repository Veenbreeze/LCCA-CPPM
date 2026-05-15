import { api, getListData } from "@/services/api";

export type ConditionRecord = {
  id: number;
  asset: number;
  inspection_date: string;
  condition_score: number;
  notes: string;
  asset_name?: string;
};

function normalizeConditionRecord(record: Partial<ConditionRecord> & { condition_score?: string | number }) {
  return {
    ...record,
    condition_score: Number(record.condition_score ?? 0),
  } as ConditionRecord;
}

export const ConditionService = {
  list: () =>
    api
      .get<ConditionRecord[] | { results: ConditionRecord[] }>("/conditions/")
      .then((r) => getListData(r.data).map(normalizeConditionRecord)),
  get: (id: number | string) => api.get<ConditionRecord>(`/conditions/${id}/`).then((r) => normalizeConditionRecord(r.data)),
  create: (payload: Omit<ConditionRecord, "id" | "asset_name">) =>
    api.post<ConditionRecord>("/conditions/", payload).then((r) => normalizeConditionRecord(r.data)),
  update: (id: number | string, payload: Partial<Omit<ConditionRecord, "id" | "asset_name">>) =>
    api.put<ConditionRecord>(`/conditions/${id}/`, payload).then((r) => normalizeConditionRecord(r.data)),
  remove: (id: number | string) => api.delete(`/conditions/${id}/`).then((r) => r.data),
};
