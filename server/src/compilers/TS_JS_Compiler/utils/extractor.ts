import { SourceFile, SyntaxKind } from "ts-morph";
import { FileUploadModel } from "../../../module/file_Interface/fileInterface.js";
import { WorkerFile } from "../../../module/worker/worker_types/workerTypes.js";
import { streamToString } from "../../../module/utils/parserFileData.js";

export enum CodeUnitType {
  FUNCTIONS = "functions",
  ARROWS = "arrows",
  METHODS = "methods",
  CONSTRUCTORS = "constructors",
  GETTERS = "getters",
  SETTERS = "setters",
  CALLBACKS = "callbacks",
  HANDLERS = "handlers",
  STATIC_BLOCKS = "staticBlocks",
  TOP_LEVEL_STATEMENTS = "topLevelStatements",
}


export const extractors: Record<CodeUnitType, (source: SourceFile) => any[]> = {
  [CodeUnitType.FUNCTIONS]: (source) =>
    source.getFunctions(),

  [CodeUnitType.ARROWS]: (source) =>
    source.getDescendantsOfKind(SyntaxKind.ArrowFunction),

  [CodeUnitType.METHODS]: (source) =>
    source.getClasses().flatMap((c: { getMethods: () => any; }) => c.getMethods()),

  [CodeUnitType.CONSTRUCTORS]: (source) =>
    source.getClasses().map((c: { getConstructors: () => any; }) => c.getConstructors()).flat(),

  [CodeUnitType.GETTERS]: (source) =>
    source.getClasses().flatMap((c: { getGetAccessors: () => any; }) => c.getGetAccessors()),

  [CodeUnitType.SETTERS]: (source) =>
    source.getClasses().flatMap((c: { getSetAccessors: () => any; }) => c.getSetAccessors()),

  [CodeUnitType.STATIC_BLOCKS]: (source) =>
    source.getClasses().flatMap((c: { getStaticBlocks: () => any; }) => c.getStaticBlocks()),

  [CodeUnitType.CALLBACKS]: (source) =>
    source.getDescendantsOfKind(SyntaxKind.FunctionExpression),

  [CodeUnitType.HANDLERS]: (source) =>
    source.getDescendantsOfKind(SyntaxKind.FunctionExpression),

  [CodeUnitType.TOP_LEVEL_STATEMENTS]: (source) =>
    source.getStatements(),
};


export async function extractFiles(
  files: FileUploadModel[]
): Promise<WorkerFile[]> {
  const result: WorkerFile[] = [];

  for (const file of files) {
    const text = await streamToString(file.file);

    result.push({
      name: file.name,
      language: file.language,
      content: text,
    });
  }

  return result;
}