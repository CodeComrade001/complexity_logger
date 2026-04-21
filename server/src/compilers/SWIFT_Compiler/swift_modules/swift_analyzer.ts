// ============================================================================
// SWIFT ANALYZER
// ============================================================================
import Parser from "tree-sitter";
// @ts-ignore
import Swift from "tree-sitter-swift";
import { ReasonRule, SupportedLanguage } from "../../shared_v2/interfaces.js";
import { BaseLanguageAnalyzer, CodeUnit } from "../../shared_v2/base-analyzer.js";
import { extractSwiftSignals } from "./swift_signal_extractor.js";
import { SWIFT_EXTRA_SPACE_RULES, SWIFT_EXTRA_TIME_RULES } from "./swift_reason_generator.js";

function extractSwiftCodeUnits(tree: Parser.Tree): CodeUnit[] {
  const units: CodeUnit[] = [];

  const visit = (node: Parser.SyntaxNode): void => {
    if (node.type === "function_declaration") {
      const nameNode = node.childForFieldName("name");
      units.push({ node, name: nameNode?.text ?? null, kind: "function" });
    } else if (node.type === "initializer_declaration") {
      units.push({ node, name: "init", kind: "constructor" });
    } else if (node.type === "closure_expression") {
      units.push({ node, name: null, kind: "closure" });
    }
    for (const child of node.children) visit(child);
  };

  visit(tree.rootNode);
  return units;
}

export class SwiftAnalyzer extends BaseLanguageAnalyzer {
  readonly language: SupportedLanguage = "swift";

  protected createParser(): Parser {
    const parser = new Parser();
    parser.setLanguage(Swift);
    return parser;
  }

  protected extractCodeUnits(tree: Parser.Tree, _source: string): CodeUnit[] {
    return extractSwiftCodeUnits(tree);
  }

  protected extractSignals(
    node: Parser.SyntaxNode,
    source: string,
    functionName: string | null
  ) {
    return extractSwiftSignals(node, source, functionName);
  }

  protected extraTimeRules(): ReasonRule[] { return SWIFT_EXTRA_TIME_RULES; }
  protected extraSpaceRules(): ReasonRule[] { return SWIFT_EXTRA_SPACE_RULES; }
}

export default new SwiftAnalyzer();
