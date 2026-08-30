// ============================================================================
// PYTHON ANALYZER
// Wraps tree-sitter-python parsing and runs the full complexity pipeline.
//
// Python code units:
//   • function_definition   → functions (top-level) or methods (inside class)
//   • lambda                → callbacks
//
// Python has no distinct "constructor" keyword at the AST level — __init__
// is a regular method_definition with name "__init__". We detect it and map
// it to the `constructors` bucket to keep parity with the TypeScript analyzer.
// ============================================================================

import { join } from "node:path";
import Parser from "tree-sitter";

import type {
  AnalysisSummary,
  ComplexityResult,
  fetchUnitPartOfCodeArrayTargets,
} from "../shared/interfaces.js";
import { buildComplexityProfile } from "../shared/profile-builder.js";
import { PaidTierReasonGenerator } from "../shared/reason-generator.js";
import {
  modelGrowth,
  composeGrowth,
  buildResult,
  buildAnalysisSummary,
} from "../shared/growth-model.js";
import { InputValidator } from "../shared/complexity-utils.js";
import { extractSignals } from "./python_signals.js";

interface CodeUnit {
  node: Parser.SyntaxNode;
  name: string | null;
  kind: fetchUnitPartOfCodeArrayTargets;
}

export class PythonAnalyzer {
  private parser: Parser;

  constructor(parser: Parser) {
    this.parser = parser;
  }


  // ── Public API ─────────────────────────────────────────────────────────

  async execute(sourceCode: string, fileName: string): Promise<AnalysisSummary> {
    const tree = this.parser.parse(sourceCode);
    const units = this.extractCodeUnits(tree.rootNode);
    const results: ComplexityResult[] = [];

    for (const unit of units) {
      const result = this.analyzeUnit(unit);
      if (result) results.push(result);
    }

    return buildAnalysisSummary(results, fileName);
  }

  // ── Code unit extraction ────────────────────────────────────────────────

  private extractCodeUnits(root: Parser.SyntaxNode): CodeUnit[] {
    const units: CodeUnit[] = [];
    this.walkForUnits(root, units, false);
    return units;
  }

  private walkForUnits(
    node: Parser.SyntaxNode,
    units: CodeUnit[],
    insideClass: boolean
  ): void {
    switch (node.type) {
      case "function_definition": {
        // name field: identifier node
        const nameNode = node.childForFieldName("name");
        const name = nameNode?.text ?? null;

        let kind: fetchUnitPartOfCodeArrayTargets;
        if (insideClass && name === "__init__") {
          kind = "constructors";
        } else if (insideClass && (name === "__get__" || name?.startsWith("get_"))) {
          kind = "getters";
        } else if (insideClass && (name === "__set__" || name?.startsWith("set_"))) {
          kind = "setters";
        } else if (insideClass) {
          kind = "methods";
        } else {
          kind = "functions";
        }

        units.push({ node, name, kind });

        // Recurse into body — nested functions / lambdas
        for (const child of node.namedChildren) {
          this.walkForUnits(child, units, false);
        }
        return; // avoid double-recursion below
      }

      case "class_definition": {
        // Recurse into class body with insideClass = true
        for (const child of node.namedChildren) {
          this.walkForUnits(child, units, true);
        }
        return;
      }

      case "lambda": {
        units.push({ node, name: null, kind: "callbacks" });
        break;
      }
    }

    for (const child of node.namedChildren) {
      this.walkForUnits(child, units, insideClass);
    }
  }

  // ── Single-unit analysis pipeline ──────────────────────────────────────

  private analyzeUnit(unit: CodeUnit): ComplexityResult | null {
    try {
      const validatedName = InputValidator.validateFunctionName(
        unit.name,
        (msg) =>
          console.warn(
            `[PythonAnalyzer] ${msg} - Line ${unit.node.startPosition.row + 1}`
          )
      );

      const signals = extractSignals(unit.node, validatedName);
      const profile = buildComplexityProfile(signals);
      const reasons = PaidTierReasonGenerator.generateReasons(profile, signals);
      const growth = composeGrowth(modelGrowth(profile));

      return buildResult(
        {
          kind: unit.kind,
          name: validatedName,
          startLine: unit.node.startPosition.row + 1,
          endLine: unit.node.endPosition.row + 1,
          text: unit.node.text,
        },
        reasons,
        growth
      );
    } catch (err) {
      console.error(
        `[PythonAnalyzer] Failed to analyse "${unit.name ?? "<anonymous>"}" at line ${unit.node.startPosition.row + 1
        }:`,
        (err as Error).message
      );
      return null;
    }
  }
}
