// ============================================================================
// KOTLIN ANALYZER
// Wraps tree-sitter-kotlin parsing and runs the full complexity pipeline.
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
import { extractSignals } from "./kotlin_signals.js";

interface CodeUnit {
  node: Parser.SyntaxNode;
  name: string | null;
  kind: fetchUnitPartOfCodeArrayTargets;
}

export class KotlinAnalyzer {
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
      case "function_declaration": {
        // top-level fun
        const nameNode = node.childForFieldName("name") ??
          node.namedChildren.find((c: any) => c.type === "simple_identifier");
        units.push({
          node,
          name: nameNode?.text ?? null,
          kind: "functions",
        });
        break;
      }

      case "function_declaration": {
        // class member fun — same node type in Kotlin grammar
        // Kotlin grammar has function_declaration for both; handled by walkForUnits
        break;
      }

      case "anonymous_function":
      case "lambda_literal": {
        // { params -> body } or fun() {}
        units.push({ node, name: null, kind: "callbacks" });
        break;
      }

      case "secondary_constructor": {
        units.push({ node, name: null, kind: "constructors" });
        break;
      }

      case "class_declaration":
      case "object_declaration": {
        // Descend separately to pick up members
        for (const child of node.namedChildren) {
          this.walkForUnits(child, units);
        }
        return; // return here to avoid double-recursion at the bottom
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
            `[KotlinAnalyzer] ${msg} - Line ${unit.node.startPosition.row + 1}`
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
        `[KotlinAnalyzer] Failed to analyse "${unit.name ?? "<anonymous>"}" at line ${unit.node.startPosition.row + 1
        }:`,
        (err as Error).message
      );
      return null;
    }
  }
}
