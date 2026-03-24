import { dataSets } from "../../../utils/datasets.js";


export const BuildKeywordSet: Set<string> = new Set([
  ...dataSets.loops,
  ...dataSets.nestedLoopSignals,
  ...dataSets.recursion,
  ...dataSets.divideAndConquer,
  ...dataSets.dataIteration,
  ...dataSets.expensiveBuiltins,
  ...dataSets.memoryAllocations,
  ...dataSets.temporaryStructures,
  ...dataSets.recursionSpace,
  ...dataSets.dataDuplication,
  ...dataSets.branches,
  ...dataSets.inputDependent,
  ...dataSets.directCodePatterns,
  ...dataSets.hiddenCostOps,
  ...dataSets.spaceImpactOps,
  ...dataSets.algorithmicFactors,
  ...dataSets.inputFactors,
  ...dataSets.runtimeFactors,
  ...dataSets.architectureFactors,
  ...dataSets.languageSpecific
]);
