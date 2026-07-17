import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, Badge, Alert } from "@/components/ui-kit";
import { useAssets } from "@/hooks/useAssets";
import {
  LIFECYCLE_STAGES,
  type AssetRecord,
  type LifecycleStage,
} from "@/services/assetService";

export const Route = createFileRoute("/assets")({ component: AssetsPage });

type AssetForm = Omit<AssetRecord, "id">;

const statusVariant = (status: AssetRecord["status"]) =>
  status === "Installation" ? "success" : status === "Operational" ? "success" : status === "Under Maintenance" ? "warning" : "muted";

function AssetsPage() {
  const { assets, loading, error, create, update, remove } = useAssets();
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [editing, setEditing] = useState<AssetRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const types = ["All", ...Array.from(new Set(assets.map((asset) => asset.asset_type)))];

  const filtered = useMemo(
    () =>
      assets.filter(
        (asset) =>
          (filterType === "All" || asset.asset_type === filterType) &&
          (asset.name.toLowerCase().includes(query.toLowerCase()) ||
            String(asset.id).toLowerCase().includes(query.toLowerCase()) ||
            asset.location.toLowerCase().includes(query.toLowerCase())),
      ),
    [assets, filterType, query],
  );

  const onDelete = async (id: number) => {
    if (!confirm("Delete this asset?")) return;
    try {
      await remove(id);
      toast.success("Asset removed successfully.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const onSubmit = async (data: AssetForm) => {
    setFormError(null);
    if (!data.name.trim()) {
      setFormError("Please enter a name for the asset.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editing) {
        await update(editing.id, data);
        toast.success("Asset updated successfully.");
      } else {
        await create(data);
        toast.success("Asset created successfully.");
      }
      setOpen(false);
      setEditing(null);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Asset Management"
        subtitle="Inventory of physical and digital assets across the portfolio"
        actions={
          <button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 shadow-soft"
          >
            <Plus className="h-4 w-4" /> Add Asset
          </button>
        }
      />

      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, ID, or location…"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-shell">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-3 py-3 font-medium">Asset ID</th>
                <th className="px-3 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Location</th>
                <th className="px-3 py-3 font-medium">Condition</th>
                <th className="px-3 py-3 font-medium">RUL</th>
                <th className="px-3 py-3 font-medium">Lifecycle Stage</th>
                <th className="px-3 py-3 font-medium">Criticality</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <tr key={asset.id} className="border-b border-border hover:bg-muted/40">
                  <td className="px-3 py-3 font-mono text-xs">{asset.id}</td>
                  <td className="px-3 py-3 font-medium">{asset.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{asset.asset_type}</td>
                  <td className="px-3 py-3 text-muted-foreground">{asset.location}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <span
                          key={level}
                          className={`h-2 w-4 rounded-sm ${
                            level <= Math.round(Number(asset.condition_rating))
                              ? asset.condition_rating <= 2
                                ? "bg-destructive"
                                : asset.condition_rating < 4
                                  ? "bg-warning"
                                  : "bg-success"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium">{asset.remaining_useful_life}</td>
                  <td className="px-3 py-3 capitalize text-muted-foreground">
                    {asset.lifecycle_stage}
                  </td>
                  <td className="px-3 py-3 font-medium">
                    {Number(asset.criticality).toFixed(1)}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={statusVariant(asset.status) as any}>{asset.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(asset);
                          setOpen(true);
                        }}
                        aria-label="Edit asset"
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(asset.id)}
                        aria-label="Delete asset"
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No assets match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <AssetModal
          initial={editing}
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

function AssetModal({
  initial,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  initial: AssetRecord | null;
  onClose: () => void;
  onSubmit: (asset: AssetForm) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<AssetForm>(
    initial
      ? {
          name: initial.name,
          asset_type: initial.asset_type,
          location: initial.location,
          installation_date: initial.installation_date,
          condition_rating: Number(initial.condition_rating),
          remaining_useful_life: initial.remaining_useful_life,
          status: initial.status,
          lifecycle_stage: initial.lifecycle_stage,
          criticality: Number(initial.criticality),
        }
      : {
          name: "",
          asset_type: "Mechanical",
          location: "",
          installation_date: new Date().toISOString().slice(0, 10),
          condition_rating: 3,
          remaining_useful_life: 8,
          status: "Operational",
          lifecycle_stage: "renewal",
          criticality: 3,
        },
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-deep">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? "Edit Asset" : "Add Asset"}</h2>
          <button
            aria-label="Close asset form"
            onClick={onClose}
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
          <Field label="Name" className="col-span-2">
            <input
              aria-label="Asset name"
              placeholder="e.g. Boiler A-12"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Type">
            <select
              aria-label="Asset type"
              value={form.asset_type}
              onChange={(e) => setForm({ ...form, asset_type: e.target.value })}
              className="input"
            >
              {["Mechanical", "Electrical", "Pipeline", "IT", "Civil"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <input
              aria-label="Asset location"
              placeholder="e.g. Plant 1"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Condition Rating">
            <input
              aria-label="Condition rating"
              placeholder="3.5"
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={form.condition_rating}
              onChange={(e) => setForm({ ...form, condition_rating: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Remaining Useful Life">
            <input
              aria-label="Remaining useful life"
              placeholder="10"
              type="number"
              min={0}
              value={form.remaining_useful_life}
              onChange={(e) => setForm({ ...form, remaining_useful_life: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Status">
            <select
              aria-label="Asset status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input"
            >
              <option>Installation</option>
              <option>Operational</option>
              <option>Under Maintenance</option>
              <option>Decommissioned</option>
            </select>
          </Field>
          <Field label="Lifecycle Stage">
            <select
              aria-label="Lifecycle stage"
              value={form.lifecycle_stage}
              onChange={(e) =>
                setForm({ ...form, lifecycle_stage: e.target.value as LifecycleStage })
              }
              className="input"
            >
              {LIFECYCLE_STAGES.map((stage) => (
                <option key={stage} value={stage} className="capitalize">
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Criticality (1-5)">
            <input
              aria-label="Criticality"
              placeholder="3.0"
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={form.criticality}
              onChange={(e) => setForm({ ...form, criticality: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Installation Date" className="col-span-2">
            <input
              type="date"
              value={form.installation_date}
              onChange={(e) => setForm({ ...form, installation_date: e.target.value })}
              className="input"
            />
          </Field>
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
        <style>{`.input{height:38px;width:100%;border:1px solid var(--input);border-radius:8px;padding:0 10px;font-size:13px;background:var(--background);outline:none}.input:focus{box-shadow:0 0 0 2px var(--ring)}`}</style>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
