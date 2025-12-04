export interface FetchUnitPartOfCodeProps {
  filePath: string; // path to the file
  targets: Array<
    | "functions"
    | "arrows"
    | "methods"
    | "variables"
    | "classes"
    | "interfaces"
    | "enums"
    | "imports"
    | "exports"
  >;
}
