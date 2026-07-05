/* eslint-disable prettier/prettier */
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Boxes,
  Activity,
  ShieldAlert,
  FolderKanban,
  Calculator,
  FileBarChart,
  ListChecks,
  ChevronLeft,
  Menu,
  User,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { NotificationsBell } from "@/components/NotificationsBell";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pageTitle: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, pageTitle: "Portfolio Dashboard" },
    ],
  },
  {
    label: "Asset Lifecycle",
    items: [
      { to: "/assets", label: "Asset Management", icon: Boxes, pageTitle: "Asset Management" },
      { to: "/condition", label: "Condition & RUL", icon: Activity, pageTitle: "Condition Assessment & RUL" },
      { to: "/risk", label: "Risk & Criticality", icon: ShieldAlert, pageTitle: "Risk & Prioritization" },
      { to: "/prioritisation", label: "Intervention Priority", icon: ListChecks, pageTitle: "Intervention Prioritisation" },
    ],
  },
  {
    label: "Capital Planning",
    items: [
      { to: "/projects", label: "Capital Projects", icon: FolderKanban, pageTitle: "Capital Improvement Projects" },
      { to: "/scenario", label: "CAPEX Scenarios", icon: Calculator, pageTitle: "Lifecycle Cost & Scenario Analysis" },
      { to: "/reports", label: "Reports", icon: FileBarChart, pageTitle: "Reports & Exports" },
    ],
  },
];

const allItems = navSections.flatMap((section) => section.items);

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, toggle } = useTheme();

  const activeItem = useMemo(
    () =>
      allItems.find((item) => item.to === location.pathname) ?? allItems[0],
    [location.pathname],
  );

  const breadcrumbSection = useMemo(
    () =>
      navSections.find((section) =>
        section.items.some((item) => item.to === location.pathname),
      ),
    [location.pathname],
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col gradient-sidebar text-sidebar-foreground transition-all duration-300 lg:static",
          collapsed ? "w-20" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-[oklch(0.55_0.22_280)] text-primary-foreground font-bold shadow-elevated">
              <span className="text-[13px] tracking-tight">LC</span>
              {/* <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar" /> */}
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-sm font-semibold">LCA·CPPM</div>
                <div className="text-[10px] text-sidebar-foreground/60">Lifecycle & Capital</div>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
                  {section.label}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = location.pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-elevated"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      )}
                    >
                      {active && !collapsed && (
                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground/80" />
                      )}
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-transform",
                          active ? "" : "group-hover:scale-110",
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer card */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="rounded-lg bg-sidebar-accent/60 p-3 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold tracking-tight text-sidebar-foreground">
                  System Status
                </span>
                <span className="inline-flex items-center gap-1 text-success">
                  {/* <span className="h-2.5 w-1.5 rounded-full bg-success" /> */}
                  Operational
                </span>
              </div>
              <div className="mt-1.5 text-sidebar-foreground/55">
                v1.0.0 · Build {new Date().getFullYear()}
              </div>
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
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-md lg:px-6 shadow-xs">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            title="Open navigation menu"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search assets, projects, reports…"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span>Active</span>
            </span>
            <button
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <NotificationsBell />
            <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-2 py-1.5 shadow-xs">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.22_280)] text-primary-foreground">
                <User className="h-4 w-4" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
              </div>
              <div className="hidden sm:block pr-1 text-[11px] leading-tight">
                <div className="font-semibold tracking-tight">Eng. Victor</div>
                <div className="text-muted-foreground">Asset Manager</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
