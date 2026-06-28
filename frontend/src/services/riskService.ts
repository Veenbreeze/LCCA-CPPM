import { api, getListData } from "@/services/api";

export type RiskRecord = {
  id: number;
  asset: number;
  probability_of_failure: number;
  consequence_of_failure: number;
  computed_risk_score: number;
  criticality: number;
  combined_score: number;
};

function normalizeRiskRecord(
  record: Partial<RiskRecord> & {
    probability_of_failure?: string | number;
    consequence_of_failure?: string | number;
    computed_risk_score?: string | number;
    criticality?: string | number;
    combined_score?: string | number;
  },
) {
  return {
    ...record,
    probability_of_failure: Number(record.probability_of_failure ?? 0),
    consequence_of_failure: Number(record.consequence_of_failure ?? 0),
    computed_risk_score: Number(record.computed_risk_score ?? 0),
    criticality: Number(record.criticality ?? 1),
    combined_score: Number(record.combined_score ?? 0),
  } as RiskRecord;
}

export type RiskCreatePayload = Pick<
  RiskRecord,
  "asset" | "probability_of_failure" | "consequence_of_failure"
>;

export const RiskService = {
  list: () =>
    api
      .get<RiskRecord[] | { results: RiskRecord[] }>("/risks/")
      .then((r) => getListData(r.data).map(normalizeRiskRecord)),
  get: (id: number | string) =>
    api.get<RiskRecord>(`/risks/${id}/`).then((r) => normalizeRiskRecord(r.data)),
  create: (payload: RiskCreatePayload) =>
    api.post<RiskRecord>("/risks/", payload).then((r) => normalizeRiskRecord(r.data)),
  update: (id: number | string, payload: Partial<RiskCreatePayload>) =>
    api.put<RiskRecord>(`/risks/${id}/`, payload).then((r) => normalizeRiskRecord(r.data)),
  remove: (id: number | string) => api.delete(`/risks/${id}/`).then((r) => r.data),
};
