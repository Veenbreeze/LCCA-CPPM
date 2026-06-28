/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, CardTitle, Badge, Alert } from "@/components/ui-kit";
import { useProjects } from "@/hooks/useProjects";
import { useAssets } from "@/hooks/useAssets";
import { type ProjectRecord } from "@/services/projectService";

export const Route = createFileRoute("/projects")({ component: ProjectsPage });

type ProjectForm = Omit<ProjectRecord, "id">;

const statusVariant = (status: ProjectRecord["status"]) =>
  status === "Completed"
    ? "success"
    : status === "In Progress"
      ? "info"
      : status === "On Hold"
        ? "warning"
        : "muted";

function ProjectsPage() {
  const { projects, loading, error, create, update, remove } = useProjects();
  const { assets } = useAssets();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assetMap = useMemo(() => new Map(assets.map((asset) => [asset.id, asset.name])), [assets]);

  const resourceSpan = useMemo(() => {
    const dates = projects.flatMap((project) => [
      new Date(project.start_date),
      new Date(project.end_date),
    ]);
    if (!dates.length) return { minDate: new Date(), maxDate: new Date() };
    return {
      minDate: new Date(Math.min(...dates.map((date) => date.getTime()))),
      maxDate: new Date(Math.max(...dates.map((date) => date.getTime()))),
    };
  }, [projects]);

  const offsetPct = (date: Date) =>
    ((date.getTime() - resourceSpan.minDate.getTime()) /
      (resourceSpan.maxDate.getTime() - resourceSpan.minDate.getTime())) *
    100;
  const widthPct = (start: Date, end: Date) =>
    ((end.getTime() - start.getTime()) /
      (resourceSpan.maxDate.getTime() - resourceSpan.minDate.getTime())) *
    100;

  const onSubmit = async (payload: ProjectForm) => {
    setFormError(null);
    if (!payload.name.trim()) {
      setFormError("Project name is required.");
      return;
    }
    if (!payload.asset) {
      setFormError("Select an asset for the project.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editing) {
        await update(editing.id, payload);
        toast.success("Project updated successfully.");
      } else {
        await create(payload);
        toast.success("Project created successfully.");
      }
      setOpen(false);
      setEditing(null);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timelineProjects = projects.filter((project) => project.start_date && project.end_date);

  return (
    <div>
      <PageHeader
        title="Capital Projects"
        subtitle="Portfolio of CAPEX projects with timeline and budget tracking"
        actions={
          <button
            aria-label="Open new project form"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 shadow-soft"
          >
            <Plus className="h-4 w-4" /> New Project
          </button>
        }
      />

      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <Card className="mb-6">
        <CardTitle>Project Timeline</CardTitle>
        <div className="space-y-3">
          {timelineProjects.map((project) => (
            <div key={project.id} className="grid grid-cols-12 items-center gap-3">
              <div className="col-span-4 sm:col-span-3 truncate text-sm font-medium">
                {project.name}
              </div>
              <div className="col-span-8 sm:col-span-9 relative h-7 rounded-md bg-muted/50">
                <div
                  className="absolute top-0 h-7 rounded-md bg-primary/80 text-primary-foreground shadow-soft flex items-center px-2"
                  style={{
                    left: `${offsetPct(new Date(project.start_date))}%`,
                    width: `${widthPct(new Date(project.start_date), new Date(project.end_date))}%`,
                  }}
                  title={`${project.start_date} → ${project.end_date}`}
                >
                  <span className="text-[10px] font-medium truncate">
                    ${Number(project.budget).toLocaleString()} · {project.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {!timelineProjects.length && (
            <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
              No project timeline data yet.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>All Projects</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-shell">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-3 py-3 font-medium">Project</th>
                <th className="px-3 py-3 font-medium">Asset</th>
                <th className="px-3 py-3 font-medium">Budget</th>
                <th className="px-3 py-3 font-medium">Timeline</th>
                <th className="px-3 py-3 font-medium">Owner</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-border hover:bg-muted/40">
                  <td className="px-3 py-3 font-medium">{project.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {assetMap.get(project.asset) ?? project.asset}
                  </td>
                  <td className="px-3 py-3">${Number(project.budget).toLocaleString()}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {project.start_date} → {project.end_date}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{project.responsible_person}</td>
                  <td className="px-3 py-3">
                    <Badge variant={statusVariant(project.status) as any}>{project.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        aria-label="Edit project"
                        onClick={() => {
                          setEditing(project);
                          setOpen(true);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Delete project"
                        onClick={async () => {
                          if (!confirm("Delete project?")) return;
                          try {
                            await remove(project.id);
                            toast.success("Project deleted.");
                          } catch (err) {
                            toast.error((err as Error).message);
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <ProjectModal
          initial={editing}
          assets={assets}
          onClose={() => {
            setOpen(false);
            setEditing(null);
            setFormError(null);
          }}
          onSubmit={onSubmit}
          submitting={isSubmitting}
          error={formError}
        />
      )}
    </div>
  );
}

function ProjectModal({
  initial,
  assets,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  initial: ProjectRecord | null;
  assets: { id: number; name: string }[];
  onClose: () => void;
  onSubmit: (project: ProjectForm) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<ProjectForm>(
    initial
      ? {
          name: initial.name,
          asset: initial.asset,
          scope_description: initial.scope_description ?? "",
          budget: Number(initial.budget),
          start_date: initial.start_date,
          end_date: initial.end_date,
          status: initial.status,
          responsible_person: initial.responsible_person,
        }
      : {
          name: "",
          asset: assets[0]?.id ?? 0,
          scope_description: "",
          budget: 0,
          start_date: new Date().toISOString().slice(0, 10),
          end_date: new Date().toISOString().slice(0, 10),
          status: "Planning",
          responsible_person: "",
        },
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-deep">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? "Edit Project" : "New Project"}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error ? <Alert variant="destructive">{error}</Alert> : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="grid grid-cols-2 gap-3"
        >
          <Label field="Name" full>
            <input
              aria-label="Project name"
              placeholder="New asset upgrade"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </Label>
          <Label field="Asset">
            <select
              aria-label="Select project asset"
              value={form.asset}
              onChange={(e) => setForm({ ...form, asset: Number(e.target.value) })}
              className="input"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          </Label>
          <Label field="Owner">
            <input
              aria-label="Responsible person"
              placeholder="e.g. Asset Manager"
              value={form.responsible_person}
              onChange={(e) => setForm({ ...form, responsible_person: e.target.value })}
              className="input"
            />
          </Label>
          <Label field="Budget (USD)">
            <input
              aria-label="Project budget"
              placeholder="125000"
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              className="input"
            />
          </Label>
          <Label field="Start Date">
            <input
              aria-label="Project start date"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="input"
            />
          </Label>
          <Label field="End Date">
            <input
              aria-label="Project end date"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="input"
            />
          </Label>
          <Label field="Status" full>
            <select
              aria-label="Project status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input"
            >
              <option>Planning</option>
              <option>In Progress</option>
              <option>On Hold</option>
              <option>Completed</option>
            </select>
          </Label>
          <Label field="Scope Description" full>
            <textarea
              aria-label="Project scope description"
              placeholder="Describe the project scope: deliverables, boundaries, exclusions…"
              value={form.scope_description}
              onChange={(e) => setForm({ ...form, scope_description: e.target.value })}
              rows={4}
              className="input"
              style={{ height: "auto", minHeight: 90, padding: "8px 10px" }}
            />
          </Label>
          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Label({
  field,
  children,
  full,
}: {
  field: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{field}</span>
      {children}
    </label>
  );
}
