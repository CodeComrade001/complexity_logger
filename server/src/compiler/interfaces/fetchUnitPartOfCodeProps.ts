export interface FetchUnitPartOfCodeProps {
  targets: Array<fetchUnitPartOfCodeArrayTargets>;
}

export type fetchUnitPartOfCodeArrayTargets = "functions" | "arrows" | "methods" | "constructors" | "getters" | "setters" | "callbacks" | "handlers" | "staticBlocks" | "topLevelStatements"


