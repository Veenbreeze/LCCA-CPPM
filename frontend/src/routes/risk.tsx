/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, CardTitle, Badge, Alert } from "@/components/ui-kit";
import { useRisk } from "@/hooks/useRisk";
import { useAssets } from "@/hooks/useAssets";
import { type RiskCreatePayload, type RiskRecord } from "@/services/riskService";

export const Route = createFileRoute("/risk")({ component: RiskPage });

const formatLevel = (score: number) => {
  if (score >= 100) return "Critical";
  if (score >= 50) return "High";
  if (score >= 20) return "Medium";
  return "Low";
};

const levelVariant = (level: string) =>
  level === "Critical"
    ? "destructive"
    : level === "High"
      ? "destructive"
      : level === "Medium"
        ? "warning"
        : "success";

function RiskPage() {
  const { risks, loading, error, create, update, remove } = useRisk();
  const { assets } = useAssets();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RiskRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const assetMap = useMemo(() => new Map(assets.map((asset) => [asset.id, asset.name])), [assets]);
  const riskAssetIds = useMemo(() => new Set(risks.map((risk) => risk.asset)), [risks]);

  const enrichedRisks = useMemo(
    () =>
      risks
        .map((risk) => ({
          ...risk,
          asset_name: assetMap.get(risk.asset) ?? String(risk.asset),
          level: formatLevel(Number(risk.combined_score || risk.computed_risk_score)),
        }))
        .sort(
          (a, b) =>
            Number(b.combined_score || b.computed_risk_score) -
            Number(a.combined_score || a.computed_risk_score),
        ),
    [assetMap, risks],
  );

  const counts = useMemo(
    () => ({
      Critical: enrichedRisks.filter((risk) => risk.level === "Critical").length,
      High: enrichedRisks.filter((risk) => risk.level === "High").length,
      Medium: enrichedRisks.filter((risk) => risk.level === "Medium").length,
      Low: enrichedRisks.filter((risk) => risk.level === "Low").length,
    }),
    [enrichedRisks],
  );

  const heatmap = useMemo(
    () =>
      Array.from({ length: 10 }, (_, pofIdx) =>
        Array.from({ length: 10 }, (_, cofIdx) => {
          const pof = pofIdx + 1;
          const cof = cofIdx + 1;
          return enrichedRisks.filter(
            (risk) =>
              Math.min(10, Math.max(1, Math.round(Number(risk.probability_of_failure)))) === pof &&
              Math.min(10, Math.max(1, Math.round(Number(risk.consequence_of_failure)))) === cof,
          ).length;
        }),
      ),
    [enrichedRisks],
  );

  const filteredRisks = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return enrichedRisks;
    return enrichedRisks.filter(
      (risk) =>
        risk.asset_name.toLowerCase().includes(search) ||
        String(risk.computed_risk_score).toLowerCase().includes(search) ||
        String(risk.combined_score).toLowerCase().includes(search) ||
        risk.level.toLowerCase().includes(search),
    );
  }, [enrichedRisks, query]);

  const maxCombined = useMemo(
    () =>
      enrichedRisks.reduce(
        (max, risk) => Math.max(max, Number(risk.combined_score || risk.computed_risk_score)),
        0,
      ),
    [enrichedRisks],
  );

  const onSubmit = async (payload: RiskCreatePayload) => {
    setFormError(null);
    if (!payload.asset) {
      setFormError("Select an asset for the risk assessment.");
      return;
    }
    const pof = Number(payload.probability_of_failure);
    const cof = Number(payload.consequence_of_failure);
    if (!(pof >= 1 && pof <= 10)) {
      setFormError("Probability of Failure must be between 1 and 10.");
      return;
    }
    if (!(cof >= 1 && cof <= 10)) {
      setFormError("Consequence of Failure must be between 1 and 10.");
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await update(editing.id, payload);
        toast.success("Risk assessment updated.");
      } else {
        await create(payload);
        toast.success("Risk assessment created.");
      }
      setOpen(false);
      setEditing(null);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (risk: RiskRecord) => {
    if (!confirm(`Delete risk for ${assetMap.get(risk.asset) ?? risk.asset}?`)) return;
    try {
      await remove(risk.id);
      toast.success("Risk assessment removed.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Risk & Prioritization"
        subtitle="Probability × Consequence × Criticality ranking across portfolio"
        actions={
          <button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 shadow-soft"
          >
            <Plus className="h-4 w-4" /> Add Risk
          </button>
        }
      />

      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <div className="mt-6 relative">
        <div className="relative max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            🔎
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search risk by asset, score, or level…"
            className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(["Critical", "High", "Medium", "Low"] as const).map((level) => (
          <Card key={level}>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {level}
            </div>
            <div className="mt-2 text-3xl font-bold tracking-tight">
              {loading ? "…" : counts[level]}
            </div>
            <div className="mt-2">
              <Badge variant={levelVariant(level) as any}>{level} risk</Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardTitle subtitle="Asset count by Probability × Consequence (1–10 scale)">
          Risk Heatmap (PoF × CoF)
        </CardTitle>
        <div className="overflow-x-auto">
          <div className="inline-block">
            <div className="grid" style={{ gridTemplateColumns: "48px repeat(10, 44px)" }}>
              <div />
              {Array.from({ length: 10 }, (_, i) => i + 1).map((cof) => (
                <div
                  key={`h${cof}`}
                  className="text-center text-[11px] font-medium text-muted-foreground py-1"
                >
                  C{cof}
                </div>
              ))}
              {Array.from({ length: 10 }, (_, i) => 10 - i).map((pof) => (
                <div key={`row${pof}`} className="contents">
                  <div className="flex items-center justify-end pr-2 text-[11px] font-medium text-muted-foreground">
                    P{pof}
                  </div>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((cof) => {
                    const product = pof * cof;
                    const tone =
                      product >= 64
                        ? "bg-destructive/80 text-white"
                        : product >= 40
                          ? "bg-destructive/60 text-white"
                          : product >= 20
                            ? "bg-warning/70 text-foreground"
                            : product >= 8
                              ? "bg-success/60 text-foreground"
                              : "bg-muted text-muted-foreground";
                    const count = heatmap[pof - 1]?.[cof - 1] ?? 0;
                    return (
                      <div
                        key={`${pof}-${cof}`}
                        className={`h-9 w-10 flex items-center justify-center text-xs font-semibold rounded-sm m-px transition-transform hover:scale-110 hover:ring-2 hover:ring-ring ${tone}`}
                        title={`PoF ${pof} × CoF ${cof} = ${product} • ${count} asset(s)`}
                      >
                        {count || ""}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="font-medium">Severity:</span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-muted" /> Low (&lt;8)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-success/60" /> Moderate (8–19)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-warning/70" /> Elevated (20–39)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-destructive/60" /> High (40–63)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-destructive/80" /> Critical
                (64+)
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-6">
        <CardTitle>Asset Risk Ranking</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-shell">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-3 py-3 font-medium">Rank</th>
                <th className="px-3 py-3 font-medium">Asset</th>
                <th className="px-3 py-3 font-medium">PoF</th>
                <th className="px-3 py-3 font-medium">CoF</th>
                <th className="px-3 py-3 font-medium">Criticality</th>
                <th className="px-3 py-3 font-medium">Risk Score</th>
                <th className="px-3 py-3 font-medium">Combined</th>
                <th className="px-3 py-3 font-medium">Level</th>
                <th className="px-3 py-3 font-medium">Score Bar</th>
                <th className="px-3 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((risk, index) => {
                const combined = Number(risk.combined_score || risk.computed_risk_score);
                const widthPct = maxCombined > 0 ? (combined / maxCombined) * 100 : 0;
                return (
                  <tr key={risk.id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-3 py-3 font-mono text-xs">#{index + 1}</td>
                    <td className="px-3 py-3 font-medium">{risk.asset_name}</td>
                    <td className="px-3 py-3">{Number(risk.probability_of_failure).toFixed(1)}</td>
                    <td className="px-3 py-3">{Number(risk.consequence_of_failure).toFixed(1)}</td>
                    <td className="px-3 py-3">{Number(risk.criticality).toFixed(1)}</td>
                    <td className="px-3 py-3">{Number(risk.computed_risk_score).toFixed(1)}</td>
                    <td className="px-3 py-3 font-semibold">{combined.toFixed(1)}</td>
                    <td className="px-3 py-3">
                      <Badge variant={levelVariant(risk.level) as any}>{risk.level}</Badge>
                    </td>
                    <td className="px-3 py-3 w-48">
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${risk.level === "Critical" || risk.level === "High" ? "bg-destructive" : risk.level === "Medium" ? "bg-warning" : "bg-success"}`}
                          style={{ width: `${Math.min(100, widthPct)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          aria-label="Edit risk"
                          onClick={() => {
                            setEditing(risk);
                            setOpen(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          aria-label="Delete risk"
                          onClick={() => onDelete(risk)}
                          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredRisks.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No risk records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <RiskModal
          initial={editing}
          assets={assets}
          existingAssetIds={riskAssetIds}
          onClose={() => {
            setOpen(false);
            setEditing(null);
            setFormError(null);
          }}
          onSubmit={onSubmit}
          submitting={submitting}
          error={formError}
        />
      )}
    </div>
  );
}

function RiskModal({
  initial,
  assets,
  existingAssetIds,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  initial: RiskRecord | null;
  assets: { id: number; name: string; criticality?: number }[];
  existingAssetIds: Set<number>;
  onClose: () => void;
  onSubmit: (payload: RiskCreatePayload) => void;
  submitting: boolean;
  error: string | null;
}) {
  const availableAssets = useMemo(
    () => (initial ? assets : assets.filter((asset) => !existingAssetIds.has(asset.id))),
    [assets, existingAssetIds, initial],
  );

  const [form, setForm] = useState<RiskCreatePayload>(
    initial
      ? {
          asset: initial.asset,
          probability_of_failure: Number(initial.probability_of_failure),
          consequence_of_failure: Number(initial.consequence_of_failure),
        }
      : {
          asset: availableAssets[0]?.id ?? 0,
          probability_of_failure: 3,
          consequence_of_failure: 3,
        },
  );

  const selectedAsset = assets.find((asset) => asset.id === form.asset);
  const criticality = Number(selectedAsset?.criticality ?? 1);
  const previewRisk = form.probability_of_failure * form.consequence_of_failure;
  const previewCombined = previewRisk * criticality;
  const previewLevel =
    previewCombined >= 100
      ? "Critical"
      : previewCombined >= 50
        ? "High"
        : previewCombined >= 20
          ? "Medium"
          : "Low";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-deep">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? "Edit Risk" : "New Risk Assessment"}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error ? <Alert variant="destructive">{error}</Alert> : null}

        {!initial && availableAssets.length === 0 && (
          <Alert variant="default">
            All assets already have a risk assessment. Edit an existing entry instead.
          </Alert>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="grid grid-cols-2 gap-3"
        >
          <Field label="Asset" full>
            <select
              value={form.asset}
              onChange={(e) => setForm({ ...form, asset: Number(e.target.value) })}
              disabled={!!initial}
              className="input"
            >
              {(initial ? assets : availableAssets).map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
            {initial && (
              <span className="text-[10px] text-muted-foreground">
                Asset is fixed when editing an existing risk.
              </span>
            )}
          </Field>

          <Field label="Probability of Failure (1-10)">
            <input
              type="number"
              min={1}
              max={10}
              step={0.1}
              value={form.probability_of_failure}
              onChange={(e) =>
                setForm({ ...form, probability_of_failure: Number(e.target.value) })
              }
              className="input"
            />
          </Field>
          <Field label="Consequence of Failure (1-10)">
            <input
              type="number"
              min={1}
              max={10}
              step={0.1}
              value={form.consequence_of_failure}
              onChange={(e) =>
                setForm({ ...form, consequence_of_failure: Number(e.target.value) })
              }
              className="input"
            />
          </Field>

          <div className="col-span-2 mt-2 rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Live preview
            </div>
            <div className="mt-1 grid grid-cols-4 gap-2 text-sm">
              <div>
                <div className="text-[10px] text-muted-foreground">Asset criticality</div>
                <div className="font-semibold">{criticality.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Risk (PoF × CoF)</div>
                <div className="font-semibold">{previewRisk.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Combined</div>
                <div className="font-semibold">{previewCombined.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Band</div>
                <Badge variant={levelVariant(previewLevel) as any}>{previewLevel}</Badge>
              </div>
            </div>
          </div>

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
              disabled={submitting || (!initial && availableAssets.length === 0)}
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
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
