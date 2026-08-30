// ============================================================================
// JAVA ANALYZER
// Wraps tree-sitter-java parsing and runs the full complexity pipeline.
// ============================================================================

import { join } from "node:path";

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
import { extractSignals } from "./java_signals.js";
import Parser from "tree-sitter";

interface CodeUnit {
  node: Parser.SyntaxNode;
  name: string | null;
  kind: fetchUnitPartOfCodeArrayTargets;
}

export class JavaAnalyzer {
  private parser: Parser;

  constructor(parser: Parser) {
    this.parser = parser;
  }


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

  private extractCodeUnits(root: Parser.SyntaxNode): CodeUnit[] {
    const units: CodeUnit[] = [];
    this.walkForUnits(root, units);
    return units;
  }

  private walkForUnits(node: Parser.SyntaxNode, units: CodeUnit[]): void {
    switch (node.type) {
      case "method_declaration": {
        // method_declaration: modifiers? type name formal_parameters ...
        const nameNode = node.childForFieldName("name");
        units.push({
          node,
          name: nameNode?.text ?? null,
          kind: "methods",
        });
        break;
      }

      case "constructor_declaration": {
        const nameNode = node.childForFieldName("name");
        units.push({
          node,
          name: nameNode?.text ?? null,
          kind: "constructors",
        });
        break;
      }

      case "lambda_expression": {
        // Lambda: params -> body
        units.push({ node, name: null, kind: "callbacks" });
        break;
      }

      case "static_initializer": {
        // static { ... }
        units.push({ node, name: null, kind: "staticBlocks" });
        break;
      }
    }

    for (const child of node.namedChildren) {
      this.walkForUnits(child, units);
    }
  }

  private analyzeUnit(unit: CodeUnit): ComplexityResult | null {
    try {
      const validatedName = InputValidator.validateFunctionName(
        unit.name,
        (msg) =>
          console.warn(
            `[JavaAnalyzer] ${msg} - Line ${unit.node.startPosition.row + 1}`
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
        `[JavaAnalyzer] Failed to analyse "${unit.name ?? "<anonymous>"}" at line ${unit.node.startPosition.row + 1
        }:`,
        (err as Error).message
      );
      return null;
    }
  }
}
