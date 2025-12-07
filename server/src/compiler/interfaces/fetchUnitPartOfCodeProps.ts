export interface FetchUnitPartOfCodeProps {
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
