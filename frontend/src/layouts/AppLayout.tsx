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
          "fixed inset-y-0 left-0 z-40 flex h-screen flex-col bg-primary text-primary-foreground transition-all duration-300",
          collapsed ? "w-20" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-primary-foreground/15 px-4">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 text-primary-foreground font-bold shadow-elevated backdrop-blur-sm">
              <span className="text-[13px] tracking-tight">LC</span>
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-sm font-semibold">LCCA-CPPM</div>
                <div className="text-[10px] text-primary-foreground/60">Lifecycle & Capital</div>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-primary-foreground/60 transition-colors hover:bg-white/10 hover:text-primary-foreground"
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 space-y-5 px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/50">
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
                          ? "bg-white text-primary shadow-elevated"
                          : "text-primary-foreground/75 hover:bg-white/10 hover:text-primary-foreground",
                      )}
                    >
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
          <div className="border-t border-primary-foreground/15 p-4">
            <div className="rounded-lg bg-white/10 p-3 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold tracking-tight text-primary-foreground">
                  System Status
                </span>
                <span className="inline-flex items-center gap-1 text-success">
                  Operational
                </span>
              </div>
              <div className="mt-1.5 text-primary-foreground/70">
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
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-all duration-300",
          collapsed ? "lg:ml-20" : "lg:ml-72",
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 gradient-sidebar px-4 text-sidebar-foreground shadow-elevated lg:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            title="Open navigation menu"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md hover:bg-sidebar-accent"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/70">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span>Active</span>
            </span>
            <button
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <NotificationsBell />
            <div className="flex items-center gap-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-2 py-1.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.22_280)] text-primary-foreground">
                <User className="h-4 w-4" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar" />
              </div>
              <div className="hidden sm:block pr-1 text-[11px] leading-tight">
                <div className="font-semibold tracking-tight text-sidebar-foreground">Eng. Victor</div>
                <div className="text-sidebar-foreground/60">Asset Manager</div>
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
