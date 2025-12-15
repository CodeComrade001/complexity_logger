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