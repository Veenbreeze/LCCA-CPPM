// Mock data — replace with live API calls (see services/api.ts)
// JSON shape mirrors a Django REST Framework serializer output.

export type AssetStatus = "Operational" | "Under Maintenance" | "Decommissioned";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type ProjectStatus = "Planning" | "In Progress" | "On Hold" | "Completed";

export interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  condition: number; // 1-5
  rul: number; // years
  status: AssetStatus;
  installed: string;
  value: number;
}

export interface ConditionRecord {
  id: string;
  asset_id: string;
  asset_name: string;
  inspection_date: string;
  score: number;
  inspector: string;
  notes: string;
}

export interface RiskItem {
  id: string;
  asset_id: string;
  asset_name: string;
  pof: number; // 1-5
  cof: number; // 1-5
  risk_score: number;
  level: RiskLevel;
}

export interface CapitalProject {
  id: string;
  name: string;
  asset: string;
  budget: number;
  spent: number;
  start: string;
  end: string;
  status: ProjectStatus;
  owner: string;
}

export const mockAssets: Asset[] = [
  { id: "AST-1001", name: "Primary Substation Transformer", type: "Electrical", location: "Plant A", condition: 4, rul: 12, status: "Operational", installed: "2012-03-10", value: 1250000 },
  { id: "AST-1002", name: "Cooling Tower #3", type: "Mechanical", location: "Plant B", condition: 2, rul: 3, status: "Under Maintenance", installed: "2005-06-22", value: 480000 },
  { id: "AST-1003", name: "Pipeline Segment 12-A", type: "Pipeline", location: "Field North", condition: 3, rul: 8, status: "Operational", installed: "2010-09-01", value: 920000 },
  { id: "AST-1004", name: "Boiler Unit B-7", type: "Mechanical", location: "Plant A", condition: 1, rul: 1, status: "Under Maintenance", installed: "1998-11-15", value: 760000 },
  { id: "AST-1005", name: "SCADA Server Cluster", type: "IT", location: "Control Room", condition: 5, rul: 7, status: "Operational", installed: "2020-01-12", value: 310000 },
  { id: "AST-1006", name: "Wastewater Pump 4", type: "Mechanical", location: "Plant C", condition: 2, rul: 4, status: "Operational", installed: "2008-04-30", value: 215000 },
  { id: "AST-1007", name: "HV Switchgear Panel", type: "Electrical", location: "Plant B", condition: 4, rul: 15, status: "Operational", installed: "2016-07-19", value: 540000 },
  { id: "AST-1008", name: "Compressor Station K2", type: "Mechanical", location: "Field South", condition: 3, rul: 6, status: "Operational", installed: "2011-02-08", value: 685000 },
];

export const mockConditions: ConditionRecord[] = [
  { id: "CR-001", asset_id: "AST-1004", asset_name: "Boiler Unit B-7", inspection_date: "2025-02-12", score: 1.5, inspector: "J. Mensah", notes: "Severe corrosion on tube bundle. Recommend replacement." },
  { id: "CR-002", asset_id: "AST-1002", asset_name: "Cooling Tower #3", inspection_date: "2025-03-04", score: 2.2, inspector: "A. Owusu", notes: "Fan blade vibration above threshold." },
  { id: "CR-003", asset_id: "AST-1001", asset_name: "Primary Substation Transformer", inspection_date: "2025-03-22", score: 4.1, inspector: "K. Asante", notes: "Oil quality nominal. Schedule next test in 12 months." },
  { id: "CR-004", asset_id: "AST-1006", asset_name: "Wastewater Pump 4", inspection_date: "2025-04-01", score: 2.8, inspector: "S. Boateng", notes: "Bearing wear detected; lubricate and re-monitor." },
];

export const mockRisks: RiskItem[] = mockAssets.map((a) => {
  const pof = 6 - a.condition;
  const cof = Math.min(5, Math.ceil(a.value / 250000));
  const score = pof * cof;
  const level: RiskLevel =
    score >= 20 ? "Critical" : score >= 12 ? "High" : score >= 6 ? "Medium" : "Low";
  return { id: `RSK-${a.id}`, asset_id: a.id, asset_name: a.name, pof, cof, risk_score: score, level };
});

export const mockProjects: CapitalProject[] = [
  { id: "PRJ-2001", name: "Boiler B-7 Replacement", asset: "AST-1004", budget: 850000, spent: 240000, start: "2025-01-15", end: "2025-09-30", status: "In Progress", owner: "E. Adjei" },
  { id: "PRJ-2002", name: "Cooling Tower Refurbishment", asset: "AST-1002", budget: 320000, spent: 80000, start: "2025-03-01", end: "2025-08-15", status: "In Progress", owner: "M. Quaye" },
  { id: "PRJ-2003", name: "SCADA Cybersecurity Upgrade", asset: "AST-1005", budget: 145000, spent: 0, start: "2025-06-01", end: "2025-12-01", status: "Planning", owner: "R. Tetteh" },
  { id: "PRJ-2004", name: "Substation Transformer Overhaul", asset: "AST-1001", budget: 420000, spent: 420000, start: "2024-04-01", end: "2024-11-30", status: "Completed", owner: "L. Nkrumah" },
  { id: "PRJ-2005", name: "Pipeline 12-A Inline Inspection", asset: "AST-1003", budget: 180000, spent: 30000, start: "2025-05-01", end: "2025-07-15", status: "On Hold", owner: "P. Anane" },
];

export const conditionTrend = [
  { year: "2019", score: 4.6 }, { year: "2020", score: 4.3 }, { year: "2021", score: 3.9 },
  { year: "2022", score: 3.5 }, { year: "2023", score: 3.0 }, { year: "2024", score: 2.4 }, { year: "2025", score: 1.5 },
];

export const recentActivities = [
  { id: 1, action: "Inspection logged", target: "Boiler Unit B-7", user: "J. Mensah", time: "2h ago" },
  { id: 2, action: "Project budget updated", target: "Cooling Tower Refurb", user: "M. Quaye", time: "5h ago" },
  { id: 3, action: "Risk re-scored", target: "Pipeline 12-A", user: "System", time: "1d ago" },
  { id: 4, action: "Asset added", target: "HV Switchgear Panel", user: "Admin", time: "2d ago" },
  { id: 5, action: "Report exported (PDF)", target: "Q1 CAPEX Analysis", user: "L. Nkrumah", time: "3d ago" },
];
