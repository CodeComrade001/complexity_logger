export type DatasetKey = "typescript" | "python" | "csharp" | "c" | "javascript";

export const DATASETS: Record<DatasetKey, RegExp[]> = {
  typescript: [/\.ts$/],
  javascript: [/\.js$/],
  python: [/\.py$/],
  csharp: [/\.cs$/],
  c: [/\.c$/, /\.h$/],
};

export const IGNORED_PATHS = [
  "node_modules/",
];

export const IGNORED_FILES = [
  "package.json",
];

export const BACKEND_LANGUAGES = [
  { key: "typescript", label: "TypeScript" },
  { key: "javascript", label: "JavaScript" },
  { key: "python", label: "Python" },
  { key: "java", label: "Java" },
  { key: "csharp", label: "C#" },
  { key: "c", label: "C" },
] as const;

export type BackendLanguageKey = typeof BACKEND_LANGUAGES[number]["key"];



export type ComplexityReason = {
  type: "time" | "space";
  pattern: string;
  detail: string;
  impact?: "low" | "medium" | "high" | "critical";
  confidence?: number;
  lineNumber?: number;
};

export type MethodPreview = {
  id: string;
  kind: "method";
  name: string;
  startLine: number;
  endLine: number;
  text: string;

  timeComplexity: string;
  spaceComplexity: string;

  timeScore: number;
  spaceScore: number;
  totalScore: number;

  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;

  reasons: ComplexityReason[];
};

