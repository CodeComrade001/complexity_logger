export type BackendLanguageKey = 'typescript' | 'javascript' | 'csharp' | 'python' | 'java';

export interface SingleFile {
  id: string;
  name: string;
  type: 'file';
  language: BackendLanguageKey;
  size: number;
  dir: string;
  file: File;
}

export interface MethodPreview {
  name: string;
  complexity: number;
  lineStart: number;
  lineEnd: number;
  type: string;
}

export const BACKEND_LANGUAGES: { key: BackendLanguageKey; label: string }[] = [
  { key: 'typescript', label: 'TypeScript' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'csharp', label: 'C#' },
  { key: 'python', label: 'Python' },
  { key: 'java', label: 'Java' },
];

export const IGNORED_PATHS = ['node_modules', '.git', 'dist', 'build', 'bin', 'obj'];
export const IGNORED_FILES = ['package-lock.json', 'yarn.lock', '.DS_Store', 'Thumbs.db'];

export const DATASETS: Record<BackendLanguageKey, RegExp[]> = {
  typescript: [/\.ts$/, /\.tsx$/],
  javascript: [/\.js$/, /\.jsx$/],
  csharp: [/\.cs$/],
  python: [/\.py$/],
  java: [/\.java$/],
};