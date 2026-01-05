export interface AnalyzeFileUpload {
  name: string;
  language: string;
  size: number;
  file: File;
}

/* =========================
   ROOT RESPONSE
   ========================= */

export interface FileComplexityReceivedPayload {
  success: boolean;
  message: string;
  data: FileComplexityData;
}

/* =========================
   DATA CONTAINER
   ========================= */

export interface FileComplexityData {
  freeComplexityReport: ComplexityReport;
  paidComplexityReport: ComplexityReport;
}

/* =========================
   REPORT
   ========================= */

export interface ComplexityReport {
  nameOfFile: string;
  success: boolean;
  generatedAt: string; // ISO date string
  tierUsed: "free" | "paid";
  summary: ComplexitySummary;
  details: ComplexityDetails;
}

/* =========================
   SUMMARY
   ========================= */

export interface ComplexitySummary {
  itemsAnalyzed: number;
  totalScore: number;
  avgScore: number;
  avgTimeComplexity: string;
  avgSpaceComplexity: string;
  criticalRiskCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

/* =========================
   DETAILS ROOT
   ========================= */

export interface ComplexityDetails {
  functions: ComplexityUnit[];
  arrows: ComplexityUnit[];
  methods: ComplexityUnit[];
  constructors: ComplexityUnit[];
  getters: ComplexityUnit[];
  setters: ComplexityUnit[];
  callbacks: ComplexityUnit[];
  handlers: ComplexityUnit[];
  staticBlocks: ComplexityUnit[];
  topLevelStatements: ComplexityUnit[];
}

/* =========================
   CORE ANALYSIS UNIT
   ========================= */

export interface ComplexityUnit {
  id: string;
  kind: ComplexityUnitKind;
  name: string;
  startLine: number;
  endLine: number;
  text: string;

  timeComplexity: ComplexityMetric;
  spaceComplexity: ComplexityMetric;

  timeScore: number;
  spaceScore: number;
  totalScore: number;

  riskLevel: RiskLevel;
  confidence: number;

  reasons: ComplexityReason[];
  matchedKeywords: string[];

  tierUsed: "free" | "paid";
}

/* =========================
   ENUM-LIKE TYPES
   ========================= */

export type ComplexityUnitKind =
  | "functions"
  | "arrows"
  | "methods"
  | "constructors"
  | "getters"
  | "setters"
  | "callbacks"
  | "handlers"
  | "staticBlocks"
  | "topLevelStatements";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/* =========================
   METRICS
   ========================= */

export interface ComplexityMetric {
  notation: string; // e.g. O(n), O(1), O(n^k)
  confidence: number;
  flags: string[];
}


export interface RiskThresholdConfig {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface RiskCounts {
  criticalRiskCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

/* =========================
   REASONS
   ========================= */

export interface ComplexityReason {
  type: "time" | "space";
  pattern: string;
  detail: string;
  impact: "low" | "medium" | "high" | "critical";
  confidence: number;
  lineNumber: number;
}

export type ViewMode = "card" | "list" | "table";
