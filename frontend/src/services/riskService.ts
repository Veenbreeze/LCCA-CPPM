import { api, getListData } from "@/services/api";

export type RiskRecord = {
  id: number;
  asset: number;
  probability_of_failure: number;
  consequence_of_failure: number;
  computed_risk_score: number;
};

function normalizeRiskRecord(record: Partial<RiskRecord> & { probability_of_failure?: string | number; consequence_of_failure?: string | number; computed_risk_score?: string | number }) {
  return {
    ...record,
    probability_of_failure: Number(record.probability_of_failure ?? 0),
    consequence_of_failure: Number(record.consequence_of_failure ?? 0),
    computed_risk_score: Number(record.computed_risk_score ?? 0),
  } as RiskRecord;
}

export const RiskService = {
  list: () =>
    api
      .get<RiskRecord[] | { results: RiskRecord[] }>("/risks/")
      .then((r) => getListData(r.data).map(normalizeRiskRecord)),
  get: (id: number | string) => api.get<RiskRecord>(`/risks/${id}/`).then((r) => normalizeRiskRecord(r.data)),
  create: (payload: Omit<RiskRecord, "id">) => api.post<RiskRecord>("/risks/", payload).then((r) => normalizeRiskRecord(r.data)),
  update: (id: number | string, payload: Partial<Omit<RiskRecord, "id">>) =>
    api.put<RiskRecord>(`/risks/${id}/`, payload).then((r) => normalizeRiskRecord(r.data)),
  remove: (id: number | string) => api.delete(`/risks/${id}/`).then((r) => r.data),
};
