export type ViewMode = "card" | "list" | "table";
export interface MethodResult {
  id: string;
  name: string;
  startLine: number;
  endLine: number;
  timeComplexity: string;
  spaceComplexity: string;
  totalScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reasons: { type: string; detail: string }[];
}