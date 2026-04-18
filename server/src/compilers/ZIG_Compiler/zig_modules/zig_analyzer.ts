// ============================================================================
// ZIG ANALYZER
// Wraps tree-sitter-zig parsing and runs the full complexity pipeline.
//
// Zig code units:
//   • function_declaration  → functions (top-level or inside struct namespace)
//   • function_signature    → forward declaration (no body; skipped for analysis)
//
// Zig has no class keyword; functions live at file scope or inside struct/union
// type declarations. We detect the struct context to tag methods appropriately.
//
// Anonymous function expressions do not exist in Zig; closures are not a
// first-class language feature. Comptime blocks are treated as staticBlocks.
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
import { extractSignals } from "./zig_signals.js";

interface CodeUnit {
  node: Parser.SyntaxNode;
  name: string | null;
  kind: fetchUnitPartOfCodeArrayTargets;
}

export class ZigAnalyzer {
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
   * @param insideStruct  True when descending through a struct/union declaration,
   *                      so function_declarations map to "methods".
   */
  private walkForUnits(
    node: Parser.SyntaxNode,
    units: CodeUnit[],
    insideStruct: boolean
  ): void {
    switch (node.type) {
      case "function_declaration": {
        // In Zig grammar: function_declaration has a "n" field for name
        // and a "body" (block) field.
        const nameNode = node.childForFieldName("n");
        const name = nameNode?.text ?? null;

        // function_signature is a forward-decl with no body — skip
        const hasBody = node.childForFieldName("body") !== null;
        if (!hasBody) break;

        let kind: fetchUnitPartOfCodeArrayTargets;
        if (insideStruct && name === "init") {
          kind = "constructors";
        } else if (insideStruct && name === "deinit") {
          // deinit is the Zig destructor convention; map to setters bucket
          kind = "setters";
        } else if (insideStruct) {
          kind = "methods";
        } else {
          kind = "functions";
        }

        units.push({ node, name, kind });

        // Recurse into body for nested function declarations
        const body = node.childForFieldName("body");
        if (body) {
          for (const child of body.namedChildren) {
            this.walkForUnits(child, units, false);
          }
        }
        return; // avoid double recursion
      }

      case "comptime_block": {
        // comptime { ... } — maps to staticBlocks
        units.push({ node, name: null, kind: "staticBlocks" });
        break;
      }

      case "assignment_statement": {
        // const MyType = struct { ... };  — detect struct literal bodies
        // to mark inner functions as methods
        const expr = node.childForFieldName("expression");
        if (
          expr &&
          (expr.type === "struct_expression" ||
            expr.type === "enum_expression" ||
            expr.type === "union_expression")
        ) {
          for (const child of expr.namedChildren) {
            this.walkForUnits(child, units, true);
          }
          return;
        }
        break;
      }
    }

    for (const child of node.namedChildren) {
      this.walkForUnits(child, units, insideStruct);
    }
  }

  // ── Single-unit analysis pipeline ──────────────────────────────────────

  private analyzeUnit(unit: CodeUnit): ComplexityResult | null {
    try {
      const validatedName = InputValidator.validateFunctionName(
        unit.name,
        (msg) =>
          console.warn(
            `[ZigAnalyzer] ${msg} - Line ${unit.node.startPosition.row + 1}`
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
        `[ZigAnalyzer] Failed to analyse "${unit.name ?? "<anonymous>"}" at line ${unit.node.startPosition.row + 1
        }:`,
        (err as Error).message
      );
      return null;
    }
  }
}
