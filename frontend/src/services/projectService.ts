import { api, getListData } from "@/services/api";

export type ProjectRecord = {
  id: number;
  name: string;
  asset: number;
  budget: number;
  start_date: string;
  end_date: string;
  status: string;
  responsible_person: string;
};

export const ProjectService = {
  list: () => api.get<ProjectRecord[] | { results: ProjectRecord[] }>("/projects/").then((r) => getListData(r.data)),
  get: (id: number | string) => api.get<ProjectRecord>(`/projects/${id}/`).then((r) => r.data),
  create: (payload: Omit<ProjectRecord, "id">) => api.post<ProjectRecord>("/projects/", payload).then((r) => r.data),
  update: (id: number | string, payload: Partial<Omit<ProjectRecord, "id">>) =>
    api.put<ProjectRecord>(`/projects/${id}/`, payload).then((r) => r.data),
  remove: (id: number | string) => api.delete(`/projects/${id}/`).then((r) => r.data),
};
