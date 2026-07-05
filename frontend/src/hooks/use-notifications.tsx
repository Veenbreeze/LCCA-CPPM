import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AssetService, type AssetRecord } from "@/services/assetService";
import { ConditionService, type ConditionRecord } from "@/services/conditionService";
import { RiskService, type RiskRecord } from "@/services/riskService";

export type NotificationKind = "risk" | "inspection";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  href: string;
  severity: "high" | "critical" | "info";
  createdAt: string; // ISO
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  read: Set<string>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  reviewedInspections: Set<string>;
  markInspectionReviewed: (id: string) => void;
  addInspection: (record: ConditionRecord) => Promise<ConditionRecord>;
  inspections: ConditionRecord[];
  risks: RiskRecord[];
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const STORAGE_READ = "lcacppm-notif-read";
const STORAGE_REVIEWED = "lcacppm-insp-reviewed";

function loadSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistSet(key: string, set: Set<string>) {
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {}
}

function withAssetName<T extends { asset: number; asset_name?: string }>(
  items: T[],
  map: Map<number, string>,
) {
  return items.map((item) => ({
    ...item,
    asset_name: map.get(item.asset) ?? String(item.asset),
  }));
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [risks, setRisks] = useState<RiskRecord[]>([]);
  const [inspections, setInspections] = useState<ConditionRecord[]>([]);
  const [read, setRead] = useState<Set<string>>(new Set());
  const [reviewedInspections, setReviewedInspections] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRead(loadSet(STORAGE_READ));
    setReviewedInspections(loadSet(STORAGE_REVIEWED));

    const loadNotifications = async () => {
      try {
        const [assetData, riskData, conditionData] = await Promise.all([
          AssetService.list(),
          RiskService.list(),
          ConditionService.list(),
        ]);

        const assetMap = new Map(assetData.map((asset) => [asset.id, asset.name]));
        setAssets(assetData);
        setRisks(withAssetName(riskData, assetMap));
        setInspections(withAssetName(conditionData, assetMap));
      } catch (error) {
        console.error("Unable to fetch notification feeds", error);
      }
    };

    void loadNotifications();
  }, []);

  const notifications = useMemo<AppNotification[]>(() => {
    const formatNumber = (value: unknown) => {
      const numberValue = Number(value);
      return Number.isFinite(numberValue) ? numberValue : 0;
    };

    const riskNotifs: AppNotification[] = risks
      .map((risk) => ({
        ...risk,
        computed_risk_score: formatNumber(risk.computed_risk_score),
      }))
      .filter((risk) => risk.computed_risk_score >= 50)
      .map((risk) => ({
        id: `risk-${risk.id}`,
        kind: "risk",
        title: `Risk review needed: ${risk.asset_name}`,
        message: `Risk score ${risk.computed_risk_score.toFixed(1)} for asset ${risk.asset_name}.`,
        href: "/risk",
        severity: risk.computed_risk_score >= 100 ? "critical" : "high",
        createdAt: new Date().toISOString(),
      }));

    const inspectionNotifs: AppNotification[] = inspections
      .map((inspection) => ({
        ...inspection,
        condition_score: formatNumber(inspection.condition_score),
      }))
      .filter((inspection) => !reviewedInspections.has(String(inspection.id)))
      .map((inspection) => ({
        id: `insp-${inspection.id}`,
        kind: "inspection",
        title: `New inspection: ${inspection.asset_name}`,
        message: `Condition score ${inspection.condition_score.toFixed(1)} on ${inspection.inspection_date}.`,
        href: "/condition",
        severity:
          inspection.condition_score < 2
            ? "critical"
            : inspection.condition_score < 3
              ? "high"
              : "info",
        createdAt: inspection.inspection_date,
      }));

    return [...riskNotifs, ...inspectionNotifs].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }, [risks, inspections, reviewedInspections]);

  const unreadCount = notifications.filter((notification) => !read.has(notification.id)).length;

  const markAsRead = useCallback((id: string) => {
    setRead((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistSet(STORAGE_READ, next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setRead(() => {
      const next = new Set(notifications.map((notification) => notification.id));
      persistSet(STORAGE_READ, next);
      return next;
    });
  }, [notifications]);

  const markInspectionReviewed = useCallback((id: string) => {
    setReviewedInspections((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistSet(STORAGE_REVIEWED, next);
      return next;
    });
    setRead((prev) => {
      const next = new Set(prev);
      next.add(`insp-${id}`);
      persistSet(STORAGE_READ, next);
      return next;
    });
  }, []);

  const addInspection = useCallback(
    async (record: Omit<ConditionRecord, "id" | "asset_name">) => {
      const created = await ConditionService.create(record);
      const assetMap = new Map(assets.map((asset) => [asset.id, asset.name]));
      setInspections((prev) => [
        { ...created, asset_name: assetMap.get(created.asset) ?? String(created.asset) },
        ...prev,
      ]);
      return created;
    },
    [assets],
  );

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    read,
    markAsRead,
    markAllAsRead,
    reviewedInspections,
    markInspectionReviewed,
    addInspection,
    inspections,
    risks,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
}
