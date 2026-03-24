// src/utils/serializer.ts
import {
  ClassDeclaration,
  MethodDeclaration,
  FunctionDeclaration,
  ArrowFunction,
  VariableDeclaration,
  InterfaceDeclaration,
  EnumDeclaration,
  ImportDeclaration,
  ExportDeclaration
} from "ts-morph";

export class Serializer {

  // -----------------------
  // GENERIC SAFE SERIALIZER
  // -----------------------
  public static safe(value: any) {
    return JSON.parse(JSON.stringify(value, Serializer.circularReplacer()));
  }

  private static circularReplacer() {
    const seen = new WeakSet();
    return (key: string, value: any) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    };
  }

  // -----------------------
  // SERIALIZERS FOR NODES
  // -----------------------

  public static serializeClass(cls: ClassDeclaration) {
    return {
      kind: "class",
      name: cls.getName(),
      methods: cls.getMethods().map(m => this.serializeMethod(m)),
      properties: cls.getProperties().map(p => ({
        name: p.getName(),
        type: p.getType().getText(),
        text: p.getText()
      })),
      text: cls.getText(),
    };
  }

  public static serializeMethod(method: MethodDeclaration) {
    return {
      kind: "method",
      name: method.getName(),
      params: method.getParameters().map(p => p.getName()),
      returnType: method.getReturnType().getText(),
      isAsync: method.isAsync(),
      text: method.getText(),
    };
  }

  public static serializeFunction(fn: FunctionDeclaration) {
    return {
      kind: "function",
      name: fn.getName(),
      params: fn.getParameters().map(p => p.getName()),
      returnType: fn.getReturnType().getText(),
      text: fn.getText(),
    };
  }

  public static serializeArrow(fn: ArrowFunction) {
    return {
      kind: "arrow",
      params: fn.getParameters().map(p => p.getName()),
      returnType: fn.getReturnType().getText(),
      text: fn.getText(),
    };
  }

  public static serializeVariable(variable: VariableDeclaration) {
    return {
      kind: "variable",
      name: variable.getName(),
      type: variable.getType().getText(),
      initializer: variable.getInitializer()?.getText() || null,
      text: variable.getText(),
    };
  }

  public static serializeInterface(intf: InterfaceDeclaration) {
    return {
      kind: "interface",
      name: intf.getName(),
      properties: intf.getProperties().map(p => ({
        name: p.getName(),
        type: p.getType().getText(),
      })),
      text: intf.getText(),
    };
  }

  public static serializeEnum(enm: EnumDeclaration) {
    return {
      kind: "enum",
      name: enm.getName(),
      members: enm.getMembers().map(m => ({
        name: m.getName(),
        value: m.getValue(),
      })),
      text: enm.getText(),
    };
  }

  public static serializeImport(imp: ImportDeclaration) {
    return {
      kind: "import",
      module: imp.getModuleSpecifierValue(),
      text: imp.getText(),
    };
  }

  public static serializeExport(exp: ExportDeclaration) {
    return {
      kind: "export",
      module: exp.getModuleSpecifierValue() || null,
      text: exp.getText(),
    };
  }

  // ----------------------------------------------------
  // MAIN PUBLIC API — converts extractors → JSON SAFE
  // ----------------------------------------------------
  public static serializeAnalysis(analysis: any) {
    return {
      functions: (analysis.functions || []).map((f: FunctionDeclaration) => this.serializeFunction(f)),
      classes: (analysis.classes || []).map((c: ClassDeclaration) => this.serializeClass(c)),
      variables: (analysis.variables || []).map((v: VariableDeclaration) => this.serializeVariable(v)),
      arrows: (analysis.arrows || []).map((a: ArrowFunction) => this.serializeArrow(a)),
      methods: (analysis.methods || []).map((m: MethodDeclaration) => this.serializeMethod(m)),
      interfaces: (analysis.interfaces || []).map((i: InterfaceDeclaration) => this.serializeInterface(i)),
      enums: (analysis.enums || []).map((e: EnumDeclaration) => this.serializeEnum(e)),
      imports: (analysis.imports || []).map((i: ImportDeclaration) => this.serializeImport(i)),
      exports: (analysis.exports || []).map((e: ExportDeclaration) => this.serializeExport(e)),
    };
  }
}
