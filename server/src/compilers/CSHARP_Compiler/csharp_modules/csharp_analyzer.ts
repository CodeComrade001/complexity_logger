// ============================================================================
// C# ANALYZER
// ============================================================================
import Parser from "tree-sitter";
// @ts-ignore
import CSharp from "tree-sitter-c-sharp";
import { ReasonRule, SupportedLanguage } from "../../shared_v2/interfaces.js";
import { BaseLanguageAnalyzer, CodeUnit } from "../../shared_v2/base-analyzer.js";
import { extractCSharpSignals } from "./csharp_signal_extractor.js";
import { CSHARP_EXTRA_SPACE_RULES, CSHARP_EXTRA_TIME_RULES } from "./csharp_reason_generator.js";

const CSHARP_FUNCTION_TYPES = new Set([
  "method_declaration",
  "constructor_declaration",
  "local_function_statement",
  "lambda_expression",
  "anonymous_method_expression",
]);

function extractCSharpCodeUnits(tree: Parser.Tree): CodeUnit[] {
  const units: CodeUnit[] = [];

  const visit = (node: Parser.SyntaxNode): void => {
    if (node.type === "method_declaration") {
      const nameNode = node.childForFieldName("name");
      units.push({ node, name: nameNode?.text ?? null, kind: "method" });
    } else if (node.type === "constructor_declaration") {
      const nameNode = node.childForFieldName("name");
      units.push({ node, name: nameNode?.text ?? null, kind: "constructor" });
    } else if (node.type === "local_function_statement") {
      const nameNode = node.childForFieldName("name");
      units.push({ node, name: nameNode?.text ?? null, kind: "function" });
    } else if (
      node.type === "lambda_expression" ||
      node.type === "anonymous_method_expression"
    ) {
      units.push({ node, name: null, kind: "lambda" });
    }
    for (const child of node.children) visit(child);
  };

  visit(tree.rootNode);
  return units;
}

export class CSharpAnalyzer extends BaseLanguageAnalyzer {
  readonly language: SupportedLanguage = "csharp";

  protected createParser(): Parser {
    const parser = new Parser();
    parser.setLanguage(CSharp);
    return parser;
  }

  protected extractCodeUnits(tree: Parser.Tree, _source: string): CodeUnit[] {
    return extractCSharpCodeUnits(tree);
  }

  protected extractSignals(
    node: Parser.SyntaxNode,
    source: string,
    functionName: string | null
  ) {
    return extractCSharpSignals(node, source, functionName);
  }

  protected extraTimeRules(): ReasonRule[] { return CSHARP_EXTRA_TIME_RULES; }
  protected extraSpaceRules(): ReasonRule[] { return CSHARP_EXTRA_SPACE_RULES; }
}

export default new CSharpAnalyzer();
