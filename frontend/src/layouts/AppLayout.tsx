/* eslint-disable prettier/prettier */
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LayoutDashboard, Boxes, Activity, ShieldAlert, FolderKanban,
  Calculator, FileBarChart, Search, ChevronLeft, Menu, User,
  Sun, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useAssets } from "@/hooks/useAssets";
import { useProjects } from "@/hooks/useProjects";
import { useReports } from "@/hooks/useReports";
import { NotificationsBell } from "@/components/NotificationsBell";
 
const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assets", label: "Asset Management", icon: Boxes },
  { to: "/condition", label: "Condition & RUL", icon: Activity },
  { to: "/risk", label: "Risk & Prioritization", icon: ShieldAlert },
  { to: "/projects", label: "Capital Projects", icon: FolderKanban },
  { to: "/scenario", label: "Scenario Analysis", icon: Calculator },
  { to: "/reports", label: "Reports", icon: FileBarChart },
] as const;

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const { assets } = useAssets();
  const { projects } = useProjects();
  const { reports } = useReports();

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchResults = useMemo(
    () => {
      if (!normalizedQuery) return { assets: [], projects: [], reports: [] };

      return {
        assets: assets
          .filter((asset) =>
            [asset.name, asset.asset_type, asset.location, String(asset.id)]
              .some((field) => field.toLowerCase().includes(normalizedQuery))
          )
          .slice(0, 5),
        projects: projects
          .filter((project) =>
            [project.name, project.status, project.responsible_person, String(project.budget)]
              .some((field) => field.toLowerCase().includes(normalizedQuery))
          )
          .slice(0, 5),
        reports: reports
          .filter((report) =>
            [report.title, report.description, report.updated].some((field) => field.toLowerCase().includes(normalizedQuery))
          )
          .slice(0, 5),
      };
    },
    [normalizedQuery, assets, projects, reports]
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 lg:static",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary text-primary-foreground font-bold">
              LC
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-sm font-semibold">LCCA&CPPM</div>
                <div className="text-[10px] text-sidebar-foreground/60"> Build differently,not perfectly </div>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md hover:bg-sidebar-accent"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="rounded-lg bg-sidebar-accent/50 p-3 text-xs">
              <div className="font-semibold text-sidebar-foreground">LCCA&CPPM</div>
              <div className="mt-0.5 text-sidebar-foreground/60">Version 1.0.0</div>
            </div>
          </div>
        )}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            title="Open navigation menu"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets, projects, reports…"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            {searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-soft">
                <div className="space-y-4 p-4 text-sm">
                  {searchResults.assets.length || searchResults.projects.length || searchResults.reports.length ? (
                    <>
                      {searchResults.assets.length > 0 && (
                        <div>
                          <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Assets</div>
                          <div className="space-y-1">
                            {searchResults.assets.map((asset) => (
                              <Link
                                key={asset.id}
                                to="/assets"
                                className="block rounded-lg px-3 py-2 hover:bg-muted"
                              >
                                <div className="font-medium">{asset.name}</div>
                                <div className="text-xs text-muted-foreground">{asset.asset_type} · {asset.location}</div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.projects.length > 0 && (
                        <div>
                          <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Projects</div>
                          <div className="space-y-1">
                            {searchResults.projects.map((project) => (
                              <Link
                                key={project.id}
                                to="/projects"
                                className="block rounded-lg px-3 py-2 hover:bg-muted"
                              >
                                <div className="font-medium">{project.name}</div>
                                <div className="text-xs text-muted-foreground">{project.status} · ${Number(project.budget).toLocaleString()}</div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.reports.length > 0 && (
                        <div>
                          <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Reports</div>
                          <div className="space-y-1">
                            {searchResults.reports.map((report) => (
                              <Link
                                key={report.id}
                                to="/reports"
                                className="block rounded-lg px-3 py-2 hover:bg-muted"
                              >
                                <div className="font-medium">{report.title}</div>
                                <div className="text-xs text-muted-foreground">{report.description}</div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">No matching assets, projects, or reports.</div>
                  )}
                </div>
              </div>
            )}
          </div> */}

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <NotificationsBell />
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full gradient-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden sm:block text-xs leading-tight pr-1">
                <div className="font-semibold">Eng. Victor</div>
                <div className="text-muted-foreground">Asset Manager</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
