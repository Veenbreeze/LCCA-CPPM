import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, ShieldAlert, ClipboardCheck, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, type AppNotification } from "@/hooks/use-notifications";

function severityClasses(severity: AppNotification["severity"]) {
  switch (severity) {
    case "critical":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "high":
      return "bg-warning/15 text-warning-foreground border-warning/40";
    default:
      return "bg-info/10 text-info border-info/30";
  }
}

export function NotificationsBell() {
  const { notifications, unreadCount, read, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-sidebar-accent"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-elevated">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Notifications</div>
              <div className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </div>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-muted"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No notifications right now.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((n) => {
                  const isRead = read.has(n.id);
                  const Icon = n.kind === "risk" ? ShieldAlert : ClipboardCheck;
                  return (
                    <li key={n.id} className={cn("relative", !isRead && "bg-accent/30")}>
                      <Link
                        to={n.href}
                        onClick={() => {
                          markAsRead(n.id);
                          setOpen(false);
                        }}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                            severityClasses(n.severity),
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-sm font-medium leading-snug">{n.title}</div>
                            {!isRead && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                          <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {n.message}
                          </div>
                        </div>
                      </Link>
                      {!isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          aria-label="Mark as read"
                          className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground group-hover:flex"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-border bg-muted/30 px-4 py-2 text-center">
            <Link
              to="/risk"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-primary hover:underline"
            >
              View risk register →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
