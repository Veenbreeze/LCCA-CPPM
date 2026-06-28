import { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/* ───────────────────────────── PageHeader ───────────────────────────── */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  meta,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
            <span className="inline-block h-1 w-6 rounded-full bg-primary" />
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        )}
        {meta && <div className="mt-3 flex flex-wrap gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ───────────────────────────── StatCard ───────────────────────────── */

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  accent = "primary",
  footer,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  icon?: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "success" | "warning" | "destructive" | "info";
  footer?: ReactNode;
}) {
  const accentMap = {
    primary: "from-primary/15 to-primary/0 text-primary",
    success: "from-success/15 to-success/0 text-success",
    warning: "from-warning/20 to-warning/0 text-warning",
    destructive: "from-destructive/15 to-destructive/0 text-destructive",
    info: "from-info/15 to-info/0 text-info",
  };
  const accentBar = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
    info: "bg-info",
  };
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all hover:shadow-elevated hover:-translate-y-0.5">
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-[3px]",
          accentBar[accent],
        )}
      />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {label}
            </div>
            <div className="mt-2.5 text-3xl font-bold tracking-tight text-foreground num">
              {value}
            </div>
            {hint && (
              <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
                accentMap[accent],
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        {trend && (
          <div
            className={cn(
              "mt-3 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
              trend.positive
                ? "border-success/30 bg-success/10 text-success"
                : "border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {trend.positive ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {trend.value}
          </div>
        )}
        {footer && (
          <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── Card ───────────────────────────── */

export function Card({
  children,
  className,
  padded = true,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card shadow-soft card-rule",
        padded && "p-5",
        interactive && "transition-all hover:shadow-elevated hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  action,
  subtitle,
}: {
  children: ReactNode;
  action?: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{children}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ───────────────────────────── Badge ───────────────────────────── */

export function Badge({
  children,
  variant = "default",
  dot = false,
  size = "md",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "destructive" | "info" | "muted";
  dot?: boolean;
  size?: "sm" | "md";
}) {
  const map = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/25",
    warning: "bg-warning/15 text-warning-foreground border-warning/40",
    destructive: "bg-destructive/10 text-destructive border-destructive/25",
    info: "bg-info/10 text-info border-info/25",
    muted: "bg-muted text-muted-foreground border-border",
  };
  const dotColor = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
    info: "bg-info",
    muted: "bg-muted-foreground/60",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
        map[variant],
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[variant])} />
      )}
      {children}
    </span>
  );
}

/* ───────────────────────────── DataTable shell ───────────────────────────── */

export function DataTable({
  children,
  className,
  caption,
}: {
  children: ReactNode;
  className?: string;
  caption?: ReactNode;
}) {
  return (
    <div className="relative overflow-x-auto rounded-lg border border-border bg-card">
      <table className={cn("w-full text-sm table-shell", className)}>{children}</table>
      {caption && (
        <div className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          {caption}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────── ModalShell ───────────────────────────── */

export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = "md",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const widthClass =
    size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "w-full overflow-hidden rounded-xl border border-border bg-card shadow-deep",
          widthClass,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border bg-gradient-to-b from-muted/40 to-transparent px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── Buttons ───────────────────────────── */

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:opacity-95 hover:shadow-elevated active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-ring",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 focus-ring",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ───────────────────────────── KPI strip ───────────────────────────── */

export function KpiStrip({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-card/70 px-4 py-2 text-xs">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-1.5">
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-semibold text-foreground num">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export { Alert } from "@/components/ui/alert";
