import { api, getListData } from "@/services/api";

export type AssetRecord = {
  id: number;
  name: string;
  asset_type: string;
  location: string;
  installation_date: string;
  condition_rating: number;
  remaining_useful_life: number;
  status: string;
};

export const AssetService = {
  list: () => api.get<AssetRecord[] | { results: AssetRecord[] }>("/assets/").then((r) => getListData(r.data)),
  get: (id: number | string) => api.get<AssetRecord>(`/assets/${id}/`).then((r) => r.data),
  create: (payload: Omit<AssetRecord, "id">) => api.post<AssetRecord>("/assets/", payload).then((r) => r.data),
  update: (id: number | string, payload: Partial<Omit<AssetRecord, "id">>) =>
    api.put<AssetRecord>(`/assets/${id}/`, payload).then((r) => r.data),
  remove: (id: number | string) => api.delete(`/assets/${id}/`).then((r) => r.data),
};
