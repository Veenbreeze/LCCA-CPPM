import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Plus, Calculator, TrendingDown, TrendingUp, X, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, CardTitle, StatCard, Badge, Alert } from "@/components/ui-kit";
import { useScenarios } from "@/hooks/useScenarios";
import { useAssets } from "@/hooks/useAssets";
import {
  type ScenarioCreatePayload,
  type ScenarioRecord,
} from "@/services/scenarioService";

export const Route = createFileRoute("/scenario")({ component: ScenarioPage });

type ScenarioForm = ScenarioCreatePayload;

function ScenarioPage() {
  const { scenarios, loading, error, create, update, remove } = useScenarios();
  const { assets } = useAssets();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ScenarioRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assetMap = useMemo(() => new Map(assets.map((asset) => [asset.id, asset.name])), [assets]);

  const bestScenario = useMemo(() => {
    if (!scenarios.length) return null;
    return scenarios.reduce(
      (best, current) => (current.npv < best.npv ? current : best),
      scenarios[0],
    );
  }, [scenarios]);

  const summary = useMemo(
    () => ({
      total: scenarios.length,
      average: scenarios.length
        ? scenarios.reduce((sum, item) => sum + item.npv, 0) / scenarios.length
        : 0,
      best: bestScenario?.npv ?? 0,
    }),
    [bestScenario, scenarios],
  );

  const chartData = useMemo(
    () =>
      scenarios.slice(0, 5).map((scenario, index) => ({
        scenario: assetMap.get(scenario.asset) ?? `Asset ${scenario.asset}`,
        NPV: Number(scenario.npv),
        index,
      })),
    [assetMap, scenarios],
  );

  const onSubmit = async (payload: ScenarioForm) => {
    setFormError(null);
    if (!payload.asset) {
      setFormError("Select an asset for the scenario.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editing) {
        await update(editing.id, payload);
        toast.success("Scenario updated successfully.");
      } else {
        await create(payload);
        toast.success("Scenario saved successfully.");
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
        title="Scenario Analysis"
        subtitle="Lifecycle cost comparison and scenario management"
      />

      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle>Scenario Inventory</CardTitle>
          <div className="mt-4 text-sm text-muted-foreground">
            {loading ? "Loading scenario records..." : `${summary.total} active scenario(s)`}
          </div>
        </Card>
        <Card>
          <CardTitle>Average NPV</CardTitle>
          <div className="mt-4 text-3xl font-semibold">${summary.average.toFixed(0)}</div>
        </Card>
        <Card>
          <CardTitle>Best Scenario</CardTitle>
          <div className="mt-4 text-3xl font-semibold">
            ${bestScenario ? bestScenario.npv.toFixed(0) : "—"}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {bestScenario ? assetMap.get(bestScenario.asset) : "No scenario selected"}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle>Scenario Inputs</CardTitle>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Create scenario records for repair, replacement, and maintenance cost comparisons. Use
              this panel to manage relative lifecycle decisions.
            </p>
            <button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add scenario
            </button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>Cumulative NPV by Scenario</CardTitle>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis
                  dataKey="scenario"
                  tick={{ fontSize: 11, fill: "oklch(0.52 0.03 250)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.52 0.03 250)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid oklch(0.92 0.01 250)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="NPV" fill="oklch(0.52 0.20 254)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardTitle>
          Scenarios
          <span className="ml-2 text-xs text-muted-foreground">
            {loading ? "Loading…" : `${scenarios.length} records`}
          </span>
        </CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-shell">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-3 py-3 font-medium">Scenario</th>
                <th className="px-3 py-3 font-medium">Repair</th>
                <th className="px-3 py-3 font-medium">Replace</th>
                <th className="px-3 py-3 font-medium">Maintenance</th>
                <th className="px-3 py-3 font-medium">Discount</th>
                <th className="px-3 py-3 font-medium">Horizon</th>
                <th className="px-3 py-3 font-medium">Repair NPV</th>
                <th className="px-3 py-3 font-medium">Replace NPV</th>
                <th className="px-3 py-3 font-medium">Lifecycle Cost</th>
                <th className="px-3 py-3 font-medium">Recommend</th>
                <th className="px-3 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => (
                <tr key={scenario.id} className="border-b border-border hover:bg-muted/40">
                  <td className="px-3 py-3 font-medium">{assetMap.get(scenario.asset) ?? `Asset ${scenario.asset}`}</td>
                  <td className="px-3 py-3">${Number(scenario.repair_cost).toLocaleString()}</td>
                  <td className="px-3 py-3">${Number(scenario.replacement_cost).toLocaleString()}</td>
                  <td className="px-3 py-3">${Number(scenario.maintenance_cost).toLocaleString()}</td>
                  <td className="px-3 py-3">{Number(scenario.discount_rate).toFixed(2)}%</td>
                  <td className="px-3 py-3 font-semibold">${Number(scenario.npv).toFixed(0)}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(scenario);
                          setOpen(true);
                        }}
                        className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:bg-muted"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm("Delete scenario?")) return;
                          try {
                            await remove(scenario.id);
                            toast.success("Scenario deleted.");
                          } catch (err) {
                            toast.error((err as Error).message);
                          }
                        }}
                        className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
        <ScenarioModal
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

function ScenarioModal({
  initial,
  assets,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  initial: ScenarioRecord | null;
  assets: { id: number; name: string }[];
  onClose: () => void;
  onSubmit: (scenario: ScenarioForm) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<ScenarioForm>(
    initial
      ? {
          asset: initial.asset,
          repair_cost: Number(initial.repair_cost),
          replacement_cost: Number(initial.replacement_cost),
          maintenance_cost: Number(initial.maintenance_cost),
          discount_rate: Number(initial.discount_rate),
        }
      : {
          asset: assets[0]?.id ?? 0,
          repair_cost: 0,
          replacement_cost: 0,
          maintenance_cost: 0,
          discount_rate: 5,
        },
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-deep">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? "Edit Scenario" : "New Scenario"}</h2>
          <button
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
          <Label field="Asset" full>
            <select
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
          <Label field="Repair Cost">
            <input
              type="number"
              value={form.repair_cost}
              onChange={(e) => setForm({ ...form, repair_cost: Number(e.target.value) })}
              className="input"
            />
          </Label>
          <Label field="Replacement Cost">
            <input
              type="number"
              value={form.replacement_cost}
              onChange={(e) => setForm({ ...form, replacement_cost: Number(e.target.value) })}
              className="input"
            />
          </Label>
          <Label field="Maintenance Cost">
            <input
              type="number"
              value={form.maintenance_cost}
              onChange={(e) => setForm({ ...form, maintenance_cost: Number(e.target.value) })}
              className="input"
            />
          </Label>
          <Label field="Discount Rate" full>
            <input
              type="number"
              value={form.discount_rate}
              onChange={(e) => setForm({ ...form, discount_rate: Number(e.target.value) })}
              className="input"
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
