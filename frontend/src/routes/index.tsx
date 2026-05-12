import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Boxes, ShieldAlert, FolderKanban, Wallet } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { PageHeader, StatCard, Card, CardTitle, Badge, Alert } from "@/components/ui-kit";
import { useAssets } from "@/hooks/useAssets";
import { useProjects } from "@/hooks/useProjects";
import { useRisk } from "@/hooks/useRisk";
import { useNotifications } from "@/hooks/use-notifications";

export const Route = createFileRoute("/")({ component: Dashboard });

const COLORS = ["oklch(0.62 0.16 155)", "oklch(0.52 0.20 254)", "oklch(0.75 0.16 75)", "oklch(0.58 0.22 25)", "oklch(0.55 0.18 295)"];

const formatLevel = (score: number) => {
  if (score >= 100) return "Critical";
  if (score >= 50) return "High";
  if (score >= 20) return "Medium";
  return "Low";
};

function Dashboard() {
  const { assets, loading: assetsLoading, error: assetsError } = useAssets();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { risks, loading: risksLoading, error: risksError } = useRisk();
  const { inspections } = useNotifications();

  const loading = assetsLoading || projectsLoading || risksLoading;
  const error = assetsError || projectsError || risksError;

  const totalAssets = assets.length;
  const activeProjects = projects.filter((project) => project.status !== "Completed").length;
  const totalCapex = projects.reduce((sum, project) => sum + Number(project.budget), 0);
  const highRisk = risks.filter((risk) => {
    const level = formatLevel(Number(risk.computed_risk_score));
    return level === "High" || level === "Critical";
  }).length;

  const conditionDist = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `Rating ${rating}`,
    count: assets.filter((asset) => Math.round(Number(asset.condition_rating)) === rating).length,
  }));

  const capexAllocation = projects.map((project) => ({ name: project.name.split(" ")[0], value: Number(project.budget) }));

  const heatmap = Array.from({ length: 5 }, (_, pofIdx) =>
    Array.from({ length: 5 }, (_, cofIdx) => {
      const pof = pofIdx + 1;
      const cof = cofIdx + 1;
      return risks.filter(
        (risk) =>
          Math.min(5, Math.max(1, Math.round(Number(risk.probability_of_failure)))) === pof &&
          Math.min(5, Math.max(1, Math.round(Number(risk.consequence_of_failure)))) === cof
      ).length;
    })
  );

  const recentActivities = useMemo(
    () =>
      [
        ...risks.slice(0, 3).map((risk) => ({
          id: `risk-${risk.id}`,
          action: "Risk rescore",
          target: `Asset ${risk.asset}`,
          user: "System",
          time: "Just now",
        })),
        ...inspections.slice(0, 2).map((record) => ({
          id: `inspection-${record.id}`,
          action: "Inspection logged",
          target: record.asset_name ?? `Asset ${record.asset}`,
          user: "Maintenance",
          time: record.inspection_date,
        })),
      ]
        .sort((a, b) => b.time.localeCompare(a.time))
        .slice(0, 5),
    [inspections, risks]
  );

  return (
    <div>
      <PageHeader
        title="Portfolio Overview"
        subtitle="Real-time view of asset health, risk and capital project performance"
      />

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <div className="font-medium">Unable to load dashboard metrics</div>
          <div>{error}</div>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Assets"
          value={loading ? "…" : totalAssets.toString()}
          hint="Across the portfolio"
          icon={Boxes}
          trend={{ value: "+5 this quarter", positive: true }}
        />
        <StatCard
          label="High-Risk Assets"
          value={loading ? "…" : highRisk.toString()}
          hint="Critical + High"
          icon={ShieldAlert}
          accent="destructive"
          trend={{ value: "+2 since last report", positive: false }}
        />
        <StatCard
          label="Active Projects"
          value={loading ? "…" : activeProjects.toString()}
          hint={`${projects.length} in portfolio`}
          icon={FolderKanban}
          accent="success"
        />
        <StatCard
          label="Total CAPEX Budget"
          value={loading ? "…" : `$${(totalCapex / 1_000_000).toFixed(2)}M`}
          hint={`${projects.length} projects`}
          icon={Wallet}
          accent="primary"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle action={<Badge variant="muted">Live</Badge>}>Asset Condition Distribution</CardTitle>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={conditionDist} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis dataKey="rating" tick={{ fontSize: 12, fill: "oklch(0.52 0.03 250)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "oklch(0.52 0.03 250)" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "oklch(0.96 0.012 250)" }} contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 250)", fontSize: 12 }} />
                <Bar dataKey="count" fill="oklch(0.52 0.20 254)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardTitle>CAPEX Allocation</CardTitle>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={capexAllocation} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {capexAllocation.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 250)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardTitle>Risk Heatmap (PoF × CoF)</CardTitle>
          <div className="space-y-1">
            <div className="flex">
              <div className="w-8" />
              {[1, 2, 3, 4, 5].map((cof) => (
                <div key={cof} className="flex-1 text-center text-[10px] text-muted-foreground">
                  CoF {cof}
                </div>
              ))}
            </div>
            {heatmap
              .slice()
              .reverse()
              .map((row, rowIndex) => {
                const pof = 5 - rowIndex;
                return (
                  <div key={pof} className="flex items-center gap-1">
                    <div className="w-8 text-[10px] text-muted-foreground">PoF {pof}</div>
                    {row.map((cell, cofIndex) => {
                      const score = pof * (cofIndex + 1);
                      const bg = score >= 20 ? "bg-destructive" : score >= 12 ? "bg-warning" : score >= 6 ? "bg-info" : "bg-success";
                      return (
                        <div
                          key={cofIndex}
                          className={`flex-1 aspect-square rounded ${bg} ${cell === 0 ? "opacity-30" : "opacity-90"} flex items-center justify-center text-[11px] font-semibold text-white`}
                        >
                          {cell || ""}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle action={<button className="text-xs font-medium text-primary hover:underline">View all</button>}>
            Recent Activity
          </CardTitle>
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Action</th>
                  <th className="px-2 py-2 font-medium">Target</th>
                  <th className="px-2 py-2 font-medium">User</th>
                  <th className="px-2 py-2 font-medium text-right">When</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity) => (
                  <tr key={activity.id} className="border-t border-border">
                    <td className="px-2 py-3 font-medium text-foreground">{activity.action}</td>
                    <td className="px-2 py-3 text-muted-foreground">{activity.target}</td>
                    <td className="px-2 py-3 text-muted-foreground">{activity.user}</td>
                    <td className="px-2 py-3 text-right text-xs text-muted-foreground">{activity.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
