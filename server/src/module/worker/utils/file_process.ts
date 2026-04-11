import { Project, SourceFile } from "ts-morph";
import { CompilerInterface } from "../../../compilers/TS_JS_Compiler/ts_js_bootstrap.js";
import { getCachedResult, hashContent, setCachedResult } from "../cache/workerCache.js";

const MAX_PROJECT_FILES = 1000;

export function enforceProjectLimit(project: Project) {
  const files = project.getSourceFiles();

  if (files.length > MAX_PROJECT_FILES) {
    const excess = files.length - MAX_PROJECT_FILES;

    for (let i = 0; i < excess; i++) {
      files[i].delete(); // remove oldest
    }

    console.log(`🧹 Evicted ${excess} old files from project`);
  }
}

export async function processFile(
  f: any,
  project: Project,
  compiler: CompilerInterface
) {
  const fileHash = hashContent(f.content);

  // ✅ CACHE HIT
  const cached = getCachedResult(fileHash);
  if (cached) return cached;

  // ✅ SOURCE FILE CREATION / REUSE
  let sourceFile: SourceFile;

  const existing = project.getSourceFile(f.name);

  if (existing) {
    existing.replaceWithText(f.fileContent ?? f.content);
    sourceFile = existing;
  } else {
    sourceFile = project.createSourceFile(
      f.name,
      f.fileContent ?? f.content,
      { overwrite: true }
    );
  }

  // ✅ EXTRACT (ONLY RESPONSIBILITY HERE)
  const extracted = await compiler.utils.extract([
    "functions",
    "arrows",
    "methods",
    "constructors",
    "getters",
    "setters",
    "callbacks",
    "handlers",
    "staticBlocks",
    "topLevelStatements"
  ], sourceFile);
  console.log("Turbo Log  ~ processFile ~ extracted:", extracted);

  // ✅ NORMALIZE
  const normalized = await compiler.utils.normalize({
    [extracted.name]: extracted.data,
  });

  if (!normalized) {
    return {
      success: false,
      message: "Normalization failed",
      data: null,
    };
  }

  // ✅ EXECUTE
  const result = await compiler.compiler.execute(normalized);

  // ✅ CACHE STORE
  setCachedResult(fileHash, result);

  return result;
}

export const GetUnitPartOfCode_BATCHLIMIT = 30;

export async function processFilesBatch(
  files: any[],
  project: Project,
  compiler: CompilerInterface
) {
  const results: any[] = [];
  const seen = new Map(); // dedupe within batch

  for (let i = 0; i < files.length; i += GetUnitPartOfCode_BATCHLIMIT) {
    const batch = files.slice(i, i + GetUnitPartOfCode_BATCHLIMIT);

    const batchResults = await Promise.all(
      batch.map(async (f) => {
        const hash = hashContent(f.content);

        // ✅ DEDUPLICATION
        if (seen.has(hash)) return seen.get(hash);

        const res = await processFile(f, project, compiler);
        seen.set(hash, res);
        return res;
      })
    );

    results.push(...batchResults);
  }

  return results;
}