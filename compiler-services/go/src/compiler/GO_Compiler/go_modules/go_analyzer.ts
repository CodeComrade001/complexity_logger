// ============================================================================
// GO ANALYZER
// Wraps tree-sitter-go parsing and runs the full complexity pipeline.
// Mirrors the architecture of ts_js_bootstrap.ts + EnhancedAnalyzer_v2.
// ============================================================================

import { createRequire } from "node:module";
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
import { extractSignals } from "./go_signals.js";

const require = createRequire(import.meta.url);

// ── Code unit descriptor ─────────────────────────────────────────────────────
interface CodeUnit {
  node: Parser.SyntaxNode;
  name: string | null;
  kind: fetchUnitPartOfCodeArrayTargets;
}

// ============================================================================
// GO ANALYZER CLASS
// ============================================================================
export class GoAnalyzer {
  private parser: Parser;

  constructor(parser: Parser) {
    this.parser = parser;
  }


  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * execute a Go source file and return an AnalysisSummary.
   * Mirrors GetComplexityGenerator.execute() + ComplexityOrchestrator_v1.executePaidTier().
   */
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

  /**
   * Walks the root node and collects all analysable code units.
   * Go units: function_declaration, method_declaration, func_literal.
   */
  private extractCodeUnits(root: Parser.SyntaxNode): CodeUnit[] {
    const units: CodeUnit[] = [];
    this.walkForUnits(root, units);
    return units;
  }

  private walkForUnits(
    node: Parser.SyntaxNode,
    units: CodeUnit[]
  ): void {
    switch (node.type) {
      case "function_declaration": {
        const nameNode = node.childForFieldName("name");
        units.push({
          node,
          name: nameNode?.text ?? null,
          kind: "functions",
        });
        break;
      }

      case "method_declaration": {
        // method_declaration: receiver name type_params? params result? body
        const nameNode = node.childForFieldName("name");
        units.push({
          node,
          name: nameNode?.text ?? null,
          kind: "methods",
        });
        break;
      }

      case "func_literal": {
        // Anonymous function value: func() { ... }
        units.push({
          node,
          name: null,
          kind: "callbacks",
        });
        break;
      }
    }

    // Always recurse — we want nested functions too
    for (const child of node.namedChildren) {
      this.walkForUnits(child, units);
    }
  }

  // ── Single-unit analysis pipeline ──────────────────────────────────────

  private analyzeUnit(unit: CodeUnit): ComplexityResult | null {
    try {
      const validatedName = InputValidator.validateFunctionName(
        unit.name,
        (msg) =>
          console.warn(`[GoAnalyzer] ${msg} - Line ${unit.node.startPosition.row + 1}`)
      );

      const signals = extractSignals(unit.node, validatedName);
      const profile = buildComplexityProfile(signals);
      const reasons = PaidTierReasonGenerator.generateReasons(profile, signals);
      const growth = composeGrowth(modelGrowth(profile));

      return buildResult(
        {
          kind: unit.kind,
          name: validatedName,
          startLine: unit.node.startPosition.row + 1, // tree-sitter is 0-based
          endLine: unit.node.endPosition.row + 1,
          text: unit.node.text,
        },
        reasons,
        growth
      );
    } catch (err) {
      console.error(
        `[GoAnalyzer] Failed to analyse "${unit.name ?? "<anonymous>"}" at line ${unit.node.startPosition.row + 1
        }:`,
        (err as Error).message
      );
      return null;
    }
  }
}
