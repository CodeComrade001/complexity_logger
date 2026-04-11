export type FetchUnitPartOfCodeProps = fetchUnitPartOfCodeArrayTargets[];

export type fetchUnitPartOfCodeArrayTargets = "functions" | "arrows" | "methods" | "constructors" | "getters" | "setters" | "callbacks" | "handlers" | "staticBlocks" | "topLevelStatements"

export const BATCHSIZEVALUES = 20 | 50 | 100;
export const COMPLEXITYGENERATORMAXFILES = 100;
