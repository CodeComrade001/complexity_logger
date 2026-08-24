export interface CodeParts {
  functions: any[],
  arrows: any[],
  methods: any[],
  constructors: any[],
  getters: any[],
  setters: any[],
  callbacks: any[],
  handlers: any[],
  staticBlocks: any[],
  topLevelStatements: any[]
}

export interface FilePayload {
  [fileName: string]: CodeParts;
}


export interface normalizedPayloadData {
  nameOfFile: string;
  functions: any[],
  arrows: any[],
  methods: any[],
  constructors: any[],
  getters: any[],
  setters: any[],
  callbacks: any[],
  handlers: any[],
  staticBlocks: any[],
  topLevelStatements: any[]
}