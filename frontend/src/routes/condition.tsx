import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, CardTitle, Badge, Alert } from "@/components/ui-kit";
import { useAssets } from "@/hooks/useAssets";
import { useConditions } from "@/hooks/useConditions";
import { useNotifications } from "@/hooks/use-notifications";

export const Route = createFileRoute("/condition")({ component: ConditionPage });

function ConditionPage() {
  const { assets, loading: assetsLoading, error: assetsError } = useAssets();
  const { conditions, loading: conditionLoading, error: conditionError, create } = useConditions();
  const { reviewedInspections, markInspectionReviewed } = useNotifications();

  const [form, setForm] = useState({
    asset: 0,
    condition_score: 3,
    inspection_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!assetsLoading && assets.length && form.asset === 0) {
      setForm((current) => ({ ...current, asset: assets[0].id }));
    }
  }, [assets, assetsLoading, form.asset]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.asset) {
      setFormError("Please select an asset.");
      return;
    }
    if (form.condition_score < 0 || form.condition_score > 5) {
      setFormError("Condition score must be between 0 and 5.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      const created = await create(form);
      toast.success("Inspection logged", {
        description: `Asset ${assets.find((item) => item.id === created.asset)?.name ?? created.asset} — score ${created.condition_score}.`,
      });
      setForm((prev) => ({ ...prev, notes: "" }));
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const assetMap = new Map(assets.map((asset) => [asset.id, asset.name]));

  return (
    <div>
      <PageHeader title="Condition & Remaining Useful Life" subtitle="Inspection records and degradation analytics" />

      {(assetsError || conditionError) ? (
        <Alert variant="destructive">{assetsError || conditionError}</Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle action={<Badge variant="info">Asset health</Badge>}>Condition Trend (last 7 yrs)</CardTitle>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart
                data={conditions.slice(-7).map((condition) => ({
                  year: condition.inspection_date,
                  score: Number(condition.condition_score),
                }))}
                margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
              >
                <CartesianGrid stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: "oklch(0.52 0.03 250)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "oklch(0.52 0.03 250)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 250)", fontSize: 12 }} />
                <ReferenceLine y={2} stroke="oklch(0.58 0.22 25)" strokeDasharray="4 4" label={{ value: "Threshold", fontSize: 10, fill: "oklch(0.58 0.22 25)" }} />
                <Line type="monotone" dataKey="score" stroke="oklch(0.52 0.20 254)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardTitle>Log Inspection</CardTitle>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Asset</label>
              <select
                aria-label="Select asset"
                value={form.asset}
                onChange={(e) => setForm({ ...form, asset: Number(e.target.value) })}
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Score (1–5)</label>
                <input
                  aria-label="Condition score"
                  placeholder="3.0"
                  type="number"
                  min={1}
                  max={5}
                  step={0.1}
                  value={form.condition_score}
                  onChange={(e) => setForm({ ...form, condition_score: Number(e.target.value) })}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <input
                  aria-label="Inspection date"
                  type="date"
                  value={form.inspection_date}
                  onChange={(e) => setForm({ ...form, inspection_date: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Notes</label>
              <textarea
                aria-label="Inspection notes"
                placeholder="Add inspection comments"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg border border-input bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {formError ? <Alert variant="destructive">{formError}</Alert> : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Plus className="h-4 w-4" /> {isSubmitting ? "Submitting…" : "Submit Inspection"}
            </button>
          </form>
        </Card>
      </div>

      <Card className="mt-6">
        <CardTitle>Inspection Records</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-3 py-3 font-medium">Record</th>
                <th className="px-3 py-3 font-medium">Asset</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Score</th>
                <th className="px-3 py-3 font-medium">Notes</th>
                <th className="px-3 py-3 font-medium text-right">Review</th>
              </tr>
            </thead>
            <tbody>
              {conditions.map((record) => {
                const reviewed = reviewedInspections.has(String(record.id));
                return (
                  <tr key={record.id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-3 py-3 font-mono text-xs">{record.id}</td>
                    <td className="px-3 py-3 font-medium">{assetMap.get(record.asset) ?? record.asset}</td>
                    <td className="px-3 py-3 text-muted-foreground">{record.inspection_date}</td>
                    <td className="px-3 py-3">
                      <Badge variant={record.condition_score < 2 ? "destructive" : record.condition_score < 3 ? "warning" : "success"}>
                        {Number(record.condition_score).toFixed(1)}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground max-w-md truncate">{record.notes}</td>
                    <td className="px-3 py-3 text-right">
                      {reviewed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            markInspectionReviewed(String(record.id));
                            toast.success("Inspection marked reviewed", { description: assetMap.get(record.asset) ?? String(record.asset) });
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted"
                        >
                          Mark reviewed
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
