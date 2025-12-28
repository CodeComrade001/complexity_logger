import { SyntaxKind } from "ts-morph";

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


export const extractors: Record<CodeUnitType, (source: any) => any[]> = {
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

