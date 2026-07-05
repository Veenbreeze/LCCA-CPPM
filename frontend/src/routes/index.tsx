import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Boxes,
  ShieldAlert,
  FolderKanban,
  Wallet,
  ArrowUpRight,
  Activity,
  Calendar,
} from "lucide-react";
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
import {
  PageHeader,
  StatCard,
  Card,
  CardTitle,
  Badge,
  Alert,
  KpiStrip,
} from "@/components/ui-kit";
import { useAssets } from "@/hooks/useAssets";
import { useProjects } from "@/hooks/useProjects";
import { useRisk } from "@/hooks/useRisk";
import { useNotifications } from "@/hooks/use-notifications";

export const Route = createFileRoute("/")({ component: Dashboard });

const COLORS = [
  "oklch(0.52 0.20 254)",
  "oklch(0.58 0.16 155)",
  "oklch(0.72 0.16 75)",
  "oklch(0.56 0.22 25)",
  "oklch(0.55 0.18 295)",
];

const formatLevel = (score: number) => {
  if (score >= 100) return "Critical";
  if (score >= 50) return "High";
  if (score >= 20) return "Medium";
  return "Low";
};

const today = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
    const level = formatLevel(Number(risk.combined_score || risk.computed_risk_score));
    return level === "High" || level === "Critical";
  }).length;
  const avgCondition =
    assets.length === 0
      ? 0
      : assets.reduce((sum, asset) => sum + Number(asset.condition_rating), 0) / assets.length;
  const avgRul =
    assets.length === 0
      ? 0
      : assets.reduce((sum, asset) => sum + Number(asset.remaining_useful_life), 0) /
        assets.length;

  const conditionDist = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `Rating ${rating}`,
    count: assets.filter((asset) => Math.round(Number(asset.condition_rating)) === rating).length,
  }));

  const lifecycleDist = [
    { stage: "Renewal", key: "renewal" },
    { stage: "Replacement", key: "replacement" },
    { stage: "Refurbishment", key: "refurbishment" },
    { stage: "Expansion", key: "expansion" },
  ].map((row) => ({
    ...row,
    count: assets.filter((asset) => asset.lifecycle_stage === row.key).length,
  }));

  const capexAllocation = projects.slice(0, 6).map((project) => ({
    name: project.name.split(" ").slice(0, 2).join(" "),
    value: Number(project.budget),
  }));

  const heatmap = Array.from({ length: 5 }, (_, pofIdx) =>
    Array.from({ length: 5 }, (_, cofIdx) => {
      const pof = pofIdx + 1;
      const cof = cofIdx + 1;
      return risks.filter(
        (risk) =>
          Math.min(5, Math.max(1, Math.round(Number(risk.probability_of_failure)))) === pof &&
          Math.min(5, Math.max(1, Math.round(Number(risk.consequence_of_failure)))) === cof,
      ).length;
    }),
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
          variant: "info" as const,
        })),
        ...inspections.slice(0, 2).map((record) => ({
          id: `inspection-${record.id}`,
          action: "Inspection logged",
          target: record.asset_name ?? `Asset ${record.asset}`,
          user: "Maintenance",
          time: record.inspection_date,
          variant: "success" as const,
        })),
      ]
        .sort((a, b) => b.time.localeCompare(a.time))
        .slice(0, 5),
    [inspections, risks],
  );

  return (
    <div>
      {/* Hero panel — gradient with KPI strip */}
      <div className="mb-7 overflow-hidden rounded-2xl border border-border gradient-hero text-primary-foreground shadow-elevated">
        <div className="relative p-6 sm:p-8">
          <div className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }} />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Portfolio Overview
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Lifecycle Cost Analysis & Capital Project Portfolio
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/75">
                Real-time view of asset health, criticality-weighted risk, and capital programme
                performance.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/70">
              <Calendar className="h-3.5 w-3.5" />
              <span>As of {today()}</span>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-[11px] sm:grid-cols-4">
            {[
              { label: "Assets tracked", value: loading ? "—" : String(totalAssets) },
              { label: "Mean condition", value: loading ? "—" : avgCondition.toFixed(2) + " / 5" },
              {
                label: "Mean RUL",
                value: loading ? "—" : avgRul.toFixed(1) + " yr",
              },
              {
                label: "CAPEX programme",
                value: loading ? "—" : "$" + (totalCapex / 1_000_000).toFixed(2) + "M",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-white/55 uppercase tracking-[0.1em]">{item.label}</div>
                <div className="mt-1 text-xl font-bold tracking-tight num">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PageHeader
        eyebrow="Executive Summary"
        title="Key Performance Indicators"
        subtitle="Snapshot of portfolio scale, risk exposure and capital deployment"
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
          hint="Tracked across portfolio"
          icon={Boxes}
          trend={{ value: "+5 this quarter", positive: true }}
        />
        <StatCard
          label="High-Risk Assets"
          value={loading ? "…" : highRisk.toString()}
          hint="Critical + High band"
          icon={ShieldAlert}
          accent="destructive"
          trend={{ value: "all high-risk assets", positive: false }}
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
          accent="info"
        />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" padded={false}>
          <div className="p-5">
            <CardTitle
              subtitle="Distribution of assets by condition rating (1 = poor, 5 = excellent)"
              action={<Badge variant="info" dot>Live</Badge>}
            >
              Asset Condition Distribution
            </CardTitle>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={conditionDist} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="condBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.55 0.2 256)" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="oklch(0.42 0.16 256)" stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(0.9 0.012 250)" vertical={false} />
                  <XAxis
                    dataKey="rating"
                    tick={{ fontSize: 11, fill: "oklch(0.48 0.03 252)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.48 0.03 252)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "oklch(0.42 0.16 256 / 0.08)" }}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid oklch(0.9 0.012 250)",
                      fontSize: 12,
                      boxShadow: "0 4px 12px oklch(0.18 0.04 252 / 0.08)",
                      padding: "8px 12px",
                    }}
                  />
                  <Bar dataKey="count" fill="url(#condBar)" radius={[8, 8, 0, 0]} maxBarSize={64} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="border-t border-border bg-muted/30 px-5 py-3">
            <KpiStrip
              items={[
                {
                  label: "Avg rating",
                  value: loading ? "—" : avgCondition.toFixed(2),
                },
                {
                  label: "Below 3.0",
                  value: loading
                    ? "—"
                    : assets
                        .filter((a) => Number(a.condition_rating) < 3)
                        .length.toString(),
                },
                {
                  label: "Above 4.0",
                  value: loading
                    ? "—"
                    : assets
                        .filter((a) => Number(a.condition_rating) >= 4)
                        .length.toString(),
                },
              ]}
            />
          </div>
        </Card>

        <Card>
          <CardTitle subtitle="Budget share by project">CAPEX Allocation</CardTitle>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={capexAllocation}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="oklch(1 0 0)"
                  strokeWidth={2}
                >
                  {capexAllocation.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid oklch(0.9 0.012 250)",
                    fontSize: 12,
                    boxShadow: "0 4px 12px oklch(0.18 0.04 252 / 0.08)",
                  }}
                  formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Lifecycle stage + heatmap + activity */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle subtitle="Planned intervention type per asset">Lifecycle Stage Mix</CardTitle>
          <div className="space-y-3">
            {lifecycleDist.map((row) => {
              const pct =
                totalAssets > 0 ? Math.round((row.count / totalAssets) * 100) : 0;
              return (
                <div key={row.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{row.stage}</span>
                    <span className="text-muted-foreground num">
                      {row.count} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.55_0.22_280)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardTitle subtitle="Asset count per PoF × CoF cell">Risk Heatmap</CardTitle>
          <div className="space-y-1">
            <div className="flex">
              <div className="w-9" />
              {[1, 2, 3, 4, 5].map((cof) => (
                <div
                  key={cof}
                  className="flex-1 text-center text-[10px] font-semibold text-muted-foreground"
                >
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
                    <div className="w-9 text-[10px] font-semibold text-muted-foreground">
                      PoF {pof}
                    </div>
                    {row.map((cell, cofIndex) => {
                      const score = pof * (cofIndex + 1);
                      const bg =
                        score >= 20
                          ? "bg-destructive"
                          : score >= 12
                            ? "bg-warning"
                            : score >= 6
                              ? "bg-info"
                              : "bg-success";
                      return (
                        <div
                          key={cofIndex}
                          className={`flex-1 aspect-square rounded-md ${bg} ${cell === 0 ? "opacity-25" : "opacity-95"} flex items-center justify-center text-[11px] font-bold text-white shadow-xs num`}
                          title={`PoF ${pof} × CoF ${cofIndex + 1} = ${score}, ${cell} asset(s)`}
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

        <Card padded={false}>
          <div className="p-5">
            <CardTitle
              subtitle="Latest portfolio events"
              action={
                <Link
                  to="/reports"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  View all <ArrowUpRight className="h-3 w-3" />
                </Link>
              }
            >
              Recent Activity
            </CardTitle>
            <ul className="space-y-3">
              {recentActivities.length === 0 && (
                <li className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  <Activity className="mx-auto mb-2 h-5 w-5 opacity-60" />
                  No recent activity recorded.
                </li>
              )}
              {recentActivities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3"
                >
                  <Badge variant={activity.variant} dot size="sm">
                    {activity.action}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground truncate">
                      {activity.target}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {activity.user} · {activity.time}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
