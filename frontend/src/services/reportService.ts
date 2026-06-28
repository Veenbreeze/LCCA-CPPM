import { api, getListData } from "@/services/api";

export type ReportSummary = {
  id: number;
  title: string;
  description: string;
  updated: string;
};

export type PrioritisationRow = {
  rank: number;
  risk_id: number;
  asset_id: number;
  asset_name: string;
  asset_type: string;
  location: string;
  lifecycle_stage: string;
  recommended_intervention: string;
  remaining_useful_life: number;
  probability_of_failure: number;
  consequence_of_failure: number;
  criticality: number;
  risk_score: number;
  combined_score: number;
  urgency_score: number;
  band: "Critical" | "High" | "Medium" | "Low";
};

export type PrioritisationReport = {
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  results: PrioritisationRow[];
};

export const ReportService = {
  list: () =>
    api
      .get<ReportSummary[] | { results: ReportSummary[] }>("/reports/")
      .then((r) => getListData(r.data)),
  exportReport: (id: number, format: "pdf" | "csv") =>
    api
      .get<Blob>(`/reports/${id}/export/`, { params: { fmt: format }, responseType: "blob" })
      .then((r) => r.data),
  prioritisation: () =>
    api.get<PrioritisationReport>("/reports/prioritisation/").then((r) => r.data),
};
