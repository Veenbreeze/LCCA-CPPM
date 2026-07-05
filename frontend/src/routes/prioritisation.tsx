/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, CardTitle, Badge, Alert } from "@/components/ui-kit";
import {
  ReportService,
  type PrioritisationReport,
  type PrioritisationRow,
} from "@/services/reportService";

export const Route = createFileRoute("/prioritisation")({ component: PrioritisationPage });

const PRIORITISATION_REPORT_ID = 4;

const bandVariant = (band: PrioritisationRow["band"]) =>
  band === "Critical"
    ? "destructive"
    : band === "High"
      ? "destructive"
      : band === "Medium"
        ? "warning"
        : "success";

function PrioritisationPage() {
  const [data, setData] = useState<PrioritisationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [bandFilter, setBandFilter] = useState<string>("All");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const report = await ReportService.prioritisation();
        setData(report);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const rows = data?.results ?? [];

  const filteredRows = useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows.filter(
      (row) =>
        (bandFilter === "All" || row.band === bandFilter) &&
        (!search ||
          row.asset_name.toLowerCase().includes(search) ||
          row.location.toLowerCase().includes(search) ||
          row.recommended_intervention.toLowerCase().includes(search) ||
          row.lifecycle_stage.toLowerCase().includes(search)),
    );
  }, [bandFilter, query, rows]);

  const maxUrgency = useMemo(
    () => rows.reduce((max, row) => Math.max(max, row.urgency_score), 0),
    [rows],
  );

  const download = async (fmt: "pdf" | "csv") => {
    try {
      const blob = await ReportService.exportReport(PRIORITISATION_REPORT_ID, fmt);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `intervention-prioritisation.${fmt}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exported prioritisation report as ${fmt.toUpperCase()}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const summary = data?.summary ?? { total: 0, critical: 0, high: 0, medium: 0, low: 0 };

  return (
    <div>
      <PageHeader
        title="Intervention Prioritisation"
        subtitle="Ranked interventions by (risk × criticality) / RUL"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => download("pdf")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Download className="h-4 w-4" /> Export PDF
            </button>
            <button
              onClick={() => download("csv")}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export CSV
            </button>
          </div>
        }
      />

      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Card>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight">
            {loading ? "…" : summary.total}
          </div>
        </Card>
        {(["critical", "high", "medium", "low"] as const).map((key) => (
          <Card key={key}>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {key}
            </div>
            <div className="mt-2 text-3xl font-bold tracking-tight">
              {loading ? "…" : summary[key]}
            </div>
            <div className="mt-2">
              <Badge
                variant={
                  bandVariant(
                    (key.charAt(0).toUpperCase() + key.slice(1)) as PrioritisationRow["band"],
                  ) as any
                }
              >
                {key} band
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search asset, location, intervention…"
            className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={bandFilter}
            onChange={(e) => setBandFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {["All", "Critical", "High", "Medium", "Low"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <CardTitle>Ranked Interventions</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-shell">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-3 py-3 font-medium">Rank</th>
                <th className="px-3 py-3 font-medium">Asset</th>
                <th className="px-3 py-3 font-medium">Stage</th>
                <th className="px-3 py-3 font-medium">Recommended</th>
                <th className="px-3 py-3 font-medium">RUL</th>
                <th className="px-3 py-3 font-medium">Risk</th>
                <th className="px-3 py-3 font-medium">Crit</th>
                <th className="px-3 py-3 font-medium">Combined</th>
                <th className="px-3 py-3 font-medium">Urgency</th>
                <th className="px-3 py-3 font-medium">Band</th>
                <th className="px-3 py-3 font-medium">Urgency Bar</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const widthPct = maxUrgency > 0 ? (row.urgency_score / maxUrgency) * 100 : 0;
                return (
                  <tr key={row.risk_id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-3 py-3 font-mono text-xs">#{row.rank}</td>
                    <td className="px-3 py-3 font-medium">
                      <div>{row.asset_name}</div>
                      <div className="text-xs text-muted-foreground">{row.location}</div>
                    </td>
                    <td className="px-3 py-3 capitalize text-muted-foreground">
                      {row.lifecycle_stage}
                    </td>
                    <td className="px-3 py-3 font-medium">{row.recommended_intervention}</td>
                    <td className="px-3 py-3">{row.remaining_useful_life}</td>
                    <td className="px-3 py-3">{row.risk_score.toFixed(1)}</td>
                    <td className="px-3 py-3">{row.criticality.toFixed(1)}</td>
                    <td className="px-3 py-3 font-semibold">{row.combined_score.toFixed(1)}</td>
                    <td className="px-3 py-3 font-semibold">{row.urgency_score.toFixed(1)}</td>
                    <td className="px-3 py-3">
                      <Badge variant={bandVariant(row.band) as any}>{row.band}</Badge>
                    </td>
                    <td className="px-3 py-3 w-48">
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${row.band === "Critical" || row.band === "High" ? "bg-destructive" : row.band === "Medium" ? "bg-warning" : "bg-success"}`}
                          style={{ width: `${Math.min(100, widthPct)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      No interventions match your filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
