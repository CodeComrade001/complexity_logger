
import type { AnalysisSummary, ComplexityResult, fetchUnitPartOfCodeArrayTargets, } from "../shared/interfaces.js";
import { buildComplexityProfile } from "../shared/profile-builder.js";
import { PaidTierReasonGenerator } from "../shared/reason-generator.js";
import { modelGrowth, composeGrowth, buildResult, buildAnalysisSummary, } from "../shared/growth-model.js";

import { extractCSharpSignals } from "./csharp_signal_extractor.js";
import Parser from "tree-sitter";
import { InputValidator } from "../shared/shared-utils.js";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CodeUnit {
  node: Parser.SyntaxNode;
  name: string | null;
  kind: fetchUnitPartOfCodeArrayTargets;
}

// ─────────────────────────────────────────────────────────────────────────────
// Analyzer
// ─────────────────────────────────────────────────────────────────────────────

export class CSharpAnalyzer {
  private parser: Parser;

  constructor(
    parser: Parser
  ) {
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

  // ── Code unit extraction (Rust-style walker) ───────────────────────────

  private extractCodeUnits(root: Parser.SyntaxNode): CodeUnit[] {
    const units: CodeUnit[] = [];
    this.walk(root, units, {
      insideClass: false,
    });
    return units;
  }

  private walk(
    node: Parser.SyntaxNode,
    units: CodeUnit[],
    context: { insideClass: boolean }
  ): void {
    switch (node.type) {
      case "class_declaration": {
        const body = node.childForFieldName("body");
        if (body) {
          for (const child of body.namedChildren) {
            this.walk(child, units, { insideClass: true });
          }
        }
        return;
      }

      case "method_declaration": {
        const nameNode = node.childForFieldName("name");
        units.push({
          node,
          name: nameNode?.text ?? null,
          kind: context.insideClass ? "methods" : "functions",
        });
        return;
      }

      case "constructor_declaration": {
        const nameNode = node.childForFieldName("name");
        units.push({
          node,
          name: nameNode?.text ?? null,
          kind: "constructors",
        });
        return;
      }

      case "local_function_statement": {
        const nameNode = node.childForFieldName("name");
        units.push({
          node,
          name: nameNode?.text ?? null,
          kind: "functions",
        });
        return;
      }

      case "lambda_expression":
      case "anonymous_method_expression": {
        units.push({
          node,
          name: null,
          kind: "callbacks",
        });
        return;
      }
    }

    for (const child of node.namedChildren) {
      this.walk(child, units, context);
    }
  }

  // ── Analysis pipeline (same as Rust) ───────────────────────────────────

  private analyzeUnit(unit: CodeUnit): ComplexityResult | null {
    try {
      const validatedName = InputValidator.validateFunctionName(
        unit.name,
        (msg) =>
          console.warn(
            `[CSharpAnalyzer] ${msg} - Line ${unit.node.startPosition.row + 1}`
          )
      );

      const signals = extractCSharpSignals(
        unit.node,
        unit.node.text,
        validatedName
      );

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
        `[CSharpAnalyzer] Failed to analyse "${unit.name ?? "<anonymous>"
        }" at line ${unit.node.startPosition.row + 1}:`,
        (err as Error).message
      );
      return null;
    }
  }
}

// Default instance (optional, matches previous export style)