import { api, getListData } from "@/services/api";

export type ReportSummary = {
  id: number;
  title: string;
  description: string;
  updated: string;
};

export const ReportService = {
  list: () =>
    api
      .get<ReportSummary[] | { results: ReportSummary[] }>("/reports/")
      .then((r) => getListData(r.data)),
  exportReport: (id: number, format: "pdf" | "csv") =>
    api
      .get<Blob>(`/reports/${id}/export/`, { params: { format }, responseType: "blob" })
      .then((r) => r.data),
};
