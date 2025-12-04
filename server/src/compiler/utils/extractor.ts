import { SyntaxKind } from "ts-morph";

export enum CodeUnitType {
  FUNCTIONS = "functions",
  ARROWS = "arrows",
  METHODS = "methods",
  VARIABLES = "variables",
  CLASSES = "classes",
  INTERFACES = "interfaces",
  ENUMS = "enums",
  IMPORTS = "imports",
  EXPORTS = "exports",
}


export const extractors = {
  [CodeUnitType.FUNCTIONS]: (source: any) => source.getFunctions(),
  [CodeUnitType.ARROWS]: (source: any) =>
    source.getDescendantsOfKind(SyntaxKind.ArrowFunction),
  [CodeUnitType.METHODS]: (source: any) =>
    source.getClasses().flatMap((c: any) => c.getMethods()),
  [CodeUnitType.VARIABLES]: (source: any) => source.getVariableDeclarations(),
  [CodeUnitType.CLASSES]: (source: any) => source.getClasses(),
  [CodeUnitType.INTERFACES]: (source: any) => source.getInterfaces(),
  [CodeUnitType.ENUMS]: (source: any) => source.getEnums(),
  [CodeUnitType.IMPORTS]: (source: any) => source.getImportDeclarations(),
  [CodeUnitType.EXPORTS]: (source: any) => source.getExportDeclarations(),
};

