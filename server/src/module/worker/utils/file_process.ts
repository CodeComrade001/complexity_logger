import { Project, SourceFile } from "ts-morph";
import { CompilerInterface } from "../../../compilers/TS_JS_Compiler/ts_js_bootstrap.js";
import { getCachedResult, hashContent, setCachedResult } from "../cache/workerCache.js";

const MAX_PROJECT_FILES = 1000;
export const GetUnitPartOfCode_BATCHLIMIT = 50;

export function enforceProjectLimit(project: Project) {
  const files = project.getSourceFiles();

  if (files.length > MAX_PROJECT_FILES) {
    const excess = files.length - MAX_PROJECT_FILES;

    for (let i = 0; i < excess; i++) {
      files[i].delete();
    }

    console.log(`🧹 Evicted ${excess} old files from project`);
  }
}

export async function processFile(
  input: any | any[],
  project: Project,
  compiler: CompilerInterface
) {
  const files = Array.isArray(input) ? input : [input];

  if (files.length > GetUnitPartOfCode_BATCHLIMIT) {
    throw new Error(`Max batch size is ${GetUnitPartOfCode_BATCHLIMIT}`);
  }

  const seen = new Map();
  const extractedBatch: any[] = [];

  for (const file of files) {
    const content = file.fileContent ?? file.content;
    const fileHash = hashContent(content);

    // ✅ CACHE HIT
    if (seen.has(fileHash)) {
      continue;
    }

    const cached = getCachedResult(fileHash);
    if (cached) {
      seen.set(fileHash, cached);
      continue;
    }

    // ✅ create/update source file
    let sourceFile: SourceFile;

    const existing = project.getSourceFile(file.name);

    if (existing) {
      existing.replaceWithText(content);
      sourceFile = existing;
    } else {
      sourceFile = project.createSourceFile(file.name, content, {
        overwrite: true,
      });
    }

    enforceProjectLimit(project);

    // ✅ EXTRACT ONLY (NO EXECUTE HERE)
    const extracted = await compiler.utils.extract(
      [
        "functions",
        "arrows",
        "methods",
        "constructors",
        "getters",
        "setters",
        "callbacks",
        "handlers",
        "staticBlocks",
        "topLevelStatements",
      ],
      sourceFile
    );
    console.log("Turbo Log  ~ processFile ~ extracted:", extracted);

    // if (!extracted || !extracted.data) {
    //   throw new Error(`Extraction failed for ${file.name}`);
    // }

    extractedBatch.push({
      hash: fileHash,
      payload: extracted,
    });
  }

  // 🚨 CRITICAL FIX: execute ONCE with ARRAY
  const payloadArray = extractedBatch.map((e) => e.payload[0]);

  if (payloadArray.length === 0) {
    return [];
  }

  const results = await compiler.compiler.execute(payloadArray);
  console.log("Turbo Log  ~ processFile ~ results:", results);

  // ✅ map results back to cache
  results?.data?.forEach((res: any, index: number) => {
    const hash = extractedBatch[index]?.hash;
    if (hash) {
      setCachedResult(hash, res);
      seen.set(hash, res);
    }
  });

  return results;
}

export async function processFilesBatch(
  files: any[],
  project: Project,
  compiler: CompilerInterface
) {
  return processFile(files, project, compiler);
}