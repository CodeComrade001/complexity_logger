// ============================================================================
// RUST ANALYZER
// Wraps tree-sitter-rust parsing and runs the full complexity pipeline.
//
// Rust code units:
//   • function_item   → top-level fn / nested fn
//   • impl_item block → methods (extracted via function_item inside impl)
//   • closure_expression → callbacks
//
// Rust has no distinct class; methods live inside `impl` blocks.
// We walk into impl_item and tag those function_items as "methods".
// ============================================================================

import { join } from "node:path";
import Parser from "tree-sitter";

import type {
  AnalysisSummary,
  ComplexityResult,
  fetchUnitPartOfCodeArrayTargets,
} from "../../shared/interfaces.js";
import { buildComplexityProfile } from "../../shared/profile-builder.js";
import { PaidTierReasonGenerator } from "../../shared/reason-generator.js";
import {
  modelGrowth,
  composeGrowth,
  buildResult,
  buildAnalysisSummary,
} from "../../shared/growth-model.js";
import { InputValidator } from "../../shared/complexity-utils.js";
import { extractSignals } from "./rust_signals.js";

interface CodeUnit {
  node: Parser.SyntaxNode;
  name: string | null;
  kind: fetchUnitPartOfCodeArrayTargets;
}

export class RustAnalyzer {
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

  /**
   * @param insideImpl  True when currently descending inside an `impl` block,
   *                    so function_items map to "methods".
   */
  private walkForUnits(
    node: Parser.SyntaxNode,
    units: CodeUnit[],
    insideImpl: boolean
  ): void {
    switch (node.type) {
      case "function_item": {
        // name field: identifier
        const nameNode = node.childForFieldName("name");
        const name = nameNode?.text ?? null;

        // Detect constructor convention: `new` is the idiomatic constructor name
        let kind: fetchUnitPartOfCodeArrayTargets;
        if (insideImpl && name === "new") {
          kind = "constructors";
        } else if (insideImpl) {
          kind = "methods";
        } else {
          kind = "functions";
        }

        units.push({ node, name, kind });

        // Recurse into body for nested functions / closures
        const body = node.childForFieldName("body");
        if (body) {
          for (const child of body.namedChildren) {
            this.walkForUnits(child, units, false);
          }
        }
        return; // avoid double recursion below
      }

      case "impl_item": {
        // impl Type { fn ... }  or  impl Trait for Type { fn ... }
        const body = node.childForFieldName("body");
        if (body) {
          for (const child of body.namedChildren) {
            this.walkForUnits(child, units, true);
          }
        }
        return;
      }

      case "closure_expression": {
        // |params| body  or  |params| { body }
        units.push({ node, name: null, kind: "callbacks" });
        // Recurse into closure body
        const body = node.childForFieldName("body");
        if (body) {
          for (const child of body.namedChildren) {
            this.walkForUnits(child, units, false);
          }
        }
        return;
      }

      case "trait_item": {
        // Recurse into default method implementations inside trait blocks
        const body = node.childForFieldName("body");
        if (body) {
          for (const child of body.namedChildren) {
            this.walkForUnits(child, units, true);
          }
        }
        return;
      }
    }

    for (const child of node.namedChildren) {
      this.walkForUnits(child, units, insideImpl);
    }
  }

  // ── Single-unit analysis pipeline ──────────────────────────────────────

  private analyzeUnit(unit: CodeUnit): ComplexityResult | null {
    try {
      const validatedName = InputValidator.validateFunctionName(
        unit.name,
        (msg) =>
          console.warn(
            `[RustAnalyzer] ${msg} - Line ${unit.node.startPosition.row + 1}`
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
        `[RustAnalyzer] Failed to analyse "${unit.name ?? "<anonymous>"}" at line ${unit.node.startPosition.row + 1
        }:`,
        (err as Error).message
      );
      return null;
    }
  }
}
