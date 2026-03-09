export type KPI = {
  label: string;
  value: string;
  trend?: string;
  tone?: "neutral" | "good" | "warning" | "critical";
};

export type RecordLink = {
  type: string;
  id: string;
  label: string;
};

export type ProjectSummary = {
  id: string;
  code: string;
  name: string;
  phase: string;
  health: "GREEN" | "AMBER" | "RED";
  sponsor: string;
  manager: string;
  openIssues: number;
  overdueActions: number;
  openDeficiencies: number;
};

export type WorkRecord = {
  id: string;
  title: string;
  status: string;
  owner: string;
  company: string;
  parentId?: string;
  level?: number;
  startDate?: string;
  endDate?: string;
  percentComplete?: number;
  dueDate?: string;
  priority?: string;
  severity?: string;
  ageDays?: number;
  area?: string;
  discipline?: string;
  system?: string;
  assetId?: string;
  assetName?: string;
  equipmentType?: string;
  assetStatus?: string;
  checklistTemplate?: string;
  checklistStatus?: string;
  ashraeLevel?: string;
  summary?: string;
  links?: RecordLink[];
};
