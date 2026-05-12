import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader, Card, CardTitle, Badge, Alert } from "@/components/ui-kit";
import { useRisk } from "@/hooks/useRisk";
import { useAssets } from "@/hooks/useAssets";

export const Route = createFileRoute("/risk")({ component: RiskPage });

const formatLevel = (score: number) => {
  if (score >= 100) return "Critical";
  if (score >= 50) return "High";
  if (score >= 20) return "Medium";
  return "Low";
};

const levelVariant = (level: string) =>
  level === "Critical" ? "destructive" : level === "High" ? "destructive" : level === "Medium" ? "warning" : "success";

function RiskPage() {
  const { risks, loading, error } = useRisk();
  const { assets } = useAssets();

  const assetMap = useMemo(() => new Map(assets.map((asset) => [asset.id, asset.name])), [assets]);

  const enrichedRisks = useMemo(
    () =>
      risks
        .map((risk) => ({
          ...risk,
          asset_name: assetMap.get(risk.asset) ?? String(risk.asset),
          level: formatLevel(Number(risk.computed_risk_score)),
        }))
        .sort((a, b) => Number(b.computed_risk_score) - Number(a.computed_risk_score)),
    [assetMap, risks]
  );

  const counts = useMemo(
    () => ({
      Critical: enrichedRisks.filter((risk) => risk.level === "Critical").length,
      High: enrichedRisks.filter((risk) => risk.level === "High").length,
      Medium: enrichedRisks.filter((risk) => risk.level === "Medium").length,
      Low: enrichedRisks.filter((risk) => risk.level === "Low").length,
    }),
    [enrichedRisks]
  );

  const heatmap = useMemo(
    () =>
      Array.from({ length: 5 }, (_, pofIdx) =>
        Array.from({ length: 5 }, (_, cofIdx) => {
          const pof = pofIdx + 1;
          const cof = cofIdx + 1;
          return enrichedRisks.filter(
            (risk) =>
              Math.min(5, Math.max(1, Math.round(Number(risk.probability_of_failure)))) === pof &&
              Math.min(5, Math.max(1, Math.round(Number(risk.consequence_of_failure)))) === cof
          ).length;
        })
      ),
    [enrichedRisks]
  );

  return (
    <div>
      <PageHeader title="Risk & Prioritization" subtitle="Probability × Consequence ranking across portfolio" />

      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(["Critical", "High", "Medium", "Low"] as const).map((level) => (
          <Card key={level}>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{level}</div>
            <div className="mt-2 text-3xl font-bold tracking-tight">{loading ? "…" : counts[level]}</div>
            <div className="mt-2"><Badge variant={levelVariant(level) as any}>{level} risk</Badge></div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardTitle>Asset Risk Ranking</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-3 py-3 font-medium">Rank</th>
                <th className="px-3 py-3 font-medium">Asset</th>
                <th className="px-3 py-3 font-medium">PoF</th>
                <th className="px-3 py-3 font-medium">CoF</th>
                <th className="px-3 py-3 font-medium">Risk Score</th>
                <th className="px-3 py-3 font-medium">Level</th>
                <th className="px-3 py-3 font-medium">Score Bar</th>
              </tr>
            </thead>
            <tbody>
              {enrichedRisks.map((risk, index) => (
                <tr key={risk.id} className="border-b border-border hover:bg-muted/40">
                  <td className="px-3 py-3 font-mono text-xs">#{index + 1}</td>
                  <td className="px-3 py-3 font-medium">{risk.asset_name}</td>
                  <td className="px-3 py-3">{Number(risk.probability_of_failure).toFixed(1)}</td>
                  <td className="px-3 py-3">{Number(risk.consequence_of_failure).toFixed(1)}</td>
                  <td className="px-3 py-3 font-semibold">{Number(risk.computed_risk_score).toFixed(1)}</td>
                  <td className="px-3 py-3"><Badge variant={levelVariant(risk.level) as any}>{risk.level}</Badge></td>
                  <td className="px-3 py-3 w-48">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${risk.level === "Critical" || risk.level === "High" ? "bg-destructive" : risk.level === "Medium" ? "bg-warning" : "bg-success"}`}
                        style={{ width: `${Math.min(100, (Number(risk.computed_risk_score) / 125) * 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
