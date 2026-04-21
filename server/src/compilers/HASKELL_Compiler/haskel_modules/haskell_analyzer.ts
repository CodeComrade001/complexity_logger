// ============================================================================
// HASKELL ANALYZER
// ============================================================================
import Parser from "tree-sitter";
// @ts-ignore
import Haskell from "tree-sitter-haskell";
import { ReasonRule, SupportedLanguage } from "../../shared_v2/interfaces.js";
import { BaseLanguageAnalyzer, CodeUnit } from "../../shared_v2/base-analyzer.js"
import { extractHaskellSignals } from "./haskell_signal_extractor.js";
import { HASKELL_EXTRA_SPACE_RULES, HASKELL_EXTRA_TIME_RULES } from "./haskell_reason_generator.js";

function extractHaskellCodeUnits(tree: Parser.Tree): CodeUnit[] {
  const units: CodeUnit[] = [];

  const visit = (node: Parser.SyntaxNode): void => {
    // top-level function declaration: funcName arg1 arg2 = body
    if (node.type === "function" || node.type === "top_splice") {
      const nameNode = node.child(0);
      if (nameNode?.type === "variable") {
        units.push({ node, name: nameNode.text, kind: "function" });
      }
    }
    // Type class instance methods
    if (node.type === "instance_declaration") {
      for (const child of node.children) {
        if (child.type === "function") {
          const nameNode = child.child(0);
          units.push({
            node: child,
            name: nameNode?.text ?? null,
            kind: "method",
          });
        }
      }
    }
    for (const child of node.children) visit(child);
  };

  visit(tree.rootNode);
  return units;
}

export class HaskellAnalyzer extends BaseLanguageAnalyzer {
  readonly language: SupportedLanguage = "haskell";

  protected createParser(): Parser {
    const parser = new Parser();
    parser.setLanguage(Haskell);
    return parser;
  }

  protected extractCodeUnits(tree: Parser.Tree, _source: string): CodeUnit[] {
    return extractHaskellCodeUnits(tree);
  }

  protected extractSignals(
    node: Parser.SyntaxNode,
    source: string,
    functionName: string | null
  ) {
    return extractHaskellSignals(node, source, functionName);
  }

  protected extraTimeRules(): ReasonRule[] { return HASKELL_EXTRA_TIME_RULES; }
  protected extraSpaceRules(): ReasonRule[] { return HASKELL_EXTRA_SPACE_RULES; }
}

export default new HaskellAnalyzer();
